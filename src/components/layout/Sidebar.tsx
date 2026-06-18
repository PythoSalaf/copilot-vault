import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingDown,
  Layers,
  CalendarClock,
  ShieldCheck,
  Sparkles,
  Activity,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/runway", label: "Runway", icon: TrendingDown },
  { to: "/allocations", label: "Allocations", icon: Layers },
  { to: "/payroll", label: "Payroll", icon: CalendarClock },
  { to: "/policies", label: "Policies", icon: ShieldCheck },
  { to: "/agent", label: "Copilot", icon: Sparkles },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 p-3 space-y-1">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <NavLink
            key={it.to}
            to={it.to}
            onClick={onNavigate}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              "text-sidebar-foreground/80 hover:text-foreground hover:bg-sidebar-accent",
              isActive && "bg-sidebar-accent text-foreground shadow-[inset_2px_0_0_0_var(--primary)]",
            )}
          >
            <Icon className="size-4" />
            <span>{it.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

function SidebarBrand() {
  return (
    <div className="px-5 h-16 flex items-center gap-2 border-b border-sidebar-border">
      <div className="size-7 rounded-md bg-primary/15 border border-primary/40 grid place-items-center">
        <Activity className="size-4 text-primary" />
      </div>
      <div className="font-mono text-sm tracking-tight">
        <span className="text-foreground">treasury</span>
        <span className="text-primary">.copilot</span>
      </div>
    </div>
  );
}

function NetworkBadge() {
  return (
    <div className="p-3 border-t border-sidebar-border">
      <div className="rounded-md border border-border bg-surface-elevated/60 p-3">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
          Network
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-mono">Robinhood Chain · testnet</span>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-[220px] shrink-0 flex-col border-r border-border bg-sidebar">
      <SidebarBrand />
      <NavList />
      <NetworkBadge />
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed top-0 left-0 h-full w-[260px] z-50 bg-sidebar border-r border-border flex flex-col md:hidden"
          >
            <div className="flex items-center justify-between border-b border-sidebar-border">
              <SidebarBrand />
              <button
                onClick={onClose}
                className="mr-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
            </div>
            <NavList onNavigate={onClose} />
            <NetworkBadge />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
