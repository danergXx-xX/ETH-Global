import { test, expect } from "@playwright/test";

const VALID_PROPOSAL = "Allocate 100 ETH to DeFi yield strategy";
const PERSONAS = ["bull", "bear", "risk", "tech", "sentiment"] as const;

test.describe("API /health", () => {
  test("returns ok status with version", async ({ request }) => {
    const response = await request.get("/health");
    expect(response.ok()).toBe(true);

    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.version).toBeDefined();
    expect(body.timestamp).toBeDefined();
  });
});

test.describe("API POST /api/debate - happy path", () => {
  test("returns 5 decisions with consensus and vote_id", async ({
    request,
  }) => {
    const response = await request.post("/api/debate", {
      data: { text: VALID_PROPOSAL },
    });
    expect(response.ok()).toBe(true);

    const body = await response.json();

    expect(body.decisions).toHaveLength(5);
    expect(body.consensus).toBeDefined();
    expect(body.vote_id).toBeDefined();

    for (const decision of body.decisions) {
      expect(PERSONAS).toContain(decision.persona);
      expect(["FOR", "AGAINST", "ABSTAIN"]).toContain(decision.decision);
      expect(decision.confidence).toBeGreaterThanOrEqual(0);
      expect(decision.confidence).toBeLessThanOrEqual(1);
      expect(decision.reasoning).toBeTruthy();
      expect(decision.timestamp).toBeDefined();
    }
  });

  test("all 5 agent personas present in response", async ({ request }) => {
    const response = await request.post("/api/debate", {
      data: { text: VALID_PROPOSAL },
    });
    const body = await response.json();

    const returnedPersonas = body.decisions.map(
      (d: { persona: string }) => d.persona,
    );
    for (const persona of PERSONAS) {
      expect(returnedPersonas).toContain(persona);
    }
  });

  test("consensus is valid enum value", async ({ request }) => {
    const response = await request.post("/api/debate", {
      data: { text: VALID_PROPOSAL },
    });
    const body = await response.json();

    expect(["FOR", "AGAINST", "ABSTAIN", "SPLIT"]).toContain(body.consensus);
  });

  test("includes request-id header in response", async ({ request }) => {
    const response = await request.post("/api/debate", {
      data: { text: VALID_PROPOSAL },
    });

    const requestId = response.headers()["x-request-id"];
    expect(requestId).toBeTruthy();
  });
});

test.describe("API POST /api/debate - validation", () => {
  test("rejects empty text with 422", async ({ request }) => {
    const response = await request.post("/api/debate", {
      data: { text: "" },
    });
    expect(response.status()).toBe(422);
  });

  test("rejects missing text field with 422", async ({ request }) => {
    const response = await request.post("/api/debate", {
      data: {},
    });
    expect(response.status()).toBe(422);
  });

  test("rejects text exceeding 2000 chars with 422", async ({ request }) => {
    const longText = "A".repeat(2001);
    const response = await request.post("/api/debate", {
      data: { text: longText },
    });
    expect(response.status()).toBe(422);
  });

  test("accepts text at exactly 2000 chars", async ({ request }) => {
    const maxText = "A".repeat(2000);
    const response = await request.post("/api/debate", {
      data: { text: maxText },
    });
    expect(response.ok()).toBe(true);
  });
});

test.describe("API CORS", () => {
  test("allows OPTIONS preflight", async ({ request }) => {
    const response = await request.fetch("/api/debate", {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
      },
    });
    expect(response.status()).toBeLessThan(400);
  });
});
