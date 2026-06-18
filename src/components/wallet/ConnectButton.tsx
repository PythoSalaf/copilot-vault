import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { Wallet, ChevronDown, LogOut, Check } from "lucide-react";
import { useState } from "react";
import { SUPPORTED_CHAINS, CHAIN_LABELS } from "@/lib/wagmi";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [open, setOpen] = useState(false);

  if (!isConnected || !address) {
    const injected = connectors.find((c) => c.type === "injected") ?? connectors[0];
    return (
      <button
        onClick={() => injected && connect({ connector: injected })}
        disabled={!injected || isPending}
        className="h-9 px-3 rounded-md border border-border bg-surface-elevated flex items-center gap-2 text-xs font-mono hover:border-primary/40 disabled:opacity-60"
        title={error?.message}
      >
        <Wallet className="size-4 text-primary" />
        {isPending ? "Connecting…" : "Connect wallet"}
      </button>
    );
  }

  const short = `${address.slice(0, 6)}…${address.slice(-4)}`;
  const chainLabel = CHAIN_LABELS[chainId] ?? `Chain ${chainId}`;
  const supported = SUPPORTED_CHAINS.some((c) => c.id === chainId);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-9 px-3 rounded-md border border-border bg-surface-elevated flex items-center gap-2 text-xs font-mono hover:border-primary/40"
      >
        <span
          className={`size-1.5 rounded-full ${supported ? "bg-success" : "bg-destructive"}`}
        />
        <span className="text-muted-foreground">{chainLabel}</span>
        <span className="text-foreground">{short}</span>
        <ChevronDown className="size-3" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-60 rounded-md border border-border bg-popover shadow-lg z-50 p-1 text-xs font-mono">
          <div className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            Network
          </div>
          {SUPPORTED_CHAINS.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                switchChain({ chainId: c.id });
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-surface-elevated"
            >
              <span>{CHAIN_LABELS[c.id] ?? c.name}</span>
              {chainId === c.id && <Check className="size-3 text-primary" />}
            </button>
          ))}
          <div className="my-1 h-px bg-border" />
          <button
            onClick={() => {
              disconnect();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-elevated text-destructive"
          >
            <LogOut className="size-3" /> Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
