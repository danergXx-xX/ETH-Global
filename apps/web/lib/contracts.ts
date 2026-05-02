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
    agentAddresses: {
      bull: "0x0000000000000000000000000000000000000001",
      bear: "0x0000000000000000000000000000000000000002",
      risk: "0x0000000000000000000000000000000000000003",
      tech: "0x0000000000000000000000000000000000000004",
      sentiment: "0x0000000000000000000000000000000000000005",
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
