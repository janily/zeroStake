"use client";

import type { ReactNode } from "react";
import { WalletBridgeProvider } from "@janily/walletbridgekit";
import { sepoliaChain } from "@/lib/chain";

export function WalletRoot({ children }: { children: ReactNode }) {
  return (
    <WalletBridgeProvider
      config={{
        appName: "MetaNode Stake",
        chains: [sepoliaChain],
        autoReconnect: true,
        defaultChainId: sepoliaChain.id,
        walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "zero-stake-dev",
      }}
    >
      {children}
    </WalletBridgeProvider>
  );
}
