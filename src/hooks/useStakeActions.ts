"use client";

import { useCallback, useMemo, useState } from "react";
import { parseEther } from "ethers";
import { getSigner, getStakeContract } from "@/lib/ethers";
import { toReadableError } from "@/lib/errors";
import type { TxState } from "@/types/stake";

export interface StakeActionContract {
  ETH_PID(): Promise<bigint>;
  depositETH(overrides: { value: bigint }): Promise<{ hash?: string; wait(): Promise<unknown> }>;
  unstake(pid: bigint, amount: bigint): Promise<{ hash?: string; wait(): Promise<unknown> }>;
  withdraw(pid: bigint): Promise<{ hash?: string; wait(): Promise<unknown> }>;
  claim(pid: bigint): Promise<{ hash?: string; wait(): Promise<unknown> }>;
}

export async function runStakeETH(contract: StakeActionContract, amount: string) {
  return contract.depositETH({ value: parseEther(amount) });
}

export async function runRequestWithdraw(contract: StakeActionContract, amount: string) {
  const ethPid = await contract.ETH_PID();
  return contract.unstake(ethPid, parseEther(amount));
}

export async function runWithdrawUnlockedETH(contract: StakeActionContract) {
  const ethPid = await contract.ETH_PID();
  return contract.withdraw(ethPid);
}

export async function runClaimReward(contract: StakeActionContract) {
  const ethPid = await contract.ETH_PID();
  return contract.claim(ethPid);
}

const labels = {
  idle: "Ready for action",
  validating: "Validating input",
  waiting_wallet: "Confirm the transaction in your wallet",
  submitted: "Transaction submitted",
  confirming: "Waiting for block confirmation",
  success: "Transaction successful",
  failed: "Transaction failed",
};

export function useStakeActions(onSuccess?: () => Promise<void> | void) {
  const [tx, setTx] = useState<TxState>({ status: "idle", label: labels.idle });

  const execute = useCallback(
    async (runner: (contract: StakeActionContract) => Promise<{ hash?: string; wait(): Promise<unknown> }>) => {
      setTx({ status: "validating", label: labels.validating });
      try {
        const signer = await getSigner();
        const contract = getStakeContract(signer) as unknown as StakeActionContract;
        setTx({ status: "waiting_wallet", label: labels.waiting_wallet });
        const transaction = await runner(contract);
        setTx({ status: "submitted", label: labels.submitted, hash: transaction.hash });
        setTx({ status: "confirming", label: labels.confirming, hash: transaction.hash });
        await transaction.wait();
        await onSuccess?.();
        setTx({ status: "success", label: labels.success, hash: transaction.hash });
      } catch (error) {
        setTx({ status: "failed", label: labels.failed, error: toReadableError(error) });
        throw error;
      }
    },
    [onSuccess],
  );

  return useMemo(
    () => ({
      tx,
      resetTx: () => setTx({ status: "idle", label: labels.idle }),
      stakeETH: (amount: string) => execute((contract) => runStakeETH(contract, amount)),
      requestWithdraw: (amount: string) => execute((contract) => runRequestWithdraw(contract, amount)),
      withdrawUnlockedETH: () => execute(runWithdrawUnlockedETH),
      claimReward: () => execute(runClaimReward),
    }),
    [execute, tx],
  );
}
