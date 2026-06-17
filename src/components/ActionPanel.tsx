"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowClockwise, HandCoins, HandWithdraw, Percent, Vault } from "@phosphor-icons/react";
import { formatEther } from "ethers";
import { formatTokenAmount, hasPositiveValue } from "@/lib/format";
import { maxStakeAmount, validateEthAmount } from "@/lib/validate";
import type { StakeData, TxStatus } from "@/types/stake";

interface ActionPanelProps {
  data?: StakeData;
  balance?: bigint;
  connected: boolean;
  correctNetwork: boolean;
  txStatus: TxStatus;
  onStake(amount: string): Promise<void>;
  onRequestWithdraw(amount: string): Promise<void>;
  onWithdraw(): Promise<void>;
  onClaim(): Promise<void>;
  onRefresh(): Promise<void> | void;
}

export function ActionPanel({
  data,
  balance,
  connected,
  correctNetwork,
  txStatus,
  onStake,
  onRequestWithdraw,
  onWithdraw,
  onClaim,
  onRefresh,
}: ActionPanelProps) {
  const [stakeAmount, setStakeAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [localError, setLocalError] = useState<string>();
  const busy = ["validating", "waiting_wallet", "submitted", "confirming"].includes(txStatus);

  const stakeValidation = useMemo(
    () =>
      validateEthAmount({
        amount: stakeAmount,
        max: maxStakeAmount(balance),
        min: data?.poolInfo.minDepositAmount,
      }),
    [balance, data?.poolInfo.minDepositAmount, stakeAmount],
  );

  const withdrawValidation = useMemo(
    () =>
      validateEthAmount({
        amount: withdrawAmount,
        max: data?.stakingBalance,
        maxMessage: "Withdraw amount cannot exceed your staked balance",
        minMessage: "Amount must be greater than 0",
      }),
    [data?.stakingBalance, withdrawAmount],
  );

  const baseDisabled = !connected || !correctNetwork || busy;
  const stakeDisabled = baseDisabled || !stakeAmount || !stakeValidation.ok || Boolean(data?.paused);
  const requestDisabled = baseDisabled || !withdrawAmount || !withdrawValidation.ok || Boolean(data?.withdrawPaused);
  const withdrawDisabled =
    baseDisabled || !hasPositiveValue(data?.pendingWithdrawAmount) || Boolean(data?.withdrawPaused);
  const claimDisabled = baseDisabled || !hasPositiveValue(data?.pendingReward) || Boolean(data?.claimPaused);

  const run = async (action: () => Promise<void>, clear?: () => void) => {
    setLocalError(undefined);
    try {
      await action();
      clear?.();
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Action failed");
    }
  };

  return (
    <section className="rounded-[2rem] border border-ink/10 bg-white/78 p-5 shadow-diffusion backdrop-blur md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-moss">Actions</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Manage position</h2>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/10 bg-paper px-4 py-2 text-sm font-medium text-ink hover:border-moss/35 disabled:cursor-not-allowed disabled:opacity-45"
          disabled={busy}
          onClick={() => void onRefresh()}
          type="button"
        >
          <ArrowClockwise size={16} />
          Refresh
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ActionBlock
          description="Stake Sepolia ETH to earn MetaNode rewards."
          disabled={stakeDisabled}
          error={stakeAmount && !stakeValidation.ok ? stakeValidation.error : undefined}
          icon={<Vault size={20} weight="duotone" />}
          input={stakeAmount}
          label="ETH amount"
          maxLabel="Max"
          onInput={setStakeAmount}
          onMax={() => setStakeAmount(formatEther(maxStakeAmount(balance)))}
          onSubmit={() => run(() => onStake(stakeAmount), () => setStakeAmount(""))}
          title="Stake ETH"
          buttonText={busy ? "Processing" : "Stake"}
        />

        <ActionBlock
          description="Submit an unlock request first, then withdraw after the lock period ends."
          disabled={requestDisabled}
          error={withdrawAmount && !withdrawValidation.ok ? withdrawValidation.error : undefined}
          icon={<HandWithdraw size={20} weight="duotone" />}
          input={withdrawAmount}
          label="Withdraw request"
          maxLabel="Staked"
          onInput={setWithdrawAmount}
          onMax={() => setWithdrawAmount(formatEther(data?.stakingBalance ?? 0n))}
          onSubmit={() => run(() => onRequestWithdraw(withdrawAmount), () => setWithdrawAmount(""))}
          title="Request Withdraw"
          buttonText={busy ? "Processing" : "Request"}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <QuickAction
          amount={`${formatTokenAmount(data?.pendingWithdrawAmount, 5)} ETH`}
          disabled={withdrawDisabled}
          icon={<HandWithdraw size={20} weight="duotone" />}
          label="Withdraw Unlocked ETH"
          onClick={() => run(onWithdraw)}
        />
        <QuickAction
          amount={`${formatTokenAmount(data?.pendingReward, 5)} META`}
          disabled={claimDisabled}
          icon={<HandCoins size={20} weight="duotone" />}
          label="Claim Rewards"
          onClick={() => run(onClaim)}
        />
      </div>

      {localError ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{localError}</p> : null}
      {!connected ? <p className="mt-4 text-sm text-ink/55">Connect a wallet to load your staking position.</p> : null}
      {connected && !correctNetwork ? <p className="mt-4 text-sm text-rose-700">Switch to the Sepolia test network.</p> : null}
    </section>
  );
}

function ActionBlock({
  title,
  description,
  icon,
  label,
  input,
  onInput,
  onSubmit,
  onMax,
  maxLabel,
  disabled,
  error,
  buttonText,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  label: string;
  input: string;
  onInput(value: string): void;
  onSubmit(): void;
  onMax(): void;
  maxLabel: string;
  disabled: boolean;
  error?: string;
  buttonText: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-ink/10 bg-paper/80 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-moss">{icon}</div>
        <div>
          <h3 className="font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 text-sm leading-5 text-ink/55">{description}</p>
        </div>
      </div>
      <label className="mt-4 block text-sm font-medium text-ink/70" htmlFor={title}>
        {label}
      </label>
      <div className="mt-2 grid grid-cols-[1fr_auto] rounded-2xl border border-ink/10 bg-white focus-within:border-moss/50">
        <input
          className="min-w-0 bg-transparent px-4 py-3 font-mono outline-none"
          id={title}
          inputMode="decimal"
          onChange={(event) => onInput(event.target.value)}
          placeholder="0.00"
          value={input}
        />
        <button className="px-4 text-sm font-medium text-moss" onClick={onMax} type="button">
          {maxLabel}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : <p className="mt-2 text-xs text-ink/45">Amount uses ETH decimals.</p>}
      <button
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-moss disabled:cursor-not-allowed disabled:bg-ink/20"
        disabled={disabled}
        onClick={onSubmit}
        type="button"
      >
        <Percent size={16} />
        {buttonText}
      </button>
    </div>
  );
}

function QuickAction({
  label,
  amount,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  amount: string;
  icon: ReactNode;
  disabled: boolean;
  onClick(): void;
}) {
  return (
    <button
      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[1.5rem] border border-ink/10 bg-paper/80 p-4 text-left hover:border-moss/40 disabled:cursor-not-allowed disabled:opacity-45"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-moss">{icon}</span>
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-1 block font-mono text-xs text-ink/50">{amount}</span>
      </span>
      <span className="h-2 w-8 rounded-full bg-moss/65" />
    </button>
  );
}
