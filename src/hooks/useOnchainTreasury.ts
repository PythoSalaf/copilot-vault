import { useMemo } from "react";
import { useAccount, useBalance, useChainId, useReadContracts } from "wagmi";
import { erc20Abi, formatUnits } from "viem";
import { TOKENS, PRICES_USD, CHAIN_LABELS, SUPPORTED_CHAINS, tokenExplorerUrl } from "@/lib/wagmi";
import { mockTreasury, type Treasury, type Asset } from "@/lib/mock-treasury";

export type TreasuryStatus = "demo" | "loading" | "live" | "partial" | "error" | "unsupported";

export interface TreasuryError {
  scope: "native" | "token";
  symbol?: string;
  address?: string;
  message: string;
}

export interface OnchainTreasuryState {
  treasury: Treasury;
  isLive: boolean;
  isLoading: boolean;
  status: TreasuryStatus;
  errors: TreasuryError[];
  address?: `0x${string}`;
  chainId?: number;
  chainLabel?: string;
  chainSupported: boolean;
}

function shortErr(e: unknown): string {
  if (!e) return "unknown error";
  const msg = e instanceof Error ? e.message : String(e);
  // Strip viem's verbose multi-line context — keep first useful line.
  return msg.split("\n")[0].slice(0, 160);
}

export function useOnchainTreasury(): OnchainTreasuryState {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const chainSupported = SUPPORTED_CHAINS.some((c) => c.id === chainId);

  const native = useBalance({
    address,
    query: { enabled: !!address && chainSupported, refetchInterval: 15000, retry: 1 },
  });

  const tokens = TOKENS[chainId] ?? [];

  const erc20 = useReadContracts({
    contracts: tokens.map((t) => ({
      address: t.address,
      abi: erc20Abi,
      functionName: "balanceOf" as const,
      args: [address!] as const,
      chainId,
    })),
    query: {
      enabled: !!address && chainSupported && tokens.length > 0,
      refetchInterval: 15000,
      retry: 1,
    },
  });

  return useMemo<OnchainTreasuryState>(() => {
    if (!isConnected || !address) {
      return {
        treasury: mockTreasury,
        isLive: false,
        isLoading: false,
        status: "demo",
        errors: [],
        chainSupported,
      };
    }

    if (!chainSupported) {
      return {
        treasury: {
          ...mockTreasury,
          organization: `Wallet ${address.slice(0, 6)}…${address.slice(-4)}`,
        },
        isLive: false,
        isLoading: false,
        status: "unsupported",
        errors: [
          {
            scope: "native",
            message: `Chain ${chainId} not supported. Switch to Arbitrum Sepolia or Robinhood Testnet.`,
          },
        ],
        address,
        chainId,
        chainLabel: CHAIN_LABELS[chainId] ?? `Chain ${chainId}`,
        chainSupported: false,
      };
    }

    const isLoading = native.isLoading || erc20.isLoading;
    const errors: TreasuryError[] = [];
    const assets: Asset[] = [];

    // Native balance
    if (native.isError) {
      errors.push({
        scope: "native",
        symbol: "ETH",
        message: `Native RPC read failed — ${shortErr(native.error)}`,
      });
    } else if (native.data) {
      const sym = native.data.symbol || "ETH";
      const decimals = native.data.decimals ?? 18;
      const amt = Number(formatUnits(native.data.value, decimals));
      const price = PRICES_USD[sym] ?? 0;
      assets.push({
        symbol: sym,
        amount: amt,
        valueUSD: amt * price,
        protocol: "Wallet",
        risk: sym === "ETH" ? "medium" : "low",
        address: undefined,
        explorerUrl: tokenExplorerUrl(chainId, undefined, address),
      });
    }

    // ERC20 balances — per-token error tracking
    erc20.data?.forEach((res, i) => {
      const meta = tokens[i];
      if (!meta) return;
      if (res.status !== "success") {
        errors.push({
          scope: "token",
          symbol: meta.symbol,
          address: meta.address,
          message: `${meta.symbol} read failed — ${shortErr((res as { error?: unknown }).error)}`,
        });
        return;
      }
      try {
        const raw = res.result as bigint;
        const decimals = meta.decimals ?? 18;
        const amt = Number(formatUnits(raw, decimals));
        const price = PRICES_USD[meta.symbol] ?? 1;
        assets.push({
          symbol: meta.symbol,
          amount: amt,
          valueUSD: amt * price,
          protocol: "Wallet",
          risk: "low",
          address: meta.address,
          explorerUrl: tokenExplorerUrl(chainId, meta.address, address),
        });
      } catch (e) {
        errors.push({
          scope: "token",
          symbol: meta.symbol,
          address: meta.address,
          message: `${meta.symbol} decode failed — ${shortErr(e)}`,
        });
      }
    });

    // If the read hook itself errored (e.g. multicall transport down), surface it once.
    if (erc20.isError && tokens.length > 0 && !(erc20.data?.length)) {
      errors.push({
        scope: "token",
        message: `ERC-20 batch read failed — ${shortErr(erc20.error)}`,
      });
    }

    const totalAUM = assets.reduce((s, a) => s + a.valueUSD, 0);
    const monthlyBurn = mockTreasury.monthlyBurn;
    const monthlyRevenue = mockTreasury.monthlyRevenue;
    const netMonthlyBurn = monthlyBurn - monthlyRevenue;
    const runwayMonths = netMonthlyBurn > 0 && totalAUM > 0 ? totalAUM / netMonthlyBurn : 0;

    const stable = assets
      .filter((a) => a.symbol === "USDC" || a.symbol === "USDG")
      .reduce((s, a) => s + a.valueUSD, 0);
    const stablePct = totalAUM > 0 ? stable / totalAUM : 0;
    const runwayScore = Math.min(60, runwayMonths * 6);
    const stableScore = stablePct > 0.7 ? 20 : stablePct > 0.3 ? 35 : 25;
    const healthScore = Math.round(Math.max(5, Math.min(99, runwayScore + stableScore)));

    // Status: errors but some assets → partial; total failure → error
    const totalExpected = (tokens.length || 0) + 1; // native + tokens
    const succeeded = assets.length;
    let status: TreasuryStatus = "live";
    if (isLoading && succeeded === 0) status = "loading";
    else if (succeeded === 0 && errors.length > 0) status = "error";
    else if (errors.length > 0 || succeeded < totalExpected) status = "partial";

    const useLive = succeeded > 0;

    return {
      treasury: {
        ...mockTreasury,
        organization: `Wallet ${address.slice(0, 6)}…${address.slice(-4)}`,
        assets: useLive ? assets : mockTreasury.assets,
        totalAUM: useLive ? totalAUM : mockTreasury.totalAUM,
        runwayMonths: useLive ? Number(runwayMonths.toFixed(1)) : mockTreasury.runwayMonths,
        netMonthlyBurn,
        healthScore: useLive ? healthScore : mockTreasury.healthScore,
      },
      isLive: useLive,
      isLoading,
      status,
      errors,
      address,
      chainId,
      chainLabel: CHAIN_LABELS[chainId] ?? `Chain ${chainId}`,
      chainSupported,
    };
  }, [
    isConnected,
    address,
    chainId,
    chainSupported,
    native.data,
    native.isLoading,
    native.isError,
    native.error,
    erc20.data,
    erc20.isLoading,
    erc20.isError,
    erc20.error,
    tokens,
  ]);
}
