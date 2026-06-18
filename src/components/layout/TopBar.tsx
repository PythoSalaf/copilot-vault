import { Bell, Menu } from "lucide-react";
import { useState } from "react";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { MobileSidebar } from "@/components/layout/Sidebar";
import { useOnchainTreasury } from "@/hooks/useOnchainTreasury";

function scoreColor(score: number) {
  if (score >= 70) return "text-success border-success/40 bg-success/10";
  if (score >= 40) return "text-warning border-warning/40 bg-warning/10";
  return "text-destructive border-destructive/40 bg-destructive/10";
}

const STATUS_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  demo: { label: "demo data", className: "text-muted-foreground border-border bg-surface-elevated" },
  loading: { label: "live · syncing", className: "text-primary border-primary/40 bg-primary/10" },
  live: { label: "live · onchain", className: "text-success border-success/40 bg-success/10" },
  partial: { label: "live · partial", className: "text-warning border-warning/40 bg-warning/10" },
  error: { label: "rpc error", className: "text-destructive border-destructive/40 bg-destructive/10" },
  unsupported: { label: "wrong network", className: "text-warning border-warning/40 bg-warning/10" },
};

export function TopBar() {
  const { treasury, status, errors } = useOnchainTreasury();
  const [menuOpen, setMenuOpen] = useState(false);
  const badge = STATUS_BADGE[status] ?? STATUS_BADGE.demo;
  const tooltip = errors.length > 0 ? errors.map((e) => e.message).join("\n") : undefined;

  return (
    <>
      <header className="h-16 border-b border-border bg-background/70 backdrop-blur px-3 sm:px-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden size-9 grid place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
          <div className="hidden sm:block font-mono text-xs text-muted-foreground uppercase tracking-widest shrink-0">
            Org
          </div>
          <div className="font-mono text-sm truncate min-w-0">{treasury.organization}</div>
          <div
            title={tooltip}
            className={`hidden xs:inline-flex sm:inline-flex ml-1 px-2 py-0.5 rounded border text-[10px] font-mono uppercase tracking-widest shrink-0 ${badge.className}`}
          >
            {badge.label}
          </div>
          <div
            className={`hidden md:inline-flex ml-1 px-2 py-1 rounded border text-[11px] font-mono shrink-0 ${scoreColor(treasury.healthScore)}`}
          >
            Health · {treasury.healthScore}/100
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button className="hidden sm:grid size-9 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-border-strong">
            <Bell className="size-4" />
          </button>
          <ConnectButton />
        </div>
      </header>
      <MobileSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
