"use client";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();
  const nextLocale = locale === "pl" ? "en" : "pl";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLocale(nextLocale)}
    >
      {nextLocale.toUpperCase()}
    </Button>
  );
}
