/**
 * Phase 2 ENS - Diversify reputation snapshot pre-demo (Sesja 32, 2026-05-03)
 *
 * Cel: Sesja 25 mint set wszystkie 5 agentow na baseline 100. Pre-demo PM-Lead
 * decyzja: zroznicowane wartosci ktore wygladaja realistycznie ("system juz dziala").
 * Dane oparte o symulacje 12 debat - bull i risk czesciej zgadzaja sie z consensus,
 * bear bardziej kontrarianisty.
 *
 * Update text records per agent (3 fields x 5 agents = 15 setText tx):
 *   - ai.reputation        (zroznicowany score)
 *   - ai.debates_participated (12 dla wszystkich)
 *   - ai.consensus_aligned (procent jak ponizej)
 *
 * Tryby:
 *   - tsx scripts/diversify-reputation-snapshot.ts             (dry-run, default)
 *   - tsx scripts/diversify-reputation-snapshot.ts --broadcast (live)
 *
 * Wymaga:
 *   - ENS_OWNER_PRIVATE_KEY  (klucz wallet ownera aicouncil-danergy.eth)
 *   - SEPOLIA_RPC_URL        (opcjonalne)
 *
 * Gas estimate: ~15 setText tx x ~50k gas ~= ~750k gas total ~= ~0.005 ETH Sepolia.
 *
 * Bazuje na scripts/update-reputation-snapshot.ts (Sesja 25) - ten sam wallet,
 * ten sam parent, ten sam resolver. Roznica: hardcoded values zamiast read z Base Sepolia.
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  namehash,
  type Address,
  type Hex,
} from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

const PARENT_DOMAIN = "aicouncil-danergy.eth";
const PUBLIC_RESOLVER: Address = "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD";
const ENS_REGISTRY_ADDR: Address = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";

const PUBLIC_RESOLVER_ABI = [
  {
    type: "function",
    name: "setText",
    stateMutability: "nonpayable",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "key", type: "string" },
      { name: "value", type: "string" },
    ],
    outputs: [],
  },
] as const;

const ENS_REGISTRY_ABI = [
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [{ name: "node", type: "bytes32" }],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

/**
 * Diversified snapshot values, PM-Lead decyzja Sesja 32.
 * Symulacja 12 debat per agent - bull/risk czesciej alignuja, bear kontra.
 *
 * Procent consensus_aligned = aligned/debates_participated (integer math, audit-friendly).
 *   bull       10/12 = 83.3%
 *   bear        9/12 = 75.0%
 *   risk       11/12 = 91.7%
 *   tech       10/12 = 83.3%
 *   sentiment  10/12 = 83.3%
 * Reputation deltas oparte o tendencje alignment z odchyleniem dla varietetu (bull rosnie,
 * bear traci, risk najwyzej, tech umiarkowanie, sentiment lekko nad baseline 100).
 */
const DIVERSIFIED_SNAPSHOT: Array<{
  label: string;
  reputation: string;
  debates_participated: string;
  consensus_aligned: string;
  consensus_pct_note: string;
}> = [
  { label: "bull", reputation: "108", debates_participated: "12", consensus_aligned: "10", consensus_pct_note: "83.3%" },
  { label: "bear", reputation: "95", debates_participated: "12", consensus_aligned: "9", consensus_pct_note: "75.0%" },
  { label: "risk", reputation: "112", debates_participated: "12", consensus_aligned: "11", consensus_pct_note: "91.7%" },
  { label: "tech", reputation: "105", debates_participated: "12", consensus_aligned: "10", consensus_pct_note: "83.3%" },
  { label: "sentiment", reputation: "102", debates_participated: "12", consensus_aligned: "10", consensus_pct_note: "83.3%" },
];

function isHexPrivateKey(value: string): value is Hex {
  return /^0x[0-9a-fA-F]{64}$/.test(value);
}

async function main() {
  const broadcast = process.argv.includes("--broadcast");
  const sepoliaRpc =
    process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

  console.log("=".repeat(70));
  console.log("Phase 2 ENS - DIVERSIFY reputation snapshot (Sesja 32 pre-demo)");
  console.log("=".repeat(70));
  console.log(`Parent ENS:  ${PARENT_DOMAIN} (Sepolia)`);
  console.log(`Mode:        ${broadcast ? "LIVE BROADCAST" : "DRY-RUN"}`);
  console.log(`Tx count:    ${DIVERSIFIED_SNAPSHOT.length * 3} setText (${DIVERSIFIED_SNAPSHOT.length} agents x 3 fields)`);
  console.log("");
  console.log("Planned values:");
  for (const s of DIVERSIFIED_SNAPSHOT) {
    console.log(
      `  ${s.label.padEnd(10)} reputation=${s.reputation}  debates=${s.debates_participated}  aligned=${s.consensus_aligned} (${s.consensus_pct_note})`,
    );
  }

  if (!broadcast) {
    console.log("\nDRY-RUN. Re-run z --broadcast aby zapisac do ENS text records.");
    console.log("Gas estimate broadcast: ~15 tx x ~50k gas = ~0.005 ETH Sepolia.");
    return;
  }

  const pk = process.env.ENS_OWNER_PRIVATE_KEY;
  if (!pk || !isHexPrivateKey(pk)) {
    throw new Error("Brak/zle ENS_OWNER_PRIVATE_KEY (oczekiwane 0x + 64 hex).");
  }
  const account = privateKeyToAccount(pk);

  // Symetria z update-reputation-snapshot.ts (Mateusz audit LOW-2):
  // sprawdz wlasnosc parent ENS PRZED broadcast.
  const sepoliaPublic = createPublicClient({
    chain: sepolia,
    transport: http(sepoliaRpc),
  });
  const parentNode = namehash(PARENT_DOMAIN);
  const parentOwner = await sepoliaPublic.readContract({
    address: ENS_REGISTRY_ADDR,
    abi: ENS_REGISTRY_ABI,
    functionName: "owner",
    args: [parentNode],
  });
  if (account.address.toLowerCase() !== String(parentOwner).toLowerCase()) {
    throw new Error(
      `Wallet ${account.address} nie jest ownerem ${PARENT_DOMAIN} (owner=${parentOwner}).`,
    );
  }

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(sepoliaRpc),
  });

  console.log(`\nDeployer: ${account.address}`);
  console.log("Broadcasting setText tx...\n");

  for (const s of DIVERSIFIED_SNAPSHOT) {
    const fqdn = `${s.label}.${PARENT_DOMAIN}`;
    const node = namehash(fqdn);

    const updates: Array<{ key: string; value: string }> = [
      { key: "ai.reputation", value: s.reputation },
      { key: "ai.debates_participated", value: s.debates_participated },
      { key: "ai.consensus_aligned", value: s.consensus_aligned },
    ];

    for (const u of updates) {
      const tx = await walletClient.writeContract({
        address: PUBLIC_RESOLVER,
        abi: PUBLIC_RESOLVER_ABI,
        functionName: "setText",
        args: [node, u.key, u.value],
      });
      console.log(
        `  ${fqdn} ${u.key.padEnd(25)}=${u.value.padEnd(4)}  tx: https://sepolia.etherscan.io/tx/${tx}`,
      );
      // Czekaj na confirmation przed kolejnym setText - inaczej publiczne RPC moga
      // odrzucac z powodu stale nonce gdy 15 tx leci pod rzad (Critic M5).
      await sepoliaPublic.waitForTransactionReceipt({ hash: tx });
    }
  }

  console.log("\nDONE. Verify via app.ens.domains/aicouncil-danergy.eth (Sepolia network).");
}

main().catch((err) => {
  console.error("\nERROR:", err);
  process.exit(1);
});
