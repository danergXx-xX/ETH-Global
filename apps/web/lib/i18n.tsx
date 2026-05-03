"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import pl from "../messages/pl.json";
import en from "../messages/en.json";

type Locale = "pl" | "en";
type Messages = typeof en;

const bundles: Record<Locale, Messages> = { pl, en };

function getNestedValue(obj: Record<string, unknown>, path: string): string | null {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : null;
}

function safeReadStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem("locale");
    if (stored === "pl" || stored === "en") return stored;
  } catch {
    return null;
  }
  return null;
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

export function useI18n() {
  return useContext(I18nContext);
}

export function useTranslations(namespace?: string) {
  const { t } = useContext(I18nContext);
  if (!namespace) return t;
  return (key: string, params?: Record<string, string>) =>
    t(`${namespace}.${key}`, params);
}

function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = safeReadStoredLocale();
  if (stored) return stored;
  try {
    return navigator.language.startsWith("pl") ? "pl" : "en";
  } catch {
    return "en";
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(detectLocale());
    setMounted(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem("locale", l);
      document.documentElement.lang = l;
    } catch {
      // localStorage unavailable (private mode, SSR edge) - state-only update is fine
    }
  }, []);

  const currentLocale: Locale = mounted && (locale === "pl" || locale === "en") ? locale : "en";
  const messages = bundles[currentLocale] ?? bundles.en;

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      const resolved =
        getNestedValue(messages as unknown as Record<string, unknown>, key) ??
        getNestedValue(bundles.en as unknown as Record<string, unknown>, key) ??
        key;
      // Hard guarantee: t() always returns a string, never an object/array.
      // Prevents React error #31 ("Objects are not valid as a React child")
      // when a translation key accidentally points at a nested namespace.
      let value = typeof resolved === "string" ? resolved : key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{${k}}`, String(v ?? ""));
        }
      }
      return value;
    },
    [messages]
  );

  return (
    <I18nContext.Provider value={{ locale: currentLocale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}
