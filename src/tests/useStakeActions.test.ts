import { parseEther } from "ethers";
import { describe, expect, it, vi } from "vitest";
import {
  runClaimReward,
  runRequestWithdraw,
  runStakeETH,
  runWithdrawUnlockedETH,
  type StakeActionContract,
} from "@/hooks/useStakeActions";

function createContract() {
  const wait = vi.fn().mockResolvedValue({});
  const tx = { hash: "0xabc", wait };
  const contract: StakeActionContract = {
    ETH_PID: vi.fn().mockResolvedValue(0n),
    depositETH: vi.fn().mockResolvedValue(tx),
    unstake: vi.fn().mockResolvedValue(tx),
    withdraw: vi.fn().mockResolvedValue(tx),
    claim: vi.fn().mockResolvedValue(tx),
  };
  return { contract, wait };
}

describe("stake action runners", () => {
  it("calls depositETH with value for native ETH staking", async () => {
    const { contract } = createContract();
    const tx = await runStakeETH(contract, "0.4");
    expect(contract.depositETH).toHaveBeenCalledWith({ value: parseEther("0.4") });
    await tx.wait();
  });

  it("calls unstake with ETH pool id and amount", async () => {
    const { contract } = createContract();
    await runRequestWithdraw(contract, "0.2");
    expect(contract.unstake).toHaveBeenCalledWith(0n, parseEther("0.2"));
  });

  it("calls withdraw and claim with ETH pool id", async () => {
    const { contract } = createContract();
    await runWithdrawUnlockedETH(contract);
    await runClaimReward(contract);
    expect(contract.withdraw).toHaveBeenCalledWith(0n);
    expect(contract.claim).toHaveBeenCalledWith(0n);
  });
});
