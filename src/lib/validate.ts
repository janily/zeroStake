import { parseEther } from "ethers";

export interface AmountValidationInput {
  amount: string;
  max?: bigint;
  min?: bigint;
  maxMessage?: string;
  minMessage?: string;
}

export interface AmountValidationResult {
  ok: boolean;
  value?: bigint;
  error?: string;
}

export const GAS_RESERVE = parseEther("0.005");

export function validateEthAmount({
  amount,
  max,
  min,
  maxMessage = "Insufficient wallet balance",
  minMessage = "Amount is below the pool minimum",
}: AmountValidationInput): AmountValidationResult {
  const normalized = amount.trim();
  if (!normalized) return { ok: false, error: "Enter an amount" };
  if (!/^\d+(\.\d+)?$/.test(normalized)) return { ok: false, error: "Enter a valid number" };

  try {
    const value = parseEther(normalized);
    if (value <= 0n) return { ok: false, error: "Amount must be greater than 0" };
    if (max !== undefined && value > max) return { ok: false, error: maxMessage };
    if (min !== undefined && value < min) return { ok: false, error: minMessage };
    return { ok: true, value };
  } catch {
    return { ok: false, error: "Enter a valid number" };
  }
}

export function maxStakeAmount(balance?: bigint) {
  if (!balance || balance <= GAS_RESERVE) return 0n;
  return balance - GAS_RESERVE;
}
