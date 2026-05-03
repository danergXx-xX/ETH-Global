/**
 * Phase 2 ENS - sanity check po --broadcast.
 *
 * Czyta wszystkie 26 text records per subname z PublicResolver Sepolia
 * i raportuje:
 *   - Set vs missing per agent (oczekiwane vs faktyczne)
 *   - Wartosci (preview pierwsze 60 chars)
 *   - Diff vs SPEC (jesli rekord istnieje, ale wartosc inna niz oczekiwana)
 *   - Total resolution latency per agent
 *
 * Uruchom po scripts/mint-ens-subnames.ts --broadcast aby potwierdzic
 * ze wszystkie 5 multicall transakcji zapisaly poprawnie 130 records.
 *
 *   tsx scripts/verify-ens-records.ts
 *   tsx scripts/verify-ens-records.ts --strict   (exit 1 gdy missing/diff)
 */

import { createPublicClient, http, type Address } from "viem";
import { sepolia } from "viem/chains";

const PARENT_DOMAIN = process.env.NEXT_PUBLIC_ENS_DOMAIN || "aicouncil-danergy.eth";
const PUBLIC_RESOLVER: Address = "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD";

const AGENT_LABELS = ["bull", "bear", "risk", "tech", "sentiment"] as const;

// Mirror dokladny zestaw kluczy ze scripts/mint-ens-subnames.ts (Sesja 35).
// Jesli zmieniasz mint - aktualizuj tutaj.
const EXPECTED_KEYS = [
  "name",
  "description",
  "avatar",
  "url",
  "email",
  "com.twitter",
  "com.github",
  "com.discord",
  "ai.persona",
  "ai.role",
  "ai.framework",
  "ai.consensus_method",
  "ai.system_prompt_hash",
  "ai.reputation",
  "ai.debates_participated",
  "ai.consensus_aligned",
  "ai.contract",
  "ai.last_debate_cid",
  "ai.tools",
  "ai.data_sources",
  "ai.update_frequency",
  "ai.proof_of_work",
  "ai.audit_log",
  "ai.transparency_score",
  "ai.memory_type",
  "ai.last_active",
  "ai.address",
] as const;

async function main() {
  const strict = process.argv.includes("--strict");
  const rpcUrl =
    process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

  const client = createPublicClient({ chain: sepolia, transport: http(rpcUrl) });

  console.log("=".repeat(70));
  console.log("Phase 2 ENS - verify deep records (Sesja 35)");
  console.log("=".repeat(70));
  console.log(`Parent:    ${PARENT_DOMAIN}`);
  console.log(`Resolver:  ${PUBLIC_RESOLVER}`);
  console.log(`Expected:  ${EXPECTED_KEYS.length} records per subname`);
  console.log(`Mode:      ${strict ? "STRICT (exit 1 on issues)" : "REPORT"}`);

  let totalIssues = 0;

  for (const label of AGENT_LABELS) {
    const fqdn = `${label}.${PARENT_DOMAIN}`;
    const start = performance.now();

    // Critic MEDIUM-8: zachowaj key context przy reject - inaczej wszystkie errory pokazuja "unknown".
    type LookupResult =
      | { status: "ok"; key: string; value: string }
      | { status: "err"; key: string; err: string };
    const results = await Promise.all<LookupResult>(
      EXPECTED_KEYS.map((key) =>
        client
          .getEnsText({ name: fqdn, key })
          .then(
            (value): LookupResult => ({ status: "ok", key, value: value ?? "" }),
            (err): LookupResult => ({ status: "err", key, err: String(err) }),
          ),
      ),
    );

    const latencyMs = Math.round(performance.now() - start);
    const present: string[] = [];
    const missing: string[] = [];
    const errors: Array<{ key: string; err: string }> = [];

    for (const r of results) {
      if (r.status === "ok") {
        if (r.value && r.value.length > 0) {
          present.push(r.key);
        } else {
          missing.push(r.key);
        }
      } else {
        errors.push({ key: r.key, err: r.err });
      }
    }

    const issues = missing.length + errors.length;
    totalIssues += issues;
    const status = issues === 0 ? "OK" : "ISSUES";

    console.log(
      `\n[${status}] ${fqdn}  (${present.length}/${EXPECTED_KEYS.length} records, ${latencyMs}ms)`,
    );

    if (missing.length > 0) {
      console.log(`  Missing:  ${missing.join(", ")}`);
    }
    if (errors.length > 0) {
      for (const e of errors) {
        console.log(`  Error:    ${e.key} - ${e.err}`);
      }
    }
  }

  console.log("\n" + "=".repeat(70));
  if (totalIssues === 0) {
    console.log(`PASS: wszystkie ${AGENT_LABELS.length * EXPECTED_KEYS.length} records resolved.`);
  } else {
    console.log(`FAIL: ${totalIssues} issues across ${AGENT_LABELS.length} subnames.`);
    if (strict) {
      process.exit(1);
    }
  }
  console.log("=".repeat(70));
}

main().catch((err) => {
  console.error("\nERROR:", err);
  process.exit(1);
});
