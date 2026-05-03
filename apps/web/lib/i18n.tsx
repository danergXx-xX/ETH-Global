"use client";

import { createContext, useContext, type ReactNode } from "react";
import en from "../messages/en.json";

type Locale = "pl" | "en";
type Messages = typeof en;

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

// EN-only mode (judges are EN, eliminates i18n object render risk).
// pl.json kept on disk as dead code in case we re-enable PL post-submission.
const messages: Messages = en;

function translate(key: string, params?: Record<string, string>): string {
  const resolved = getNestedValue(messages as unknown as Record<string, unknown>, key) ?? key;
  let value = typeof resolved === "string" ? resolved : key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(`{${k}}`, String(v ?? ""));
    }
  }
  return value;
}

const I18N_VALUE: I18nContextValue = {
  locale: "en",
  setLocale: () => {},
  t: translate,
};

const I18nContext = createContext<I18nContextValue>(I18N_VALUE);

export function useI18n() {
  return useContext(I18nContext);
}

export function useTranslations(namespace?: string) {
  const { t } = useContext(I18nContext);
  if (!namespace) return t;
  return (key: string, params?: Record<string, string>) =>
    t(`${namespace}.${key}`, params);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  return <I18nContext.Provider value={I18N_VALUE}>{children}</I18nContext.Provider>;
}
