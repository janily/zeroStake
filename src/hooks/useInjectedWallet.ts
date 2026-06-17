"use client";

import { useCallback, useMemo } from "react";
import { formatEther } from "ethers";
import { useBalance, useConnect, useDisconnect, useSwitchChain, useWallet, type WalletType } from "@janily/walletbridgekit";
import { SEPOLIA_CHAIN_ID, isSepolia, sepoliaChain } from "@/lib/chain";

function getWalletErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : String(error);
  if (/4001|rejected|denied/i.test(message)) return "You rejected the wallet request";
  if (/4902|unrecognized|not added/i.test(message)) return "Sepolia is not available in your wallet";
  return fallback;
}

function toBigIntChainId(chainId?: number) {
  return chainId === undefined ? undefined : BigInt(chainId);
}

export function useInjectedWallet() {
  const wallet = useWallet();
  const { balance, refreshBalance, isLoading: isBalanceLoading } = useBalance();
  const { connect: connectWalletBridge, connectors, isConnecting } = useConnect();
  const { disconnect: disconnectWalletBridge, isDisconnecting } = useDisconnect();
  const { switchChain, isSwitchingChain, error: switchError } = useSwitchChain();

  const connect = useCallback(async () => {
    const connector = connectors.find((item) => item.installed) ?? connectors[0];
    if (!connector) return;
    await connectWalletBridge(connector.id as WalletType);
  }, [connectWalletBridge, connectors]);

  const disconnect = useCallback(async () => {
    await disconnectWalletBridge();
  }, [disconnectWalletBridge]);

  const refresh = useCallback(async () => {
    await refreshBalance();
  }, [refreshBalance]);

  const switchToSepolia = useCallback(async () => {
    await switchChain(sepoliaChain.id);
    await refreshBalance();
  }, [refreshBalance, switchChain]);

  const chainId = toBigIntChainId(wallet.chainId);
  const error = wallet.error ?? switchError;
  const loading = isConnecting || isDisconnecting || isSwitchingChain || isBalanceLoading || wallet.status === "reconnecting";

  return useMemo(
    () => ({
      account: wallet.address,
      accounts: wallet.accounts,
      chainId,
      balance: balance?.value,
      balanceLabel: balance?.value === undefined ? "0" : formatEther(balance.value),
      loading,
      error: error ? getWalletErrorMessage(error, error.message) : undefined,
      provider: wallet.provider,
      walletType: wallet.walletType,
      status: wallet.status,
      isConnected: wallet.status === "connected" && Boolean(wallet.address),
      isCorrectNetwork: isSepolia(chainId) || wallet.chainId === Number(SEPOLIA_CHAIN_ID),
      connect,
      disconnect,
      refresh,
      switchToSepolia,
    }),
    [balance?.value, chainId, connect, disconnect, error, loading, refresh, switchToSepolia, wallet.accounts, wallet.address, wallet.chainId, wallet.provider, wallet.status, wallet.walletType],
  );
}
