import { BrowserProvider, Contract, type ContractRunner } from "ethers";
import { STAKE_ADDRESS } from "@/contracts/addresses";
import { stakeAbi } from "@/contracts/stakeAbi";
import type { Eip1193Provider } from "@janily/walletbridgekit";

export function getBrowserProviderFromWallet(provider: Eip1193Provider) {
  return new BrowserProvider(provider);
}

export function getStakeContract(runner: ContractRunner) {
  return new Contract(STAKE_ADDRESS, stakeAbi, runner);
}
