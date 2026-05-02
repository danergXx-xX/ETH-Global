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
} from "./abi";

export const CHAIN_ID = 84532; // Base Sepolia
export const CHAIN_NAME = "Base Sepolia";
export const BASESCAN_URL = "https://sepolia.basescan.org";

export const CONTRACTS = {
  CouncilToken: {
    address: "0x5fE2a5E971d9FAafF9cC0b0C9981da44fefC4381" as const,
    abi: CouncilTokenAbi,
    name: "AI Council Token",
    symbol: "AICT",
    type: "ERC20Votes",
  },
  TimelockController: {
    address: "0x76A69Bb6aeF69A2E76fA6C9632Ff6Ca101441B0f" as const,
    abi: TimelockControllerAbi,
    minDelaySeconds: 172800, // 48h - Sora trust mech #2
  },
  AICouncilGovernor: {
    address: "0x1f95C796C5dc47d08B20CF3220a2AFa995e301F0" as const,
    abi: AICouncilGovernorAbi,
    votingDelaySeconds: 12,
    votingPeriodDays: 1,
    quorumPercentage: 60,
  },
  MockUSDC: {
    address: "0x606EDE7755131e6206A29B67d88761eEbb3Bb59d" as const,
    abi: MockUSDCAbi,
    name: "Mock USDC",
    symbol: "mUSDC",
    decimals: 6,
    initialTreasuryMUSDC: "1000000", // 1M w timelock
  },
} as const;

export type ContractName = keyof typeof CONTRACTS;

export function getBasescanUrl(address: string): string {
  return `${BASESCAN_URL}/address/${address}`;
}

export function getBasescanTxUrl(txHash: string): string {
  return `${BASESCAN_URL}/tx/${txHash}`;
}
