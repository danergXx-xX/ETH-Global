"use client";

import type { ReactNode } from "react";

export interface StepDescriptor {
  id: string;
  label: string;
}

interface WizardShellProps {
  steps: StepDescriptor[];
  currentIndex: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLast?: boolean;
}

export function WizardShell({
  steps,
  currentIndex,
  title,
  subtitle,
  children,
  onNext,
  onBack,
  onSkip,
  nextLabel = "Next",
  nextDisabled = false,
  isLast = false,
}: WizardShellProps) {
  const progressPct = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-b from-background to-card/30">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            <span>
              Step {currentIndex + 1} of {steps.length}
            </span>
            <span>{steps[currentIndex]?.label}</span>
          </div>
          <div
            className="h-1.5 bg-secondary rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={currentIndex + 1}
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-label="Onboarding progress"
          >
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            {steps.map((s, i) => (
              <div
                key={s.id}
                className={`flex-1 h-1 rounded-full ${
                  i <= currentIndex ? "bg-primary" : "bg-secondary"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 sm:p-8 shadow-lg">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-display font-semibold">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>

          <div className="mb-6">{children}</div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-border">
            {onBack && currentIndex > 0 ? (
              <button
                type="button"
                onClick={onBack}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
              >
                Back
              </button>
            ) : (
              <span className="hidden sm:block" />
            )}
            <div className="flex-1" />
            {onSkip ? (
              <button
                type="button"
                onClick={onSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
              >
                Skip
              </button>
            ) : null}
            {onNext ? (
              <button
                type="button"
                onClick={onNext}
                disabled={nextDisabled}
                className="rounded bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isLast ? nextLabel : `${nextLabel} ->`}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
