import { test, expect } from "@playwright/test";

test.describe("I18n PL/EN toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("toggle switches UI labels between PL and EN", async ({ page }) => {
    const toggleButton = page.locator("button", { hasText: /^PL$|^EN$/ });
    await expect(toggleButton).toBeVisible();

    const currentLabel = await toggleButton.textContent();

    if (currentLabel === "PL") {
      await toggleButton.click();
      await expect(page.locator("h1")).toHaveText("AI Treasury Council");
      await expect(
        page.locator("button", { hasText: /Zwołaj Radę/ }),
      ).toBeVisible();

      const subtitlePl = page.locator("text=Wieloagentowa rada zarządzająca skarbcem DAO");
      await expect(subtitlePl).toBeVisible();
    } else {
      await toggleButton.click();
      await expect(page.locator("h1")).toHaveText("AI Treasury Council");
      await expect(
        page.locator("button", { hasText: /Convene Council/ }),
      ).toBeVisible();

      const subtitleEn = page.locator("text=Multi-agent council managing DAO treasury");
      await expect(subtitleEn).toBeVisible();
    }
  });

  test("locale persists in localStorage after toggle", async ({ page }) => {
    const toggleButton = page.locator("button", { hasText: /^PL$|^EN$/ });
    const currentLabel = await toggleButton.textContent();

    await toggleButton.click();
    const expectedLocale = currentLabel === "PL" ? "pl" : "en";

    const storedLocale = await page.evaluate(() =>
      localStorage.getItem("locale"),
    );
    expect(storedLocale).toBe(expectedLocale);
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
