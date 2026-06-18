import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { AlertTriangle } from "lucide-react";
import { TREASURY_CHAIN_ID } from "@/lib/contracts/addresses";

export function NetworkWarningBanner() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected || chainId === TREASURY_CHAIN_ID) return null;

  return (
    <div className="border-b border-warning/40 bg-warning/10 px-3 sm:px-6 py-2.5 flex items-center gap-3 flex-wrap">
      <AlertTriangle className="size-4 text-warning shrink-0" />
      <span className="text-xs sm:text-sm text-foreground flex-1 min-w-0">
        Switch to <span className="font-mono">Robinhood Chain Testnet</span> to use live data.
      </span>
      <button
        onClick={() => switchChain({ chainId: TREASURY_CHAIN_ID })}
        disabled={isPending}
        className="h-8 px-3 rounded-md border border-warning/60 bg-warning/20 hover:bg-warning/30 text-xs font-mono uppercase tracking-widest disabled:opacity-60"
      >
        {isPending ? "Switching…" : "Switch network"}
      </button>
    </div>
  );
}
