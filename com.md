# WalletBridgeKit

WalletBridgeKit is a React and Next.js friendly EVM wallet account SDK. It provides multi-wallet connectors, Zustand global state, React hooks, lightweight UI components, automatic reconnect, and network switching event handling.

## Install

```bash
npm install @janily/walletbridgekit
```

## Quick Start

```tsx
'use client';

import { WalletBridgeProvider, WalletConnectButton, WalletStatus, supportedChains } from '@janily/walletbridgekit';

export function WalletRoot({ children }: { children: React.ReactNode }) {
  return (
    <WalletBridgeProvider
      config={{
        appName: 'ZeroOne App',
        chains: supportedChains,
        autoReconnect: true,
        defaultChainId: 8453,
        walletConnectProjectId: 'YOUR_PROJECT_ID',
      }}
    >
      <WalletConnectButton />
      <WalletStatus />
      {children}
    </WalletBridgeProvider>
  );
}
```

## Features

- MetaMask, Coinbase Wallet, WalletConnect, and mobile wallet app connectors.
- Global Zustand store for address, accounts, chain ID, balance, wallet type, provider, and errors.
- `chainChanged`, `accountsChanged`, and `disconnect` event handling.
- `switchChain` with configured-chain validation and optional `wallet_addEthereumChain` fallback.
- React hooks: `useWallet`, `useConnect`, `useDisconnect`, `useSwitchChain`, `useBalance`.
- UI components: `WalletConnectButton`, `WalletModal`, `ChainSwitcher`, `WalletStatus`.

## Development

```bash
npm install
npm run dev
npm test
npm run typecheck
npm run build
npm run docs:build
```