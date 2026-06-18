export type AssetRisk = "low" | "medium" | "high";
export type Severity = "low" | "medium" | "high";

export interface Asset {
  symbol: string;
  amount: number;
  valueUSD: number;
  protocol: string;
  risk: AssetRisk;
  apy?: number;
  address?: string;
  explorerUrl?: string;
}

export interface Payroll {
  name: string;
  amount: number;
  token: string;
  nextDate: string;
  status: "scheduled" | "pending" | "executed" | "delayed";
}

export interface Policy {
  id: string;
  text: string;
  active: boolean;
  violated: boolean;
}

export interface AgentInsight {
  severity: Severity;
  message: string;
}

export interface Treasury {
  organization: string;
  totalAUM: number;
  healthScore: number;
  runwayMonths: number;
  assets: Asset[];
  monthlyBurn: number;
  monthlyRevenue: number;
  netMonthlyBurn: number;
  payroll: Payroll[];
  policies: Policy[];
  agentInsights: AgentInsight[];
}

export const mockTreasury: Treasury = {
  organization: "BuildDAO",
  totalAUM: 847500,
  healthScore: 62,
  runwayMonths: 7.2,
  assets: [
    { symbol: "USDC", amount: 420000, valueUSD: 420000, protocol: "Wallet", risk: "low" },
    { symbol: "ETH", amount: 85.4, valueUSD: 238000, protocol: "Wallet", risk: "medium" },
    { symbol: "USDC", amount: 95000, valueUSD: 95000, protocol: "Aave v3", risk: "low", apy: 4.2 },
    { symbol: "ARB", amount: 24500, valueUSD: 68250, protocol: "Wallet", risk: "high" },
    { symbol: "USDC", amount: 26250, valueUSD: 26250, protocol: "T-Bill Vault", risk: "low", apy: 5.1 },
  ],
  monthlyBurn: 98500,
  monthlyRevenue: 14200,
  netMonthlyBurn: 84300,
  payroll: [
    { name: "Core team (4)", amount: 52000, token: "USDC", nextDate: "2026-06-01", status: "scheduled" },
    { name: "Contractors (2)", amount: 18000, token: "USDC", nextDate: "2026-06-15", status: "scheduled" },
    { name: "Grants payout", amount: 12000, token: "ARB", nextDate: "2026-07-01", status: "pending" },
  ],
  policies: [
    { id: "p1", text: "Max 30% in single protocol", active: true, violated: false },
    { id: "p2", text: "Keep 3 months payroll liquid", active: true, violated: false },
    { id: "p3", text: "Require multisig for tx > $10,000", active: true, violated: false },
    { id: "p4", text: "Max 70% stablecoin concentration", active: true, violated: true },
  ],
  agentInsights: [
    { severity: "high", message: "Stablecoin concentration at 71.3% — policy threshold exceeded." },
    { severity: "medium", message: "ETH holdings underperforming. 10% reallocation to T-bills could add $2,840/mo yield." },
    { severity: "low", message: "Runway improving trend. +0.3 months since last week." },
  ],
};

export function buildTreasuryContext(t: Treasury): string {
  const stable = t.assets.filter((a) => a.symbol === "USDC").reduce((s, a) => s + a.valueUSD, 0);
  const stablePct = ((stable / t.totalAUM) * 100).toFixed(1);
  return [
    `Organization: ${t.organization}`,
    `Total AUM: $${t.totalAUM.toLocaleString()}`,
    `Health Score: ${t.healthScore}/100`,
    `Runway: ${t.runwayMonths} months`,
    `Monthly burn: $${t.monthlyBurn.toLocaleString()}, revenue: $${t.monthlyRevenue.toLocaleString()}, net burn: $${t.netMonthlyBurn.toLocaleString()}`,
    `Stablecoin concentration: ${stablePct}%`,
    `Assets:`,
    ...t.assets.map(
      (a) =>
        `  - ${a.amount.toLocaleString()} ${a.symbol} on ${a.protocol} = $${a.valueUSD.toLocaleString()} (risk: ${a.risk}${a.apy ? `, apy: ${a.apy}%` : ""})`,
    ),
    `Policies:`,
    ...t.policies.map((p) => `  - [${p.violated ? "VIOLATED" : "ok"}] ${p.text}`),
    `Upcoming payroll:`,
    ...t.payroll.map((p) => `  - ${p.name}: $${p.amount.toLocaleString()} ${p.token} on ${p.nextDate} (${p.status})`),
  ].join("\n");
}
