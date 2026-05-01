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
  const stored = localStorage.getItem("locale");
  if (stored === "pl" || stored === "en") return stored;
  return navigator.language.startsWith("pl") ? "pl" : "en";
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
    localStorage.setItem("locale", l);
    document.documentElement.lang = l;
  }, []);

  const currentLocale = mounted ? locale : "en";
  const messages = bundles[currentLocale];

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      let value =
        getNestedValue(messages as unknown as Record<string, unknown>, key) ??
        getNestedValue(bundles.en as unknown as Record<string, unknown>, key) ??
        key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{${k}}`, v);
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
