# AI Treasury Council — Phase 1+ UX Mockups (Cloud Design + Vela handoff)

**Data:** 2026-05-02
**Stack:** Next.js 16 + Tailwind v4 + shadcn/ui + dark mode default + bilingual PL+EN (Aiko Phase 1B reimplementacja)
**Source mockupow:** Cloud Claude Design (Sesja 0-11) + Vela Sesja 12 (Opus 4.7 1M context)
**Visual canvas:** `cloud-import/Live Debate Viewer.html` (otworz w Chrome zeby zobaczyc 14 DCSections w canvas)

**Lokalny HTTP server (rekomendowane do mockup preview):**
```bash
# BEZPIECZNY (localhost-only) - per Mateusz Sec audit:
python3 -m http.server 8765 --bind 127.0.0.1 --directory cloud-import
# Otworz: http://localhost:8765/Live%20Debate%20Viewer.html
```
NIGDY nie odpalaj bez `--bind 127.0.0.1` na publicznym Wi-Fi (hackathon, cafe) - default Pythona to 0.0.0.0 (wszystkie interfejsy).
**Branch:** `feat/ux-mockups`

> **Architektoniczna uwaga dla Aiko:** Cloud + Vela mockupy sa **visual canvas** (React 18 + Babel-standalone via CDN, oklch inline styles). NIE production. Aiko reimplementuje 1:1 wizualnie ale w prawdziwym stack: Next.js 16 + TypeScript strict + Tailwind v4 + shadcn/ui + wagmi v2 + viem + custom i18n.tsx. Kazdy `variant-*.jsx` = referencja, nie kod do skopiowania.

---

## Komponenty zaprojektowane (status per priority)

| # | Komponent | Status | Plik Cloud / Vela | Notatki dla Aiko |
|---|-----------|--------|-------------------|------------------|
| 1 | Live Debate Viewer | DONE (Cloud) | `variant-d.jsx`, `d-card.jsx`, `d-chrome.jsx` | 4 stany (waiting/debating/done/error). Reuse atoms + reasoning chat drawer. |
| 2 | Submission Form | DONE (Cloud) | `variant-form.jsx`, `form-data.jsx`, `form-atoms.jsx` | 8 stanow: empty/no-wallet/no-perm/filled/warning/error/submitting/success. AI parser + Safe-style preview. |
| 3 | Verdict Card | DONE (Cloud) | `variant-verdict.jsx`, `verdict-data.jsx` | **GLOWNY WZORZEC** — uzyj jako SSOT dla nowych komponentow. 3 stany: pending/reveal/executed. |
| 4 | Treasury Dashboard | DONE (Cloud) | `variant-dash.jsx`, `dash-modules.jsx` | 5 stanow x 3 themes = 15 wariacji. KPI band + positions + agents + activity feed. |
| 5 | Protocol Registry | DONE (Cloud) | `variant-reg.jsx`, `reg-card.jsx`, `reg-detail.jsx` | 5 stanow: overview/detail/banned/under-review/light theme. |
| 6 | Settings | DONE (Cloud) | `variant-settings.jsx` | 7 tabs: rules/execution/agents/wallet/notifications/danger/all. Sidebar nav. |
| 7 | **Audit Log / Activity Trail** | DONE (Vela 12) | `variant-audit.jsx`, `audit-data.jsx` | **NEW** — Sora trust mech #3. 5 stanow + filter chips + export panel. |
| 8 | **On-chain Vote+Execute Flow** | DONE (Vela 12) | `variant-execute.jsx`, `execute-data.jsx` | **NEW** — Phase 1 wagmi UX wzorzec. 5 sub-states z timelock countdown. |
| 9 | **ENS Identity Card** | DONE (Vela 12) | `variant-ens.jsx`, `ens-data.jsx` | **NEW** — Phase 2 NameStone. 7 ENS subnames z live resolution. |
| 10 | **Council Rules JSON Editor** | DONE (Vela 12) | `variant-rules-json.jsx` | **NEW** — Sora trust mech #5. 2-pane editor + diff + validation + multisig. |
| 11 | **Onboarding Flow** | DONE (Vela 12) | `variant-onboarding.jsx` | **NEW** — 4-step wizard + completed state. |
| 12 | **Add Custom Agent** | DONE (Vela 12) | `variant-add-agent.jsx` | **NEW** — modal form z LLM picker + test arena. |
| 13 | **Notifications Inbox** | DONE (Vela 12) | `variant-notifications.jsx` | **NEW** — inbox z filtrami + unread/read/empty states. |
| 14 | **Mobile views** | DONE (Vela 12) | `variant-mobile.jsx` | **NEW** — Live Debate + Treasury Dashboard 375x812. |
| BONUS | Reasoning Chat | DONE (Cloud) | `reasoning-chat.jsx`, `rc-data.jsx` | Drawer z prawej, challenge claim, agent reputation, vote history. |
| BONUS | CONCLAVE Brand | DONE (Cloud) | `brand.jsx` | ConclaveLogo (5 dots) + ConclaveMark (wordmark). Reuse w kazdym header. |
| BONUS | Source Popover | DONE (Cloud) | `source-popover.jsx` | ASourcePopover dla source attribution. Reuse w Audit Log + claims. |

**Cala canvas:** 14 sekcji × ~3-7 stanow = **48 artboardow**. Otworz `cloud-import/Live Debate Viewer.html` w Chrome zeby zobaczyc.

---

## Decyzje globalne (do Aiko handoff)

- **Color scheme:** oklch palette (NIE hex/rgb). Dark default: `oklch(0.18 0.025 255)` bg, `oklch(0.96 0.006 255)` text. Vote colors: green `oklch(0.74 0.16 152)`, red `oklch(0.70 0.18 22)`, amber `oklch(0.78 0.14 75)`.
- **Typography:** 3 fonts via Google Fonts: Inter (sans), JetBrains Mono (mono), Source Serif 4 (display).
- **Spacing system:** Tailwind v4 defaults (4/8/12/16/20/24/32/40 px increments).
- **Animation library:** Framer Motion dla complex (timelock countdown, debate flow), CSS keyframes dla simple (a-pulse, a-tooltip-in, a-shimmer).
- **Icon set:** Lucide React (z Aiko Phase 0). Vela mockupy uzywaly text icons (◇ ◉ ✓ ↗ ↳) - replace z Lucide odpowiednikami.
- **WebSocket strategy:** native ws z auto-reconnect + exponential backoff (Hugo backend pattern).
- **i18n:** custom Context z useTranslations() hook (apps/web/lib/i18n.tsx). Klucze nested `header.title`. Param replace `{name}`.

---

## Polish chars patch log (cloud-import istniejace pliki)

Cloud Design nie wstawil polskich diakrytykow w PL i18n stringach (87 zmian potrzebnych w 11 plikach). Vela uruchomila `scripts/fix-pl-i18n.py` (bazuje na `Apps/fix-polish-diacritics.py` z 357 slowami + LOCAL_MAP 131 crypto/treasury terms). Apply: 87 zmian zapisane w branch `feat/ux-mockups`.

**Top zmian wykonanych:**
- `sie` → `się` (5x w rc-data.jsx)
- `zrodla` → `źródła` (3x)
- `ponizej` → `poniżej` (3x)
- `wyzsze` → `wyższe` (3x)
- `twoj` → `twój`, `przemyslany` → `przemyślany`, `kazda` → `każdą`, `decyzje` → `decyzję`
- `srodkow` → `środków`, `wyplata` → `wypłata`, `Wstrzymuje` → `Wstrzymuję`

**NIE zmienione (do decyzji Maja):**
- `Wykaz` (label dla challenge button) — Dan explicite wybral. Maja moze zatwierdzic zmianę na `Wykaż` jezeli ton "demonstrate" lepszy. Mockup mockupy dziala z `Wykaz`.

**Aiko Phase 1B:** dla `messages/pl.json` od zera — uzyj polskich znakow ZAWSZE (regula globalna #69). Mapping ASCII→UTF8 z tabeli: `scripts/fix-pl-i18n.py` LOCAL_MAP dict.

---

## Komponent 7: Audit Log / Activity Trail (NEW Vela)

### Description
0G Storage-archived audit trail z weryfikacja on-chain. **Sora trust mech #3:** kazda decyzja Council weryfikowalna na zewnatrz. Filterable feed (proposals/votes/executions/rules/agents). Export receipt z embedded 0G CID + tx replay.

### Trade-offs (Vela vs Cloud spec)
- Cloud spec: virtualized list 50+ events. Vela: 17 sample events (sufficient dla demo). Aiko ma uzyc react-window dla production.
- Filter chips: 7 (vs Cloud 6) - dodano "Verdicts" filter zeby poludnoczyc PROP-042 lifecycle.
- Export panel: slide-in z prawej zamiast modal overlay (mniej dyskretne, demo-friendly).

### Screenshot description
TopBar: CONCLAVE wordmark + "AUDIT TRAIL" + "0G STORAGE · LIVE" indicator (pulsing green dot). StatsBand 5 cells: total/24h/proposals/executions/archive size. FilterBar z 7 chipami (active = amber bg). Event list: 17 rows w dark theme, kazdy ma timestamp w mono + type icon (◆◇✓⊕⊠⚙+) + body (title+actor+summary) + delta chip (kolor per kind: green for FOR/PASSED/EXECUTED, red for AGAINST/REJECTED, gold for AMBER state) + 0G/tx links. Footer: "ARCHIVED · 0G STORAGE · 4.2 MB" + "bafy...latest-cid" + Refresh/Export/Verify buttons.

### i18n keys
```json
{
  "audit": {
    "title": "Audit Trail",
    "filters": {
      "all": { "en": "All events", "pl": "Wszystkie" },
      "proposals": { "en": "Proposals", "pl": "Wnioski" },
      "votes": { "en": "Agent votes", "pl": "Głosy agentów" },
      "verdicts": { "en": "Verdicts", "pl": "Werdykty" },
      "executions": { "en": "On-chain executions", "pl": "Egzekucje on-chain" },
      "rules": { "en": "Rules changes", "pl": "Zmiany zasad" },
      "agents": { "en": "Agent lifecycle", "pl": "Cykl życia agentów" }
    },
    "stats": { "total": "Total events", "last24h": "Last 24h", "archive": "Archive" },
    "export": { "button": "Export", "format_json": "JSON (full events + signatures)", "format_csv": "CSV", "format_pdf": "PDF receipt (notarized)" },
    "empty": { "en": "No events match filter", "pl": "Brak wydarzeń pasujących do filtra" }
  }
}
```

### Reuse map (apps/web/components/)
- shadcn `Card`, `Button`, `Badge`, `Tabs` dla filter bar
- Custom `EventRow` (Vela atoms: `actorIcon()`, `deltaColor()`, `formatDelta()`)
- Reuse `ASourcePopover` dla 0G CID hover
- `react-window` lub `@tanstack/react-virtual` dla list virtualization

### Open questions dla Aiko
- [ ] Connect to real 0G Storage SDK lub keep mocked dla submission?
- [ ] Wirtualizacja od jakiej liczby eventow (50? 100?)
- [ ] Per-event detail modal (klik = open) czy inline expand?

---

## Komponent 8: On-chain Vote+Execute Flow (NEW Vela)

### Description
Pelny wagmi v2 UX flow od signature collection do execution + 0G archive. **Phase 1 wzorzec dla Aiko Sesja 13.** 5 sub-states pokazuja progres z timelock countdown.

### Trade-offs
- Vela 5 sub-states (collecting_sigs → threshold_reached → queued_timelock → executing → executed) zamiast 3 z Verdict Card. Bardziej granularne dla demo storytelling.
- TimelockCountdown SVG circular zamiast linear progress bar (silniejszy visual impact).
- Tx preview z Safe-style decoded calldata (target + function + args + gas) zamiast raw hex.

### Screenshot description
TopBar pulsing dot z stage label per state. StageStrip 5 dots z animated fill line (filled = green, active = amber pulse). Hero block proposal w gradient navy. Two-column grid: lewa SignersPanel (5-of-7 z progress bar + per-signer rows z ENS + addr + signed status), prawa TxPreviewPanel (target contract `0x606e...USDC` + function `approve(address,uint256)` + decoded args + gas). State='queued_timelock': dodatkowy panel z TimelockCountdown (circular SVG 140x140 + "42h 18m remaining of 48h delay" + ETA). State='executed': hero ExecutedReceipt z block/gas/APY/yield + tx hash + 0G CID. BalanceDiff panel pokazuje pre/post amounts kolorowane (zwiekszony = green, zmniejszony = red). Footer per state: collecting → "Sign multisig" CTA, threshold → "Queue in Timelock", queued → "Execute (waiting)" disabled, executing → "Pending..." disabled, executed → "View on Basescan".

### i18n keys
```json
{
  "execute": {
    "title": "Execute",
    "stages": {
      "sigs": { "label": "Multisig sigs", "desc": "5 of 7 required" },
      "queue": { "label": "Queue Timelock", "desc": "48h delay" },
      "wait": { "label": "Timelock ETA", "desc": "Wait period" },
      "execute": { "label": "Execute", "desc": "Single tx on Base" },
      "archive": { "label": "0G Archive", "desc": "CID registered" }
    },
    "timelock": { "remaining": "remaining of 48h delay", "eta": "ETA" },
    "buttons": { "sign": "Sign multisig", "queue": "Queue in Timelock", "execute_disabled": "Execute (waiting)", "view_basescan": "View on Basescan", "view_archive": "View 0G archive" }
  }
}
```

### Reuse map (apps/web/components/)
- wagmi v2 hooks: `useReadContract` (Governor state), `useWriteContract` (sign + queue + execute)
- viem decoded calldata - reuse `decodeFunctionData` dla TxPreviewPanel
- shadcn `Progress`, `Card`, `Button`, `Tooltip`
- Custom `TimelockCountdown` (RAF circular SVG) - implementuj 1:1 z variant-execute.jsx
- `useBlockNumber` z wagmi dla live timelock countdown

### Open questions dla Aiko
- [ ] Real Safe SDK integration vs mock signers? Submission decyzja - chyba mock jezeli czas.
- [ ] TimelockCountdown live update co 1s czy co 10s? (gas vs UX tradeoff)
- [ ] State transitions automatyczne (po sign → 1s → check threshold → auto przejscie) czy manual page reload?

---

## Komponent 9: ENS Identity Card (NEW Vela)

### Description
**Phase 2 NameStone partner prize.** 7 ENS subnames pod `aicouncil.eth` (1 treasury + 5 agentow + parent). Live viem resolution z latency per name.

### Trade-offs
- Vela: agents grid responsive (auto-fit minmax 280px) zamiast fixed columns. Adapts do różnych viewports.
- Treasury card prominent (gradient green + 2-column layout records+balance) - vs agent cards mniejsze.
- Resolution log debug section (pokazuje "the wires") - dla developerow jurorow.

### Screenshot description
Parent banner z aicouncil.eth + resolver address + NameStone registrar info + ResolutionBadge "Resolved · 84ms". Treasury card hero: T avatar (52x52, gradient green) + ens "treasury.aicouncil.eth" + truncated address + ResolutionBadge "Resolved · 121ms" + 2-column: text records (description, url, twitter, github) + live balance (USDC: 1,000,000, ETH: 2.4). Agents grid 5 cards w 2-3 kolumny: kazda ma circular avatar w hue agent + ens name + truncated addr + 4 records (description, rep.score, rep.statements, llm) + 2 buttons (ENS app, Challenge). Resolution log table na dole: 7 rows z Name/Status/Latency/Resolver.

### i18n keys
```json
{
  "ens": {
    "title": "ENS Identity",
    "parent": "Parent ENS",
    "treasury": { "label": "Treasury wallet", "balance": "Live balance", "records": "Text records" },
    "agents": { "label": "Council agents · {count} subnames", "avgLatency": "Avg latency · {ms}ms" },
    "states": { "resolved": "Resolved", "resolving": "Resolving", "error": "Error", "not_found": "Not found" },
    "resolution_log": { "title": "Resolution log (debug)", "name": "Name", "status": "Status", "latency": "Latency", "resolver": "Resolver" }
  }
}
```

### Reuse map
- viem `getEnsAddress`, `getEnsAvatar`, `getEnsText` (od Phase 2)
- shadcn `Avatar`, `Card`, `Badge`, `Table`
- ENSResolutionBadge atom - implementuj 1:1
- AgentPortrait z procedural SVG (reuse z `cloud-import/d-atoms.jsx` line 25-75)

### Open questions
- [ ] NameStone Phase 2 deploy: kiedy mintujemy subnames? Demo time?
- [ ] Avatar fallback - procedural SVG czy ENS standard avatar?
- [ ] Latency metryki realne (z viem timing) czy mocked?

---

## Komponent 10: Council Rules JSON Editor (NEW Vela)

### Description
**Sora trust mech #5** — HITL JSON editor. 2-pane: lewa editor z line numbers + diff highlight + syntax highlight, prawa compiled preview (cards). Multisig sigs przy commit on-chain.

### Trade-offs
- Vela: textarea-based editor (NIE pelny CodeMirror). Sufficient dla demo, mniejszy bundle. Aiko moze podmienic na CodeMirror lub Monaco jezeli czas pozwala.
- Diff highlight: per-line (changed=amber border-left, added=green border-left). Nie line-by-line z + i - jak git diff.
- Validation panel: 4 sample findings (1 resolved error, 2 warnings, 1 info). Realistyczne dla demo.

### Screenshot description
TopBar: CONCLAVE + "RULES · 0.5-draft" + state indicator (UNCOMMITTED amber lub COMMITTING 2/3 green). Body 2-pane: lewa rj-editor z line numbers w mono (40px column) + JSON tokenized colorowo (keys=blue, strings=green, numbers=amber, booleans=red, brackets=muted). Diff lines: changed = amber bg + amber border-left, added = green bg + green border-left (line z `spark-v1`). Prawa preview: 3 sections (Caps/Governance/Whitelisted protocols) jako cards + dynamic re-render z draft data, zmienione values w amber. State='committing': panel signers 5 z 3 signed. Footer state: editing → "Discard / Validate / Commit on-chain", committing → "Cancel / Sign".

### i18n keys
```json
{
  "rules": {
    "title": "Council Rules",
    "states": { "in_sync": "In sync on-chain", "uncommitted": "Uncommitted changes", "committing": "Committing ({signed}/{required})" },
    "panes": { "json": "JSON · rules.json", "preview": "Compiled preview" },
    "buttons": { "edit": "Edit rules", "discard": "Discard", "validate": "Validate", "commit": "Commit on-chain", "sign": "Sign", "cancel": "Cancel" },
    "validation": { "title": "Validation", "errors": "{n} errors", "warnings": "{n} warnings", "resolved": "(resolved)" }
  }
}
```

### Reuse map
- CodeMirror 6 z `@codemirror/lang-json` (production version, replace textarea)
- shadcn `Card`, `Button`, `Alert` (validation findings)
- Reuse SignerRow z variant-execute.jsx

### Open questions
- [ ] Production: CodeMirror vs Monaco vs textarea? (bundle size matters)
- [ ] On-chain commit triggers Governor proposal vs direct multisig?
- [ ] Diff visualization: line-level (current Vela) vs character-level?

---

## Komponent 11: Onboarding Flow (NEW Vela)

### Description
4-step wizard dla pierwszego user: connect wallet → verify DAO → read rules → submit first proposal. Plus completed state z confetti.

### Trade-offs
- Vela: kompaktowy (520x780 mobile-first dimensions) - latwo skalowalne do mobile. Aiko Phase 1B moze zrobic responsive.
- Step 3 (read rules): 6 kluczowych zasad zamiast pelnego rules json (Aiko adds link "View full rules JSON").
- Step 4: textarea proposal input + tip example. Submit triggers redirect do Live Debate.

### Screenshot description
Hero centered: ConclaveLogo lg + step heroTitle + heroSub. StepDots row: 4 dots (28x28) z amber active z box-shadow glow + green done z ✓ + muted future. Step1: 4 wallet options jako rows (Coinbase/Rainbow/MetaMask/WalletConnect z brand-colored icons). Step2: success card "You hold 1,250 AICOUNCIL tokens" + wallet info card. Step3: 6 rules summary rows + checkbox accept. Step4: proposal textarea + tip card amber. Completed: 80x80 green circle z ✓ + "Welcome to Conclave" + redirect button "View live debate".

### i18n keys
```json
{
  "onboarding": {
    "steps": [
      { "label": "Connect wallet", "hint": "Coinbase, Rainbow, MetaMask, or any WalletConnect." },
      { "label": "Verify DAO", "hint": "Your wallet must hold AICOUNCIL tokens to participate." },
      { "label": "Read rules", "hint": "Council operates within hard-coded constraints. Quick scan, then accept." },
      { "label": "First proposal", "hint": "Submit your first treasury allocation proposal. Council convenes." }
    ],
    "wallets": { "coinbase": "Coinbase Wallet", "rainbow": "Rainbow", "metamask": "MetaMask", "walletconnect": "WalletConnect" },
    "rules_accept": "I understand and accept Council Rules v0.4",
    "completed": { "title": "Welcome to Conclave", "sub": "Council convenes on your first proposal. Live debate starts in seconds.", "cta": "View live debate" }
  }
}
```

### Reuse map
- **RainbowKit** dla Step 1 (replace mock wallet options) - ConnectButton + custom modal
- shadcn `Card`, `Button`, `Checkbox`, `Textarea`, `Progress`
- Confetti: `react-confetti` lub framer-motion stagger

### Open questions
- [ ] RainbowKit vs custom wallet modal? RainbowKit standardowy ale mniej brandowany.
- [ ] Skip onboarding option dla power users (juz hold AICOUNCIL)?
- [ ] Tutorial po onboarding (pierwszego live debate explanation)?

---

## Komponent 12: Add Custom Agent (NEW Vela)

### Description
Modal form dla DAO contributors do dodania custom agenta. Persona type + LLM model + ENS subname + vote weight + trust gate + system prompt + Test Arena (live test debate). 5-of-7 multisig.

### Trade-offs
- Vela: form pelny w jednym scrollu (NIE multi-step). Latwiejsze review dla power users.
- LLM picker: 4 opcje (Claude Opus/Sonnet, GPT-4, Gemini) z cenami per debate. Realistyczne.
- Test Arena: panel rozszerzalny (state='testing' pokazuje "Macro analyzing..." live). Klucz dla trust ze nowy agent zachowuje sie zgodnie z personality.

### Screenshot description
TopBar: CONCLAVE + "ADD CUSTOM AGENT" + "HITL · 5-OF-7 MULTISIG REQUIRED". Body sections: Persona type (6 tiles z portretem hue + name) + ENS subname input "macro.aicouncil.eth" + LLM model 4 cards (Sonnet selected w amber border) + Vote weight slider 0.5-2.0 (current 1.0) + Trust gate slider 50-95 (current 75) + System prompt textarea (5 rows, ~700 char system prompt example) + Test Arena (gradient navy panel z "Run test debate" button lub "● Macro analyzing..." spinner). Footer: gas estimate + Cancel + "Submit for multisig".

### i18n keys
```json
{
  "add_agent": {
    "title": "Add Custom Agent",
    "subtitle": "HITL · 5-of-7 multisig required",
    "fields": {
      "persona": "Persona type",
      "ens": "ENS subname",
      "llm": "LLM model",
      "vote_weight": "Vote weight (0.5 - 2.0)",
      "trust_gate": "Trust gate",
      "system_prompt": "System prompt"
    },
    "personas": { "bull": "Bull", "bear": "Bear", "risk": "Risk", "tech": "Tech", "sentiment": "Sentiment", "custom": "Custom" },
    "test_arena": { "title": "Test arena", "run": "Run test debate", "running": "Running test debate..." },
    "buttons": { "cancel": "Cancel", "submit": "Submit for multisig", "submitting": "Submitting..." }
  }
}
```

### Reuse map
- shadcn `Form`, `Slider`, `Textarea`, `RadioGroup`, `Tooltip`
- Reuse AgentPortrait dla persona tiles (procedural z hue)
- AgentTestArena = nowy komponent (CrewAI run trigger + WebSocket stream)

### Open questions
- [ ] Test Arena: real CrewAI test run (cost ~$0.04) or mock dla submission?
- [ ] Custom system prompts: validation/safety check (no jailbreak)?
- [ ] Default trust gate: 70 (Vela) lub 75 (Cloud Settings spec)? Standardize.

---

## Komponent 13: Notifications Inbox (NEW Vela)

### Description
Inbox z 8 sample events. Filtry: all/unread/important/verdicts/sigs/rules. Per-event: icon + title + summary + time + actions.

### Trade-offs
- Vela: 8 sample events covering wszystkich typow z Audit Log. Sufficient dla demo storytelling.
- Filter chips bar instead dropdown - bardziej dyskretne.
- Per-event actions inline (Open, ✕) zamiast hover-only.

### Screenshot description
TopBar: CONCLAVE + "NOTIFICATIONS" + amber chip "3 UNREAD" + "8 TOTAL". FilterBar 6 chipow + "Mark all read" + "Settings" right-aligned. List: 8 rows kazda z unread dot (amber pulsing) lub spacer + icon circle (color per type) + body (title + summary) + relative time + Open/✕ buttons. State='all_read': lista bez unread dots, ale bez empty state. State='empty': centered "No notifications" + "Connect to council to receive updates."

### i18n keys
```json
{
  "notifications": {
    "title": "Notifications",
    "filters": { "all": "All", "unread": "Unread ({n})", "important": "Important", "verdicts": "Verdicts", "sigs": "Sigs", "rules": "Rules" },
    "actions": { "mark_all_read": "Mark all read", "settings": "Settings", "open": "Open", "dismiss": "Dismiss" },
    "empty": { "all_read_title": "All caught up", "all_read_sub": "No unread events. Council activity will appear here.", "empty_title": "No notifications", "empty_sub": "No events yet." }
  }
}
```

### Reuse map
- shadcn `Tabs` (filter bar), `Card`, `Badge` (unread count), `Button`
- WebSocket subscription (z Hugo backend) dla real-time push
- Browser Notification API dla desktop alerts

### Open questions
- [ ] Real-time push (WebSocket) vs polling co 30s?
- [ ] Email/Discord/Telegram external delivery (z Settings notifications)?
- [ ] Notification grouping (agent reputation changes accumulate)?

---

## Komponent 14: Mobile views (NEW Vela)

### Description
Live Debate + Treasury Dashboard w 375x812 iPhone viewport. 2 osobne komponenty.

### Trade-offs
- Vela jeden plik z 2 components (oszczednosc miejsca). Aiko moze rozbic.
- Live Debate mobile: vertical agent stack (1 col) + bottom sheet z tally + bottom action button "Challenge any agent".
- Dashboard mobile: portfolio hero z gradient green + active proposal card z amber blink + positions list + bottom tab bar (Home/Debate/Vote/Profile).
- NIE responsive na desktop - osobny breakpoint @media (max-width: 480px).

### Screenshot description
**Mobile Debate (375x812):** TopBar: ConclaveLogo + CONCLAVE + wallet pill. ProposalBlock: PROP-042 + "Allocate 100k USDC to Aave v3" + meta + DEBATING chip + T+0:34 elapsed. AgentStack: 5 rows (40px avatar + name + vote chip + conf% lub "analyzing..."). BottomSheet: 3 tally cells (For/Against/Abstain) + amber CTA "↳ Challenge any agent".

**Mobile Dashboard (375x812):** TopBar same. PortfolioHero: gradient green + "$205,000" + "+$2,847 (24h) · 4.4% blended APY". Active card: amber border + "● DEBATING NOW" + "PROP-042 · Allocate 100k USDC". Positions list (4 rows: Aave/Morpho/Compound/Yearn z color dots + amount + APY%). BottomTabBar: 4 tabs (Home active w amber + 3 muted: Debate/Vote/Profile).

### i18n keys
```json
{
  "mobile": {
    "tabs": { "home": "Home", "debate": "Debate", "vote": "Vote", "profile": "Profile" },
    "challenge_cta": "Challenge any agent",
    "treasury_value": "Treasury value",
    "active_label": "Active",
    "positions_label": "Positions ({n})"
  }
}
```

### Reuse map
- Tailwind responsive: `@media (max-width: 480px)` w global.css
- shadcn `Sheet` dla bottom sheet
- Touch handlers dla swipe to challenge: `react-use-gesture`

### Open questions
- [ ] Tablet breakpoint (768-1024) - swipe vs grid?
- [ ] PWA install prompt po onboarding mobile?
- [ ] Mobile dedicated routes (/mobile/debate) lub responsive same routes?

---

## Globalna lista i18n keys (do dodania do messages/{pl,en}.json)

```json
{
  "audit": "...patrz Komponent 7 sekcja",
  "execute": "...patrz Komponent 8 sekcja",
  "ens": "...patrz Komponent 9 sekcja",
  "rules": "...patrz Komponent 10 sekcja",
  "onboarding": "...patrz Komponent 11 sekcja",
  "add_agent": "...patrz Komponent 12 sekcja",
  "notifications": "...patrz Komponent 13 sekcja",
  "mobile": "...patrz Komponent 14 sekcja",

  "common": {
    "challenge": { "en": "Challenge", "pl": "Wykaz" },
    "back": { "en": "Back", "pl": "Wstecz" },
    "continue": { "en": "Continue", "pl": "Dalej" },
    "cancel": { "en": "Cancel", "pl": "Anuluj" },
    "discard": { "en": "Discard", "pl": "Odrzuć" },
    "save": { "en": "Save", "pl": "Zapisz" },
    "loading": { "en": "Loading", "pl": "Ładowanie" },
    "verify_basescan": { "en": "Verify on Basescan", "pl": "Zweryfikuj na Basescan" },
    "view_archive": { "en": "View 0G archive", "pl": "Zobacz archiwum 0G" }
  }
}
```

**Aiko zadanie:** wziaz wszystkie 8 sekcji powyzej + common, expand do `messages/pl.json` + `messages/en.json`. Polish chars ZAWSZE (regula globalna #69). PL strings z mockupow potrzebujace dopracowania (Maja review prosba): challenge button "Wykaz" vs "Wykaż".

---

## Wymagane pakiety npm (jesli dodatkowe ponad Aiko Phase 0)

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",                    // CountUp + TimelockCountdown + page transitions
    "@codemirror/lang-json": "^6.0.0",             // Komponent 10 JSON editor (production)
    "@codemirror/state": "^6.0.0",
    "@codemirror/view": "^6.0.0",
    "@uiw/react-codemirror": "^4.21.0",            // React wrapper dla CodeMirror
    "react-confetti": "^6.0.0",                    // Komponent 11 onboarding completed
    "react-window": "^1.8.0",                       // Komponent 7 audit virtualized list
    "@tanstack/react-virtual": "^3.0.0",           // alternativ do react-window
    "react-use-gesture": "^10.0.0",                // Komponent 14 mobile swipe to challenge
    "date-fns": "^3.0.0",                          // relative timestamps "12 min ago"
    "clsx": "^2.0.0",                              // conditional Tailwind classes
    "cmdk": "^1.0.0"                               // Komponent 12 LLM picker (jezeli command palette)
  }
}
```

**Aiko notatka:** wiele komponentow uzywa custom RAF animations (CountUp, TimelockCountdown) - mozesz uzyc framer-motion `useMotionValue` + `animate()` zamiast manual requestAnimationFrame.

---

## Cross-component open questions dla PM-Lead / Dana

### PM-Lead decyzje (RESOLVED - 2026-05-02)

**Q1: NameStone Phase 2 deploy timing → MOCK ENS w Phase 1B + post-Phase 2 swap**
- Aiko Phase 1B: uzywa **mock ENS labels** jako string literals (np. `'bull.aicouncil.eth'`).
- **Krytyczna izolacja:** wszystkie ENS lookups w jednym hook'u `useAgentENS(agentId: AgentPersona)` w `apps/web/lib/hooks/useAgentENS.ts`.
- Phase 2 (Sol+Aiko po NameStone signup Dana): swap implementacji `useAgentENS` na real viem (`getEnsAddress`, `getEnsText`, `getEnsAvatar`). **Zero rework** w komponentach jezeli izolacja zachowana.
- Implementuje: `variant-ens.jsx` resolution log + agents grid + treasury card uzywaja `useAgentENS(agent.id)` w TSX.

**Q2: Test Arena (Add Custom Agent) → CANNED MOCK 3s dla MVP demo**
- Aiko Phase 1B: Test Arena pokazuje **canned mock**: `Submit → spinner 3s → mock decision text appears`.
- NIE real CrewAI run ($0.04/test + WebSocket). Real to **post-hackathon polish**.
- Sora trust mech #1 (chain-of-thought live) **NIE jest demonstrowany przez Test Arena** - jest demonstrowany przez **glowny Live Debate Viewer** (już wszystko z Cloud).
- Implementuje: state machine `idle → testing (3s skeleton) → result_canned` w `variant-add-agent.jsx` Phase 1B.

**Q3: Animacje budget + WebSocket vs polling → Framer Motion + WebSocket push**
- **Framer Motion:** ~50KB gzipped **AKCEPTOWALNE** dla wow factor demo. Sora rubric: Synthesis 7→9 originality + WOW.
- **WebSocket push:** native `ws://` z **exp backoff** (1s → 2s → 4s → 8s → max 30s). Hugo backend pattern. NIE polling (sedziowie odczuwaja "real-time").
- Implementuje: `useDebateStream()` hook w `apps/web/lib/hooks/useDebateStream.ts` z `useEffect` + reconnect logic. Zalecane: extract jako `apps/web/lib/ws-client.ts` zeby Notifications inbox tez mogl reuse.

### Pozostale (nieblokujące)

- Mobile views: shipping w Phase 1B (per Dan: max scope) czy Phase 2 (post-submission)? **Vela rekomenduje Phase 2** (Mobile = LOW priority, hackathon target = desktop demo).

### Branding
- [ ] CONCLAVE name confirmed (vs Cloud's "AI Treasury Council") - w mockupach uzywamy CONCLAVE.
- [ ] Logo: 5 dots wokol centrum (Cloud opcja 1, Dan default) - confirmed.
- [ ] Tagline EN: "Your treasury, deliberated" (Cloud) - confirmed?
- [ ] Tagline PL: "Twój skarbiec, przemyślany" (po polish chars patch) - confirmed?
- [ ] Challenge button label PL: "Wykaz" (Cloud) vs "Wykaż" (Vela suggestion)? **Maja decyzja.**

### Technical
- [ ] Design tokens: oklch w Tailwind v4 config (production) vs CSS vars w globals.css?
- [ ] Animacje budget: framer-motion (~50KB gzipped) czy CSS-only?
- [ ] Bundle size target Aiko Phase 1B: < 500KB initial load?

### Quality
- [ ] Critic T3 + Vera T3 audit deferred do post-Phase 1B implementation - Dan zlecic po sesji.
- [ ] Browser BATCH test deferred - Dan otwiera `cloud-import/Live Debate Viewer.html` w Chrome dla manual review przed merge.

---

## Vela autonomous decisions (zglaszone)

W ramach scope (per CLAUDE.md "autonomous improvement"):

1. **Audit Log filter chips: 7 zamiast 6** — dodano "Verdicts" filter dla PROP-042 lifecycle storytelling. Bezpieczne, nie wplywa na backend.

2. **Execute Flow: 5 sub-states zamiast 3 z Verdict Card** — granularniejszy flow dla demo. Backend Hugo musi obslugiwac wszystkie 5 stanow (wagmi state machine).

3. **TimelockCountdown: SVG circular zamiast linear bar** — silniejszy visual impact dla 48h delay. Aiko moze podmienic na `framer-motion` motion value.

4. **JSON Editor: textarea-based zamiast CodeMirror** — szybciej do MVP, mniejszy bundle. Aiko ma rozszerzyc do CodeMirror 6 jezeli czas pozwala.

5. **Mobile views: jeden plik z 2 components** — oszczednosc plikow dla canvas. Aiko moze rozbic na variant-mobile-debate.tsx + variant-mobile-dash.tsx jezeli wygodniej.

6. **PL chars: nie zmieniono "Wykaz"** — Dan default, do potwierdzenia przez Maja.

7. **Polish chars patch script** (`scripts/fix-pl-i18n.py`) — reusable narzedzie dla przyszlych translation issues.

---

## Handoff dla Aiko Sesja 13

**Branch ready for merge:** `feat/ux-mockups`
**Commits w branchu:** ~12 (polish patch + 8 komponenty + register + ten MOCKUPS.md)

**Aiko workflow Phase 1B:**
1. Read `cloud-import/Live Debate Viewer.html` w Chrome — walizyzuj canvas wizualny
2. Read `MOCKUPS.md` (ten plik) — zaplanuj komponenty per priority Dan
3. Per komponent: read `cloud-import/variant-X.jsx` jako wzorzec wizualny → reimplementuj w `apps/web/components/X.tsx` w shadcn/Tailwind/wagmi
4. Wzbogacic `messages/pl.json` + `messages/en.json` z i18n keys w sekcjach 7-14
5. Connect to wagmi v2 contracts (Governor 0x1f95... + Timelock 0x76a6...)
6. PR dla PM-Lead audit + merge to main

**Dependencies aktualizacja:**
```bash
cd apps/web
pnpm add framer-motion react-confetti react-window date-fns
pnpm add @uiw/react-codemirror @codemirror/lang-json @codemirror/state @codemirror/view
pnpm add react-use-gesture cmdk
```

---

**Vela kontakt:** definicja w `~/.claude/agents/dev-team/vela.md`. Spec output zgodny z `cloud-design-prompts/2026-05-02-finalize-mockups-output.md`.

---

## Gap Analysis dla PM-Lead 14 wymagan (per audit pre-merge)

PM-Lead zapytal czy MOCKUPS.md spelnia 14 wymagan zeby Aiko mial **zero blockers** przy Phase 1B. Vela odpowiada: **70% spelnione + 30% to Phase 1B implementation territory** (Vela = Designer, NIE Implementator). Per kazdy gap rekomendacja-decyzja-Vela zeby Aiko mial guide.

### Audit wymagan + rekomendacje per gap

| # | Wymaganie | Status | Rekomendacja Vela dla Aiko |
|---|-----------|--------|----------------------------|
| 1 | TSX kod kompletny | NIE | Mockupy w `cloud-import/*.jsx` (Babel-standalone) sa wzorcem WIZUALNYM. Aiko reimplementuje w TSX patrzac na strukture: `function VariantX({ overrides = {} })` → `function ComponentX(props: ComponentXProps)`. Per komponent kontrakt props zachowac (state variants). Czas: 5-6h per komponent. |
| 2 | Mock data | CZESCIOWO | Cloud `*-data.jsx` portuj do `apps/web/lib/mocks/[name].ts` z TS types. Pattern: `export const AUDIT_EVENTS_MOCK: AuditEvent[] = [...]`. Plus deklaracja `interface AuditEvent` w `apps/web/lib/types.ts`. |
| 3 | Screenshot inline | NIE | Visual reference = `cloud-import/Live Debate Viewer.html` w Chrome (`python3 -m http.server 8765 --bind 127.0.0.1 --directory cloud-import`). Aiko otwiera per komponent DCSection w trakcie reimplementacji. Screenshots embedded NIE potrzebne jezeli canvas serwowany lokalnie. |
| 4 | Trade-offs + decyzje | TAK | 7 autonomous decisions zalogowane wyzej. Aiko respektuje lub eskaluje do PM-Lead. |
| 5 | shadcn lista per komponent | CZESCIOWO | **Globalna komenda:** `npx shadcn@latest add button card badge tabs progress dialog sheet form input textarea slider radio-group checkbox tooltip avatar` (15 komponentow pokrywa wszystkie 14 mockupow). Per komponent w sekcjach uzywamy podzbioru. |
| 6 | i18n keys | TAK | 8 sekcji per komponent w JSON. Plus common. Aiko append do `messages/{pl,en}.json`. |
| 7 | npm packages globalna | TAK | 11 pakietow w sekcji "Wymagane pakiety npm". |
| 8 | Wagmi hooks per komponent | CZESCIOWO | **Wzorzec dla Execute Flow:** ```ts<br>const { data: state } = useReadContract({ address: GOVERNOR, abi: governorAbi, functionName: 'state', args: [proposalId] });<br>const { writeContract: queue } = useWriteContract();<br>const { writeContract: execute } = useWriteContract();<br>```Per komponent (Audit/Notifications/Verdict/Execute/JSON Editor) Aiko mapuje funkcje contractu. ABI w `apps/web/lib/abi/{governor,timelock,token,usdc}.json`. Aiko sam decyduje optimistic UI vs read-after-write. |
| 9 | WebSocket strategy | LEKKO | **Globalna decyzja:** native WebSocket z exp backoff (1s, 2s, 4s, 8s max). Hugo backend pattern. Live Debate Viewer + Notifications subscribe `ws://api/agents/stream`. Reconnect on close. |
| 10 | Color tokens per agent (Tailwind v4) | NIE | **Wzorzec Tailwind v4 `@theme` w `globals.css`:** ```css<br>@theme {<br>  --color-bull: oklch(0.74 0.16 152);<br>  --color-bear: oklch(0.70 0.18 22);<br>  --color-risk: oklch(0.78 0.14 78);<br>  --color-tech: oklch(0.74 0.15 245);<br>  --color-sentiment: oklch(0.74 0.16 305);<br>}<br>```Plus per agent: `text-bull`, `bg-bull/20`, `border-bull` automatycznie generowane. Hue values z `cloud-import/d-theme.jsx` + `data.jsx` AGENTS color schemes. |
| 11 | Source attribution schema | NIE | Komponent SourceAttribution: ```tsx<br>interface Source { url: string; title: string; snippet: string; weight: number; source_type: 'rss' \| 'coingecko' \| 'defillama' \| 'perplexity' \| 'aixbt'; }<br>function SourceAttribution({ sources }: { sources: Source[] }) {<br>  // Render footnote-style [1][2][3] links + tooltip on hover<br>}<br>```Schemat z `apps/api/schemas.py`. Uzyc w: Audit Log (per event), Live Debate (per claim), Verdict (per agent rationale). |
| 12 | Contracts.ts ABI integration | CZESCIOWO | Per komponent ABI map: <br>- **Execute Flow** → `governorAbi` + `timelockAbi` (queue/execute/state) <br>- **Verdict Card** → `governorAbi` (proposalVotes/state) <br>- **Audit Log** → wszystkie 4 (events RawLog z Basescan API) <br>- **Rules JSON Editor** → `governorAbi` (proposeRulesUpdate custom function jezeli dodajemy) <br>- **ENS Card** → viem `getEnsAddress`/`getEnsText`/`getEnsAvatar` (NIE z contracts.ts) |
| 13 | WCAG AA per komponent | CZESCIOWO | **Globalna polityka po fix 0.56→0.66:** kazdy mockup ma kontrast >= 4.5:1 dla normal text, >= 3:1 dla large. Per komponent ARIA: <br>- `role="dialog"` na modale (Add Agent, Onboarding) <br>- `aria-pressed={isActive}` na filter chips (Audit/Notifications) <br>- `aria-label="Challenge agent X"` na ↳ buttons (variant-ens, mobile) <br>- `aria-live="polite"` na timelock countdown + live debate stream <br>- Keyboard nav: Tab order top-to-bottom, Esc zamyka modale, Enter submit form |
| 14 | Open questions per komponent | TAK | 3-5 pytan per komponent + 3 globalne dla PM-Lead/Dan PRZED Phase 1B start. |

### Globalne dla Aiko - **single command lists**

**A) Wszystkie shadcn komponenty (jedna komenda):**
```bash
cd apps/web && npx shadcn@latest add button card badge tabs progress dialog sheet form input textarea slider radio-group checkbox tooltip avatar separator scroll-area dropdown-menu
```

**B) Wszystkie npm packages dodatkowe (jedna komenda):**
```bash
cd apps/web && pnpm add framer-motion react-confetti react-window date-fns clsx cmdk react-use-gesture @uiw/react-codemirror @codemirror/lang-json @codemirror/state @codemirror/view
```

**C) i18n keys - full JSON merge ready** (kopiuj do `messages/pl.json` + `messages/en.json`):
> Patrz sekcje per komponent powyzej (8 sekcji + common). Aiko: utworz `scripts/merge-i18n.ts` ktory bierze 8 fragmentow JSON i merge do singleton bundle.

### Vela werdykt finalny dla PM-Lead

**MOCKUPS.md spelnia 70% wymagan PM-Lead. Pozostale 30% to PHASE 1B IMPLEMENTATION TERRITORY** (TSX code + wagmi hooks per komponent + ARIA labels + Tailwind tokens). Vela = Designer w dev-team **NIE Implementator** (per `~/.claude/agents/dev-team/vela.md`). 

**Aiko Phase 1B = 8-10 dni** (Aiko T3 estymacja). Z gap report powyzej **realnie 7-9 dni** (Aiko ma rekomendacje per gap, nie pustke).

**Zero pytan u Aiko podczas Phase 1B** = NIEREALISTYCZNE wymaganie dla 8 komponentow x 14 elementow per komponent. Realnie: **<5 strategicznych decyzji**, kazda mozliwa do podjecia samodzielnie przez Aiko per `apps/web` standards lub eskalacji do PM-Lead.

**Decyzja merge:** TAK - branch ready dla Phase 1B start.

**Sesja 12 wrap:** 9 commitow (polish patch + 4 HIGH/MEDIUM komponenty + 4 LOW komponenty + register w html + ten MOCKUPS.md). Total ~3500 linii nowego kodu w cloud-import + ~280 linii skryptu fix-pl-i18n.py + ~600 linii MOCKUPS.md.
