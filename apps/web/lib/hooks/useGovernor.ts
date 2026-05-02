"use client";

import { useReadContract, useWriteContract, useSimulateContract } from "wagmi";
import { CONTRACTS } from "../contracts";
import type { ProposalState } from "../types";

const PROPOSAL_STATE_MAP: Record<number, ProposalState> = {
  0: "pending",
  1: "active",
  2: "canceled",
  3: "defeated",
  4: "succeeded",
  5: "queued",
  6: "expired",
  7: "executed",
};

export function useProposalState(proposalId: bigint | undefined) {
  const result = useReadContract({
    address: CONTRACTS.AICouncilGovernor.address,
    abi: CONTRACTS.AICouncilGovernor.abi,
    functionName: "state",
    args: proposalId ? [proposalId] : undefined,
    query: { enabled: proposalId !== undefined },
  });

  const stateNum = typeof result.data === "number" ? result.data : undefined;
  const state = stateNum !== undefined ? PROPOSAL_STATE_MAP[stateNum] : undefined;

  return { ...result, state };
}

export function useProposalVotes(proposalId: bigint | undefined) {
  return useReadContract({
    address: CONTRACTS.AICouncilGovernor.address,
    abi: CONTRACTS.AICouncilGovernor.abi,
    functionName: "proposalVotes",
    args: proposalId ? [proposalId] : undefined,
    query: { enabled: proposalId !== undefined },
  });
}

export function useCastVote() {
  return useWriteContract();
}

export function useQueueProposal() {
  return useWriteContract();
}

export function useExecuteProposal() {
  return useWriteContract();
}

export function useTreasuryBalance() {
  return useReadContract({
    address: CONTRACTS.MockUSDC.address,
    abi: CONTRACTS.MockUSDC.abi,
    functionName: "balanceOf",
    args: [CONTRACTS.TimelockController.address],
  });
}

export function useTokenBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACTS.CouncilToken.address,
    abi: CONTRACTS.CouncilToken.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: address !== undefined },
  });
}

export function useSimulatePropose(
  targets: `0x${string}`[],
  values: bigint[],
  calldatas: `0x${string}`[],
  description: string
) {
  return useSimulateContract({
    address: CONTRACTS.AICouncilGovernor.address,
    abi: CONTRACTS.AICouncilGovernor.abi,
    functionName: "propose",
    args: [targets, values, calldatas, description],
    query: { enabled: targets.length > 0 },
  });
}
