"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatEther } from "ethers";
import { SEPOLIA_CHAIN_ID_HEX, isSepolia, sepoliaChain } from "@/lib/chain";
import { getBrowserProvider, getEthereum } from "@/lib/ethers";

interface WalletState {
  account?: string;
  chainId?: bigint;
  balance?: bigint;
  loading: boolean;
  error?: string;
}

function getWalletErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : String(error);
  if (/4001|rejected|denied/i.test(message)) return "You rejected the wallet request";
  if (/4902|unrecognized|not added/i.test(message)) return "Sepolia is not available in your wallet";
  return fallback;
}

async function requestSepoliaSwitch(ethereum: EthereumProvider) {
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    });
  } catch (error) {
    if (!/4902|unrecognized|not added/i.test(String(error))) throw error;

    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: SEPOLIA_CHAIN_ID_HEX,
          chainName: sepoliaChain.name,
          nativeCurrency: sepoliaChain.nativeCurrency,
          rpcUrls: sepoliaChain.rpcUrls,
          blockExplorerUrls: sepoliaChain.blockExplorers.map((explorer) => explorer.url),
        },
      ],
    });
  }
}

export function useInjectedWallet() {
  const [state, setState] = useState<WalletState>({ loading: true });

  const refresh = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      setState({ loading: false, error: "Install MetaMask first" });
      return;
    }

    try {
      const provider = await getBrowserProvider();
      const accounts = await ethereum.request<string[]>({ method: "eth_accounts" });
      const network = await provider.getNetwork();
      const account = accounts[0];
      const balance = account ? await provider.getBalance(account) : undefined;
      setState({ account, chainId: network.chainId, balance, loading: false });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : "Unable to read wallet status",
      }));
    }
  }, []);

  const connect = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      setState({ loading: false, error: "Install MetaMask first" });
      return;
    }
    setState((current) => ({ ...current, loading: true, error: undefined }));
    try {
      await ethereum.request<string[]>({ method: "eth_requestAccounts" });
      await refresh();
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: getWalletErrorMessage(error, "Wallet connection failed"),
      }));
    }
  }, [refresh]);

  const switchToSepolia = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      setState({ loading: false, error: "Install MetaMask first" });
      return;
    }

    setState((current) => ({ ...current, loading: true, error: undefined }));
    try {
      const accounts = await ethereum.request<string[]>({ method: "eth_accounts" });
      if (!accounts[0]) {
        await ethereum.request<string[]>({ method: "eth_requestAccounts" });
      }
      await requestSepoliaSwitch(ethereum);
      await refresh();
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: getWalletErrorMessage(error, "Unable to switch to Sepolia"),
      }));
    }
  }, [refresh]);

  useEffect(() => {
    void refresh();
    const ethereum = getEthereum();
    if (!ethereum?.on) return;

    const onAccountsChanged = () => void refresh();
    const onChainChanged = () => void refresh();
    const onDisconnect = () => setState({ loading: false });

    ethereum.on("accountsChanged", onAccountsChanged);
    ethereum.on("chainChanged", onChainChanged);
    ethereum.on("disconnect", onDisconnect);

    return () => {
      ethereum.removeListener?.("accountsChanged", onAccountsChanged);
      ethereum.removeListener?.("chainChanged", onChainChanged);
      ethereum.removeListener?.("disconnect", onDisconnect);
    };
  }, [refresh]);

  return useMemo(
    () => ({
      ...state,
      balanceLabel: state.balance === undefined ? "0" : formatEther(state.balance),
      isConnected: Boolean(state.account),
      isCorrectNetwork: isSepolia(state.chainId),
      connect,
      refresh,
      switchToSepolia,
    }),
    [connect, refresh, state, switchToSepolia],
  );
}
