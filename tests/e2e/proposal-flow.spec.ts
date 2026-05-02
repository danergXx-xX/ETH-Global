import { test, expect } from "@playwright/test";

const PROPOSAL_TEXT = "Allocate 100 ETH to DeFi yield strategy";
const AGENT_COUNT = 5;
const DEBATE_TIMEOUT = 5_000;

test.describe("Proposal flow - happy path", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("dashboard renders header, proposal form, and agent cards", async ({
    page,
  }) => {
    await expect(page.locator("h1")).toBeVisible();

    const textarea = page.locator("textarea");
    await expect(textarea).toBeVisible();

    const submitButton = page.locator("button", {
      hasText: /Convene Council|Zwołaj Radę/,
    });
    await expect(submitButton).toBeVisible();

    const cards = page.locator('[class*="card"]').filter({ has: page.locator("span.font-medium") });
    await expect(cards).toHaveCount(AGENT_COUNT);
  });

  test("submit proposal triggers debate and shows 5 agent decisions", async ({
    page,
  }) => {
    const textarea = page.locator("textarea");
    await textarea.fill(PROPOSAL_TEXT);

    const submitButton = page.locator("button", {
      hasText: /Convene Council|Zwołaj Radę/,
    });
    await submitButton.click();

    const decisionBadges = page.locator('[class*="bg-green-900"], [class*="bg-red-900"], [class*="bg-zinc-800"]');
    await expect(decisionBadges).toHaveCount(AGENT_COUNT, {
      timeout: DEBATE_TIMEOUT,
    });
  });

  test("vote tally shows For/Against/Abstain counts after debate", async ({
    page,
  }) => {
    await page.locator("textarea").fill(PROPOSAL_TEXT);
    await page.locator("button", { hasText: /Convene Council|Zwołaj Radę/ }).click();

    const tallyCard = page.locator("text=/For|Za/").first();
    await expect(tallyCard).toBeVisible({ timeout: DEBATE_TIMEOUT });

    const tallySection = page.locator('[class*="card"]').filter({
      hasText: /Vote tally|Wyniki głosowania/,
    });
    await expect(tallySection).toBeVisible();

    const tallyTexts = tallySection.locator('[class*="flex gap-6"] span');
    await expect(tallyTexts).toHaveCount(3);
  });

  test("verdict banner appears after debate completes", async ({ page }) => {
    await page.locator("textarea").fill(PROPOSAL_TEXT);
    await page.locator("button", { hasText: /Convene Council|Zwołaj Radę/ }).click();

    const verdictText = page.locator("p.font-semibold");
    await expect(verdictText).toBeVisible({ timeout: DEBATE_TIMEOUT });

    const text = await verdictText.textContent();
    const validVerdicts = [
      "Council recommends: APPROVE",
      "Council recommends: REJECT",
      "Council split - no consensus",
      "Rada rekomenduje: PRZYJĄĆ",
      "Rada rekomenduje: ODRZUCIĆ",
      "Rada podzielona - brak konsensusu",
    ];
    expect(validVerdicts.some((v) => text?.includes(v))).toBe(true);
  });

  test("submit button disabled when textarea empty", async ({ page }) => {
    const submitButton = page.locator("button", {
      hasText: /Convene Council|Zwołaj Radę/,
    });
    await expect(submitButton).toBeDisabled();
  });

  test("can submit a second proposal after first debate completes", async ({
    page,
  }) => {
    await page.locator("textarea").fill(PROPOSAL_TEXT);
    const submitButton = page.locator("button", {
      hasText: /Convene Council|Zwołaj Radę/,
    });
    await submitButton.click();

    const decisionBadges = page.locator('[class*="bg-green-900"], [class*="bg-red-900"], [class*="bg-zinc-800"]');
    await expect(decisionBadges).toHaveCount(AGENT_COUNT, {
      timeout: DEBATE_TIMEOUT,
    });

    await expect(submitButton).toBeEnabled({ timeout: DEBATE_TIMEOUT });
  });
});
