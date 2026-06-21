import { NextRequest, NextResponse } from "next/server";

const fallbackRpcUrls = [
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://sepolia.drpc.org",
  "https://1rpc.io/sepolia",
  "https://rpc.sepolia.org",
];

function getRpcUrls() {
  return [process.env.SEPOLIA_RPC_URL, ...fallbackRpcUrls].filter((url): url is string => Boolean(url));
}

function getPayloadId(payload: unknown) {
  if (Array.isArray(payload)) return null;
  if (payload && typeof payload === "object" && "id" in payload) return payload.id;
  return null;
}

function jsonRpcError(payload: unknown, message: string, status = 502) {
  return NextResponse.json(
    {
      jsonrpc: "2.0",
      id: getPayloadId(payload),
      error: { code: -32000, message },
    },
    { status },
  );
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonRpcError(null, "Invalid JSON-RPC payload", 400);
  }

  const requestBody = JSON.stringify(payload);

  for (const rpcUrl of getRpcUrls()) {
    try {
      const upstream = await fetch(rpcUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: requestBody,
        cache: "no-store",
      });

      const body = await upstream.text();
      const contentType = upstream.headers.get("content-type") || "";

      if (!upstream.ok || !contentType.includes("application/json")) {
        continue;
      }

      return new NextResponse(body, {
        status: upstream.status,
        headers: { "content-type": contentType },
      });
    } catch {
      continue;
    }
  }

  return jsonRpcError(payload, "Unable to reach Sepolia RPC");
}
