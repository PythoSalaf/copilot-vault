import { AlertTriangle, Info, Loader2, WifiOff } from "lucide-react";
import { useOnchainTreasury } from "@/hooks/useOnchainTreasury";

export function TreasuryStatusBanner() {
  const { status, errors, chainLabel, isLive } = useOnchainTreasury();

  if (status === "live") return null;

  const config = {
    demo: {
      icon: Info,
      tone: "border-border bg-surface-elevated text-muted-foreground",
      iconColor: "text-muted-foreground",
      title: "Demo data",
      body: "Connect a wallet to load live on-chain balances.",
    },
    loading: {
      icon: Loader2,
      tone: "border-primary/30 bg-primary/5 text-foreground",
      iconColor: "text-primary animate-spin",
      title: "Syncing on-chain state…",
      body: `Reading balances on ${chainLabel ?? "current chain"}.`,
    },
    partial: {
      icon: AlertTriangle,
      tone: "border-warning/40 bg-warning/10 text-foreground",
      iconColor: "text-warning",
      title: "Partial on-chain data",
      body: `Some reads on ${chainLabel ?? "this chain"} failed. Showing what loaded successfully.`,
    },
    error: {
      icon: WifiOff,
      tone: "border-destructive/40 bg-destructive/10 text-foreground",
      iconColor: "text-destructive",
      title: "On-chain reads failed",
      body: `Falling back to demo data while ${chainLabel ?? "the RPC"} is unreachable.`,
    },
    unsupported: {
      icon: AlertTriangle,
      tone: "border-warning/40 bg-warning/10 text-foreground",
      iconColor: "text-warning",
      title: "Unsupported network",
      body: "Switch to Arbitrum Sepolia or Robinhood Chain Testnet to enable live reads.",
    },
  }[status];

  const Icon = config.icon;

  return (
    <div className={`rounded-md border px-3 py-2.5 sm:px-4 sm:py-3 flex gap-3 ${config.tone}`}>
      <Icon className={`size-4 mt-0.5 shrink-0 ${config.iconColor}`} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-mono text-[11px] uppercase tracking-widest">{config.title}</span>
          {isLive && (
            <span className="px-1.5 py-0.5 rounded border border-success/40 bg-success/10 text-success text-[9px] font-mono uppercase tracking-widest">
              live · partial
            </span>
          )}
        </div>
        <p className="text-xs mt-1 text-muted-foreground">{config.body}</p>
        {errors.length > 0 && (
          <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
            {errors.slice(0, 4).map((e, i) => (
              <li
                key={i}
                className="text-[11px] font-mono text-muted-foreground break-words"
                title={e.message}
              >
                <span className="text-foreground">
                  {e.symbol ? `[${e.symbol}] ` : `[${e.scope}] `}
                </span>
                {e.message}
              </li>
            ))}
            {errors.length > 4 && (
              <li className="text-[11px] font-mono text-muted-foreground">
                +{errors.length - 4} more
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
