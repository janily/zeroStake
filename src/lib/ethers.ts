import { BrowserProvider, Contract, JsonRpcProvider, type ContractRunner } from "ethers";
import type { Eip1193Provider } from "@janily/walletbridgekit";
import { STAKE_ADDRESS } from "@/contracts/addresses";
import { stakeAbi } from "@/contracts/stakeAbi";
import { sepoliaChain } from "@/lib/chain";

export function getEthereum() {
  if (typeof window === "undefined") return null;
  return window.ethereum ?? null;
}

export async function getBrowserProvider(provider?: Eip1193Provider | EthereumProvider) {
  const ethereum = provider ?? getEthereum();
  if (!ethereum) throw new Error("Wallet not found");
  return new BrowserProvider(ethereum);
}

export function getPublicProvider() {
  const rpcUrl =
    typeof window === "undefined"
      ? process.env.SEPOLIA_RPC_URL || sepoliaChain.rpcUrls[0]
      : `${window.location.origin}/api/rpc`;

  return new JsonRpcProvider(rpcUrl, Number(sepoliaChain.id));
}

export async function getSigner(provider?: Eip1193Provider | EthereumProvider) {
  const browserProvider = await getBrowserProvider(provider);
  return browserProvider.getSigner();
}

export function getStakeContract(runner: ContractRunner) {
  return new Contract(STAKE_ADDRESS, stakeAbi, runner);
}
