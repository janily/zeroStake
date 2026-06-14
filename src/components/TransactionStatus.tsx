import { ArrowSquareOut, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { SEPOLIA_EXPLORER_TX } from "@/lib/chain";
import { shortHash } from "@/lib/format";
import type { TxState } from "@/types/stake";

export function TransactionStatus({ tx }: { tx: TxState }) {
  const active = tx.status !== "idle";
  const isError = tx.status === "failed";
  const isSuccess = tx.status === "success";

  return (
    <div
      className={`rounded-[1.5rem] border p-4 ${
        active ? "border-ink/10 bg-ink text-white" : "border-ink/10 bg-white/60 text-ink/60"
      }`}
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isError ? <WarningCircle size={22} weight="duotone" /> : <CheckCircle size={22} weight="duotone" />}
          <div>
            <p className="text-sm font-medium">{tx.label}</p>
            {tx.error ? <p className="mt-1 text-xs text-white/72">{tx.error}</p> : null}
          </div>
        </div>
        {active && !isError ? <span className="h-1.5 w-12 rounded-full bg-moss/80 [animation:status-pulse_1.4s_infinite]" /> : null}
      </div>
      {tx.hash ? (
        <a
          className={`mt-3 inline-flex items-center gap-2 text-xs ${isSuccess ? "text-white" : "text-white/75"}`}
          href={`${SEPOLIA_EXPLORER_TX}${tx.hash}`}
          rel="noreferrer"
          target="_blank"
        >
          {shortHash(tx.hash)}
          <ArrowSquareOut size={14} />
        </a>
      ) : null}
    </div>
  );
}
