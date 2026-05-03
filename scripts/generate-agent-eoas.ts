/**
 * generate-agent-eoas.ts - lista 5 deterministic EOA addresses dla AITC agentow.
 *
 * Output: 5 publicznych addresses (bull, bear, risk, tech, sentiment) + ich
 * seed phrase (do dokumentacji recovery). NIGDY nie loguje private keys.
 *
 * Uzycie:
 *   tsx scripts/generate-agent-eoas.ts          # tabela + summary
 *   tsx scripts/generate-agent-eoas.ts --json   # JSON dla CI / inny skrypt
 *
 * Ten skrypt ma byc IDEMPOTENT - kazde uruchomienie zwraca te same addresses.
 * Jesli zwroci inne -> integrity bug w viem/keccak256/seeda. Treat as P0.
 */

import {
  PERSONAS,
  buildSeed,
  deriveAddress,
  type Persona,
} from "./lib/agent-eoas";

function main() {
  const wantJson = process.argv.includes("--json");
  const rows = PERSONAS.map((p: Persona) => ({
    persona: p,
    seed: buildSeed(p),
    address: deriveAddress(p),
  }));

  if (wantJson) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  console.log("=".repeat(78));
  console.log("AI Treasury Council - Deterministic Agent EOAs");
  console.log("=".repeat(78));
  console.log(
    "\nSeed pattern: keccak256(toHex('aitc-<persona>-2026-v1')) -> private key",
  );
  console.log(
    "Public addresses below are deterministic. Same seed -> same address.\n",
  );
  console.log(
    "PERSONA      | ADDRESS                                      | SEED",
  );
  console.log(
    "-".repeat(78),
  );
  for (const r of rows) {
    console.log(
      `${r.persona.padEnd(12)} | ${r.address} | ${r.seed}`,
    );
  }
  console.log("\nSECURITY:");
  console.log("  Private keys NIE sa wypisywane (security by design).");
  console.log("  Recovery: scripts/AGENT-EOAS.md - opisuje seed pattern.");
  console.log("  Backend keys: env vars BACKEND_AGENT_<PERSONA>_PK na Railway.");
  console.log("=".repeat(78));
}

main();
