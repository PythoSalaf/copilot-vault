import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fmtNum } from "@/lib/format";

export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1200;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span className={className}>
      {prefix}
      {fmtNum(v, decimals)}
      {suffix}
    </span>
  );
}

export function HealthScoreGauge({ score }: { score: number }) {
  const color =
    score >= 70 ? "var(--success)" : score >= 40 ? "var(--warning)" : "var(--destructive)";
  const label = score >= 70 ? "Healthy" : score >= 40 ? "Watch" : "Critical";
  const circumference = 2 * Math.PI * 42;
  const dash = (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="6" />
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${dash} ${circumference}` }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatedNumber value={score} className="font-mono text-3xl text-foreground" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mt-1">
            score
          </span>
        </div>
      </div>
      <span className="mt-2 text-xs font-mono uppercase tracking-widest" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

export function RunwayGauge({ months }: { months: number }) {
  const color =
    months > 12 ? "var(--success)" : months > 6 ? "var(--warning)" : "var(--destructive)";
  const circumference = 2 * Math.PI * 42;
  const dash = (Math.min(months, 24) / 24) * circumference;

  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="6" />
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${dash} ${circumference}` }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedNumber value={months} decimals={1} className="font-mono text-xs leading-none" />
        <span className="text-[8px] uppercase tracking-widest text-muted-foreground font-mono">
          mo
        </span>
      </div>
    </div>
  );
}
