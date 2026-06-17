"use client";

import { ArrowSquareOut, PlugsConnected, WarningCircle } from "@phosphor-icons/react";
import { WalletConnectButton } from "@janily/walletbridgekit";
import { ActionPanel } from "@/components/ActionPanel";
import { MetricStrip } from "@/components/MetricStrip";
import { PoolPanel } from "@/components/PoolPanel";
import { TransactionStatus } from "@/components/TransactionStatus";
import { STAKE_ADDRESS } from "@/contracts/addresses";
import { useInjectedWallet } from "@/hooks/useInjectedWallet";
import { useStakeActions } from "@/hooks/useStakeActions";
import { useStakeData } from "@/hooks/useStakeData";
import { SEPOLIA_CHAIN_ID } from "@/lib/chain";
import { shortAddress } from "@/lib/format";

export function DappShell() {
  const wallet = useInjectedWallet();
  const stakeData = useStakeData(wallet.account, wallet.isConnected && wallet.isCorrectNetwork, wallet.provider);
  const actions = useStakeActions(async () => {
    await Promise.all([wallet.refresh(), stakeData.refresh()]);
  }, wallet.provider);

  return (
    <main className="min-h-[100dvh] px-4 py-4 md:px-5 md:py-5">
      <div className="mx-auto grid max-w-[1520px] grid-cols-1 gap-4 xl:grid-cols-[minmax(300px,0.72fr)_minmax(0,1.85fr)]">
        <aside className="xl:sticky xl:top-5 xl:self-start">
          <section className="rounded-[2rem] border border-white/70 bg-white/68 p-5 shadow-diffusion backdrop-blur md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-white">
                  <PlugsConnected size={23} weight="duotone" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-moss">MetaNode</p>
                  <h1 className="text-2xl font-semibold tracking-tight">Stake</h1>
                </div>
              </div>
              <a
                aria-label="Open stake contract on Etherscan"
                className="rounded-full border border-ink/10 p-2 text-ink/65 hover:text-moss"
                href={`https://sepolia.etherscan.io/address/${STAKE_ADDRESS}`}
                rel="noreferrer"
                target="_blank"
              >
                <ArrowSquareOut size={18} />
              </a>
            </div>

            <p className="mt-6 max-w-[30ch] text-balance text-4xl font-semibold leading-[1.02] tracking-tight md:text-[2.7rem]">
              Stake Sepolia ETH, request unlocks, claim MetaNode rewards.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-[1.5rem] border border-ink/10 bg-ink p-4 text-white">
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">WalletBridgeKit</p>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                  <span className="text-white/60">Detected account</span>
                  <span className="font-mono">{shortAddress(wallet.account)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                  <span className="text-white/60">Network</span>
                  <span className={wallet.isCorrectNetwork ? "text-white" : "text-rose-200"}>
                    {wallet.chainId ? (wallet.isCorrectNetwork ? "Sepolia" : `Chain ${wallet.chainId}`) : "-"}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                  <span className="text-white/60">Status</span>
                  <span className="capitalize">{wallet.status}</span>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] [&_button]:w-full [&_button]:rounded-xl [&_button]:border [&_button]:border-transparent [&_button]:bg-transparent [&_button]:px-4 [&_button]:py-3 [&_button]:text-sm [&_button]:font-semibold [&_button]:text-white/90 [&_button]:transition [&_button:hover]:border-white/10 [&_button:hover]:bg-white/10 [&_button:hover]:text-white [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-50 [&_button+button]:mt-1 [&_button+button]:border-white/10 [&_button+button]:bg-white/[0.06] [&_button+button]:text-white/75 [&_button+button:hover]:bg-white/12 [&_button+button:hover]:text-white">
                    <WalletConnectButton connectedLabel={(address) => shortAddress(address)} label="Connect wallet" />
                  </div>
                  {wallet.isConnected && !wallet.isCorrectNetwork ? (
                    <button
                      className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={wallet.loading}
                      onClick={() => void wallet.switchToSepolia()}
                      type="button"
                    >
                      Switch to Sepolia
                    </button>
                  ) : null}
                  {wallet.isConnected ? (
                    <button
                      className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={wallet.loading}
                      onClick={() => void wallet.refresh()}
                      type="button"
                    >
                      Refresh wallet
                    </button>
                  ) : null}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-white/50">
                  Network switching is available after a wallet is connected. This prevents WalletBridgeKit from calling a provider before one exists.
                </p>
              </div>

              {wallet.isConnected && !wallet.isCorrectNetwork ? (
                <div className="flex gap-3 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <WarningCircle size={20} weight="duotone" />
                  <span>Please switch to Sepolia to use the staking pool. Expected chain ID: {SEPOLIA_CHAIN_ID.toString()}.</span>
                </div>
              ) : null}

              {wallet.error ? (
                <div className="flex gap-3 rounded-[1.5rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  <WarningCircle size={20} weight="duotone" />
                  <span>{wallet.error}</span>
                </div>
              ) : null}
            </div>
          </section>
        </aside>

        <div className="space-y-4">
          <section className="rounded-[2rem] border border-ink/10 bg-white/62 p-5 shadow-diffusion backdrop-blur md:p-6">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-moss">Position</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Your staking account</h2>
              </div>
              {stakeData.error ? <p className="text-sm text-rose-700">{stakeData.error}</p> : null}
            </div>
            <MetricStrip
              balance={wallet.balance}
              loading={wallet.loading || stakeData.loading}
              pendingReward={stakeData.data?.pendingReward}
              pendingWithdrawAmount={stakeData.data?.pendingWithdrawAmount}
              requestAmount={stakeData.data?.requestAmount}
              stakingBalance={stakeData.data?.stakingBalance}
            />
          </section>

          <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[0.82fr_1.18fr]">
            <PoolPanel data={stakeData.data} loading={stakeData.loading} />
            <div className="space-y-4">
              <ActionPanel
                balance={wallet.balance}
                connected={wallet.isConnected}
                correctNetwork={wallet.isCorrectNetwork}
                data={stakeData.data}
                onClaim={actions.claimReward}
                onRefresh={async () => {
                  await Promise.all([wallet.refresh(), stakeData.refresh()]);
                }}
                onRequestWithdraw={actions.requestWithdraw}
                onStake={actions.stakeETH}
                onWithdraw={actions.withdrawUnlockedETH}
                txStatus={actions.tx.status}
              />
              <TransactionStatus tx={actions.tx} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
