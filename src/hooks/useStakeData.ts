"use client";

import { useCallback, useEffect, useState } from "react";
import { getPublicProvider, getStakeContract } from "@/lib/ethers";
import type { PoolInfo, StakeData } from "@/types/stake";

type PoolRaw = {
  stTokenAddress?: string;
  poolWeight?: bigint;
  lastRewardBlock?: bigint;
  accMetaNodePerST?: bigint;
  stTokenAmount?: bigint;
  minDepositAmount?: bigint;
  unstakeLockedBlocks?: bigint;
} & [string, bigint, bigint, bigint, bigint, bigint, bigint];

type WithdrawRaw = {
  requestAmount?: bigint;
  pendingWithdrawAmount?: bigint;
  [index: number]: bigint;
};

export type StakeDataContract = {
  ETH_PID: () => Promise<bigint>;
  paused: () => Promise<boolean>;
  claimPaused: () => Promise<boolean>;
  withdrawPaused: () => Promise<boolean>;
  MetaNode: () => Promise<string>;
  MetaNodePerBlock: () => Promise<bigint>;
  startBlock: () => Promise<bigint>;
  endBlock: () => Promise<bigint>;
  pool: (ethPid: bigint) => Promise<PoolRaw>;
  stakingBalance: (ethPid: bigint, account: string) => Promise<bigint>;
  pendingMetaNode: (ethPid: bigint, account: string) => Promise<bigint>;
  withdrawAmount: (ethPid: bigint, account: string) => Promise<WithdrawRaw>;
};

type PublicStakeData = Omit<StakeData, "stakingBalance" | "pendingReward" | "requestAmount" | "pendingWithdrawAmount">;
type AccountStakeData = Pick<StakeData, "stakingBalance" | "pendingReward" | "requestAmount" | "pendingWithdrawAmount">;

const emptyAccountStakeData: AccountStakeData = {
  stakingBalance: 0n,
  pendingReward: 0n,
  requestAmount: 0n,
  pendingWithdrawAmount: 0n,
};

function normalizePoolInfo(poolRaw: Awaited<ReturnType<StakeDataContract["pool"]>>): PoolInfo {
  return {
    stTokenAddress: poolRaw.stTokenAddress ?? poolRaw[0],
    poolWeight: poolRaw.poolWeight ?? poolRaw[1],
    lastRewardBlock: poolRaw.lastRewardBlock ?? poolRaw[2],
    accMetaNodePerST: poolRaw.accMetaNodePerST ?? poolRaw[3],
    stTokenAmount: poolRaw.stTokenAmount ?? poolRaw[4],
    minDepositAmount: poolRaw.minDepositAmount ?? poolRaw[5],
    unstakeLockedBlocks: poolRaw.unstakeLockedBlocks ?? poolRaw[6],
  };
}

function normalizeWithdrawAmount(withdrawRaw: Awaited<ReturnType<StakeDataContract["withdrawAmount"]>>): Pick<AccountStakeData, "requestAmount" | "pendingWithdrawAmount"> {
  return {
    requestAmount: withdrawRaw.requestAmount ?? withdrawRaw[0],
    pendingWithdrawAmount: withdrawRaw.pendingWithdrawAmount ?? withdrawRaw[1],
  };
}

export async function loadPublicStakeData(contract: StakeDataContract): Promise<PublicStakeData> {
  const [ethPid, paused, claimPaused, withdrawPaused, metaNodeAddress, metaNodePerBlock, startBlock, endBlock] = await Promise.all([
    contract.ETH_PID() as Promise<bigint>,
    contract.paused() as Promise<boolean>,
    contract.claimPaused() as Promise<boolean>,
    contract.withdrawPaused() as Promise<boolean>,
    contract.MetaNode() as Promise<string>,
    contract.MetaNodePerBlock() as Promise<bigint>,
    contract.startBlock() as Promise<bigint>,
    contract.endBlock() as Promise<bigint>,
  ]);

  const poolRaw = await contract.pool(ethPid);

  return {
    ethPid,
    poolInfo: normalizePoolInfo(poolRaw),
    paused,
    claimPaused,
    withdrawPaused,
    metaNodeAddress,
    metaNodePerBlock,
    startBlock,
    endBlock,
  };
}

export async function loadAccountStakeData(account: string, ethPid: bigint, contract: StakeDataContract): Promise<AccountStakeData> {
  const [stakingBalance, pendingReward, withdrawRaw] = await Promise.all([
    contract.stakingBalance(ethPid, account) as Promise<bigint>,
    contract.pendingMetaNode(ethPid, account) as Promise<bigint>,
    contract.withdrawAmount(ethPid, account),
  ]);

  return {
    stakingBalance,
    pendingReward,
    ...normalizeWithdrawAmount(withdrawRaw),
  };
}

export async function loadStakeData(account: string | undefined, contract: StakeDataContract, loadAccount = Boolean(account)): Promise<StakeData> {
  const publicData = await loadPublicStakeData(contract);
  const accountData = account && loadAccount ? await loadAccountStakeData(account, publicData.ethPid, contract) : emptyAccountStakeData;

  return {
    ...publicData,
    ...accountData,
  };
}

export function useStakeData(account?: string, loadAccount = false) {
  const [data, setData] = useState<StakeData>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const provider = getPublicProvider();
      const contract = getStakeContract(provider) as unknown as StakeDataContract;
      setData(await loadStakeData(account, contract, loadAccount));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load on-chain data");
    } finally {
      setLoading(false);
    }
  }, [account, loadAccount]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
