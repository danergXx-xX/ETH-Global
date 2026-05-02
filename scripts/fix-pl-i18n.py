#!/usr/bin/env python3
"""Naprawia polskie znaki w PL i18n stringach plikow Cloud Design (.jsx + .html).

Cloud Design nie wstawil polskich diakrytykow w PL stringach (regula globalna
#69 Dana). Skrypt aplikuje WORD_MAP z Apps/fix-polish-diacritics.py + lokalna
mape terminologii crypto/treasury TYLKO do contentu string literali (single,
double, backtick), zachowujac kod JS nietkniety.

Strategia bezpieczenstwa:
- Replace TYLKO w string literals (regex matchuje cudzyslowy)
- Word-boundary matching (\\b) zapobiega false positives wewnatrz innych slow
- Case-preserving (lowercase/UPPERCASE/Title Case)
- JS expressions w template literals (${...}) sa pomijane
- Dry-run domyslnie - musisz dac --apply zeby zapisac

Usage:
    python3 scripts/fix-pl-i18n.py --dry-run cloud-import/*.jsx cloud-import/*.html
    python3 scripts/fix-pl-i18n.py --apply cloud-import/*.jsx cloud-import/*.html
    python3 scripts/fix-pl-i18n.py --verbose --apply cloud-import/*.jsx
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

# Reuse WORD_MAP z Apps/fix-polish-diacritics.py (357+ slow).
# Sciezka konfigurowalna przez env var DAN_VAULT_APPS, default = ~/Documents/Obsidian/Dan-Vault/Apps
import os
_default_vault = Path.home() / "Documents/Obsidian/Dan-Vault/Apps"
_apps_path = Path(os.environ.get("DAN_VAULT_APPS", str(_default_vault)))
sys.path.insert(0, str(_apps_path))
try:
    from importlib import import_module
    _mod = import_module("fix-polish-diacritics")
    BASE_MAP: dict[str, str] = dict(_mod.WORD_MAP)
    if not BASE_MAP:
        raise RuntimeError("BASE_MAP pusty - prawdopodobnie zly modul")
except Exception as e:
    print(f"FATAL: nie zaladowano fix-polish-diacritics z {_apps_path}", file=sys.stderr)
    print(f"       Ustaw DAN_VAULT_APPS=/sciezka/do/Apps lub umiesc Apps/fix-polish-diacritics.py", file=sys.stderr)
    print(f"       Blad: {e}", file=sys.stderr)
    sys.exit(1)

# Lokalna mapa - terminologia crypto/treasury/conclave NIE pokryta przez BASE_MAP.
# Tylko slowa JEDNOZNACZNE (zawsze wymagaja diakrytykow).
LOCAL_MAP: dict[str, str] = {
    # --- ż / ź ---
    # "ze": NIE w mapie - false positive risk (preposition w EN/PL). W DENYLIST.
    "wyplata": "wypłata",
    "wyplaty": "wypłaty",
    "wyplate": "wypłatę",
    "wyplaca": "wypłaca",
    "blokuja": "blokują",
    "blokujace": "blokujące",
    # "Wykaz" - Dan explicite wybral jako label (Defaults: Conclave, "Wykaz"). NIE zmieniamy bez Maja review.
    # "Wykaz": "Wykaż",  # uncomment jezeli Maja zatwierdzi
    "Wymagajace": "Wymagające",
    "Brakuje": "Brakuje",
    "moze": "może",
    "Moze": "Może",
    "moga": "mogą",
    "moglyby": "mogłyby",
    "ponizej": "poniżej",
    "powyzej": "powyżej",
    "ponizszy": "poniższy",
    "kazda": "każdą",
    "kazde": "każde",
    "kazdy": "każdy",
    "kazdej": "każdej",
    "kazdym": "każdym",
    "Kazda": "Każda",
    "Kazdy": "Każdy",
    "wezme": "wezmę",
    "rozlozyc": "rozłożyć",
    "ograniczyc": "ograniczyć",
    "uzytkownika": "użytkownika",
    "uzytkownikow": "użytkowników",
    "uzyje": "użyje",

    # --- ą / ę ---
    "srodki": "środki",
    "srodkow": "środków",
    "srodek": "środek",
    "srodka": "środka",
    "srodkami": "środkami",
    "twardy": "twardy",        # OK bez ogonka
    "Przekracza": "Przekracza", # OK
    "limit": "limit",          # OK
    "skarbiec": "skarbiec",    # OK
    "skarbca": "skarbca",      # OK
    "skarbcow": "skarbców",
    "Twoj": "Twój",
    "twoj": "twój",
    "Twoje": "Twoje",          # OK
    "Twoich": "Twoich",        # OK
    "od": "od",                # OK
    "do": "do",                # OK
    "ten": "ten",              # OK
    "ta": "ta",                # OK

    # --- ł / ó / ś ---
    "przemyslany": "przemyślany",
    "przemyslana": "przemyślana",
    "wyciagnac": "wyciągnąć",
    "spojrz": "spójrz",
    "polaczenie": "połączenie",
    "polaczenia": "połączenia",
    "podlaczy": "podłączy",
    "wpisz": "wpisz",          # OK
    "swoj": "swój",
    "Swoj": "Swój",

    # --- crypto/treasury terms ---
    "Przeznaczyc": "Przeznaczyć",
    "przeznaczyc": "przeznaczyć",
    "lamie": "łamie",
    "lamiacy": "łamiący",
    "anuluje": "anuluje",      # OK
    "okres": "okres",          # OK
    "Okres": "Okres",          # OK
    "poczatkowy": "początkowy",
    "poczatkowa": "początkowa",
    "poczatkowe": "początkowe",
    "poczatek": "początek",
    "rozpoczyna": "rozpoczyna",
    "wstrzymuje": "wstrzymuję",
    "Wstrzymuje": "Wstrzymuję",
    "rekomenduje": "rekomenduję",
    "Rekomenduje": "Rekomenduję",
    "biorac": "biorąc",
    "Biorac": "Biorąc",
    "uwzgledniajac": "uwzględniając",
    "uwzgledniac": "uwzględniać",
    "uzgodnienie": "uzgodnienie",
    "uzgodnien": "uzgodnień",
    "wyrozniajacy": "wyróżniający",
    "wyzsza": "wyższa",
    "wyzszy": "wyższy",
    "wyzsze": "wyższe",
    "ostatni": "ostatni",      # OK
    "ostatnich": "ostatnich",  # OK
    "Ostatnich": "Ostatnich",  # OK

    # --- Common verbs / forms ---
    "Zewnetrzny": "Zewnętrzny",
    "zewnetrzny": "zewnętrzny",
    "Zewnetrznego": "Zewnętrznego",
    "podlaczyc": "podłączyć",
    "Podlacz": "Podłącz",
    "podlacz": "podłącz",
    "Wybierz": "Wybierz",      # OK
    "ze skarbca posiada": "skarbiec posiada",
    "wymagana": "wymagana",    # OK
    "wymagane": "wymagane",    # OK
    "potrzebne": "potrzebne",  # OK
    "potrzebny": "potrzebny",  # OK
    "musza": "muszą",
    "Musza": "Muszą",
    "Moga": "Mogą",  # 'moga' juz w sekcji glownej (linia 64)
    "podpisac": "podpisać",
    "podpisuje": "podpisuje",  # OK
    "egzekucja": "egzekucja",  # OK
    "egzekucji": "egzekucji",  # OK
    "skonczy": "skończy",
    "skonczyc": "skończyć",
    "skonczyl": "skończył",
    "wynik": "wynik",          # OK
    "Wynik": "Wynik",          # OK
    "zakonczone": "zakończone",
    "zakonczony": "zakończony",
    "zakonczona": "zakończona",
    "podpisuja": "podpisują",
    "uczestniczace": "uczestniczące",
    "decyzji": "decyzji",      # OK
    "decyzja": "decyzja",      # OK
    "decyzje": "decyzję",
    "Decyzje": "Decyzję",      # tylko w accusative case
    "rade": "radę",
    "Rada": "Rada",            # OK
    "Rady": "Rady",            # OK
    "rady": "rady",            # OK
    "Konczy": "Kończy",
    "konczy": "kończy",
    "Konczace": "Kończące",
    "konczace": "kończące",
    "Konczy sie": "Kończy się",

    # --- "się" forms ---
    "sie": "się",
    "Sie": "Się",

    # --- rc-data.jsx (Reasoning Chat) - dodatkowe slowa znalezione przez Vera ---
    "Glos": "Głos",
    "glos": "głos",
    "Glosu": "Głosu",
    "glosu": "głosu",
    "Glosy": "Głosy",
    "glosy": "głosy",
    "powrot": "powrót",
    "powrotem": "powrotem",
    "bylby": "byłby",
    "bylyby": "byłyby",
    "byloby": "byłoby",
    "byla": "była",
    "byly": "były",
    "byl": "był",
    "wowczas": "wówczas",
    "przezylaby": "przeżyłaby",
    "przezylby": "przeżyłby",
    "wycofac": "wycofać",
    "wycofuje": "wycofuję",
    "ignoruje": "ignoruję",
    "kategoryzuje": "kategoryzuję",
    "podatnoscia": "podatnością",
    "podatnosc": "podatność",
    "podatnosci": "podatności",
    "predkosc": "prędkość",
    "predkosci": "prędkości",
    "odnotowalem": "odnotowałem",
    "odnotowalam": "odnotowałam",
    "pewnosci": "pewności",
    "pewnosc": "pewność",
    "Moge": "Mogę",
    "moge": "mogę",
    "pokazac": "pokazać",
    "pokazujac": "pokazując",
    "pokazaly": "pokazały",
    "jezeli": "jeżeli",
    "Jezeli": "Jeżeli",
    "przychod": "przychód",
    "przychody": "przychody",  # OK
    "kapitalu": "kapitału",
    "kapital": "kapitał",
    "spadna": "spadną",
    "polowie": "połowie",
    "polowy": "połowy",
    "polowa": "połowa",
    "mozemy": "możemy",
    "Mozemy": "Możemy",
    "dostalibysmy": "dostalibyśmy",

    # --- dash-data.jsx + form-data.jsx (Maja audit findings) ---
    "Aktywnosc": "Aktywność",
    "aktywnosc": "aktywność",
    "Aktywnosci": "Aktywności",
    "zywo": "żywo",
    "Zywo": "Żywo",
    "kolejna": "kolejną",
    "kolejnego": "kolejnego",  # OK
    "propozycje": "propozycję",
    "propozycji": "propozycji",  # OK
    "Propozycje": "Propozycję",
    "pozostalo": "pozostało",
    "jezykiem": "językiem",
    "jezyk": "język",
    "walidaja": "walidują",
    "wyzej": "wyżej",
    "wazone": "ważone",
    "wazony": "ważony",
    "zlozyc": "złożyć",
    "Zlozyc": "Złożyć",
    "zlozenie": "złożenie",
    "wlasnymi": "własnymi",
    "wlasnym": "własnym",
    "wlasna": "własną",
    "wlasne": "własne",
    "slowami": "słowami",
    "slowa": "słowa",
    "slowo": "słowo",
    "strukturyzowana": "strukturyzowaną",
    "Wyslij": "Wyślij",
    "wyslij": "wyślij",
    "Wymien": "Wymień",
    "wymien": "wymień",
    "Pewnosc": "Pewność",
    "pewnosc": "pewność",
    "czlonkowie": "członkowie",
    "czlonek": "członek",
    "zweryfikowac": "zweryfikować",
    "Polacz": "Połącz",
    "polacz": "połącz",
    "Ostrzezenie": "Ostrzeżenie",
    "ostrzezenie": "ostrzeżenie",
    "Srednia": "Średnia",
    "srednia": "średnia",
    "plynnosc": "płynność",
    "plynnosci": "płynności",
    "wyjscia": "wyjścia",
    "wyjscie": "wyjście",
    "glownie": "głównie",
    "glowny": "główny",
    "glowna": "główna",
    "sygnalu": "sygnału",
    "sygnal": "sygnał",
    "wystarczajaco": "wystarczająco",
    # "sa": NIE w mapie - ryzyko false positive (identifier, USA fragment). DENYLIST.
    "Pokaz": "Pokaż",
    "pokaz": "pokaż",
    "wartosci": "wartości",
    "wartosc": "wartość",       # juz w BASE_MAP, ale dla pewnosci
    "rentownosci": "rentowności",
    "rentownosc": "rentowność",
    "wplata": "wpłata",
    "wplaty": "wpłaty",
    "wplywu": "wpływu",
    "wplywem": "wpływem",
    "stope": "stopę",
    "stopy": "stopy",           # OK
    "ktore": "które",
    "Ktore": "Które",
    "Co jezeli": "Co jeżeli",
    "zrodlo": "źródło",
    "zrodla": "źródła",
    "zrodel": "źródeł",
}

# Merge: LOCAL nadpisuje BASE (LOCAL ma precedence dla terminologii crypto)
WORD_MAP: dict[str, str] = {**BASE_MAP, **LOCAL_MAP}

# Slowa ktorych NIE TYKAC (false positive triggers w angielskich/crypto stringach)
DENYLIST: set[str] = {
    # Angielskie/crypto slowa ktore wygladaja jak polskie bez ogonkow
    "for", "by", "to", "be", "we", "no", "or", "in", "is", "it", "an", "as",
    "at", "of", "ok", "go", "so", "if", "on", "do",
    # PL-EN ambiguous prepositions + identifiers
    "ze",  # pl "ze" / "że" - ambiguous, skip
    "od", "do", "ten", "ta",
    # Zmienne JS-ish
    "el", "ev", "id", "ml", "ws", "rt", "ms", "tx",
    # PL "sie" tez ryzykowne (np. lookalike z innym slowem) - sprawdze case-by-case
    # ale zostawiam zeby objac PL kontent. Word-boundary chroni.
}

# Usun denylist z mapy
for w in DENYLIST:
    WORD_MAP.pop(w, None)
    WORD_MAP.pop(w.capitalize(), None)
    WORD_MAP.pop(w.upper(), None)


def preserve_case(original: str, replacement: str) -> str:
    """Zachowaj wielkosc liter z original w replacement."""
    if original.isupper():
        return replacement.upper()
    if original[:1].isupper():
        return replacement[:1].upper() + replacement[1:]
    return replacement


def replace_in_text(text: str, stats: dict[str, int]) -> str:
    """Apply WORD_MAP do tekstu z word-boundary matching i case preservation."""

    def _sub(match: re.Match) -> str:
        word = match.group(0)
        lower = word.lower()
        if lower in WORD_MAP:
            replacement = preserve_case(word, WORD_MAP[lower])
            if replacement != word:
                stats[lower] = stats.get(lower, 0) + 1
            return replacement
        return word

    # \b zlapie tylko full words
    return re.sub(r"\b[A-Za-z]+\b", _sub, text)


# Regex dla string literals
# Single-quoted: 'content' (escape \\' supported)
SINGLE_QUOTE_RE = re.compile(r"'((?:[^'\\]|\\.)*)'")
# Double-quoted: "content"
DOUBLE_QUOTE_RE = re.compile(r'"((?:[^"\\]|\\.)*)"')
# Backtick-template literals: `content` z mozliwymi ${} expressions
# Wezmie minimalny match, ale skipuje multi-line jezeli zlozone.
BACKTICK_RE = re.compile(r"`((?:[^`\\$]|\\.|\$(?!\{))*)`", re.DOTALL)


def fix_string_content(content: str, stats: dict[str, int]) -> str:
    """Apply replace tylko do contentu string literali."""
    return replace_in_text(content, stats)


def fix_file(path: Path, apply: bool, verbose: bool) -> tuple[int, dict[str, int]]:
    """Process plik. Zwraca (zmienione_linii, stats)."""
    original = path.read_text(encoding="utf-8")
    stats: dict[str, int] = {}

    # Process kazdy typ string literal
    def _single_repl(m: re.Match) -> str:
        new_content = fix_string_content(m.group(1), stats)
        return f"'{new_content}'"

    def _double_repl(m: re.Match) -> str:
        new_content = fix_string_content(m.group(1), stats)
        return f'"{new_content}"'

    def _backtick_repl(m: re.Match) -> str:
        # Dla template literali - bardziej zachowawczo
        new_content = fix_string_content(m.group(1), stats)
        return f"`{new_content}`"

    new_text = SINGLE_QUOTE_RE.sub(_single_repl, original)
    new_text = DOUBLE_QUOTE_RE.sub(_double_repl, new_text)
    new_text = BACKTICK_RE.sub(_backtick_repl, new_text)

    # Liczba zmian
    changes = sum(stats.values())

    if changes > 0:
        if verbose:
            print(f"\n=== {path.name} ===")
            for word, count in sorted(stats.items(), key=lambda x: -x[1]):
                print(f"  {word} -> {WORD_MAP.get(word, '?')}: {count}x")

        if apply:
            path.write_text(new_text, encoding="utf-8")
            print(f"OK {path.name}: {changes} zmian zapisanych")
        else:
            print(f"DRY {path.name}: {changes} zmian wykrytych (bez zapisu)")

    return changes, stats


def main() -> int:
    parser = argparse.ArgumentParser(description="Fix PL diacritics in Cloud Design files")
    parser.add_argument("paths", nargs="+", help="Pliki .jsx/.html do przetworzenia (glob OK)")
    parser.add_argument("--apply", action="store_true", help="Zapisz zmiany (domyslnie dry-run)")
    parser.add_argument("--dry-run", action="store_true", help="Tylko podglad (default)")
    parser.add_argument("--verbose", "-v", action="store_true", help="Pokaz top zmienione slowa")
    args = parser.parse_args()

    # Resolve paths (handle glob shell expansion)
    files: list[Path] = []
    for p_str in args.paths:
        p = Path(p_str)
        if p.is_file():
            files.append(p)
        elif "*" in p_str:
            # Shell juz powinien rozwinac, ale fallback
            parent = p.parent if p.parent != Path(".") else Path(".")
            pattern = p.name
            files.extend(parent.glob(pattern))

    if not files:
        print("Brak plikow do przetworzenia", file=sys.stderr)
        return 1

    print(f"WORD_MAP: {len(WORD_MAP)} slow (BASE: {len(BASE_MAP)} + LOCAL: {len(LOCAL_MAP)} - DENY: {len(DENYLIST)})")
    print(f"Plikow: {len(files)}, tryb: {'APPLY' if args.apply else 'DRY-RUN'}\n")

    total_changes = 0
    global_stats: dict[str, int] = {}

    for f in sorted(files):
        changes, stats = fix_file(f, apply=args.apply, verbose=args.verbose)
        total_changes += changes
        for w, c in stats.items():
            global_stats[w] = global_stats.get(w, 0) + c

    print(f"\n=== SUMMARY ===")
    print(f"Total zmian: {total_changes}")
    print(f"Plikow zmienionych: {sum(1 for f in files if fix_file(f, apply=False, verbose=False)[0] > 0)}")

    if args.verbose and global_stats:
        print(f"\nTop 20 najczestszych zmian:")
        for word, count in sorted(global_stats.items(), key=lambda x: -x[1])[:20]:
            print(f"  {word:25s} -> {WORD_MAP.get(word, '?'):25s}: {count}x")

    if not args.apply:
        print(f"\n[Dry-run mode] Dodaj --apply zeby zapisac.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
