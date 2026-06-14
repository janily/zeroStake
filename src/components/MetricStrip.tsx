import { Coins, HandWithdraw, TrendUp, Vault } from "@phosphor-icons/react";
import { formatTokenAmount } from "@/lib/format";

interface MetricStripProps {
  balance?: bigint;
  stakingBalance?: bigint;
  pendingReward?: bigint;
  requestAmount?: bigint;
  pendingWithdrawAmount?: bigint;
  loading?: boolean;
}

const iconMap = [Vault, TrendUp, Coins, HandWithdraw, HandWithdraw];

export function MetricStrip({
  balance,
  stakingBalance,
  pendingReward,
  requestAmount,
  pendingWithdrawAmount,
  loading,
}: MetricStripProps) {
  const metrics = [
    { label: "Wallet ETH", value: formatTokenAmount(balance, 5), unit: "ETH" },
    { label: "Staked ETH", value: formatTokenAmount(stakingBalance, 5), unit: "ETH" },
    { label: "Claimable", value: formatTokenAmount(pendingReward, 5), unit: "META" },
    { label: "Requested", value: formatTokenAmount(requestAmount, 5), unit: "ETH" },
    { label: "Unlocked", value: formatTokenAmount(pendingWithdrawAmount, 5), unit: "ETH" },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {metrics.map((metric, index) => {
        const Icon = iconMap[index];
        return (
          <div key={metric.label} className="border-t border-ink/15 pt-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink/50">
              <Icon size={16} weight="duotone" />
              {metric.label}
            </div>
            {loading ? (
              <div className="skeleton mt-4 h-8 w-28 rounded" />
            ) : (
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-mono text-2xl font-semibold tracking-tight">{metric.value}</span>
                <span className="text-xs font-medium text-ink/45">{metric.unit}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
