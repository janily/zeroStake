import { BrowserProvider, Contract, type ContractRunner } from "ethers";
import type { Eip1193Provider } from "@janily/walletbridgekit";
import { STAKE_ADDRESS } from "@/contracts/addresses";
import { stakeAbi } from "@/contracts/stakeAbi";

export function getEthereum() {
  if (typeof window === "undefined") return null;
  return window.ethereum ?? null;
}

export async function getBrowserProvider(provider?: Eip1193Provider | EthereumProvider) {
  const ethereum = provider ?? getEthereum();
  if (!ethereum) throw new Error("Wallet not found");
  return new BrowserProvider(ethereum);
}

export async function getSigner(provider?: Eip1193Provider | EthereumProvider) {
  const browserProvider = await getBrowserProvider(provider);
  return browserProvider.getSigner();
}

export function getStakeContract(runner: ContractRunner) {
  return new Contract(STAKE_ADDRESS, stakeAbi, runner);
}
