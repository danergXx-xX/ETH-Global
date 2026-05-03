/**
 * AI Treasury Council - on-chain contract addresses + ABIs
 *
 * Source: contracts/deployments/base-sepolia.json (Sol Phase 1A deploy 2026-05-02)
 * Network: Base Sepolia (chainId 84532)
 * Deployer: 0x4872F81A0fFeb204D13f17644e26e7345F7d148a
 */

import {
  CouncilTokenAbi,
  AICouncilGovernorAbi,
  TimelockControllerAbi,
  MockUSDCAbi,
  AgentReputationAbi,
} from "./abi";

export const CHAIN_ID = 84532; // Base Sepolia
export const CHAIN_NAME = "Base Sepolia";
export const BASESCAN_URL = "https://sepolia.basescan.org";

export const CONTRACTS = {
  CouncilToken: {
    address: "0x5fe2a5e971D9faaff9cC0b0c9981DA44fEFC4381" as const,
    abi: CouncilTokenAbi,
    name: "AI Council Token",
    symbol: "AICT",
    type: "ERC20Votes",
  },
  TimelockController: {
    address: "0x76a69bB6AeF69A2E76Fa6C9632FF6Ca101441b0f" as const,
    abi: TimelockControllerAbi,
    minDelaySeconds: 172800, // 48h - Sora trust mech #2
  },
  AICouncilGovernor: {
    address: "0x1F95c796C5DC47d08B20cf3220a2AFa995E301f0" as const,
    abi: AICouncilGovernorAbi,
    votingDelaySeconds: 12,
    votingPeriodDays: 1,
    quorumPercentage: 60,
  },
  MockUSDC: {
    address: "0x606EdE7755131e6206a29B67d88761EEbb3Bb59d" as const,
    abi: MockUSDCAbi,
    name: "Mock USDC",
    symbol: "mUSDC",
    decimals: 6,
    initialTreasuryMUSDC: "1000000", // 1M w timelock
  },
  AgentReputation: {
    address: "0xf3BAb9A2761131f4A9e5BA2d9e6395bea2186f44" as const,
    abi: AgentReputationAbi,
    // Sesja 37 P0-2: real deterministic agent EOAs (Szymon escalation).
    // Source: scripts/lib/agent-eoas.ts. Doc: scripts/AGENT-EOAS.md.
    // Wczesniej: precompile 0x...01-05 (smell test failure).
    agentAddresses: {
      bull: "0xB058a9B7Cf900640078E4259bf603d3f0918BEeC",
      bear: "0x9C399085A223F35fec0Dae9573D42294bf43b963",
      risk: "0x1679a3cf4e167EeeD15a567e5EA33871399a59bC",
      tech: "0x87648Ab8e343cDAC4a7439f006f85A8a8f100b3d",
      sentiment: "0xbD77e36F82Ad0041B021834f308065CFa5b5cB62",
    },
    initialReputation: 100,
  },
} as const;

export type ContractName = keyof typeof CONTRACTS;

export function getBasescanUrl(address: string): string {
  return `${BASESCAN_URL}/address/${address}`;
}

export function getBasescanTxUrl(txHash: string): string {
  return `${BASESCAN_URL}/tx/${txHash}`;
}
