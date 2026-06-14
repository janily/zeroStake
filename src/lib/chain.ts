export const SEPOLIA_CHAIN_ID = 11155111n;
export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";
export const SEPOLIA_EXPLORER_TX = "https://sepolia.etherscan.io/tx/";

export const sepoliaChain = {
  id: Number(SEPOLIA_CHAIN_ID),
  chainId: Number(SEPOLIA_CHAIN_ID),
  name: "Sepolia",
  network: "sepolia",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorers: [{ name: "Etherscan", url: "https://sepolia.etherscan.io" }],
};

export function isSepolia(chainId?: bigint) {
  return chainId === SEPOLIA_CHAIN_ID;
}
