import { parseEther } from "ethers";
import { describe, expect, it } from "vitest";
import { maxStakeAmount, validateEthAmount } from "@/lib/validate";

describe("validateEthAmount", () => {
  it("rejects empty, zero, negative, and invalid input", () => {
    expect(validateEthAmount({ amount: "" }).error).toBe("Enter an amount");
    expect(validateEthAmount({ amount: "0" }).error).toBe("Amount must be greater than 0");
    expect(validateEthAmount({ amount: "-1" }).error).toBe("Enter a valid number");
    expect(validateEthAmount({ amount: "1.2.3" }).error).toBe("Enter a valid number");
  });

  it("rejects amounts above max and below min", () => {
    expect(validateEthAmount({ amount: "2", max: parseEther("1") }).error).toBe("Insufficient wallet balance");
    expect(validateEthAmount({ amount: "0.01", min: parseEther("0.1") }).error).toBe("Amount is below the pool minimum");
  });

  it("accepts legal values and reserves gas for max stake", () => {
    expect(validateEthAmount({ amount: "0.25", max: parseEther("1"), min: parseEther("0.1") }).ok).toBe(true);
    expect(maxStakeAmount(parseEther("1"))).toBe(parseEther("0.995"));
    expect(maxStakeAmount(parseEther("0.004"))).toBe(0n);
  });
});
