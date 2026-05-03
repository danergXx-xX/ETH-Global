/**
 * Sesja 37 P0-1 - Update ai.system_prompt_hash na 5 subname'ach do REAL hash.
 *
 * Stan przed: ai.system_prompt_hash = keccak256(toHex("aicouncil:v1:bull")).slice(0,18)
 *   - to jest hash etykiety, NIE promptu. Juror moze policzyc keccak256(systemPrompt)
 *   z personas.py i porownac - hashe nie pasuja -> smell test failure (Szymon).
 *
 * Stan po: ai.system_prompt_hash = keccak256(utf8(systemPrompt))
 *   gdzie systemPrompt = build_system_prompt(persona) z apps/api/agents/personas.py.
 *   Pelne 32 bajty (0x + 64 hex) zeby juror mogl zweryfikowac BYTE-PERFECT.
 *
 * Pattern: per-agent setText (5 osobnych transakcji, sequential nonce).
 *   NIE jest to multicall - kazdy setText ma osobny nonce, gas, receipt wait.
 *   Trade-off: prostszy debug + naturalna idempotencja (re-run pomija OK)
 *   vs ~30% wyzszy gas niz multicall(bytes[]) na 1 resolver. Dla 5 agentow x
 *   ~127k gas to akceptowalne (~636k total, ~$0.001 na 1 gwei).
 *
 * Tryby:
 *   tsx scripts/update-prompt-hashes.ts             # dry-run, pokazuje diff
 *   tsx scripts/update-prompt-hashes.ts --broadcast # live tx
 *
 * Wymaga:
 *   ENS_OWNER_PRIVATE_KEY  (parent owner aicouncil-danergy.eth)
 *   SEPOLIA_RPC_URL        (opcjonalne)
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  namehash,
  encodeFunctionData,
  formatEther,
  type Address,
  type Hex,
} from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

import { getAllPromptHashes } from "./lib/persona-prompts";

const PUBLIC_RESOLVER: Address = "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD";
const PARENT_DOMAIN = "aicouncil-danergy.eth";
const TEXT_KEY = "ai.system_prompt_hash";

const RESOLVER_ABI = [
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

function isHexPrivateKey(value: string): value is Hex {
  return /^0x[0-9a-fA-F]{64}$/.test(value);
}

async function main() {
  const broadcast = process.argv.includes("--broadcast");
  const rpcUrl =
    process.env.SEPOLIA_RPC_URL ||
    "https://ethereum-sepolia-rpc.publicnode.com";

  console.log("=".repeat(74));
  console.log("Sesja 37 P0-1: Update ai.system_prompt_hash (REAL keccak256(prompt))");
  console.log("=".repeat(74));
  console.log(`Network:        Sepolia (chain ${sepolia.id})`);
  console.log(`RPC URL:        ${rpcUrl}`);
  console.log(`Resolver:       ${PUBLIC_RESOLVER}`);
  console.log(`Parent domain:  ${PARENT_DOMAIN}`);
  console.log(`Mode:           ${broadcast ? "LIVE BROADCAST" : "DRY-RUN"}`);

  const client = createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl),
  });

  // 1. Compute new hashes z personas.py SSOT
  console.log("\n[1/3] Compute keccak256(systemPrompt) per persona");
  const newHashes = getAllPromptHashes();
  for (const [persona, hash] of Object.entries(newHashes)) {
    console.log(`  ${persona.padEnd(10)} new = ${hash}`);
  }

  // 2. Read current values from chain (diff)
  console.log("\n[2/3] Read current ai.system_prompt_hash on-chain");
  const personas = Object.keys(newHashes) as Array<keyof typeof newHashes>;
  const updates: Array<{ persona: string; node: Hex; oldVal: string; newVal: Hex; needsUpdate: boolean }> = [];
  for (const persona of personas) {
    const fqdn = `${persona}.${PARENT_DOMAIN}`;
    const node = namehash(fqdn) as Hex;
    let oldVal = "";
    try {
      oldVal = (await client.readContract({
        address: PUBLIC_RESOLVER,
        abi: RESOLVER_ABI,
        functionName: "text",
        args: [node, TEXT_KEY],
      })) as string;
    } catch (e) {
      oldVal = `<read failed: ${(e as Error).message}>`;
    }
    const newVal = newHashes[persona];
    const needsUpdate = oldVal !== newVal;
    console.log(
      `  ${persona.padEnd(10)} old = ${oldVal || "(empty)"} ${needsUpdate ? "-> UPDATE" : "OK"}`,
    );
    updates.push({ persona, node, oldVal, newVal, needsUpdate });
  }

  const toUpdate = updates.filter((u) => u.needsUpdate);
  if (toUpdate.length === 0) {
    console.log("\nAll 5 hashes match - nothing to update.");
    return;
  }

  // 3. Broadcast / dry-run
  console.log(`\n[3/3] ${broadcast ? "Broadcasting" : "Dry-run plan for"} ${toUpdate.length} update(s)`);

  if (!broadcast) {
    // Estimate gas
    try {
      const dummy = "0x14b97991f681D0b69074B5AD3CcC675765C276F4" as Address;
      const sample = toUpdate[0];
      const gas = await client.estimateGas({
        account: dummy,
        to: PUBLIC_RESOLVER,
        data: encodeFunctionData({
          abi: RESOLVER_ABI,
          functionName: "setText",
          args: [sample.node, TEXT_KEY, sample.newVal],
        }),
      });
      console.log(`  Gas est per setText: ~${gas.toString()}`);
      console.log(`  Total est:           ~${(gas * BigInt(toUpdate.length)).toString()}`);
    } catch (e) {
      console.log(`  Gas estimate skipped: ${(e as Error).message}`);
    }
    console.log("\nDRY-RUN done. Re-run z --broadcast aby wyslac transakcje.");
    return;
  }

  const pk = process.env.ENS_OWNER_PRIVATE_KEY;
  if (!pk || !isHexPrivateKey(pk)) {
    throw new Error(
      "ENS_OWNER_PRIVATE_KEY musi byc ustawione (0x + 64 hex). Zobacz .env.example.",
    );
  }
  const account = privateKeyToAccount(pk);
  const wallet = createWalletClient({ account, chain: sepolia, transport: http(rpcUrl) });

  const balance = await client.getBalance({ address: account.address });
  console.log(`\nDeployer:       ${account.address}`);
  console.log(`Balance:        ${formatEther(balance)} ETH`);

  const sent: Array<{ persona: string; tx: Hex }> = [];
  for (const u of toUpdate) {
    const tx = await wallet.writeContract({
      address: PUBLIC_RESOLVER,
      abi: RESOLVER_ABI,
      functionName: "setText",
      args: [u.node, TEXT_KEY, u.newVal],
    });
    console.log(
      `  ${u.persona.padEnd(10)} setText tx: https://sepolia.etherscan.io/tx/${tx}`,
    );
    await client.waitForTransactionReceipt({ hash: tx });
    sent.push({ persona: u.persona, tx });
  }

  console.log("\n" + "=".repeat(74));
  console.log(`DONE - ${sent.length} hash(e) zaktualizowane.`);
  console.log("Verify:");
  for (const s of sent) {
    console.log(`  https://sepolia.app.ens.domains/${s.persona}.${PARENT_DOMAIN}`);
  }
  console.log("=".repeat(74));
}

main().catch((err) => {
  console.error("\nERROR:", err);
  process.exit(1);
});
