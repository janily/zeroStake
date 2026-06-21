import { parseEther } from "ethers";
import { describe, expect, it, vi } from "vitest";
import { loadStakeData } from "@/hooks/useStakeData";

function createContract() {
  return {
    ETH_PID: vi.fn().mockResolvedValue(0n),
    paused: vi.fn().mockResolvedValue(false),
    claimPaused: vi.fn().mockResolvedValue(false),
    withdrawPaused: vi.fn().mockResolvedValue(false),
    MetaNode: vi.fn().mockResolvedValue("0x1111111111111111111111111111111111111111"),
    MetaNodePerBlock: vi.fn().mockResolvedValue(parseEther("0.01")),
    startBlock: vi.fn().mockResolvedValue(1n),
    endBlock: vi.fn().mockResolvedValue(2n),
    pool: vi.fn().mockResolvedValue({
      stTokenAddress: "0x0000000000000000000000000000000000000000",
      poolWeight: 1n,
      lastRewardBlock: 1n,
      accMetaNodePerST: 0n,
      stTokenAmount: parseEther("12.7"),
      minDepositAmount: parseEther("0.1"),
      unstakeLockedBlocks: 64n,
    }),
    stakingBalance: vi.fn().mockResolvedValue(parseEther("1")),
    pendingMetaNode: vi.fn().mockResolvedValue(parseEther("0.2")),
    withdrawAmount: vi.fn().mockResolvedValue({ requestAmount: parseEther("0.3"), pendingWithdrawAmount: parseEther("0.4") }),
  };
}

describe("loadStakeData", () => {
  it("loads public pool data without account-specific reads", async () => {
    const contract = createContract();

    const data = await loadStakeData(undefined, contract, false);

    expect(data.ethPid).toBe(0n);
    expect(data.poolInfo.minDepositAmount).toBe(parseEther("0.1"));
    expect(data.stakingBalance).toBe(0n);
    expect(data.pendingReward).toBe(0n);
    expect(contract.pool).toHaveBeenCalledWith(0n);
    expect(contract.stakingBalance).not.toHaveBeenCalled();
    expect(contract.pendingMetaNode).not.toHaveBeenCalled();
    expect(contract.withdrawAmount).not.toHaveBeenCalled();
  });

  it("loads account data only when account reads are enabled", async () => {
    const contract = createContract();

    const data = await loadStakeData("0x2222222222222222222222222222222222222222", contract, true);

    expect(data.stakingBalance).toBe(parseEther("1"));
    expect(data.pendingReward).toBe(parseEther("0.2"));
    expect(data.requestAmount).toBe(parseEther("0.3"));
    expect(data.pendingWithdrawAmount).toBe(parseEther("0.4"));
    expect(contract.stakingBalance).toHaveBeenCalledWith(0n, "0x2222222222222222222222222222222222222222");
    expect(contract.pendingMetaNode).toHaveBeenCalledWith(0n, "0x2222222222222222222222222222222222222222");
    expect(contract.withdrawAmount).toHaveBeenCalledWith(0n, "0x2222222222222222222222222222222222222222");
  });
});
