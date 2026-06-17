export function toReadableError(error: unknown) {
  const raw = extractErrorText(error);
  if (/user rejected|rejected|denied|4001/i.test(raw)) return "You rejected the wallet confirmation";
  if (/EnforcedPause/i.test(raw)) return "The contract is currently paused";
  if (/AccessControlUnauthorizedAccount/i.test(raw)) return "The current account is not authorized";
  if (/SafeERC20FailedOperation/i.test(raw)) return "ERC20 operation failed";
  if (/FailedCall/i.test(raw)) return "Contract call failed";
  if (/estimateGas|UNPREDICTABLE_GAS_LIMIT|missing revert data/i.test(raw)) {
    return "This transaction may not execute. Check your input or contract status";
  }
  if (/Wallet not found/i.test(raw)) return "Install MetaMask first";
  return raw || "Transaction failed. Please try again later";
}

function extractErrorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    return String(record.shortMessage || record.reason || record.message || record.code || "");
  }
  return "";
}
