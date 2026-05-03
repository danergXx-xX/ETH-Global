/**
 * Sesja 37 P0-2 - Update ai.address na 5 subname'ach do REAL deterministic EOA.
 *
 * Stan przed: ai.address = 0x0000000000000000000000000000000000000001..005
 *   - to sa precompile EVM addresses (ecrecover, sha256, ripemd160, identity,
 *     modexp). NIE konta agentow. Juror: smell test failure (Szymon).
 *
 * Stan po: ai.address = derive(keccak256(toHex("aitc-${persona}-2026-v1")))
 *   - 5 deterministic EOA, recoverable z seeda. Patrz scripts/lib/agent-eoas.ts
 *   i scripts/AGENT-EOAS.md.
 *
 * Tryby:
 *   tsx scripts/update-agent-addresses.ts             # dry-run, pokazuje diff
 *   tsx scripts/update-agent-addresses.ts --broadcast # live tx
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

import { PERSONAS, getAllAgentAddresses } from "./lib/agent-eoas";

const PUBLIC_RESOLVER: Address = "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD";
const PARENT_DOMAIN = "aicouncil-danergy.eth";
const TEXT_KEY = "ai.address";

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

function isPrecompile(addr: string): boolean {
  if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) return false;
  const n = BigInt(addr);
  return n >= 1n && n <= 100n;
}

async function main() {
  const broadcast = process.argv.includes("--broadcast");
  const rpcUrl =
    process.env.SEPOLIA_RPC_URL ||
    "https://ethereum-sepolia-rpc.publicnode.com";

  console.log("=".repeat(74));
  console.log("Sesja 37 P0-2: Update ai.address (REAL deterministic EOA)");
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

  console.log("\n[1/3] Compute deterministic EOA per persona");
  const newAddrs = getAllAgentAddresses();
  for (const p of PERSONAS) {
    console.log(`  ${p.padEnd(10)} new = ${newAddrs[p]}`);
  }

  console.log("\n[2/3] Read current ai.address on-chain");
  const updates: Array<{ persona: string; node: Hex; oldVal: string; newVal: Address; needsUpdate: boolean; oldIsPrecompile: boolean }> = [];
  for (const persona of PERSONAS) {
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
    const newVal = newAddrs[persona];
    const needsUpdate = oldVal.toLowerCase() !== newVal.toLowerCase();
    const oldIsPrecompile = isPrecompile(oldVal);
    const flag = oldIsPrecompile ? " [PRECOMPILE!]" : "";
    console.log(
      `  ${persona.padEnd(10)} old = ${oldVal || "(empty)"}${flag} ${needsUpdate ? "-> UPDATE" : "OK"}`,
    );
    updates.push({ persona, node, oldVal, newVal, needsUpdate, oldIsPrecompile });
  }

  const toUpdate = updates.filter((u) => u.needsUpdate);
  if (toUpdate.length === 0) {
    console.log("\nAll 5 addresses match - nothing to update.");
    return;
  }

  console.log(`\n[3/3] ${broadcast ? "Broadcasting" : "Dry-run plan for"} ${toUpdate.length} update(s)`);

  if (!broadcast) {
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
  console.log(`DONE - ${sent.length} address(es) zaktualizowane.`);
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
