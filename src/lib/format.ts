import { formatEther } from "ethers";

export function shortAddress(value?: string, head = 6, tail = 4) {
  if (!value) return "Not connected";
  if (value.length <= head + tail) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

export function shortHash(value?: string) {
  return shortAddress(value, 10, 8);
}

export function formatTokenAmount(value?: bigint, fractionDigits = 4) {
  if (value === undefined) return "0";
  const [whole, fraction = ""] = formatEther(value).split(".");
  const trimmed = fraction.slice(0, fractionDigits).replace(/0+$/, "");
  return trimmed ? `${whole}.${trimmed}` : whole;
}

export function hasPositiveValue(value?: bigint) {
  return Boolean(value && value > 0n);
}
