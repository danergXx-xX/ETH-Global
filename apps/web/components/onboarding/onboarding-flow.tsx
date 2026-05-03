"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { SUGGESTED_PROPOSALS } from "@/lib/mocks/suggested_proposals";
import { COUNCIL_RULES, COUNCIL_RULES_VERSION } from "@/lib/council-rules-content";
import { useOnboarding, type OnboardingStepId } from "@/lib/hooks";
import { useI18n } from "@/lib/i18n";
import { WizardShell, type StepDescriptor } from "@/components/onboarding/wizard-shell";
import { ConfettiBurst } from "@/components/onboarding/confetti-burst";

const STEPS: StepDescriptor[] = [
  { id: "wallet", label: "Connect" },
  { id: "dao", label: "DAO" },
  { id: "rules", label: "Rules" },
  { id: "role", label: "Role" },
  { id: "proposal", label: "First proposal" },
];

const ROLES: Array<{
  id: string;
  title: string;
  description: string;
}> = [
  {
    id: "observer",
    title: "Observer",
    description: "Read-only access. Watch debates and audit trails.",
  },
  {
    id: "voter",
    title: "Voter",
    description: "Vote on proposals. Cannot submit new ones.",
  },
  {
    id: "submitter",
    title: "Submitter",
    description: "Submit proposals and vote on the council.",
  },
  {
    id: "dao_admin",
    title: "DAO Admin",
    description: "Manage Council Rules and member access.",
  },
];

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const ETH_ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const ENS_NAME = /^[a-z0-9-]{2,}\.eth$/i;

function isLikelyDao(input: string): boolean {
  const trimmed = input.trim();
  return ETH_ADDRESS.test(trimmed) || ENS_NAME.test(trimmed);
}

export function OnboardingFlow() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { locale } = useI18n();
  const { status, markStep, isComplete } = useOnboarding();

  const [stepIndex, setStepIndex] = useState(0);
  const [daoInput, setDaoInput] = useState("");
  const [daoError, setDaoError] = useState<string | null>(null);
  const [rulesAck, setRulesAck] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedProposalId, setSelectedProposalId] = useState<string>("custom");
  const [customProposal, setCustomProposal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confetti, setConfetti] = useState(false);

  // Auto-advance step 1 when wallet connects.
  useEffect(() => {
    if (stepIndex === 0 && isConnected && address) {
      markStep("wallet_connected").catch(() => {
        /* offline-saved */
      });
      setStepIndex(1);
    }
  }, [isConnected, address, stepIndex, markStep]);

  // If user already complete -> kick to /app immediately.
  useEffect(() => {
    if (isComplete) {
      router.replace("/app");
    }
  }, [isComplete, router]);

  const proposalText = useMemo(() => {
    if (selectedProposalId === "custom") return customProposal.trim();
    const found = SUGGESTED_PROPOSALS.find((p) => p.id === selectedProposalId);
    if (!found) return "";
    return found.full_context[locale] ?? found.full_context.en;
  }, [selectedProposalId, customProposal, locale]);

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  async function handleDaoNext(skip: boolean) {
    if (skip) {
      await markStep("dao_verified", { method: "skipped" }).catch(() => undefined);
      goNext();
      return;
    }
    const trimmed = daoInput.trim();
    if (!isLikelyDao(trimmed)) {
      setDaoError("Enter a valid ENS name or 0x address, or skip.");
      return;
    }
    setDaoError(null);
    await markStep("dao_verified", { dao_ref: trimmed }).catch(() => undefined);
    goNext();
  }

  async function handleRulesNext() {
    if (!rulesAck) return;
    await markStep("rules_read", { version: COUNCIL_RULES_VERSION }).catch(() =>
      undefined,
    );
    goNext();
  }

  async function handleRoleNext() {
    if (!selectedRole) return;
    await markStep("role_selected", { role: selectedRole }).catch(() =>
      undefined,
    );
    goNext();
  }

  async function handleSubmitProposal() {
    if (!proposalText || proposalText.length < 12) return;
    setSubmitting(true);
    let debateId: string | null = null;
    try {
      const res = await fetch(`${API_URL}/api/debate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ proposal_text: proposalText }),
      });
      if (res.ok) {
        const json = (await res.json()) as { debate_id?: string };
        debateId = json.debate_id ?? null;
      }
    } catch {
      // Backend offline - we still complete onboarding locally.
    }
    await markStep("first_proposal_submitted", {
      source: selectedProposalId,
      debate_id: debateId ?? "offline",
    }).catch(() => undefined);
    setConfetti(true);
    setSubmitting(false);
    window.setTimeout(() => {
      const target = debateId ? `/app?debate_id=${debateId}` : "/app";
      router.push(target);
    }, 2_400);
  }

  // Render per step
  const stepContent = (() => {
    switch (stepIndex) {
      case 0:
        return (
          <WizardShell
            steps={STEPS}
            currentIndex={0}
            title="Welcome to AI Treasury Council"
            subtitle="Connect a wallet to get started. We support Base Sepolia for the demo - no real funds at risk."
          >
            <div className="rounded-lg border border-border bg-background/40 p-6 flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Five AI agents are about to debate treasury proposals on your
                behalf. Connect a wallet so we can record your role and
                preferences.
              </p>
              <ConnectButton showBalance={false} chainStatus="icon" />
              {isConnected ? (
                <p className="text-xs text-vote-for">
                  Wallet connected - moving to next step.
                </p>
              ) : null}
            </div>
          </WizardShell>
        );

      case 1:
        return (
          <WizardShell
            steps={STEPS}
            currentIndex={1}
            title="Verify DAO membership"
            subtitle="Optional. If you represent a DAO, paste its ENS name or governance address. Otherwise skip."
            onBack={goBack}
            onSkip={() => handleDaoNext(true)}
            onNext={() => handleDaoNext(false)}
            nextDisabled={daoInput.trim().length === 0}
          >
            <label
              htmlFor="dao-input"
              className="block text-xs text-muted-foreground mb-2"
            >
              ENS name or governance contract address
            </label>
            <input
              id="dao-input"
              type="text"
              value={daoInput}
              onChange={(e) => {
                setDaoInput(e.target.value);
                setDaoError(null);
              }}
              placeholder="dao.eth or 0x..."
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              autoComplete="off"
              spellCheck={false}
            />
            {daoError ? (
              <p className="mt-2 text-xs text-vote-against">{daoError}</p>
            ) : null}
            <p className="mt-3 text-[11px] text-muted-foreground">
              For the demo, any well-formed ENS name or address is accepted.
              Real DAO membership verification would call the governance
              contract on-chain.
            </p>
          </WizardShell>
        );

      case 2:
        return (
          <WizardShell
            steps={STEPS}
            currentIndex={2}
            title="Read Council Rules"
            subtitle="These rules bind every agent and every council member. Take a moment to review."
            onBack={goBack}
            onNext={handleRulesNext}
            nextDisabled={!rulesAck}
          >
            <div className="rounded border border-border bg-background/40 p-4 max-h-72 overflow-y-auto text-sm space-y-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Council Rules {COUNCIL_RULES_VERSION}
              </p>
              {COUNCIL_RULES.map((section) => (
                <div key={section.heading}>
                  <h3 className="text-sm font-semibold mb-1">
                    {section.heading}
                  </h3>
                  {section.paragraphs.map((p, i) => (
                    <p
                      key={i}
                      className="text-xs text-muted-foreground leading-relaxed mb-1"
                    >
                      {p}
                    </p>
                  ))}
                  {section.bullets ? (
                    <ul className="list-disc pl-5 mt-1 space-y-0.5">
                      {section.bullets.map((b, i) => (
                        <li
                          key={i}
                          className="text-xs text-muted-foreground"
                        >
                          {b}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
            <label className="mt-4 flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rulesAck}
                onChange={(e) => setRulesAck(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm">
                I have read and understand the Council Rules.
              </span>
            </label>
          </WizardShell>
        );

      case 3:
        return (
          <WizardShell
            steps={STEPS}
            currentIndex={3}
            title="Choose your role"
            subtitle="You can change this later in settings."
            onBack={goBack}
            onNext={handleRoleNext}
            nextDisabled={!selectedRole}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.map((role) => {
                const active = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`text-left rounded-lg border p-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      active
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background/30 hover:border-primary/50"
                    }`}
                    aria-pressed={active}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full border ${
                          active
                            ? "bg-primary border-primary"
                            : "border-muted-foreground"
                        }`}
                        aria-hidden="true"
                      />
                      <span className="font-medium text-sm">{role.title}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {role.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </WizardShell>
        );

      case 4:
        return (
          <WizardShell
            steps={STEPS}
            currentIndex={4}
            title="Submit your first proposal"
            subtitle="Pick a suggested proposal or write your own. The council will debate it next."
            onBack={goBack}
            onNext={handleSubmitProposal}
            nextDisabled={
              submitting ||
              proposalText.length < 12 ||
              !isConnected
            }
            nextLabel={submitting ? "Convening..." : "Submit and watch debate"}
            isLast
          >
            <label
              htmlFor="suggested-onboarding"
              className="block text-xs text-muted-foreground mb-2"
            >
              Suggested proposals (4 golden questions)
            </label>
            <select
              id="suggested-onboarding"
              value={selectedProposalId}
              onChange={(e) => setSelectedProposalId(e.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="custom">Write my own proposal</option>
              {SUGGESTED_PROPOSALS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title[locale] ?? p.title.en}
                </option>
              ))}
            </select>

            {selectedProposalId === "custom" ? (
              <textarea
                value={customProposal}
                onChange={(e) => setCustomProposal(e.target.value)}
                placeholder="Describe your treasury proposal..."
                rows={5}
                className="mt-3 w-full rounded border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <div className="mt-3 rounded border border-border/50 bg-background/40 p-3 max-h-40 overflow-y-auto text-xs whitespace-pre-wrap text-muted-foreground">
                {proposalText}
              </div>
            )}
            {!isConnected ? (
              <p className="mt-3 text-xs text-vote-against">
                Wallet disconnected. Reconnect in step 1 to submit.
              </p>
            ) : null}
          </WizardShell>
        );

      default:
        return null;
    }
  })();

  return (
    <>
      <ConfettiBurst active={confetti} />
      {stepContent}
    </>
  );
}
