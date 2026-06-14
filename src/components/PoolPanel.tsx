import { ClockCounterClockwise, Pulse, ShieldCheck } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { formatTokenAmount, shortAddress } from "@/lib/format";
import type { StakeData } from "@/types/stake";

export function PoolPanel({ data, loading }: { data?: StakeData; loading?: boolean }) {
  const rows = [
    ["Pool ID", data?.ethPid.toString() ?? "-"],
    ["Asset", "Sepolia ETH"],
    ["Pool Total", `${formatTokenAmount(data?.poolInfo.stTokenAmount, 5)} ETH`],
    ["Min Deposit", `${formatTokenAmount(data?.poolInfo.minDepositAmount, 5)} ETH`],
    ["Unlock Blocks", data?.poolInfo.unstakeLockedBlocks.toString() ?? "-"],
    ["Reward / Block", `${formatTokenAmount(data?.metaNodePerBlock, 5)} META`],
    ["Start Block", data?.startBlock.toString() ?? "-"],
    ["End Block", data?.endBlock.toString() ?? "-"],
    ["Reward Token", shortAddress(data?.metaNodeAddress)],
  ];

  return (
    <section className="rounded-[2rem] border border-ink/10 bg-white/72 p-5 shadow-diffusion backdrop-blur md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-moss">Pool</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">ETH staking pool</h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-paper">
          <Pulse size={22} weight="duotone" />
        </div>
      </div>

      <div className="mt-6 divide-y divide-ink/10">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[1fr_auto] items-center gap-4 py-3 text-sm">
            <span className="text-ink/55">{label}</span>
            {loading ? <span className="skeleton h-5 w-24 rounded" /> : <span className="font-mono text-ink">{value}</span>}
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatusPill active={Boolean(data?.paused)} icon={<ShieldCheck size={16} />} label="Contract paused" />
        <StatusPill active={Boolean(data?.withdrawPaused)} icon={<ClockCounterClockwise size={16} />} label="Withdraw paused" />
      </div>
    </section>
  );
}

function StatusPill({ active, label, icon }: { active: boolean; label: string; icon: ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-full border border-ink/10 bg-paper px-4 py-2 text-sm">
      <span className="flex items-center gap-2 text-ink/65">
        {icon}
        {label}
      </span>
      <span className={`h-2 w-8 rounded-full ${active ? "bg-rose-500" : "bg-moss/65"}`} />
    </div>
  );
}
