import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/rpc/route";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("RPC proxy route", () => {
  it("skips non-JSON upstream responses and returns the next JSON-RPC response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("<html>Not Found</html>", { status: 404, headers: { "content-type": "text/html" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result: "0xaa36a7" }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new NextRequest("https://zero-stake.test/api/rpc", {
        method: "POST",
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ jsonrpc: "2.0", id: 1, result: "0xaa36a7" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns a JSON-RPC error when the request body is invalid JSON", async () => {
    const response = await POST(
      new NextRequest("https://zero-stake.test/api/rpc", {
        method: "POST",
        body: "not-json",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: { message: "Invalid JSON-RPC payload" } });
  });
});
