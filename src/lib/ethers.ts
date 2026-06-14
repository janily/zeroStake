import { BrowserProvider, Contract, type ContractRunner } from "ethers";
import { STAKE_ADDRESS } from "@/contracts/addresses";
import { stakeAbi } from "@/contracts/stakeAbi";

export function getEthereum() {
  if (typeof window === "undefined") return null;
  return window.ethereum ?? null;
}

export async function getBrowserProvider() {
  const ethereum = getEthereum();
  if (!ethereum) throw new Error("Wallet not found");
  return new BrowserProvider(ethereum);
}

export async function getSigner() {
  const provider = await getBrowserProvider();
  return provider.getSigner();
}

export function getStakeContract(runner: ContractRunner) {
  return new Contract(STAKE_ADDRESS, stakeAbi, runner);
}
