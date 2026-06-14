"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatEther } from "ethers";
import { SEPOLIA_CHAIN_ID_HEX, isSepolia } from "@/lib/chain";
import { getBrowserProvider, getEthereum } from "@/lib/ethers";

interface WalletState {
  account?: string;
  chainId?: bigint;
  balance?: bigint;
  loading: boolean;
  error?: string;
}

export function useInjectedWallet() {
  const [state, setState] = useState<WalletState>({ loading: true });

  const refresh = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      setState({ loading: false, error: "请先安装 MetaMask 钱包" });
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
        error: error instanceof Error ? error.message : "钱包状态读取失败",
      }));
    }
  }, []);

  const connect = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      setState({ loading: false, error: "请先安装 MetaMask 钱包" });
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
        error: /4001|rejected/i.test(String(error)) ? "你取消了钱包连接" : "钱包连接失败",
      }));
    }
  }, [refresh]);

  const switchToSepolia = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) return;
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    });
    await refresh();
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
