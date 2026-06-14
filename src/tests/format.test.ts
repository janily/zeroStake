import { parseEther } from "ethers";
import { describe, expect, it } from "vitest";
import { formatTokenAmount, shortAddress, shortHash } from "@/lib/format";

describe("format helpers", () => {
  it("formats bigint token values with truncated decimals", () => {
    expect(formatTokenAmount(parseEther("1.234567"), 4)).toBe("1.2345");
    expect(formatTokenAmount(parseEther("2.000000"), 4)).toBe("2");
  });

  it("shortens addresses and hashes", () => {
    expect(shortAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe("0x1234...5678");
    expect(shortHash("0xabcdef1234567890abcdef1234567890abcdef1234567890")).toBe("0xabcdef12...34567890");
  });
});
