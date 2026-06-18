import { createConfig, http } from "wagmi";
import { injected } from "wagmi";
import { arbitrumSepolia } from "viem/chains";
import { defineChain } from "viem";

export const robinhoodTestnet = defineChain({
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Explorer",
      url: "https://explorer.testnet.chain.robinhood.com",
    },
  },
  testnet: true,
});

export const SUPPORTED_CHAINS = [arbitrumSepolia, robinhoodTestnet] as const;

export const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [arbitrumSepolia.id]: http(),
    [robinhoodTestnet.id]: http("https://rpc.testnet.chain.robinhood.com"),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}

// Known stablecoin contracts (testnet)
export const TOKENS: Record<
  number,
  { symbol: string; address: `0x${string}`; decimals: number }[]
> = {
  // Arbitrum Sepolia — Circle's USDC test deployment
  [arbitrumSepolia.id]: [
    {
      symbol: "USDC",
      address: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
      decimals: 6,
    },
  ],
  // Robinhood Chain testnet — official Paxos USDG + WETH
  // Source: https://docs.robinhood.com/chain/contracts/
  [robinhoodTestnet.id]: [
    {
      symbol: "USDG",
      address: "0x7E955252E15c84f5768B83c41a71F9eba181802F",
      decimals: 6,
    },
    {
      symbol: "WETH",
      address: "0x7943e237c7F95DA44E0301572D358911207852Fa",
      decimals: 18,
    },
  ],
};

// Demo price oracle (static USD). Replace with Chainlink feed in production.
export const PRICES_USD: Record<string, number> = {
  ETH: 2785,
  WETH: 2785,
  USDC: 1,
  USDG: 1,
  ARB: 0.42,
};

export const CHAIN_LABELS: Record<number, string> = {
  [arbitrumSepolia.id]: "Arbitrum Sepolia",
  [robinhoodTestnet.id]: "Robinhood Testnet",
};

export const EXPLORER_URLS: Record<number, string> = {
  [arbitrumSepolia.id]: "https://sepolia.arbiscan.io",
  [robinhoodTestnet.id]: "https://explorer.testnet.chain.robinhood.com",
};

export function tokenExplorerUrl(chainId: number, tokenAddress?: string, holder?: string): string {
  const base = EXPLORER_URLS[chainId] ?? EXPLORER_URLS[arbitrumSepolia.id];
  if (!tokenAddress) {
    if (!holder) return base;
    return `${base}/address/${holder}`;
  }
  if (chainId === arbitrumSepolia.id) {
    return holder ? `${base}/token/${tokenAddress}?a=${holder}` : `${base}/token/${tokenAddress}`;
  }
  return holder ? `${base}/address/${tokenAddress}?holder=${holder}` : `${base}/address/${tokenAddress}`;
}
