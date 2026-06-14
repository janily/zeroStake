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
  maxMessage = "钱包余额不足",
  minMessage = "质押数量低于池子最小要求",
}: AmountValidationInput): AmountValidationResult {
  const normalized = amount.trim();
  if (!normalized) return { ok: false, error: "请输入数量" };
  if (!/^\d+(\.\d+)?$/.test(normalized)) return { ok: false, error: "请输入合法数字" };

  try {
    const value = parseEther(normalized);
    if (value <= 0n) return { ok: false, error: "数量必须大于 0" };
    if (max !== undefined && value > max) return { ok: false, error: maxMessage };
    if (min !== undefined && value < min) return { ok: false, error: minMessage };
    return { ok: true, value };
  } catch {
    return { ok: false, error: "请输入合法数字" };
  }
}

export function maxStakeAmount(balance?: bigint) {
  if (!balance || balance <= GAS_RESERVE) return 0n;
  return balance - GAS_RESERVE;
}
