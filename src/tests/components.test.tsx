import { render, screen } from "@testing-library/react";
import { parseEther } from "ethers";
import React from "react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { ActionPanel } from "@/components/ActionPanel";
import type { StakeData } from "@/types/stake";

const baseData: StakeData = {
  ethPid: 0n,
  poolInfo: {
    stTokenAddress: "0x0000000000000000000000000000000000000000",
    poolWeight: 1n,
    lastRewardBlock: 1n,
    accMetaNodePerST: 0n,
    stTokenAmount: parseEther("12.7"),
    minDepositAmount: parseEther("0.1"),
    unstakeLockedBlocks: 64n,
  },
  stakingBalance: parseEther("1"),
  pendingReward: 0n,
  requestAmount: 0n,
  pendingWithdrawAmount: 0n,
  paused: false,
  claimPaused: false,
  withdrawPaused: false,
  metaNodeAddress: "0x1111111111111111111111111111111111111111",
  metaNodePerBlock: parseEther("0.01"),
  startBlock: 1n,
  endBlock: 2n,
};

function renderPanel(overrides: Partial<ComponentProps<typeof ActionPanel>> = {}) {
  return render(
    <ActionPanel
      balance={parseEther("2")}
      connected
      correctNetwork
      data={baseData}
      onClaim={vi.fn()}
      onRefresh={vi.fn()}
      onRequestWithdraw={vi.fn()}
      onStake={vi.fn()}
      onWithdraw={vi.fn()}
      txStatus="idle"
      {...overrides}
    />,
  );
}

describe("ActionPanel", () => {
  it("disables actions when wallet is disconnected", () => {
    renderPanel({ connected: false });
    expect(screen.getByRole("button", { name: /^Stake$/i })).toBeDisabled();
    expect(screen.getByText(/Connect a wallet/i)).toBeInTheDocument();
  });

  it("disables withdraw and claim when no unlocked assets or rewards exist", () => {
    renderPanel();
    expect(screen.getByRole("button", { name: /Withdraw Unlocked ETH/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Claim Rewards/i })).toBeDisabled();
  });

  it("enables quick actions when chain values are positive", () => {
    renderPanel({
      data: {
        ...baseData,
        pendingReward: parseEther("0.13"),
        pendingWithdrawAmount: parseEther("0.5"),
      },
    });
    expect(screen.getByRole("button", { name: /Withdraw Unlocked ETH/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Claim Rewards/i })).toBeEnabled();
  });
});
