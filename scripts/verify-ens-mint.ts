import { createPublicClient, http, namehash } from "viem";
import { sepolia } from "viem/chains";
const c = createPublicClient({ chain: sepolia, transport: http("https://ethereum-sepolia-rpc.publicnode.com") });
const RES = "0x8FADE66B79cC9f707aB26799354482EB93a5B7dD" as const;
const ABI = [{type:"function",name:"text",stateMutability:"view",inputs:[{name:"node",type:"bytes32"},{name:"key",type:"string"}],outputs:[{name:"",type:"string"}]}] as const;
const personas = ["bull","bear","risk","tech","sentiment"];
const keys = ["name","description","avatar","url","com.twitter","ai.persona","ai.reputation","ai.contract","ai.address","ai.system_prompt_hash"];
async function main() {
  for (const p of personas) {
    console.log(`\n=== ${p}.aicouncil-danergy.eth ===`);
    const node = namehash(`${p}.aicouncil-danergy.eth`);
    for (const k of keys) {
      const v = await c.readContract({ address: RES, abi: ABI, functionName: "text", args: [node, k] });
      console.log(`  ${k.padEnd(15)} = "${v}"`);
    }
  }
}
main().catch(e=>{console.error(e);process.exit(1)});
