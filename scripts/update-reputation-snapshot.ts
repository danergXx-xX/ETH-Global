/**
 * Phase 2 ENS - Re-snapshot reputation z Base Sepolia AgentReputation contract
 * do ENS text record `ai.reputation` na Sepolia (per agent).
 *
 * Cel: ENS jest na Sepolia, AgentReputation na Base Sepolia. Cross-chain text records
 * to nie standard, wiec robimy okresowy snapshot. Uruchom RAZ przed demo aby pokazac
 * "swieze" reputation w ENS Identity Card jako dodatek do live read z UI.
 *
 * Tryby:
 *   - tsx scripts/update-reputation-snapshot.ts             (dry-run)
 *   - tsx scripts/update-reputation-snapshot.ts --broadcast (live)
 *
 * Wymaga:
 *   - ENS_OWNER_PRIVATE_KEY  (klucz wallet ownera aicouncil-danergy.eth)
 *   - SEPOLIA_RPC_URL        (opcjonalne)
 *   - BASE_SEPOLIA_RPC_URL   (opcjonalne, default https://sepolia.base.org)
 *   - REPUTATION_CONTRACT    (opcjonalne, default 0xf3BAb9A...)
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  namehash,
  type Address,
  type Hex,
} from "viem";
import { sepolia, baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

const PARENT_DOMAIN = "aicouncil-danergy.eth";
const PUBLIC_RESOLVER: Address = "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD";
const DEFAULT_REPUTATION_CONTRACT: Address =
  "0xf3BAb9A2761131f4A9e5BA2d9e6395bea2186f44";

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
  {
    type: "function",
    name: "text",
    stateMutability: "view",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "key", type: "string" },
    ],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

const REPUTATION_ABI = [
  {
    type: "function",
    name: "getReputation",
    stateMutability: "view",
    inputs: [{ name: "agent", type: "address" }],
    outputs: [
      { name: "score", type: "uint256" },
      { name: "debates", type: "uint256" },
      { name: "aligned", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "getAgents",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }],
  },
  {
    type: "function",
    name: "agents",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

// Mapping: ENS label -> placeholder agent address (musi pokrywac sie z mint-ens-subnames.ts).
// Gdy beda realne agent wallets, zmien ten map.
const AGENT_LABELS: Array<{ label: string; address: Address }> = [
  { label: "bull", address: "0x0000000000000000000000000000000000000001" },
  { label: "bear", address: "0x0000000000000000000000000000000000000002" },
  { label: "risk", address: "0x0000000000000000000000000000000000000003" },
  { label: "tech", address: "0x0000000000000000000000000000000000000004" },
  { label: "sentiment", address: "0x0000000000000000000000000000000000000005" },
];

function isHexPrivateKey(value: string): value is Hex {
  return /^0x[0-9a-fA-F]{64}$/.test(value);
}

async function main() {
  const broadcast = process.argv.includes("--broadcast");
  const sepoliaRpc =
    process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
  const baseSepoliaRpc =
    process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const reputationContract = (process.env.REPUTATION_CONTRACT ||
    DEFAULT_REPUTATION_CONTRACT) as Address;

  console.log("=".repeat(70));
  console.log("Phase 2 ENS - reputation snapshot (Base Sepolia -> Sepolia text)");
  console.log("=".repeat(70));
  console.log(`Reputation:  ${reputationContract} (Base Sepolia)`);
  console.log(`Parent ENS:  ${PARENT_DOMAIN} (Sepolia)`);
  console.log(`Mode:        ${broadcast ? "LIVE BROADCAST" : "DRY-RUN"}`);

  const baseClient = createPublicClient({
    chain: baseSepolia,
    transport: http(baseSepoliaRpc),
  });

  const snapshots: Array<{
    label: string;
    address: Address;
    score: string;
    debates: string;
    aligned: string;
  }> = [];

  for (const a of AGENT_LABELS) {
    try {
      const [score, debates, aligned] = await baseClient.readContract({
        address: reputationContract,
        abi: REPUTATION_ABI,
        functionName: "getReputation",
        args: [a.address],
      });
      snapshots.push({
        label: a.label,
        address: a.address,
        score: score.toString(),
        debates: debates.toString(),
        aligned: aligned.toString(),
      });
      console.log(
        `  ${a.label.padEnd(10)} ${a.address}  score=${score} debates=${debates} aligned=${aligned}`,
      );
    } catch (e) {
      console.warn(
        `  ${a.label.padEnd(10)} READ FAILED: ${(e as Error).message}`,
      );
    }
  }

  if (snapshots.length === 0) {
    throw new Error("Brak snapshotow do zapisu - sprawdz Base Sepolia RPC i kontrakt.");
  }

  if (!broadcast) {
    console.log("\nDRY-RUN. Re-run z --broadcast aby zapisac do ENS text records.");
    return;
  }

  const pk = process.env.ENS_OWNER_PRIVATE_KEY;
  if (!pk || !isHexPrivateKey(pk)) {
    throw new Error("Brak/zle ENS_OWNER_PRIVATE_KEY (oczekiwane 0x + 64 hex).");
  }
  const account = privateKeyToAccount(pk);
  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(sepoliaRpc),
  });

  console.log(`\nDeployer: ${account.address}`);

  for (const s of snapshots) {
    const fqdn = `${s.label}.${PARENT_DOMAIN}`;
    const node = namehash(fqdn);
    const tx = await walletClient.writeContract({
      address: PUBLIC_RESOLVER,
      abi: PUBLIC_RESOLVER_ABI,
      functionName: "setText",
      args: [node, "ai.reputation", s.score],
    });
    console.log(
      `  ${fqdn} ai.reputation=${s.score}  tx: https://sepolia.etherscan.io/tx/${tx}`,
    );
  }

  console.log("\nDONE.");
}

main().catch((err) => {
  console.error("\nERROR:", err);
  process.exit(1);
});
