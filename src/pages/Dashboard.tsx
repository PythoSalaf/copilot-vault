import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { useOnchainTreasury } from "@/hooks/useOnchainTreasury";
import { useTreasuryContract } from "@/hooks/useTreasuryContract";
import { fmtUSD, fmtNum } from "@/lib/format";
import { Card, MetricCard, SeverityBadge } from "@/components/shared/Card";
import { HealthScoreGauge, RunwayGauge, AnimatedNumber } from "@/components/shared/Metrics";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";
import { EXPLORER_URLS } from "@/lib/wagmi";
import { ArrowDownRight, ArrowUpRight, Sparkles, ExternalLink } from "lucide-react";

const palette = ["var(--chart-1)", "var(--chart-4)", "var(--chart-2)", "var(--chart-5)", "var(--chart-3)"];

function buildRunwaySeries(months: number, burn: number, revenue: number, aum: number) {
  const data: { month: string; cash: number; floor: number }[] = [];
  let cash = aum;
  for (let i = 0; i <= 24; i++) {
    data.push({ month: `M${i}`, cash: Math.max(0, Math.round(cash)), floor: 0 });
    cash -= burn - revenue;
  }
  void months;
  return data;
}

export default function DashboardPage() {
  const { treasury: t } = useOnchainTreasury();
  const contract = useTreasuryContract();

  const totalAUM = contract.isLive && contract.totalValueUSD !== undefined ? contract.totalValueUSD : t.totalAUM;
  const runwayMonths = contract.isLive && contract.runwayMonths !== undefined ? contract.runwayMonths : t.runwayMonths;
  const series = buildRunwaySeries(runwayMonths, t.monthlyBurn, t.monthlyRevenue, totalAUM);

  const allocation = t.assets.map((a) => ({ name: `${a.symbol} · ${a.protocol}`, value: a.valueUSD }));

  const dataLabel = contract.isLive
    ? "live · onchain"
    : contract.isConnected && !contract.isCorrectChain
      ? "demo · wrong network"
      : "demo data";

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto">
      <div className="flex justify-end">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono uppercase tracking-widest ${
            contract.isLive
              ? "border-success/40 bg-success/10 text-success"
              : "border-border bg-surface-elevated text-muted-foreground"
          }`}
        >
          <span className={`size-1.5 rounded-full ${contract.isLive ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
          {dataLabel}
        </span>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-4 flex items-center justify-center !p-6">
          <HealthScoreGauge score={t.healthScore} />
        </Card>
        <div className="col-span-12 lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Total AUM"
            value={<AnimatedNumber value={totalAUM} prefix="$" />}
            hint={contract.isLive ? "live · getTotalValueUSD()" : "across 4 protocols"}
          />
          <div className="terminal-card p-4 flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Runway</div>
              <div className="mt-2 font-mono text-2xl">
                <AnimatedNumber value={runwayMonths} decimals={1} /> mo
              </div>
              <div className="mt-1 text-xs text-warning flex items-center gap-1">
                <ArrowDownRight className="size-3" /> –0.4 vs last wk
              </div>
            </div>
            <RunwayGauge months={runwayMonths} />
          </div>
          <MetricCard
            label="Monthly net burn"
            value={<AnimatedNumber value={t.netMonthlyBurn} prefix="$" />}
            hint={`$${t.monthlyBurn.toLocaleString()} out · $${t.monthlyRevenue.toLocaleString()} in`}
            tone="warning"
          />
          <MetricCard
            label="30d P&L"
            value={
              <span className="text-success flex items-center gap-1">
                <ArrowUpRight className="size-5" />
                <AnimatedNumber value={12480} prefix="$" />
              </span>
            }
            hint="+1.4% yield"
            tone="positive"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <Card title="Runway projection" subtitle="Cash position over the next 24 months">
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id="cash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={10} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={10} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: 12 }}
                    formatter={(v: number) => fmtUSD(v)}
                  />
                  <Area type="monotone" dataKey="cash" stroke="var(--primary)" strokeWidth={2} fill="url(#cash)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Agent insights" action={<div className="flex items-center gap-1.5 text-[11px] text-primary font-mono"><Sparkles className="size-3" /> live</div>}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {t.agentInsights.map((ins, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="rounded-md border border-border bg-surface-elevated p-3 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <SeverityBadge severity={ins.severity} />
                    <span className="text-[10px] text-muted-foreground font-mono">copilot</span>
                  </div>
                  <p className="text-sm text-foreground leading-snug">{ins.message}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-4">
          <Card title="Allocation breakdown" subtitle="By asset and protocol">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:h-72 items-center">
              <div className="h-52 sm:h-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={allocation} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2} stroke="var(--background)">
                      {allocation.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: 11 }}
                      formatter={(v: number) => fmtUSD(v)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {allocation.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="size-2.5 rounded-sm shrink-0" style={{ background: palette[i % palette.length] }} />
                    <span className="font-mono text-muted-foreground truncate flex-1">{a.name}</span>
                    <span className="font-mono text-foreground">{((a.value / t.totalAUM) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Risk exposure">
            <div className="grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as const).map((tier) => {
                const sum = t.assets.filter((a) => a.risk === tier).reduce((s, a) => s + a.valueUSD, 0);
                const pct = (sum / t.totalAUM) * 100;
                const color = tier === "low" ? "var(--success)" : tier === "medium" ? "var(--warning)" : "var(--destructive)";
                return (
                  <div key={tier} className="rounded-md border border-border bg-surface-elevated p-3">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{tier} risk</div>
                    <div className="mt-1 font-mono text-lg" style={{ color }}>{pct.toFixed(0)}%</div>
                    <div className="mt-2 h-1 rounded-full bg-border overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <div className="mt-2 text-[11px] font-mono text-muted-foreground">{fmtUSD(sum)}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <Card title="On-chain balances" subtitle="Per-asset breakdown with live prices and risk tags">
        <AssetTable />
      </Card>
    </div>
  );
}

function AssetTable() {
  const { treasury: t, chainId } = useOnchainTreasury();
  const { isConnected } = useTreasuryContract();
  const baseExplorer = (chainId && EXPLORER_URLS[chainId]) || "https://explorer.testnet.chain.robinhood.com";
  const vaultUrl = `${baseExplorer}/address/${CONTRACT_ADDRESSES.treasuryVault}`;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-2 pr-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Asset</th>
            <th className="py-2 pr-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-right">Balance</th>
            <th className="py-2 pr-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-right">Value (USD)</th>
            <th className="py-2 pr-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Risk</th>
            <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-right">Explorer</th>
          </tr>
        </thead>
        <tbody>
          {t.assets.map((a, i) => (
            <tr key={`${a.symbol}-${i}`} className="border-b border-border/50 hover:bg-surface-elevated/40 transition-colors">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center size-7 rounded-md bg-primary/10 text-primary font-mono text-xs font-bold">
                    {a.symbol.slice(0, 2)}
                  </span>
                  <div>
                    <div className="font-mono text-foreground">{a.symbol}</div>
                    <div className="text-[10px] text-muted-foreground">{a.protocol}</div>
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4 text-right font-mono text-foreground">{fmtNum(a.amount, a.amount < 0.01 ? 6 : 4)}</td>
              <td className="py-3 pr-4 text-right font-mono text-foreground">{fmtUSD(a.valueUSD)}</td>
              <td className="py-3 pr-4"><SeverityBadge severity={a.risk === "high" ? "high" : a.risk === "medium" ? "medium" : "low"} /></td>
              <td className="py-3 text-right">
                {a.explorerUrl || isConnected ? (
                  <a
                    href={a.explorerUrl || vaultUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:text-primary-foreground hover:bg-primary/20 px-2 py-1 rounded transition-colors font-mono text-xs"
                  >
                    <ExternalLink className="size-3" />
                    <span className="hidden sm:inline">view</span>
                  </a>
                ) : (
                  <span className="text-muted-foreground font-mono text-xs">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
