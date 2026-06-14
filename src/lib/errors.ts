export function toReadableError(error: unknown) {
  const raw = extractErrorText(error);
  if (/user rejected|rejected|denied|4001/i.test(raw)) return "你取消了交易确认";
  if (/EnforcedPause/i.test(raw)) return "当前合约已暂停";
  if (/AccessControlUnauthorizedAccount/i.test(raw)) return "当前账户没有权限";
  if (/SafeERC20FailedOperation/i.test(raw)) return "ERC20 操作失败";
  if (/FailedCall/i.test(raw)) return "合约调用失败";
  if (/estimateGas|UNPREDICTABLE_GAS_LIMIT|missing revert data/i.test(raw)) {
    return "当前交易可能无法执行，请检查输入或合约状态";
  }
  if (/Wallet not found/i.test(raw)) return "请先安装 MetaMask 钱包";
  return raw || "交易失败，请稍后重试";
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
