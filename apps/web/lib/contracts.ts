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
    address: "0x5fe2a5e971d9faaff9cc0b0c9981da44fefc4381" as const,
    abi: CouncilTokenAbi,
    name: "AI Council Token",
    symbol: "AICT",
    type: "ERC20Votes",
  },
  TimelockController: {
    address: "0x76a69bb6aef69a2e76fa6c9632ff6ca101441b0f" as const,
    abi: TimelockControllerAbi,
    minDelaySeconds: 172800, // 48h - Sora trust mech #2
  },
  AICouncilGovernor: {
    address: "0x1f95c796c5dc47d08b20cf3220a2afa995e301f0" as const,
    abi: AICouncilGovernorAbi,
    votingDelaySeconds: 12,
    votingPeriodDays: 1,
    quorumPercentage: 60,
  },
  MockUSDC: {
    address: "0x606ede7755131e6206a29b67d88761eebb3bb59d" as const,
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
