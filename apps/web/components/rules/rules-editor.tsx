"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/lib/i18n";

type EditorState = "in_sync" | "uncommitted" | "committing";

const INITIAL_RULES = `{
  "version": "0.4-draft",
  "caps": {
    "max_per_protocol_pct": 5,
    "max_per_asset_pct": 30,
    "max_single_tx_usd": 500000
  },
  "governance": {
    "quorum_pct": 60,
    "voting_period_days": 1,
    "timelock_hours": 48,
    "min_agent_confidence": 0.5
  },
  "whitelisted_protocols": [
    "aave-v3",
    "compound-v3",
    "morpho-blue",
    "yearn-v3"
  ],
  "risk_model": "spark-v1"
}`;

const MOCK_VALIDATION = [
  { level: "error", message: "max_per_protocol_pct (5) below recommended minimum (7)", resolved: true },
  { level: "warning", message: "timelock_hours (48) is maximum allowed - consider 24h for faster governance" },
  { level: "warning", message: "risk_model 'spark-v1' not yet audited for Base deployment" },
  { level: "info", message: "4 whitelisted protocols - within recommended 3-8 range" },
];

interface SignerState {
  name: string;
  signed: boolean;
}

export function RulesEditor() {
  const [content, setContent] = useState(INITIAL_RULES);
  const [state, setState] = useState<EditorState>("in_sync");
  const [showValidation, setShowValidation] = useState(false);
  const [signers, setSigners] = useState<SignerState[]>([
    { name: "bull.aicouncil-danergy.eth", signed: false },
    { name: "bear.aicouncil-danergy.eth", signed: false },
    { name: "risk.aicouncil-danergy.eth", signed: false },
    { name: "tech.aicouncil-danergy.eth", signed: false },
    { name: "sentiment.aicouncil-danergy.eth", signed: false },
  ]);

  const signedCount = signers.filter((s) => s.signed).length;

  const parsedPreview = useMemo(() => {
    try {
      return JSON.parse(content) as Record<string, unknown>;
    } catch {
      return null;
    }
  }, [content]);

  const t = useTranslations("rules");
  const isValid = parsedPreview !== null;

  function handleEdit(value: string) {
    setContent(value);
    if (state === "in_sync") setState("uncommitted");
  }

  function handleDiscard() {
    setContent(INITIAL_RULES);
    setState("in_sync");
    setShowValidation(false);
  }

  function handleValidate() {
    setShowValidation(true);
  }

  function handleCommit() {
    setState("committing");
  }

  function handleSign() {
    const nextUnsigned = signers.findIndex((s) => !s.signed);
    if (nextUnsigned >= 0) {
      const updated = [...signers];
      updated[nextUnsigned] = { ...updated[nextUnsigned], signed: true };
      setSigners(updated);
      if (updated.filter((s) => s.signed).length >= 3) {
        setTimeout(() => setState("in_sync"), 1000);
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{t("title")}</h2>
          <Badge
            variant="outline"
            className={`text-[10px] ${
              state === "in_sync"
                ? "text-vote-for border-vote-for/30"
                : state === "uncommitted"
                  ? "text-amber border-amber/30"
                  : "text-vote-for border-vote-for/30"
            }`}
          >
            {state === "in_sync" && t("states.in_sync")}
            {state === "uncommitted" && t("states.uncommitted")}
            {state === "committing" && t("states.committing", { signed: String(signedCount), required: "3" })}
          </Badge>
        </div>
      </div>

      {/* Two-pane editor */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* JSON editor pane */}
        <Card>
          <CardContent className="py-3 px-0">
            <label
              htmlFor="rules-json-editor"
              className="block px-4 pb-2 text-[10px] font-mono text-muted-foreground"
            >
              Council Rules JSON - {t("panes.json")}
            </label>
            <textarea
              id="rules-json-editor"
              aria-describedby="rules-json-error"
              aria-invalid={!isValid}
              value={content}
              onChange={(e) => handleEdit(e.target.value)}
              className="w-full min-h-[360px] bg-transparent px-4 font-mono text-xs text-foreground resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
              disabled={state === "committing"}
            />
            <div
              id="rules-json-error"
              role="alert"
              aria-live="polite"
              className="px-4 py-1 min-h-[1rem] text-[10px] text-destructive-foreground"
            >
              {!isValid ? "Invalid JSON syntax" : ""}
            </div>
          </CardContent>
        </Card>

        {/* Compiled preview pane */}
        <Card>
          <CardContent className="py-3 px-4 space-y-3">
            <div className="text-[10px] font-mono text-muted-foreground">
              {t("panes.preview")}
            </div>
            {parsedPreview ? (
              <div className="space-y-3">
                {Object.entries(parsedPreview).map(([section, value]) => (
                  <div key={section}>
                    <p className="text-xs font-medium text-foreground capitalize mb-1">
                      {section.replace(/_/g, " ")}
                    </p>
                    {typeof value === "object" && value !== null ? (
                      <div className="rounded bg-secondary/50 p-2 space-y-0.5">
                        {Array.isArray(value)
                          ? value.map((item, i) => (
                              <div key={i} className="text-[10px] font-mono text-foreground">
                                {String(item)}
                              </div>
                            ))
                          : Object.entries(value as Record<string, unknown>).map(
                              ([k, v]) => (
                                <div key={k} className="flex justify-between text-[10px]">
                                  <span className="text-muted-foreground">{k}</span>
                                  <span className="font-mono text-amber">{String(v)}</span>
                                </div>
                              )
                            )}
                      </div>
                    ) : (
                      <span className="text-xs font-mono text-amber">{String(value)}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-destructive-foreground">Cannot parse JSON</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Validation panel */}
      {showValidation && (
        <Card>
          <CardContent className="py-3 px-4 space-y-1.5">
            <span className="text-xs font-medium">Validation</span>
            {MOCK_VALIDATION.map((v, i) => (
              <div
                key={i}
                className={`text-[10px] flex items-center gap-2 ${
                  v.resolved ? "line-through opacity-50" : ""
                }`}
              >
                <span
                  className={
                    v.level === "error"
                      ? "text-destructive-foreground"
                      : v.level === "warning"
                        ? "text-amber"
                        : "text-muted-foreground"
                  }
                >
                  [{v.level}]
                </span>
                <span className="text-foreground">{v.message}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Committing signers */}
      {state === "committing" && (
        <Card>
          <CardContent className="py-3 px-4 space-y-2">
            <span className="text-xs font-medium">
              Multisig signatures ({signedCount}/3 required)
            </span>
            {signers.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      s.signed ? "bg-vote-for" : "bg-secondary"
                    }`}
                  />
                  <span className="font-mono text-muted-foreground">{s.name}</span>
                </div>
                {s.signed && <span className="text-vote-for text-[10px]">Signed</span>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        {state === "uncommitted" && (
          <>
            <Button variant="ghost" size="sm" onClick={handleDiscard}>
              {t("buttons.discard")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleValidate}>
              {t("buttons.validate")}
            </Button>
            <Button size="sm" onClick={handleCommit} disabled={!isValid}>
              {t("buttons.commit")}
            </Button>
          </>
        )}
        {state === "committing" && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setState("uncommitted");
                setSigners(signers.map((s) => ({ ...s, signed: false })));
              }}
            >
              {t("buttons.cancel")}
            </Button>
            <Button size="sm" onClick={handleSign}>
              {t("buttons.sign")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
