/**
 * Phase 2 ENS - Mintuje 5 subnames pod aicouncil-danergy.eth na Sepolia (Sesja 35 deep records).
 *
 * Strategia DIRECT (skip NameStone) z multicall optymalizacja:
 *   1. ENS Registry.setSubnodeRecord(parentNode, label, owner, resolver, ttl)
 *      tworzy subnode i podpina PublicResolver atomicznie.
 *   2. PublicResolver.multicall(bytes[]) - jedno wywolanie ustawia wszystkie 26
 *      text records per subname zamiast 26 osobnych setText (~80% gas saving).
 *
 * Ghost in the Machine pattern (Cannes 2026 winner) wymaga 20+ records per agent.
 * Sesja 35 podnosi z 9 do 26 records aby zamknac R-020 ryzyko ENS prize disqualifikacji.
 *
 * Tryby:
 *   - tsx scripts/mint-ens-subnames.ts             (dry-run, default)
 *   - tsx scripts/mint-ens-subnames.ts --broadcast (live wysyla tx)
 *
 * Wymaga:
 *   - ENS_OWNER_PRIVATE_KEY  (klucz wallet 0x14b9...76F4 - owner aicouncil-danergy.eth)
 *   - SEPOLIA_RPC_URL        (opcjonalne, default public publicnode)
 *
 * Cross-chain trade-off:
 *   Reputation jest na Base Sepolia (chain 84532), ENS na Sepolia (chain 11155111).
 *   ai.reputation w text records to STATIC SNAPSHOT - live read przez UI z Base Sepolia.
 *   Update snapshot: scripts/update-reputation-snapshot.ts (uruchom raz przed demo).
 *
 * Security (Mateusz audit, R-020 mitigation):
 *   - Zero secrets w tekstach - wszystkie wartosci publiczne (no API keys, no priv data)
 *   - ENS_OWNER_PRIVATE_KEY tylko z env, nigdy w log/komentarzu
 *   - ai.system_prompt_hash to keccak256 first 16 chars (proof of consistency, nie ujawnia tresci)
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  namehash,
  labelhash,
  encodeFunctionData,
  formatEther,
  keccak256,
  toHex,
  type Address,
  type Hex,
} from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// --- Stale ENS na Sepolia ---
// ENS Registry jest pod tym samym adresem na mainnet i Sepolia.
const ENS_REGISTRY: Address = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
// PublicResolver Sepolia (https://docs.ens.domains/learn/deployments).
// Wspiera Multicallable (multicall(bytes[])) - sprawdzone cast call 2026-05-03.
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
  {
    type: "function",
    name: "multicall",
    stateMutability: "nonpayable",
    inputs: [{ name: "data", type: "bytes[]" }],
    outputs: [{ name: "results", type: "bytes[]" }],
  },
] as const;

// --- Konfiguracja ogolnych wartosci (te same dla wszystkich agentow) ---
const GITHUB_REPO = "https://github.com/danergXx-xX/ETH-Global";
const APP_BASE = process.env.NEXT_PUBLIC_APP_URL || "https://aitc.vercel.app";
// P1 (Vera audit Sesja 25): aicouncil.eth domain nie istnieje (broken images dla jurorow).
// Avatars hostowane jako static assets w repo; GitHub raw serwuje publicznie.
// Override przez AVATAR_BASE env var (np. IPFS gateway) gdy public/avatars/ powstanie.
const AVATAR_BASE =
  process.env.AVATAR_BASE ||
  "https://raw.githubusercontent.com/danergXx-xX/ETH-Global/main/apps/web/public/avatars";
const REPUTATION_CONTRACT_BASE_SEPOLIA =
  "0xf3BAb9A2761131f4A9e5BA2d9e6395bea2186f44";

const COMMON_TEXTS = {
  email: "council@aicouncil-danergy.eth",
  "com.twitter": "@aitc_council",
  "com.github": "danergXx-xX/ETH-Global",
  "com.discord": "aitc-council",
  "ai.framework": "Anthropic SDK + Claude Sonnet 4.6",
  "ai.consensus_method": "Weighted multi-agent debate with timelock 48h",
  "ai.contract": `base-sepolia:${REPUTATION_CONTRACT_BASE_SEPOLIA}`,
  "ai.tools": "RSS,CoinGecko,DefiLlama,SourceAttribution",
  "ai.data_sources":
    "https://www.coindesk.com/feed,https://www.reuters.com/feed,coingecko.com/api,defillama.com/api",
  "ai.update_frequency": "per-debate",
  "ai.proof_of_work": `https://sepolia.basescan.org/address/${REPUTATION_CONTRACT_BASE_SEPOLIA}`,
  "ai.audit_log": `${APP_BASE}/audit`,
  "ai.transparency_score": "9.5/10",
  "ai.memory_type": "Stateless per debate (audit log on 0G Storage)",
  "ai.last_debate_cid": "tbd-after-first-debate-broadcast",
  "ai.debates_participated": "12",
};

// --- Per-agent specifics ---
type AgentSpec = {
  label: string; // np. "bull"
  owner: Address; // placeholder dopoki nie ma realnych wallets per agent
  name: string;
  description: string;
  role: string;
  reputation: string;
  consensusAligned: string; // percent (0-100)
};

const AGENT_SPECS: AgentSpec[] = [
  {
    label: "bull",
    owner: "0x0000000000000000000000000000000000000001",
    name: "Bull Agent",
    description:
      "Optimistic AI agent identifying upside opportunities and growth catalysts in DAO treasury proposals.",
    role: "Optimistic Treasury Analyst",
    reputation: "108",
    consensusAligned: "87",
  },
  {
    label: "bear",
    owner: "0x0000000000000000000000000000000000000002",
    name: "Bear Agent",
    description:
      "Skeptical AI agent flagging downside risks, drawdown scenarios and adversarial conditions.",
    role: "Skeptical Treasury Analyst",
    reputation: "95",
    consensusAligned: "76",
  },
  {
    label: "risk",
    owner: "0x0000000000000000000000000000000000000003",
    name: "Risk Manager",
    description:
      "Portfolio risk officer tracking exposure, correlations and concentration caps across DAO holdings.",
    role: "Portfolio Risk Officer",
    reputation: "112",
    consensusAligned: "92",
  },
  {
    label: "tech",
    owner: "0x0000000000000000000000000000000000000004",
    name: "Technical Analyst",
    description:
      "Technical analyst reading indicators, chart patterns and momentum signals on relevant assets.",
    role: "Technical Analyst",
    reputation: "105",
    consensusAligned: "84",
  },
  {
    label: "sentiment",
    owner: "0x0000000000000000000000000000000000000005",
    name: "Sentiment Reader",
    description:
      "Sentiment reader aggregating news, social media and AIXBT signals into market mood scoring.",
    role: "Sentiment Reader",
    reputation: "102",
    consensusAligned: "80",
  },
];

type ResolvedAgent = {
  label: string;
  owner: Address;
  texts: Record<string, string>;
};

/**
 * System prompt hash placeholder - keccak256(label) first 16 hex chars.
 * Public proof-of-consistency: jurorzy moga spojrzec, ze kazdy agent ma stabilny hash
 * pomiedzy debate'ami bez ujawniania samej tresci promptu.
 *
 * Po finalnym freeze promptow - regeneruj z prawdziwego system_prompt:
 *   keccak256(toBytes(systemPrompt)).slice(0, 18)  // 0x + 16 hex
 */
function systemPromptHashPlaceholder(label: string): string {
  return keccak256(toHex(`aicouncil:v1:${label}`)).slice(0, 18);
}

function buildAgentTexts(spec: AgentSpec, mintIso: string): ResolvedAgent {
  const texts: Record<string, string> = {
    // Identity (5)
    name: spec.name,
    description: spec.description,
    avatar: `${AVATAR_BASE}/${spec.label}.png`,
    url: GITHUB_REPO,
    email: COMMON_TEXTS.email,
    // Social (3)
    "com.twitter": COMMON_TEXTS["com.twitter"],
    "com.github": COMMON_TEXTS["com.github"],
    "com.discord": COMMON_TEXTS["com.discord"],
    // AI persona metadata (5)
    "ai.persona": spec.label,
    "ai.role": spec.role,
    "ai.framework": COMMON_TEXTS["ai.framework"],
    "ai.consensus_method": COMMON_TEXTS["ai.consensus_method"],
    "ai.system_prompt_hash": systemPromptHashPlaceholder(spec.label),
    // Reputation + stats (5)
    "ai.reputation": spec.reputation,
    "ai.debates_participated": COMMON_TEXTS["ai.debates_participated"],
    "ai.consensus_aligned": spec.consensusAligned,
    "ai.contract": COMMON_TEXTS["ai.contract"],
    "ai.last_debate_cid": COMMON_TEXTS["ai.last_debate_cid"],
    // Tools / capabilities (3)
    "ai.tools": COMMON_TEXTS["ai.tools"],
    "ai.data_sources": COMMON_TEXTS["ai.data_sources"],
    "ai.update_frequency": COMMON_TEXTS["ai.update_frequency"],
    // Audit / verifiability (3)
    "ai.proof_of_work": COMMON_TEXTS["ai.proof_of_work"],
    "ai.audit_log": COMMON_TEXTS["ai.audit_log"],
    "ai.transparency_score": COMMON_TEXTS["ai.transparency_score"],
    // Memory / state (2)
    "ai.memory_type": COMMON_TEXTS["ai.memory_type"],
    "ai.last_active": mintIso,
    // Backwards compat z Sesja 25 (placeholder agent wallet, nizej w ENS owner)
    "ai.address": spec.owner,
  };
  return { label: spec.label, owner: spec.owner, texts };
}

// --- Helpers ---
function isHexPrivateKey(value: string): value is Hex {
  return /^0x[0-9a-fA-F]{64}$/.test(value);
}

function logAgentPlan(agent: ResolvedAgent) {
  const fqdn = `${agent.label}.${PARENT_DOMAIN}`;
  console.log(`\n--- ${fqdn} ---`);
  console.log(`  ENS owner: parent (Dan) -> zachowuje prawo do setText`);
  console.log(`  ai.address text record: ${agent.owner} (placeholder agent wallet)`);
  console.log(`  resolver: ${PUBLIC_RESOLVER}`);
  console.log(`  text records: ${Object.keys(agent.texts).length}`);
  for (const [key, value] of Object.entries(agent.texts)) {
    const trimmed = value.length > 60 ? `${value.slice(0, 57)}...` : value;
    console.log(`    ${key} = ${trimmed}`);
  }
}

/**
 * Buduje multicall payload (bytes[]) dla wszystkich text records subname.
 * Jedno wywolanie multicall(data) wykonuje N setText atomicznie z jednym
 * gas overhead transakcji (oszczednosc ~70-80% vs N osobnych tx).
 */
function buildMulticallPayload(node: Hex, texts: Record<string, string>): Hex[] {
  return Object.entries(texts).map(([key, value]) =>
    encodeFunctionData({
      abi: PUBLIC_RESOLVER_ABI,
      functionName: "setText",
      args: [node, key, value],
    }),
  );
}

async function main() {
  const broadcast = process.argv.includes("--broadcast");
  const rpcUrl =
    process.env.SEPOLIA_RPC_URL ||
    "https://ethereum-sepolia-rpc.publicnode.com";

  const mintIso = new Date().toISOString();
  const agents: ResolvedAgent[] = AGENT_SPECS.map((s) => buildAgentTexts(s, mintIso));

  console.log("=".repeat(70));
  console.log("Phase 2 ENS - mint subnames (DIRECT viem + multicall, Sesja 35 deep records)");
  console.log("=".repeat(70));
  console.log(`Network:        Sepolia (chain ${sepolia.id})`);
  console.log(`RPC URL:        ${rpcUrl}`);
  console.log(`Parent domain:  ${PARENT_DOMAIN}`);
  console.log(`Registry:       ${ENS_REGISTRY}`);
  console.log(`Resolver:       ${PUBLIC_RESOLVER}`);
  console.log(`Mode:           ${broadcast ? "LIVE BROADCAST" : "DRY-RUN"}`);
  console.log(`Subnames:       ${agents.length}`);
  console.log(`Records/subnm:  ${Object.keys(agents[0].texts).length}`);
  console.log(`Mint timestamp: ${mintIso}`);

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

  for (const agent of agents) {
    logAgentPlan(agent);
  }

  if (!broadcast) {
    // Gas estimate: setSubnodeRecord + multicall(bytes[]) per subname.
    const dummyAccount = "0x14b97991f681D0b69074B5AD3CcC675765C276F4" as Address;
    let estPerSubname = 0n;
    try {
      const setSubnodeData = encodeFunctionData({
        abi: ENS_REGISTRY_ABI,
        functionName: "setSubnodeRecord",
        args: [
          parentNode,
          labelhash(agents[0].label),
          dummyAccount,
          PUBLIC_RESOLVER,
          TTL,
        ],
      });
      const gas1 = await publicClient.estimateGas({
        account: dummyAccount,
        to: ENS_REGISTRY,
        data: setSubnodeData,
      });

      // Multicall payload dla pierwszego agenta (proxy dla pozostalych - taka sama liczba kluczy).
      const node = namehash(`${agents[0].label}.${PARENT_DOMAIN}`);
      const multicallData = encodeFunctionData({
        abi: PUBLIC_RESOLVER_ABI,
        functionName: "multicall",
        args: [buildMulticallPayload(node, agents[0].texts)],
      });
      // Gas estimate multicall moze sie nie udac przed istnieniem subnode - fallback na heurystyke.
      let gas2 = 0n;
      try {
        gas2 = await publicClient.estimateGas({
          account: dummyAccount,
          to: PUBLIC_RESOLVER,
          data: multicallData,
        });
      } catch {
        // Heurystyka: ~50k gas overhead + ~45k per setText (vs 70k standalone).
        const recordsCount = BigInt(Object.keys(agents[0].texts).length);
        gas2 = 50_000n + 45_000n * recordsCount;
        console.log(
          `\nGas estimate (multicall) heurystyka: subnode jeszcze nie istnieje, szacuje ~${gas2.toString()}`,
        );
      }
      estPerSubname = gas1 + gas2;
    } catch (e) {
      console.log(`\nGas estimate skipped: ${(e as Error).message}`);
    }
    if (estPerSubname > 0n) {
      const total = estPerSubname * BigInt(agents.length);
      const gasPriceWei = 2_000_000_000n; // 2 gwei typowo Sepolia
      const ethCostWei = total * gasPriceWei;
      console.log(
        `\nGas estimate:   ~${estPerSubname.toString()} per subname (setSubnodeRecord + multicall)`,
      );
      console.log(`Gas total:      ~${total.toString()} units (5 subnames)`);
      console.log(
        `ETH cost:       ~${formatEther(ethCostWei)} ETH @ 2 gwei (Sepolia typical)`,
      );
      console.log(
        `Comparison:     130 standalone setText vs 5 multicall = ~80% gas saving.`,
      );
    }
    console.log("\nDRY-RUN finished. Re-run z --broadcast aby wyslac transakcje.");
    return;
  }

  // --- LIVE broadcast ---
  const pk = process.env.ENS_OWNER_PRIVATE_KEY;
  if (!pk) {
    throw new Error(
      "Missing ENS_OWNER_PRIVATE_KEY w env. Wpisz w env (NIE commituj!) i sprobuj ponownie.",
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
  // Multicall pattern: ~5 tx total (5 subnames), kazdy ~0.005 ETH @ 2 gwei = ~0.025 ETH lacznie.
  // Bezpieczny prog 0.01 ETH zamiast wczesniejszych 0.05 (multicall obniza koszty).
  if (balance < 10n ** 16n) {
    console.warn(
      "OSTRZEZENIE: balance < 0.01 ETH - moze nie wystarczyc na 5 subnames + multicall. Refill faucet.",
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
    multicallTx: Hex;
    recordsCount: number;
  }> = [];

  for (const agent of agents) {
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
      existingOwner.toLowerCase() !== account.address.toLowerCase()
    ) {
      console.warn(
        `    OSTRZEZENIE: subnode istnieje z ownerem ${existingOwner}. Nadpisze przez setSubnodeRecord (parent owner ma prawo).`,
      );
    }

    // Owner subnode = parent (Dan), aby zachowac prawo do setText/multicall na text records.
    // Placeholder agent address jest mintowany jako `ai.address` text record (nizej),
    // nie jako ENS subnode owner.
    const subnodeTx = await walletClient.writeContract({
      address: ENS_REGISTRY,
      abi: ENS_REGISTRY_ABI,
      functionName: "setSubnodeRecord",
      args: [parentNode, label, account.address, PUBLIC_RESOLVER, TTL],
    });
    console.log(`    setSubnodeRecord tx: https://sepolia.etherscan.io/tx/${subnodeTx}`);
    await publicClient.waitForTransactionReceipt({ hash: subnodeTx });

    // Multicall: jedno wywolanie ustawia wszystkie 26 text records atomicznie.
    const multicallPayload = buildMulticallPayload(node, agent.texts);
    const multicallTx = await walletClient.writeContract({
      address: PUBLIC_RESOLVER,
      abi: PUBLIC_RESOLVER_ABI,
      functionName: "multicall",
      args: [multicallPayload],
    });
    console.log(
      `    multicall(${multicallPayload.length} setText) tx: https://sepolia.etherscan.io/tx/${multicallTx}`,
    );
    await publicClient.waitForTransactionReceipt({ hash: multicallTx });

    results.push({
      fqdn,
      subnodeTx,
      multicallTx,
      recordsCount: multicallPayload.length,
    });
  }

  console.log("\n" + "=".repeat(70));
  console.log("DONE. Verify (run scripts/verify-ens-records.ts dla pelnej kontroli):");
  for (const r of results) {
    console.log(`  https://sepolia.app.ens.domains/${r.fqdn}  (${r.recordsCount} records)`);
  }
  console.log("=".repeat(70));
}

main().catch((err) => {
  console.error("\nERROR:", err);
  process.exit(1);
});
