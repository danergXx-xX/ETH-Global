import { test, expect } from "@playwright/test";

test.describe("I18n PL/EN toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("toggle switches UI labels from EN to PL", async ({ page }) => {
    await page.evaluate(() => localStorage.setItem("locale", "en"));
    await page.reload();

    const toggleButton = page.locator("button", { hasText: /^PL$/ });
    await expect(toggleButton).toBeVisible();

    await toggleButton.click();

    await expect(
      page.locator("button", { hasText: /Zwołaj Radę/ }),
    ).toBeVisible();

    await expect(
      page.locator("text=Wieloagentowa rada zarządzająca skarbcem DAO"),
    ).toBeVisible();
  });

  test("locale persists in localStorage after toggle", async ({ page }) => {
    await page.evaluate(() => localStorage.setItem("locale", "en"));
    await page.reload();

    const toggleButton = page.locator("button", { hasText: /^PL$/ });
    await toggleButton.click();

    const storedLocale = await page.evaluate(() =>
      localStorage.getItem("locale"),
    );
    expect(storedLocale).toBe("pl");
  });

  test("locale persists across page reload", async ({ page }) => {
    await page.evaluate(() => localStorage.setItem("locale", "pl"));
    await page.reload();

    const toggleButton = page.locator("button", { hasText: /^EN$/ });
    await expect(toggleButton).toBeVisible();

    await expect(
      page.locator("button", { hasText: /Zwołaj Radę/ }),
    ).toBeVisible();
  });

  test("agent labels change on locale switch", async ({ page }) => {
    await page.evaluate(() => localStorage.setItem("locale", "en"));
    await page.reload();

    await expect(page.getByText("Bull", { exact: true })).toBeVisible();
    await expect(page.getByText("Bear", { exact: true })).toBeVisible();

    await page.evaluate(() => localStorage.setItem("locale", "pl"));
    await page.reload();

    await expect(page.getByText("Optymista", { exact: true })).toBeVisible();
    await expect(page.getByText("Sceptyk", { exact: true })).toBeVisible();
  });

  test("connect wallet button text changes with locale", async ({ page }) => {
    await page.evaluate(() => localStorage.setItem("locale", "en"));
    await page.reload();
    await expect(
      page.locator("button", { hasText: "Connect wallet" }),
    ).toBeVisible();

    await page.evaluate(() => localStorage.setItem("locale", "pl"));
    await page.reload();
    await expect(
      page.locator("button", { hasText: "Połącz portfel" }),
    ).toBeVisible();
  });
});
