import { useState, useMemo } from "react";
import { Card } from "@/components/shared/Card";
import { mockTreasury } from "@/lib/mock-treasury";
import { fmtUSD, fmtNum } from "@/lib/format";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend, CartesianGrid,
} from "recharts";
import { AlertTriangle } from "lucide-react";

function Slider({ label, value, min, max, step, onChange, format }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="font-mono text-sm text-primary">{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-primary" />
    </div>
  );
}

export default function RunwayPage() {
  const t = mockTreasury;
  const [ethPrice, setEthPrice] = useState(2785);
  const [burn, setBurn] = useState(t.monthlyBurn);
  const [revenue, setRevenue] = useState(t.monthlyRevenue);
  const [vestPct, setVestPct] = useState(5);

  const scenarios = useMemo(() => {
    const ethValue = t.assets.find((a) => a.symbol === "ETH")?.amount ?? 0;
    const nonEthAUM = t.totalAUM - (t.assets.find((a) => a.symbol === "ETH")?.valueUSD ?? 0);
    const adjustedAUM = nonEthAUM + ethValue * ethPrice;
    const data: { month: string; base: number; optimistic: number; pessimistic: number }[] = [];
    let b = adjustedAUM, o = adjustedAUM, p = adjustedAUM;
    const netBurn = burn - revenue;
    for (let i = 0; i <= 24; i++) {
      data.push({ month: `M${i}`, base: Math.max(0, Math.round(b)), optimistic: Math.max(0, Math.round(o)), pessimistic: Math.max(0, Math.round(p)) });
      b -= netBurn - (vestPct / 100) * 20000;
      o -= netBurn * 0.7 - (vestPct / 100) * 25000;
      p -= netBurn * 1.4;
    }
    return data;
  }, [ethPrice, burn, revenue, vestPct, t]);

  const runwayMonths = useMemo(() => {
    const zero = scenarios.findIndex((d) => d.base === 0);
    return zero === -1 ? 24 : zero;
  }, [scenarios]);

  return (
    <div className="p-3 sm:p-6 max-w-[1600px] mx-auto grid grid-cols-12 gap-3 sm:gap-4">
      <div className="col-span-12 lg:col-span-8 space-y-4">
        <Card title="Runway projection" subtitle={`Estimated runway: ${runwayMonths} months under base case`}>
          <div className="h-64 sm:h-96">
            <ResponsiveContainer>
              <LineChart data={scenarios}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={10} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: 12 }}
                  formatter={(v: number) => fmtUSD(v)}
                />
                <Legend wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: 11 }} />
                <ReferenceLine x="M0" stroke="var(--muted-foreground)" strokeDasharray="3 3" label={{ value: "today", fill: "var(--muted-foreground)", fontSize: 10 }} />
                <Line type="monotone" dataKey="optimistic" stroke="var(--success)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="base" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="pessimistic" stroke="var(--destructive)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Stress tests" subtitle="One-click scenario simulations">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Market crash –50%", impact: "Runway 7.2 → 4.1 mo", tone: "destructive" },
              { label: "Stablecoin depeg", impact: "AUM –$56k", tone: "warning" },
              { label: "Protocol hack", impact: "Aave $95k at risk", tone: "destructive" },
              { label: "Bear market 12mo", impact: "Runway 7.2 → 3.8 mo", tone: "destructive" },
            ].map((s) => (
              <button key={s.label} className="text-left rounded-md border border-border bg-surface-elevated p-3 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="size-3.5" style={{ color: `var(--${s.tone})` }} />
                  <span className="text-xs font-medium">{s.label}</span>
                </div>
                <div className="font-mono text-[11px] text-muted-foreground">{s.impact}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-4">
        <Card title="Scenario sliders" subtitle="Tune assumptions in real time">
          <div className="space-y-5">
            <Slider label="ETH Price" value={ethPrice} min={1000} max={6000} step={50} onChange={setEthPrice} format={(v) => `$${v.toLocaleString()}`} />
            <Slider label="Monthly burn" value={burn} min={20000} max={200000} step={1000} onChange={setBurn} format={(v) => fmtUSD(v)} />
            <Slider label="Monthly revenue" value={revenue} min={0} max={100000} step={500} onChange={setRevenue} format={(v) => fmtUSD(v)} />
            <Slider label="Token vesting / mo" value={vestPct} min={0} max={20} step={0.5} onChange={setVestPct} format={(v) => `${fmtNum(v, 1)}%`} />
          </div>
          <div className="mt-6 rounded-md border border-primary/40 bg-primary/5 p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Estimated runway</div>
            <div className="mt-1 font-mono text-3xl text-primary">{runwayMonths} months</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
