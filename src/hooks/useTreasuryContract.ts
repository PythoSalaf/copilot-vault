// import { useMemo } from "react";
// import { useAccount, useChainId, useReadContracts, useWriteContract } from "wagmi";
// import { formatUnits } from "viem";
// import {
//   treasuryVaultAbi,
//   policyEngineAbi,
//   payrollManagerAbi,
//   yieldRouterAbi,
//   type OnchainAllocation,
//   type OnchainPolicy,
//   type OnchainPayroll,
//   type OnchainProtocol,
// } from "@/lib/contracts/abis";
// import { CONTRACT_ADDRESSES, TREASURY_CHAIN_ID } from "@/lib/contracts/addresses";
// import { TOKENS } from "@/lib/wagmi";
// import { mockTreasury, type Asset, type Policy, type Payroll } from "@/lib/mock-treasury";

// const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

// function isConfigured(addr: string) {
//   return !!addr && addr.toLowerCase() !== ZERO_ADDR;
// }

// function fmtDate(ts: bigint): string {
//   try {
//     return new Date(Number(ts) * 1000).toISOString().slice(0, 10);
//   } catch {
//     return "—";
//   }
// }

// function payrollStatusFromCode(code: number): Payroll["status"] {
//   switch (code) {
//     case 0: return "scheduled";
//     case 1: return "pending";
//     case 2: return "executed";
//     case 3: return "delayed";
//     default: return "scheduled";
//   }
// }

// function riskFromCode(code: number): Asset["risk"] {
//   if (code >= 2) return "high";
//   if (code === 1) return "medium";
//   return "low";
// }

// export interface UseTreasuryContractResult {
//   isConnected: boolean;
//   isCorrectChain: boolean;
//   isLive: boolean;
//   isLoading: boolean;
//   totalValueUSD?: number;
//   runwayMonths?: number;
//   allocations?: Asset[];
//   policies?: Policy[];
//   payrolls?: (Payroll & { id: `0x${string}` })[];
//   protocols?: OnchainProtocol[];
//   resolved: {
//     totalAUM: number;
//     runwayMonths: number;
//     allocations: Asset[];
//     policies: Policy[];
//     payrolls: (Payroll & { id?: `0x${string}` })[];
//   };
//   allocate: { isPending: boolean; isSuccess: boolean; data?: `0x${string}`; error?: Error | null; reset: () => void };
//   executePayroll: { isPending: boolean; isSuccess: boolean; data?: `0x${string}`; error?: Error | null; reset: () => void };
//   deposit: { isPending: boolean; isSuccess: boolean; data?: `0x${string}`; error?: Error | null; reset: () => void };
//   callAllocate: (protocol: `0x${string}`, token: `0x${string}`, amount: bigint) => void;
//   callExecutePayroll: (id: `0x${string}`) => void;
//   callDeposit: (token: `0x${string}`, amount: bigint) => void;
// }

// export function useTreasuryContract(): UseTreasuryContractResult {
//   const { isConnected } = useAccount();
//   const chainId = useChainId();
//   const isCorrectChain = chainId === TREASURY_CHAIN_ID;

//   const tokensForChain = TOKENS[TREASURY_CHAIN_ID] ?? [];
//   const tokenAddrs = tokensForChain.map((t) => t.address);

//   const canRead =
//     isConnected &&
//     isCorrectChain &&
//     isConfigured(CONTRACT_ADDRESSES.treasuryVault) &&
//     isConfigured(CONTRACT_ADDRESSES.policyEngine) &&
//     isConfigured(CONTRACT_ADDRESSES.payrollManager) &&
//     isConfigured(CONTRACT_ADDRESSES.yieldRouter);

//   const reads = useReadContracts({
//     allowFailure: true,
//     contracts: [
//       {
//         address: CONTRACT_ADDRESSES.treasuryVault,
//         abi: treasuryVaultAbi,
//         functionName: "getTotalValueUSD",
//         args: [tokenAddrs],
//         chainId: TREASURY_CHAIN_ID,
//       },
//       {
//         address: CONTRACT_ADDRESSES.treasuryVault,
//         abi: treasuryVaultAbi,
//         functionName: "getRunwayMonths",
//         args: [tokenAddrs],
//         chainId: TREASURY_CHAIN_ID,
//       },
//       {
//         address: CONTRACT_ADDRESSES.treasuryVault,
//         abi: treasuryVaultAbi,
//         functionName: "getAllocations",
//         chainId: TREASURY_CHAIN_ID,
//       },
//       {
//         address: CONTRACT_ADDRESSES.policyEngine,
//         abi: policyEngineAbi,
//         functionName: "getPolicies",
//         chainId: TREASURY_CHAIN_ID,
//       },
//       {
//         address: CONTRACT_ADDRESSES.payrollManager,
//         abi: payrollManagerAbi,
//         functionName: "getAllPayrolls",
//         chainId: TREASURY_CHAIN_ID,
//       },
//       {
//         address: CONTRACT_ADDRESSES.yieldRouter,
//         abi: yieldRouterAbi,
//         functionName: "getProtocols",
//         chainId: TREASURY_CHAIN_ID,
//       },
//     ],
//     query: {
//       enabled: canRead,
//       refetchInterval: 20000,
//       retry: 1,
//     },
//   });

//   const allocate = useWriteContract();
//   const executePayroll = useWriteContract();
//   const deposit = useWriteContract();

//   return useMemo<UseTreasuryContractResult>(() => {
//     const [totalRes, runwayRes, allocRes, policyRes, payrollRes, protocolRes] =
//       reads.data ?? [];

//     const totalValueUSDRaw =
//       totalRes?.status === "success" ? (totalRes.result as bigint) : undefined;
//     const runwayRaw =
//       runwayRes?.status === "success" ? (runwayRes.result as bigint) : undefined;
//     const allocationsRaw =
//       allocRes?.status === "success"
//         ? (allocRes.result as readonly OnchainAllocation[])
//         : undefined;
//     const policiesRaw =
//       policyRes?.status === "success"
//         ? (policyRes.result as readonly OnchainPolicy[])
//         : undefined;
//     const payrollsRaw =
//       payrollRes?.status === "success"
//         ? (payrollRes.result as readonly OnchainPayroll[])
//         : undefined;
//     const protocolsRaw =
//       protocolRes?.status === "success"
//         ? (protocolRes.result as readonly OnchainProtocol[])
//         : undefined;

//     // Decode — assume USDC-style 6 decimals for the AUM aggregate; the contract
//     // may return 18-decimal values. Try 6 first, then fall through.
//     let totalValueUSD: number | undefined;
//     if (totalValueUSDRaw !== undefined) {
//       const n6 = Number(formatUnits(totalValueUSDRaw, 6));
//       totalValueUSD = n6 > 1e12 ? Number(formatUnits(totalValueUSDRaw, 18)) : n6;
//     }

//     let runwayMonths: number | undefined;
//     if (runwayRaw !== undefined) {
//       // contract returns runway * 1e18
//       runwayMonths = Number(formatUnits(runwayRaw, 18));
//     }

//     const allocations: Asset[] | undefined = allocationsRaw?.map((a) => ({
//       symbol: a.label?.split(" ")[0] || "TOKEN",
//       amount: Number(formatUnits(a.amount, 6)),
//       valueUSD: Number(formatUnits(a.valueUSD, 6)),
//       protocol: a.label || `${a.protocol.slice(0, 6)}…${a.protocol.slice(-4)}`,
//       risk: riskFromCode(Number(a.risk)),
//       apy: Number(a.apy) / 100,
//       address: a.token,
//     }));

//     const policies: Policy[] | undefined = policiesRaw?.map((p) => ({
//       id: p.id,
//       text: p.text,
//       active: p.active,
//       violated: p.violated,
//     }));

//     const payrolls: (Payroll & { id: `0x${string}` })[] | undefined = payrollsRaw?.map(
//       (p) => ({
//         id: p.id,
//         name: p.name,
//         amount: Number(formatUnits(p.amount, 6)),
//         token: p.tokenSymbol || "USDC",
//         nextDate: fmtDate(p.nextTimestamp),
//         status: payrollStatusFromCode(Number(p.status)),
//       }),
//     );

//     const useLive = isConnected && isCorrectChain && (reads.data?.some((r) => r.status === "success") ?? false);

//     return {
//       isConnected,
//       isCorrectChain,
//       isLive: useLive,
//       isLoading: reads.isLoading,
//       totalValueUSD,
//       runwayMonths,
//       allocations,
//       policies,
//       payrolls,
//       protocols: protocolsRaw ? [...protocolsRaw] : undefined,
//       resolved: {
//         totalAUM: totalValueUSD ?? mockTreasury.totalAUM,
//         runwayMonths: runwayMonths ?? mockTreasury.runwayMonths,
//         allocations: allocations && allocations.length > 0 ? allocations : mockTreasury.assets,
//         policies: policies && policies.length > 0 ? policies : mockTreasury.policies,
//         payrolls: payrolls && payrolls.length > 0 ? payrolls : mockTreasury.payroll,
//       },
//       allocate,
//       executePayroll,
//       deposit,
//       callAllocate: (protocol, token, amount) =>
//         allocate.writeContract({
//           address: CONTRACT_ADDRESSES.treasuryVault,
//           abi: treasuryVaultAbi,
//           functionName: "allocate",
//           args: [protocol, token, amount],
//           chainId: TREASURY_CHAIN_ID,
//         }),
//       callExecutePayroll: (id) =>
//         executePayroll.writeContract({
//           address: CONTRACT_ADDRESSES.payrollManager,
//           abi: payrollManagerAbi,
//           functionName: "executePayroll",
//           args: [id],
//           chainId: TREASURY_CHAIN_ID,
//         }),
//       callDeposit: (token, amount) =>
//         deposit.writeContract({
//           address: CONTRACT_ADDRESSES.treasuryVault,
//           abi: treasuryVaultAbi,
//           functionName: "deposit",
//           args: [token, amount],
//           chainId: TREASURY_CHAIN_ID,
//         }),
//     };
//   }, [isConnected, isCorrectChain, reads.data, reads.isLoading, allocate, executePayroll, deposit]);
// }

// useTreasuryContract.ts
// Fixed version — field names now match real contract structs
// Replaced mock-field assumptions with real onchain field names

import { useMemo } from "react";
import { useAccount, useChainId, useReadContracts, useWriteContract } from "wagmi";
import { formatUnits } from "viem";
import {
  treasuryVaultAbi,
  policyEngineAbi,
  payrollManagerAbi,
  yieldRouterAbi,
  type OnchainAllocation,
  type OnchainPolicy,
  type OnchainPayroll,
  type OnchainProtocol,
} from "@/lib/contracts/abis";
import { CONTRACT_ADDRESSES, TREASURY_CHAIN_ID } from "@/lib/contracts/addresses";
import { TOKENS } from "@/lib/wagmi";
import { mockTreasury, type Asset, type Policy, type Payroll } from "@/lib/mock-treasury";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

// ✅ Fixed: also strips whitespace before checking — catches the space bug
function isConfigured(addr: string) {
  const clean = addr?.trim();
  return !!clean && clean.toLowerCase() !== ZERO_ADDR && clean.startsWith("0x");
}

function fmtDate(ts: bigint): string {
  try {
    return new Date(Number(ts) * 1000).toISOString().slice(0, 10);
  } catch {
    return "—";
  }
}

// ✅ Fixed: derive status from active + nextExecution (no onchain status field)
function payrollStatusFromEntry(active: boolean, nextExecution: bigint): Payroll["status"] {
  if (!active) return "delayed";
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (nextExecution <= now) return "pending";
  return "scheduled";
}

// ✅ Fixed: derive risk from riskScore (1–10 scale)
function riskFromScore(score: number): Asset["risk"] {
  if (score >= 7) return "high";
  if (score >= 4) return "medium";
  return "low";
}

// Short address label for display
function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export interface UseTreasuryContractResult {
  isConnected: boolean;
  isCorrectChain: boolean;
  isLive: boolean;
  isLoading: boolean;
  totalValueUSD?: number;
  runwayMonths?: number;
  allocations?: Asset[];
  policies?: Policy[];
  payrolls?: (Payroll & { id: `0x${string}` })[];
  protocols?: OnchainProtocol[];
  resolved: {
    totalAUM: number;
    runwayMonths: number;
    allocations: Asset[];
    policies: Policy[];
    payrolls: (Payroll & { id?: `0x${string}` })[];
  };
  allocate: {
    isPending: boolean;
    isSuccess: boolean;
    data?: `0x${string}`;
    error?: Error | null;
    reset: () => void;
  };
  executePayroll: {
    isPending: boolean;
    isSuccess: boolean;
    data?: `0x${string}`;
    error?: Error | null;
    reset: () => void;
  };
  deposit: {
    isPending: boolean;
    isSuccess: boolean;
    data?: `0x${string}`;
    error?: Error | null;
    reset: () => void;
  };
  callAllocate: (protocol: `0x${string}`, token: `0x${string}`, amount: bigint) => void;
  callExecutePayroll: (id: `0x${string}`) => void;
  callDeposit: (token: `0x${string}`, amount: bigint) => void;
}

export function useTreasuryContract(): UseTreasuryContractResult {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectChain = chainId === TREASURY_CHAIN_ID;

  const tokensForChain = TOKENS[TREASURY_CHAIN_ID] ?? [];
  const tokenAddrs = tokensForChain.map((t) => t.address);

  const canRead =
    isConnected &&
    isCorrectChain &&
    isConfigured(CONTRACT_ADDRESSES.treasuryVault) &&
    isConfigured(CONTRACT_ADDRESSES.policyEngine) &&
    isConfigured(CONTRACT_ADDRESSES.payrollManager) &&
    isConfigured(CONTRACT_ADDRESSES.yieldRouter);

  const reads = useReadContracts({
    allowFailure: true,
    contracts: [
      {
        address: CONTRACT_ADDRESSES.treasuryVault,
        abi: treasuryVaultAbi,
        functionName: "getTotalValueUSD",
        args: [tokenAddrs],
        chainId: TREASURY_CHAIN_ID,
      },
      {
        address: CONTRACT_ADDRESSES.treasuryVault,
        abi: treasuryVaultAbi,
        functionName: "getRunwayMonths",
        args: [tokenAddrs],
        chainId: TREASURY_CHAIN_ID,
      },
      {
        address: CONTRACT_ADDRESSES.treasuryVault,
        abi: treasuryVaultAbi,
        functionName: "getAllocations",
        chainId: TREASURY_CHAIN_ID,
      },
      {
        address: CONTRACT_ADDRESSES.policyEngine,
        abi: policyEngineAbi,
        functionName: "getPolicies",
        chainId: TREASURY_CHAIN_ID,
      },
      {
        address: CONTRACT_ADDRESSES.payrollManager,
        abi: payrollManagerAbi,
        functionName: "getAllPayrolls",
        chainId: TREASURY_CHAIN_ID,
      },
      {
        address: CONTRACT_ADDRESSES.yieldRouter,
        abi: yieldRouterAbi,
        functionName: "getProtocols",
        chainId: TREASURY_CHAIN_ID,
      },
    ],
    query: {
      enabled: canRead,
      refetchInterval: 20000,
      retry: 1,
    },
  });

  const allocate = useWriteContract();
  const executePayroll = useWriteContract();
  const deposit = useWriteContract();

  return useMemo<UseTreasuryContractResult>(() => {
    const [totalRes, runwayRes, allocRes, policyRes, payrollRes, protocolRes] = reads.data ?? [];

    // ── Decode totals ─────────────────────────────────────────
    const totalValueUSDRaw =
      totalRes?.status === "success" ? (totalRes.result as bigint) : undefined;
    const runwayRaw = runwayRes?.status === "success" ? (runwayRes.result as bigint) : undefined;

    let totalValueUSD: number | undefined;
    if (totalValueUSDRaw !== undefined) {
      // Contract sums raw token balances (6-decimal USDG)
      const n6 = Number(formatUnits(totalValueUSDRaw, 6));
      totalValueUSD = n6 > 1e12 ? Number(formatUnits(totalValueUSDRaw, 18)) : n6;
    }

    let runwayMonths: number | undefined;
    if (runwayRaw !== undefined) {
      // Contract returns runway * 1e18
      runwayMonths = Number(formatUnits(runwayRaw, 18));
    }

    // ── ✅ Fixed: Decode allocations using REAL field names ───
    const allocationsRaw =
      allocRes?.status === "success"
        ? (allocRes.result as readonly OnchainAllocation[])
        : undefined;

    const allocations: Asset[] | undefined = allocationsRaw?.map((a) => ({
      symbol: "USDG", // token addr → symbol (simplified)
      amount: Number(formatUnits(a.amount, 6)), // 6-decimal USDG
      valueUSD: Number(formatUnits(a.amount, 6)), // same as amount for stablecoins
      protocol: shortAddr(a.protocol), // use protocol address as label
      risk: "low" as const, // default; no risk field onchain
      address: a.token,
    }));

    // ── ✅ Fixed: Decode policies using REAL field names ──────
    const policiesRaw =
      policyRes?.status === "success" ? (policyRes.result as readonly OnchainPolicy[]) : undefined;

    const policies: Policy[] | undefined = policiesRaw?.map((p) => ({
      id: p.id,
      text: p.description, // ✅ "description" not "text"
      active: p.active,
      violated: false, // ✅ no "violated" field onchain — always false unless derived
    }));

    // ── ✅ Fixed: Decode payrolls using REAL field names ──────
    const payrollsRaw =
      payrollRes?.status === "success"
        ? (payrollRes.result as readonly OnchainPayroll[])
        : undefined;

    const payrolls: (Payroll & { id: `0x${string}` })[] | undefined = payrollsRaw?.map((p) => ({
      id: p.id,
      name: p.label, // ✅ "label" not "name"
      amount: Number(formatUnits(p.amount, 6)),
      token: "USDG", // ✅ no tokenSymbol onchain — hardcode for demo
      nextDate: fmtDate(p.nextExecution), // ✅ "nextExecution" not "nextTimestamp"
      status: payrollStatusFromEntry(p.active, p.nextExecution), // ✅ derived, not from field
    }));

    // ── Decode protocols ──────────────────────────────────────
    const protocolsRaw =
      protocolRes?.status === "success"
        ? (protocolRes.result as readonly OnchainProtocol[])
        : undefined;

    const useLive =
      isConnected && isCorrectChain && (reads.data?.some((r) => r.status === "success") ?? false);

    return {
      isConnected,
      isCorrectChain,
      isLive: useLive,
      isLoading: reads.isLoading,
      totalValueUSD,
      runwayMonths,
      allocations,
      policies,
      payrolls,
      protocols: protocolsRaw ? [...protocolsRaw] : undefined,
      resolved: {
        totalAUM: totalValueUSD ?? mockTreasury.totalAUM,
        runwayMonths: runwayMonths ?? mockTreasury.runwayMonths,
        allocations: allocations && allocations.length > 0 ? allocations : mockTreasury.assets,
        policies: policies && policies.length > 0 ? policies : mockTreasury.policies,
        payrolls: payrolls && payrolls.length > 0 ? payrolls : mockTreasury.payroll,
      },
      allocate,
      executePayroll,
      deposit,
      callAllocate: (protocol, token, amount) =>
        allocate.writeContract({
          address: CONTRACT_ADDRESSES.treasuryVault,
          abi: treasuryVaultAbi,
          functionName: "allocate",
          args: [protocol, token, amount],
          chainId: TREASURY_CHAIN_ID,
        }),
      callExecutePayroll: (id) =>
        executePayroll.writeContract({
          address: CONTRACT_ADDRESSES.payrollManager,
          abi: payrollManagerAbi,
          functionName: "executePayroll",
          args: [id],
          chainId: TREASURY_CHAIN_ID,
        }),
      callDeposit: (token, amount) =>
        deposit.writeContract({
          address: CONTRACT_ADDRESSES.treasuryVault,
          abi: treasuryVaultAbi,
          functionName: "deposit",
          args: [token, amount],
          chainId: TREASURY_CHAIN_ID,
        }),
    };
  }, [isConnected, isCorrectChain, reads.data, reads.isLoading, allocate, executePayroll, deposit]);
}
