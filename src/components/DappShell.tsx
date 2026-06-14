"use client";

import { ChainSwitcher, WalletConnectButton, WalletStatus } from "@janily/walletbridgekit";
import { ArrowSquareOut, PlugsConnected, WarningCircle } from "@phosphor-icons/react";
import { ActionPanel } from "@/components/ActionPanel";
import { MetricStrip } from "@/components/MetricStrip";
import { PoolPanel } from "@/components/PoolPanel";
import { TransactionStatus } from "@/components/TransactionStatus";
import { STAKE_ADDRESS } from "@/contracts/addresses";
import { useInjectedWallet } from "@/hooks/useInjectedWallet";
import { useStakeActions } from "@/hooks/useStakeActions";
import { useStakeData } from "@/hooks/useStakeData";
import { shortAddress } from "@/lib/format";

export function DappShell() {
  const wallet = useInjectedWallet();
  const stakeData = useStakeData(wallet.account, wallet.isConnected && wallet.isCorrectNetwork);
  const actions = useStakeActions(async () => {
    await Promise.all([wallet.refresh(), stakeData.refresh()]);
  });

  return (
    <main className="min-h-[100dvh] px-4 py-5 md:px-6 md:py-7">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-5 xl:grid-cols-[minmax(320px,0.82fr)_minmax(0,1.58fr)]">
        <aside className="xl:sticky xl:top-7 xl:self-start">
          <section className="rounded-[2rem] border border-white/70 bg-white/68 p-5 shadow-diffusion backdrop-blur md:p-7">
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

            <p className="mt-7 max-w-[34ch] text-balance text-4xl font-semibold leading-[0.95] tracking-tight md:text-5xl">
              Stake Sepolia ETH, request unlocks, claim MetaNode rewards.
            </p>

            <div className="mt-7 space-y-3">
              <div className="rounded-[1.5rem] border border-ink/10 bg-paper/80 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-ink/45">WalletBridgeKit</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <WalletConnectButton />
                  <ChainSwitcher />
                </div>
                <div className="mt-3 text-sm text-ink/65">
                  <WalletStatus />
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-ink/10 bg-ink p-4 text-white">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-white/60">Detected account</span>
                  <span className="font-mono">{shortAddress(wallet.account)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                  <span className="text-white/60">Network</span>
                  <span className={wallet.isCorrectNetwork ? "text-white" : "text-rose-200"}>
                    {wallet.chainId ? (wallet.isCorrectNetwork ? "Sepolia" : `Chain ${wallet.chainId}`) : "-"}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  <button
                    className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={wallet.loading}
                    onClick={() => void wallet.connect()}
                    type="button"
                  >
                    {wallet.isConnected ? "Refresh wallet" : "Connect wallet"}
                  </button>
                  {wallet.isConnected && !wallet.isCorrectNetwork ? (
                    <button
                      className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
                      onClick={() => void wallet.switchToSepolia()}
                      type="button"
                    >
                      Switch to Sepolia
                    </button>
                  ) : null}
                </div>
              </div>

              {wallet.error ? (
                <div className="flex gap-3 rounded-[1.5rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  <WarningCircle size={20} weight="duotone" />
                  <span>{wallet.error}</span>
                </div>
              ) : null}
            </div>
          </section>
        </aside>

        <div className="space-y-5">
          <section className="rounded-[2rem] border border-ink/10 bg-white/62 p-5 shadow-diffusion backdrop-blur md:p-7">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
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

          <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[0.9fr_1.1fr]">
            <PoolPanel data={stakeData.data} loading={stakeData.loading} />
            <div className="space-y-5">
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
