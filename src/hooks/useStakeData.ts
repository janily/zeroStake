"use client";

import { useCallback, useEffect, useState } from "react";
import { getBrowserProvider, getStakeContract } from "@/lib/ethers";
import type { Eip1193Provider } from "@janily/walletbridgekit";
import type { PoolInfo, StakeData } from "@/types/stake";

type StakeContract = ReturnType<typeof getStakeContract>;

export async function loadStakeData(account: string, contract: StakeContract): Promise<StakeData> {
  const [
    ethPid,
    paused,
    claimPaused,
    withdrawPaused,
    metaNodeAddress,
    metaNodePerBlock,
    startBlock,
    endBlock,
  ] = await Promise.all([
    contract.ETH_PID() as Promise<bigint>,
    contract.paused() as Promise<boolean>,
    contract.claimPaused() as Promise<boolean>,
    contract.withdrawPaused() as Promise<boolean>,
    contract.MetaNode() as Promise<string>,
    contract.MetaNodePerBlock() as Promise<bigint>,
    contract.startBlock() as Promise<bigint>,
    contract.endBlock() as Promise<bigint>,
  ]);

  const [poolRaw, stakingBalance, pendingReward, withdrawRaw] = await Promise.all([
    contract.pool(ethPid),
    contract.stakingBalance(ethPid, account) as Promise<bigint>,
    contract.pendingMetaNode(ethPid, account) as Promise<bigint>,
    contract.withdrawAmount(ethPid, account),
  ]);

  const poolInfo: PoolInfo = {
    stTokenAddress: poolRaw.stTokenAddress ?? poolRaw[0],
    poolWeight: poolRaw.poolWeight ?? poolRaw[1],
    lastRewardBlock: poolRaw.lastRewardBlock ?? poolRaw[2],
    accMetaNodePerST: poolRaw.accMetaNodePerST ?? poolRaw[3],
    stTokenAmount: poolRaw.stTokenAmount ?? poolRaw[4],
    minDepositAmount: poolRaw.minDepositAmount ?? poolRaw[5],
    unstakeLockedBlocks: poolRaw.unstakeLockedBlocks ?? poolRaw[6],
  };

  return {
    ethPid,
    poolInfo,
    stakingBalance,
    pendingReward,
    requestAmount: withdrawRaw.requestAmount ?? withdrawRaw[0],
    pendingWithdrawAmount: withdrawRaw.pendingWithdrawAmount ?? withdrawRaw[1],
    paused,
    claimPaused,
    withdrawPaused,
    metaNodeAddress,
    metaNodePerBlock,
    startBlock,
    endBlock,
  };
}

export function useStakeData(account?: string, enabled = false, walletProvider?: Eip1193Provider) {
  const [data, setData] = useState<StakeData>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    if (!account || !enabled) {
      setData(undefined);
      setError(undefined);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const provider = await getBrowserProvider(walletProvider);
      const contract = getStakeContract(provider);
      setData(await loadStakeData(account, contract));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load on-chain data");
    } finally {
      setLoading(false);
    }
  }, [account, enabled, walletProvider]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
