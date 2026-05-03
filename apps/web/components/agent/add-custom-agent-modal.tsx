"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TestArena } from "@/components/agent/test-arena";
import {
  detectJailbreak,
  useSubmitCustomAgent,
  type CustomAgent,
  type CustomAgentSpec,
  type LLMModelChoice,
} from "@/lib/hooks/useCustomAgent";

const PERSONA_OPTIONS = [
  { value: "bull", label: "Bull (long-bias)" },
  { value: "bear", label: "Bear (short-bias)" },
  { value: "risk", label: "Risk officer" },
  { value: "tech", label: "Technical analyst" },
  { value: "sentiment", label: "Sentiment / social" },
  { value: "adversarial", label: "Adversarial (red team)" },
  { value: "custom", label: "Custom persona" },
] as const;

const LLM_OPTIONS: { value: LLMModelChoice; label: string; available: boolean }[] = [
  { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 (default)", available: true },
  { value: "claude-opus-4-7", label: "Claude Opus 4.7", available: true },
  { value: "gpt-4o", label: "GPT-4o (preview)", available: false },
  { value: "gemini-2-pro", label: "Gemini 2 Pro (preview)", available: false },
];

const DEFAULT_PROPOSAL =
  "Should the DAO buy 100 ETH at current price for treasury diversification?";

const ENS_PARENT = "aicouncil-danergy.eth";
const SUBNAME_RE = /^[a-z0-9-]+$/;

interface AddCustomAgentModalProps {
  /** Triggered after a successful multisig submission - parent appends to local list. */
  onAgentRegistered?: (agent: CustomAgent) => void;
  /** Demo mode (no wallet) - disables submit, shows overlay. */
  readOnly?: boolean;
}

export function AddCustomAgentModal({
  onAgentRegistered,
  readOnly = false,
}: AddCustomAgentModalProps) {
  const [open, setOpen] = useState(false);
  const [persona, setPersona] = useState<string>("bull");
  const [displayName, setDisplayName] = useState("");
  const [llmModel, setLlmModel] = useState<LLMModelChoice>("claude-sonnet-4-6");
  const [subnameRoot, setSubnameRoot] = useState("");
  const [voteWeight, setVoteWeight] = useState(5);
  const [trustGate, setTrustGate] = useState(70);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a treasury analyst. Reason about the proposal step by step, cite at least one source, and end with FOR / AGAINST / ABSTAIN."
  );

  const [phase, setPhase] = useState<"form" | "testing" | "submitting" | "registered">("form");
  const [submittedAgent, setSubmittedAgent] = useState<CustomAgent | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const submitMutation = useSubmitCustomAgent();

  const ensSubname = useMemo(() => {
    const root = subnameRoot.trim().toLowerCase();
    if (!root) return "";
    return `${root}.${ENS_PARENT}`;
  }, [subnameRoot]);

  const personaId = useMemo(() => {
    if (persona === "custom") {
      const root = subnameRoot.trim().toLowerCase() || displayName.trim().toLowerCase();
      return root.replace(/[^a-z0-9-]+/g, "-").slice(0, 32) || "custom-agent";
    }
    return persona;
  }, [persona, subnameRoot, displayName]);

  const validation = useMemo(() => {
    const errors: string[] = [];
    if (displayName.trim().length < 2) errors.push("Display name must be at least 2 characters.");
    if (displayName.length > 50) errors.push("Display name must be 50 characters or fewer.");
    if (!subnameRoot || subnameRoot.length < 2)
      errors.push("ENS subname is required (min 2 chars).");
    if (subnameRoot.length > 30)
      errors.push("ENS subname is too long (max 30 chars).");
    if (subnameRoot && !SUBNAME_RE.test(subnameRoot.toLowerCase()))
      errors.push("ENS subname must use letters, digits, or dashes.");
    if (systemPrompt.trim().length < 20)
      errors.push("System prompt must be at least 20 characters.");
    if (systemPrompt.length > 2000)
      errors.push("System prompt must be 2000 characters or fewer.");
    const jailbreak = detectJailbreak(systemPrompt);
    if (jailbreak) errors.push(jailbreak);
    return errors;
  }, [displayName, subnameRoot, systemPrompt]);

  const buildSpec = (
    forSandbox: boolean
  ): CustomAgentSpec => ({
    persona_id: personaId,
    display_name: displayName.trim(),
    llm_model: llmModel,
    ens_subname: ensSubname,
    vote_weight: voteWeight,
    trust_gate: trustGate,
    system_prompt: systemPrompt.trim(),
    test_arena_proposal: forSandbox ? DEFAULT_PROPOSAL : null,
  });

  const handleTest = async () => {
    if (validation.length || readOnly) return;
    setServerError(null);
    setPhase("testing");
    try {
      const result = await submitMutation.mutateAsync(buildSpec(true));
      setSubmittedAgent(result);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Test arena failed");
      setPhase("form");
    }
  };

  const handleSubmitMultisig = async () => {
    if (!submittedAgent || readOnly) return;
    setPhase("submitting");
    setServerError(null);
    try {
      const finalAgent = await submitMutation.mutateAsync(buildSpec(false));
      setSubmittedAgent({
        ...finalAgent,
        test_arena_result: submittedAgent.test_arena_result,
      });
      setPhase("registered");
      onAgentRegistered?.(finalAgent);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Multisig submit failed");
      setPhase("testing");
    }
  };

  const handleTryDifferent = () => {
    setSubmittedAgent(null);
    setPhase("form");
  };

  const handleClose = (next: boolean) => {
    if (!next) {
      // Reset transient state on close so the next open starts fresh.
      setPhase("form");
      setSubmittedAgent(null);
      setServerError(null);
    }
    setOpen(next);
  };

  const isBusy = submitMutation.isPending;
  const showArena = phase !== "form" || !!submittedAgent;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" disabled={readOnly}>
          Add custom agent
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        aria-describedby="add-custom-agent-help"
      >
        <DialogHeader>
          <DialogTitle>Add a custom council agent</DialogTitle>
          <p id="add-custom-agent-help" className="text-xs text-muted-foreground">
            Define persona + LLM + voting weight, run a sandbox debate, then submit for 5-of-7
            multisig. Agents that misalign with consensus may still be valuable - DAOs decide.
          </p>
        </DialogHeader>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Persona type
            </Label>
            <RadioGroup
              value={persona}
              onValueChange={setPersona}
              className="grid grid-cols-2 gap-2"
            >
              {PERSONA_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-xs cursor-pointer hover:border-amber/40"
                >
                  <RadioGroupItem value={opt.value} id={`persona-${opt.value}`} />
                  <span>{opt.label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display-name" className="text-xs uppercase tracking-wider text-muted-foreground">
              Display name
            </Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value.slice(0, 50))}
              placeholder="e.g. Aave Yield Hawk"
              maxLength={50}
            />
            <p className="text-[10px] text-muted-foreground">{displayName.length}/50</p>

            <Label
              htmlFor="llm-model"
              className="text-xs uppercase tracking-wider text-muted-foreground"
            >
              LLM model
            </Label>
            <Select value={llmModel} onValueChange={(v) => setLlmModel(v as LLMModelChoice)}>
              <SelectTrigger id="llm-model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LLM_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} disabled={!opt.available}>
                    {opt.label}
                    {!opt.available ? " (coming soon)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label
              htmlFor="ens-subname"
              className="text-xs uppercase tracking-wider text-muted-foreground"
            >
              ENS subname
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="ens-subname"
                value={subnameRoot}
                onChange={(e) =>
                  setSubnameRoot(e.target.value.slice(0, 30).toLowerCase().replace(/\s+/g, "-"))
                }
                placeholder="aave-yield"
                maxLength={30}
                className="max-w-[220px]"
              />
              <span className="text-xs text-muted-foreground font-mono">.{ENS_PARENT}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Auto-suffixed. Letters, digits, dashes only.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Vote weight ({voteWeight})
            </Label>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[voteWeight]}
              onValueChange={(value) => setVoteWeight(value[0] ?? 5)}
            />
            <p className="text-[10px] text-muted-foreground">
              1 (advisory) - 10 (peer to standard council).
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Trust gate ({trustGate})
            </Label>
            <Slider
              min={50}
              max={100}
              step={1}
              value={[trustGate]}
              onValueChange={(value) => setTrustGate(value[0] ?? 70)}
            />
            <p className="text-[10px] text-muted-foreground">
              Minimum source confidence required for a claim to count.
            </p>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label
              htmlFor="system-prompt"
              className="text-xs uppercase tracking-wider text-muted-foreground"
            >
              System prompt
            </Label>
            <Textarea
              id="system-prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value.slice(0, 2000))}
              rows={6}
              maxLength={2000}
              className="font-mono text-xs"
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{systemPrompt.length}/2000</span>
              <span>Sanitized client + server side; jailbreak phrases will be rejected.</span>
            </div>
          </div>
        </div>

        {validation.length > 0 && (
          <div className="rounded-md border border-vote-against/40 bg-vote-against/5 p-3 text-xs text-vote-against">
            <p className="mb-1 font-medium">Fix the following before testing:</p>
            <ul className="list-disc pl-5 space-y-1">
              {validation.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {serverError && (
          <div className="rounded-md border border-vote-against/40 bg-vote-against/5 p-3 text-xs text-vote-against">
            {serverError}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleTest}
            disabled={readOnly || isBusy || validation.length > 0}
          >
            {phase === "testing" && isBusy ? "Running sandbox..." : "Test in sandbox"}
          </Button>
          <Badge variant="outline" className="self-center text-[10px] uppercase tracking-wider">
            Charter #7 - 5-of-7 multisig demo
          </Badge>
        </div>

        {showArena && (
          <TestArena
            customAgentName={displayName.trim() || "Custom agent"}
            isRunning={phase === "testing" && isBusy}
            result={submittedAgent?.test_arena_result ?? null}
            proposal={DEFAULT_PROPOSAL}
            onSubmitForMultisig={handleSubmitMultisig}
            onTryDifferentPrompt={handleTryDifferent}
            isSubmitting={phase === "submitting" && isBusy}
            submittedAgent={phase === "registered" ? submittedAgent : null}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
