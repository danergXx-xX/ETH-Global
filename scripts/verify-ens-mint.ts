import { createPublicClient, http, namehash } from "viem";
import { sepolia } from "viem/chains";

const c = createPublicClient({
  chain: sepolia,
  transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
});
const RES = "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD" as const;
const ABI = [
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
const personas = ["bull", "bear", "risk", "tech", "sentiment"];
async function main() {
  for (const p of personas) {
    const node = namehash(`${p}.aicouncil-danergy.eth`);
    const [name, persona, rep, addr] = await Promise.all([
      c.readContract({ address: RES, abi: ABI, functionName: "text", args: [node, "name"] }),
      c.readContract({ address: RES, abi: ABI, functionName: "text", args: [node, "ai.persona"] }),
      c.readContract({ address: RES, abi: ABI, functionName: "text", args: [node, "ai.reputation"] }),
      c.readContract({ address: RES, abi: ABI, functionName: "text", args: [node, "ai.address"] }),
    ]);
    console.log(`${p.padEnd(10)} name="${name}" ai.persona="${persona}" ai.reputation="${rep}" ai.address=${addr}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
