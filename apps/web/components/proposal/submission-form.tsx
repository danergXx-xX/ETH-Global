"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/lib/i18n";
import { useTokenBalance } from "@/lib/hooks";
import { SUGGESTED_PROPOSALS } from "@/lib/mocks/suggested_proposals";

type FormState =
  | "empty"
  | "no_wallet"
  | "no_permission"
  | "filled"
  | "warning"
  | "error"
  | "submitting"
  | "success";

interface SubmissionFormProps {
  onSubmit: (description: string) => void;
}

export function SubmissionForm({ onSubmit }: SubmissionFormProps) {
  const t = useTranslations("proposal");
  const { address, isConnected } = useAccount();
  const { data: tokenBalance } = useTokenBalance(address);
  const [description, setDescription] = useState("");
  const [state, setState] = useState<FormState>("empty");

  const hasTokens = (() => {
    try {
      return tokenBalance != null && BigInt(String(tokenBalance)) > BigInt(0);
    } catch {
      return false;
    }
  })();

  function getFormState(): FormState {
    if (state === "submitting" || state === "success") return state;
    if (!isConnected) return "no_wallet";
    if (!hasTokens) return "no_permission";
    if (!description.trim()) return "empty";
    if (description.length > 2000) return "warning";
    return "filled";
  }

  const currentState = getFormState();

  function handleSubmit() {
    if (currentState !== "filled" && currentState !== "warning") return;
    setState("submitting");

    // Phase 1B: mock submission delay
    setTimeout(() => {
      setState("success");
      onSubmit(description);
    }, 2000);
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{t("cardTitle")}</CardTitle>
          {currentState === "submitting" && (
            <Badge className="bg-amber/15 text-amber border-amber/30 animate-pulse-slow">
              Submitting...
            </Badge>
          )}
          {currentState === "success" && (
            <Badge className="bg-vote-for/15 text-vote-for border-vote-for/30">
              Submitted
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <label
            htmlFor="suggested-proposal"
            className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
          >
            Suggested proposals (demo)
          </label>
          <select
            id="suggested-proposal"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value=""
            disabled={
              currentState === "no_wallet" ||
              currentState === "no_permission" ||
              currentState === "submitting"
            }
            onChange={(e) => {
              const picked = SUGGESTED_PROPOSALS.find(
                (p) => p.id === e.target.value,
              );
              if (!picked) return;
              const text = `${picked.title.en}\n\n${picked.description.en}\n\n${picked.full_context.en}`;
              setDescription(text);
              if (state === "success") setState("empty");
            }}
          >
            <option value="">Pick a demo scenario...</option>
            {SUGGESTED_PROPOSALS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title.en}
              </option>
            ))}
          </select>
        </div>

        {currentState === "no_wallet" && (
          <div className="rounded-md border border-amber/20 bg-amber/5 p-3 text-sm text-amber">
            Connect your wallet to submit proposals.
          </div>
        )}

        {currentState === "no_permission" && (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive-foreground">
            You need AICT tokens to submit proposals.
          </div>
        )}

        <Textarea
          placeholder={t("placeholder")}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (state === "success") setState("empty");
          }}
          rows={4}
          disabled={
            currentState === "no_wallet" ||
            currentState === "no_permission" ||
            currentState === "submitting"
          }
          className="resize-none"
        />

        {currentState === "warning" && (
          <p className="text-xs text-amber">
            Proposal is {description.length} characters (recommended max 2000).
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {description.length} / 2000
          </span>
          <Button
            onClick={handleSubmit}
            disabled={
              currentState !== "filled" && currentState !== "warning"
            }
          >
            {currentState === "submitting"
              ? t("debating")
              : t("submit")}
          </Button>
        </div>

        <AnimatePresence>
          {currentState === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-md border border-vote-for/20 bg-vote-for/5 p-3 text-sm text-vote-for"
            >
              Proposal submitted. Council debate will begin shortly.
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
