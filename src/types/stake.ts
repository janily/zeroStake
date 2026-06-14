export interface PoolInfo {
  stTokenAddress: string;
  poolWeight: bigint;
  lastRewardBlock: bigint;
  accMetaNodePerST: bigint;
  stTokenAmount: bigint;
  minDepositAmount: bigint;
  unstakeLockedBlocks: bigint;
}

export interface StakeData {
  ethPid: bigint;
  poolInfo: PoolInfo;
  stakingBalance: bigint;
  pendingReward: bigint;
  requestAmount: bigint;
  pendingWithdrawAmount: bigint;
  paused: boolean;
  claimPaused: boolean;
  withdrawPaused: boolean;
  metaNodeAddress: string;
  metaNodePerBlock: bigint;
  startBlock: bigint;
  endBlock: bigint;
}

export type TxStatus =
  | "idle"
  | "validating"
  | "waiting_wallet"
  | "submitted"
  | "confirming"
  | "success"
  | "failed";

export interface TxState {
  status: TxStatus;
  label: string;
  hash?: string;
  error?: string;
}
