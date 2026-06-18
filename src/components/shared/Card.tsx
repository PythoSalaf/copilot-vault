import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Card({
  children,
  className,
  title,
  subtitle,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn("terminal-card p-5", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {title}
              </h3>
            )}
            {subtitle && <p className="text-sm mt-1 text-foreground">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "positive" | "warning" | "danger";
}) {
  const toneClass =
    tone === "positive"
      ? "text-success"
      : tone === "warning"
      ? "text-warning"
      : tone === "danger"
      ? "text-destructive"
      : "text-foreground";
  return (
    <div className="terminal-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-2 font-mono text-2xl", toneClass)}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function SeverityBadge({ severity }: { severity: "low" | "medium" | "high" | "good" }) {
  const map = {
    high: "border-destructive/40 bg-destructive/10 text-destructive",
    medium: "border-warning/40 bg-warning/10 text-warning",
    low: "border-primary/40 bg-primary/10 text-primary",
    good: "border-success/40 bg-success/10 text-success",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded border text-[10px] uppercase tracking-widest font-mono", map[severity])}>
      {severity}
    </span>
  );
}
