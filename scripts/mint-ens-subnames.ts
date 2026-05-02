/**
 * Phase 2 ENS - Mintuje 5 subnames pod aicouncil-danergy.eth na Sepolia.
 *
 * Strategia DIRECT (skip NameStone):
 *   1. ENS Registry.setSubnodeRecord(parentNode, label, owner, resolver, ttl)
 *      tworzy subnode i podpina PublicResolver atomicznie.
 *   2. PublicResolver.setText(node, key, value) per text record.
 *
 * Tryby:
 *   - tsx scripts/mint-ens-subnames.ts             (dry-run, default)
 *   - tsx scripts/mint-ens-subnames.ts --broadcast (live wysyla tx)
 *
 * Wymaga:
 *   - ENS_OWNER_PRIVATE_KEY  (klucz wallet 0x14b9...76F4 - owner aicouncil-danergy.eth)
 *   - SEPOLIA_RPC_URL        (opcjonalne, default public Blastapi)
 *
 * Cross-chain trade-off:
 *   Reputation jest na Base Sepolia (chain 84532), ENS na Sepolia (chain 11155111).
 *   ai.reputation w text records to STATIC SNAPSHOT - live read przez UI z Base Sepolia.
 *   Update snapshot: scripts/update-reputation-snapshot.ts (uruchom raz przed demo).
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  namehash,
  labelhash,
  encodeFunctionData,
  formatEther,
  type Address,
  type Hex,
} from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// --- Stale ENS na Sepolia ---
// ENS Registry jest pod tym samym adresem na mainnet i Sepolia.
const ENS_REGISTRY: Address = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
// PublicResolver Sepolia (https://docs.ens.domains/learn/deployments).
const PUBLIC_RESOLVER: Address = "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD";
const PARENT_DOMAIN = "aicouncil-danergy.eth";
const TTL = 0n;

// --- ABI fragmenty ---
const ENS_REGISTRY_ABI = [
  {
    type: "function",
    name: "setSubnodeRecord",
    stateMutability: "nonpayable",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "label", type: "bytes32" },
      { name: "owner", type: "address" },
      { name: "resolver", type: "address" },
      { name: "ttl", type: "uint64" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [{ name: "node", type: "bytes32" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "resolver",
    stateMutability: "view",
    inputs: [{ name: "node", type: "bytes32" }],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

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

// --- Konfiguracja agentow ---
type AgentSpec = {
  label: string;            // np. "bull"
  owner: Address;           // placeholder dopoki nie ma realnych wallets per agent
  texts: Record<string, string>;
};

const GITHUB_REPO = "https://github.com/danergXx-xX/ETH-Global";
const AVATAR_BASE = "https://aicouncil.eth/avatars";
const REPUTATION_CONTRACT_BASE_SEPOLIA =
  "0xf3BAb9A2761131f4A9e5BA2d9e6395bea2186f44";

const AGENTS: AgentSpec[] = [
  {
    label: "bull",
    owner: "0x0000000000000000000000000000000000000001",
    texts: {
      name: "Bull Agent",
      description: "Optymistyczny analityk - identyfikuje upside i okazje wzrostowe.",
      avatar: `${AVATAR_BASE}/bull.png`,
      url: GITHUB_REPO,
      "com.twitter": "@aicouncil",
      "ai.persona": "bull",
      "ai.reputation": "100",
      "ai.contract": `base-sepolia:${REPUTATION_CONTRACT_BASE_SEPOLIA}`,
      "ai.address": "0x0000000000000000000000000000000000000001",
    },
  },
  {
    label: "bear",
    owner: "0x0000000000000000000000000000000000000002",
    texts: {
      name: "Bear Agent",
      description: "Pesymistyczny analityk - wskazuje ryzyka i mozliwe spadki.",
      avatar: `${AVATAR_BASE}/bear.png`,
      url: GITHUB_REPO,
      "com.twitter": "@aicouncil",
      "ai.persona": "bear",
      "ai.reputation": "100",
      "ai.contract": `base-sepolia:${REPUTATION_CONTRACT_BASE_SEPOLIA}`,
      "ai.address": "0x0000000000000000000000000000000000000002",
    },
  },
  {
    label: "risk",
    owner: "0x0000000000000000000000000000000000000003",
    texts: {
      name: "Risk Manager",
      description: "Ocenia ekspozycje portfelowe, koreluje aktywa, pilnuje limitow.",
      avatar: `${AVATAR_BASE}/risk.png`,
      url: GITHUB_REPO,
      "com.twitter": "@aicouncil",
      "ai.persona": "risk",
      "ai.reputation": "100",
      "ai.contract": `base-sepolia:${REPUTATION_CONTRACT_BASE_SEPOLIA}`,
      "ai.address": "0x0000000000000000000000000000000000000003",
    },
  },
  {
    label: "tech",
    owner: "0x0000000000000000000000000000000000000004",
    texts: {
      name: "Technical Analyst",
      description: "Analiza techniczna - wskazniki, formacje, momentum.",
      avatar: `${AVATAR_BASE}/tech.png`,
      url: GITHUB_REPO,
      "com.twitter": "@aicouncil",
      "ai.persona": "tech",
      "ai.reputation": "100",
      "ai.contract": `base-sepolia:${REPUTATION_CONTRACT_BASE_SEPOLIA}`,
      "ai.address": "0x0000000000000000000000000000000000000004",
    },
  },
  {
    label: "sentiment",
    owner: "0x0000000000000000000000000000000000000005",
    texts: {
      name: "Sentiment Reader",
      description: "Sentyment z newsow, mediow spolecznosciowych i AIXBT.",
      avatar: `${AVATAR_BASE}/sentiment.png`,
      url: GITHUB_REPO,
      "com.twitter": "@aicouncil",
      "ai.persona": "sentiment",
      "ai.reputation": "100",
      "ai.contract": `base-sepolia:${REPUTATION_CONTRACT_BASE_SEPOLIA}`,
      "ai.address": "0x0000000000000000000000000000000000000005",
    },
  },
];

// --- Helpers ---
function isHexPrivateKey(value: string): value is Hex {
  return /^0x[0-9a-fA-F]{64}$/.test(value);
}

function logAgentPlan(agent: AgentSpec) {
  const fqdn = `${agent.label}.${PARENT_DOMAIN}`;
  console.log(`\n--- ${fqdn} ---`);
  console.log(`  owner: ${agent.owner}`);
  console.log(`  resolver: ${PUBLIC_RESOLVER}`);
  console.log(`  text records: ${Object.keys(agent.texts).length}`);
  for (const [key, value] of Object.entries(agent.texts)) {
    const trimmed = value.length > 60 ? `${value.slice(0, 57)}...` : value;
    console.log(`    ${key} = ${trimmed}`);
  }
}

async function main() {
  const broadcast = process.argv.includes("--broadcast");
  const rpcUrl =
    process.env.SEPOLIA_RPC_URL ||
    "https://ethereum-sepolia-rpc.publicnode.com";

  console.log("=".repeat(70));
  console.log("Phase 2 ENS - mint subnames (DIRECT viem)");
  console.log("=".repeat(70));
  console.log(`Network:        Sepolia (chain ${sepolia.id})`);
  console.log(`RPC URL:        ${rpcUrl}`);
  console.log(`Parent domain:  ${PARENT_DOMAIN}`);
  console.log(`Registry:       ${ENS_REGISTRY}`);
  console.log(`Resolver:       ${PUBLIC_RESOLVER}`);
  console.log(`Mode:           ${broadcast ? "LIVE BROADCAST" : "DRY-RUN"}`);
  console.log(`Subnames:       ${AGENTS.length}`);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl),
  });

  // Sanity check parent ownership.
  const parentNode = namehash(PARENT_DOMAIN);
  const parentOwner = await publicClient.readContract({
    address: ENS_REGISTRY,
    abi: ENS_REGISTRY_ABI,
    functionName: "owner",
    args: [parentNode],
  });
  console.log(`\nParent node:    ${parentNode}`);
  console.log(`Parent owner:   ${parentOwner}`);

  if (parentOwner === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      `Parent ${PARENT_DOMAIN} nie ma ownera w ENS Registry. Czy domena jest zarejestrowana na Sepolia?`,
    );
  }

  for (const agent of AGENTS) {
    logAgentPlan(agent);
  }

  if (!broadcast) {
    // Gas estimate (jeden subname, mnozymy razy 5 dla pogladu).
    const dummyAccount = "0x14b97991f681D0b69074B5AD3CcC675765C276F4" as Address;
    let estPerSubname = 0n;
    try {
      const setSubnodeData = encodeFunctionData({
        abi: ENS_REGISTRY_ABI,
        functionName: "setSubnodeRecord",
        args: [
          parentNode,
          labelhash(AGENTS[0].label),
          AGENTS[0].owner,
          PUBLIC_RESOLVER,
          TTL,
        ],
      });
      const gas1 = await publicClient.estimateGas({
        account: dummyAccount,
        to: ENS_REGISTRY,
        data: setSubnodeData,
      });
      const setTextData = encodeFunctionData({
        abi: PUBLIC_RESOLVER_ABI,
        functionName: "setText",
        args: [namehash(`${AGENTS[0].label}.${PARENT_DOMAIN}`), "name", "Bull Agent"],
      });
      const gas2 = await publicClient.estimateGas({
        account: dummyAccount,
        to: PUBLIC_RESOLVER,
        data: setTextData,
      });
      const textsCount = Object.keys(AGENTS[0].texts).length;
      estPerSubname = gas1 + gas2 * BigInt(textsCount);
    } catch (e) {
      console.log(`\nGas estimate skipped: ${(e as Error).message}`);
    }
    if (estPerSubname > 0n) {
      const total = estPerSubname * BigInt(AGENTS.length);
      console.log(
        `\nGas estimate:   ~${estPerSubname.toString()} per subname, ~${total.toString()} total`,
      );
    }
    console.log("\nDRY-RUN finished. Re-run z --broadcast aby wyslac transakcje.");
    return;
  }

  // --- LIVE broadcast ---
  const pk = process.env.ENS_OWNER_PRIVATE_KEY;
  if (!pk) {
    throw new Error(
      "Missing ENS_OWNER_PRIVATE_KEY w env. Wpisz w .env (NIE commituj!) i sprobuj ponownie.",
    );
  }
  if (!isHexPrivateKey(pk)) {
    throw new Error(
      "ENS_OWNER_PRIVATE_KEY musi byc 0x + 64 hex chars (raw private key).",
    );
  }

  const account = privateKeyToAccount(pk);
  if (account.address.toLowerCase() !== String(parentOwner).toLowerCase()) {
    throw new Error(
      `Wallet ${account.address} nie jest ownerem ${PARENT_DOMAIN} (owner=${parentOwner}).`,
    );
  }

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`\nDeployer:       ${account.address}`);
  console.log(`Balance:        ${formatEther(balance)} ETH`);
  if (balance < 10n ** 16n) {
    console.warn(
      "OSTRZEZENIE: balance < 0.01 ETH - moze nie wystarczyc na 5 subname + text records.",
    );
  }

  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(rpcUrl),
  });

  const results: Array<{
    fqdn: string;
    subnodeTx: Hex;
    textTxs: Array<{ key: string; tx: Hex }>;
  }> = [];

  for (const agent of AGENTS) {
    const fqdn = `${agent.label}.${PARENT_DOMAIN}`;
    const node = namehash(fqdn);
    const label = labelhash(agent.label);
    console.log(`\n>>> ${fqdn}`);
    console.log(`    node:  ${node}`);
    console.log(`    label: ${label}`);

    // Sprawdz collision (czy subnode juz istnieje z innym ownerem).
    const existingOwner = await publicClient.readContract({
      address: ENS_REGISTRY,
      abi: ENS_REGISTRY_ABI,
      functionName: "owner",
      args: [node],
    });
    if (
      existingOwner !== "0x0000000000000000000000000000000000000000" &&
      existingOwner.toLowerCase() !== agent.owner.toLowerCase()
    ) {
      console.warn(
        `    OSTRZEZENIE: subnode istnieje z ownerem ${existingOwner} (planowany ${agent.owner}). Nadpisze przez setSubnodeRecord (parent owner ma prawo).`,
      );
    }

    const subnodeTx = await walletClient.writeContract({
      address: ENS_REGISTRY,
      abi: ENS_REGISTRY_ABI,
      functionName: "setSubnodeRecord",
      args: [parentNode, label, agent.owner, PUBLIC_RESOLVER, TTL],
    });
    console.log(`    setSubnodeRecord tx: https://sepolia.etherscan.io/tx/${subnodeTx}`);
    await publicClient.waitForTransactionReceipt({ hash: subnodeTx });

    const textTxs: Array<{ key: string; tx: Hex }> = [];
    for (const [key, value] of Object.entries(agent.texts)) {
      const tx = await walletClient.writeContract({
        address: PUBLIC_RESOLVER,
        abi: PUBLIC_RESOLVER_ABI,
        functionName: "setText",
        args: [node, key, value],
      });
      console.log(`    setText[${key}] tx: https://sepolia.etherscan.io/tx/${tx}`);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      textTxs.push({ key, tx });
    }

    results.push({ fqdn, subnodeTx, textTxs });
  }

  console.log("\n" + "=".repeat(70));
  console.log("DONE. Verify:");
  for (const r of results) {
    console.log(`  https://sepolia.app.ens.domains/${r.fqdn}`);
  }
  console.log("=".repeat(70));
}

main().catch((err) => {
  console.error("\nERROR:", err);
  process.exit(1);
});
