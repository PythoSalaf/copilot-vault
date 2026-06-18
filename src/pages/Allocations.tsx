import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { Card, SeverityBadge } from "@/components/shared/Card";
import { mockTreasury } from "@/lib/mock-treasury";
import { fmtUSD } from "@/lib/format";
import { useTreasuryContract } from "@/hooks/useTreasuryContract";
import { CONTRACT_ADDRESSES, TREASURY_CHAIN_ID } from "@/lib/contracts/addresses";
import { TOKENS, EXPLORER_URLS } from "@/lib/wagmi";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

const yieldProtocols = [
  { protocol: "Aave v3", asset: "USDC", apy: 4.2, risk: "low" as const, liquidity: "$1.2B", recommend: 30 },
  { protocol: "T-Bill Vault", asset: "USDC", apy: 5.1, risk: "low" as const, liquidity: "$680M", recommend: 25 },
  { protocol: "Compound", asset: "USDC", apy: 3.8, risk: "low" as const, liquidity: "$540M", recommend: 10 },
  { protocol: "Pendle", asset: "ETH", apy: 7.4, risk: "medium" as const, liquidity: "$220M", recommend: 8 },
  { protocol: "GMX", asset: "USDC", apy: 12.3, risk: "high" as const, liquidity: "$95M", recommend: 0 },
];

export default function AllocationsPage() {
  const contract = useTreasuryContract();
  const assets = contract.isLive ? contract.resolved.allocations : mockTreasury.assets;
  const totalAUM = contract.isLive && contract.totalValueUSD !== undefined ? contract.totalValueUSD : mockTreasury.totalAUM;
  const t = { ...mockTreasury, assets, totalAUM };
  const [showProposal, setShowProposal] = useState(false);

  const { isPending, data: txHash, error: writeError, reset } = contract.allocate;
  const receipt = useWaitForTransactionReceipt({ hash: txHash, chainId: TREASURY_CHAIN_ID });
  const executing = isPending || receipt.isLoading;

  useEffect(() => {
    if (!txHash) return;
    if (receipt.isSuccess) {
      const explorer = EXPLORER_URLS[TREASURY_CHAIN_ID];
      toast.success("Rebalance executed", {
        description: `${txHash.slice(0, 10)}…${txHash.slice(-6)}`,
        action: { label: "View tx", onClick: () => window.open(`${explorer}/tx/${txHash}`, "_blank") },
      });
      reset();
    }
  }, [receipt.isSuccess, txHash, reset]);

  useEffect(() => {
    if (writeError) toast.error("Transaction failed", { description: writeError.message.split("\n")[0] });
  }, [writeError]);

  const handleExecute = () => {
    const usdc = (TOKENS[TREASURY_CHAIN_ID] ?? []).find((t) => t.symbol === "USDC" || t.symbol === "USDG");
    if (!usdc) { toast.error("No stablecoin token configured for Robinhood Chain Testnet"); return; }
    const amount = parseUnits("127000", usdc.decimals);
    contract.callAllocate(CONTRACT_ADDRESSES.treasuryVault, usdc.address, amount);
  };

  return (
    <div className="p-3 sm:p-6 max-w-[1600px] mx-auto space-y-3 sm:space-y-4">
      <Card title="Allocation map" subtitle="Where treasury funds are deployed">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {t.assets.map((a, i) => {
            const pct = (a.valueUSD / t.totalAUM) * 100;
            const color = a.risk === "low" ? "var(--success)" : a.risk === "medium" ? "var(--warning)" : "var(--destructive)";
            return (
              <div key={i} className="rounded-md border border-border bg-surface-elevated p-4 hover:border-primary/40 transition-colors" style={{ borderTop: `2px solid ${color}` }}>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-sm font-semibold">{a.symbol}</div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{a.risk}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{a.protocol}</div>
                <div className="mt-3 font-mono text-lg">{fmtUSD(a.valueUSD)}</div>
                <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span>{pct.toFixed(1)}% of AUM</span>
                  {a.apy && <span className="text-primary">{a.apy}% apy</span>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card
        title="Yield comparison"
        subtitle="Sorted by risk-adjusted yield"
        action={
          <button onClick={() => setShowProposal(true)} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-xs font-mono uppercase tracking-widest flex items-center gap-2 hover:opacity-90">
            <Sparkles className="size-3.5" /> Optimize
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
                <th className="py-2">Protocol</th>
                <th>Asset</th>
                <th>APY</th>
                <th>Risk</th>
                <th>Liquidity</th>
                <th className="text-right">Recommended</th>
              </tr>
            </thead>
            <tbody>
              {yieldProtocols.map((p, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-surface-elevated/50">
                  <td className="py-3 font-medium">{p.protocol}</td>
                  <td className="font-mono">{p.asset}</td>
                  <td className="font-mono text-primary">{p.apy}%</td>
                  <td><SeverityBadge severity={p.risk === "low" ? "good" : p.risk === "medium" ? "medium" : "high"} /></td>
                  <td className="font-mono text-muted-foreground">{p.liquidity}</td>
                  <td className="text-right font-mono">{p.recommend}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {showProposal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="terminal-card p-5 border-primary/40"
            style={{ boxShadow: "0 0 0 1px var(--primary), 0 12px 32px -16px var(--primary)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <h3 className="font-mono text-sm uppercase tracking-widest text-primary">Rebalance proposal</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Move $127,000 from idle USDC into Aave v3 and T-Bill Vault.</p>
              </div>
              <button onClick={() => setShowProposal(false)} className="text-xs text-muted-foreground hover:text-foreground">Dismiss</button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-md border border-border bg-surface-elevated p-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Reasoning</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2"><ArrowRight className="size-3.5 mt-1 text-primary shrink-0" /> $325k idle USDC earning 0% in the wallet.</li>
                  <li className="flex gap-2"><ArrowRight className="size-3.5 mt-1 text-primary shrink-0" /> T-Bill Vault delivers 5.1% with sovereign-grade backing.</li>
                  <li className="flex gap-2"><ArrowRight className="size-3.5 mt-1 text-primary shrink-0" /> Policy check: ✓ all 4 policies satisfied.</li>
                </ul>
              </div>
              <div className="rounded-md border border-border bg-surface-elevated p-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Impact</div>
                <div className="grid grid-cols-2 gap-3">
                  <div><div className="text-xs text-muted-foreground">Blended APY</div><div className="font-mono text-lg">4.4% → <span className="text-success">5.8%</span></div></div>
                  <div><div className="text-xs text-muted-foreground">Extra yield / mo</div><div className="font-mono text-lg text-success">+$2,970</div></div>
                  <div><div className="text-xs text-muted-foreground">Runway impact</div><div className="font-mono text-lg">+0.9 mo</div></div>
                  <div><div className="text-xs text-muted-foreground">Gas estimate</div><div className="font-mono text-lg">~$0.42</div></div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="h-10 px-4 rounded-md border border-border text-sm hover:border-border-strong">Modify in chat</button>
              <button
                onClick={handleExecute}
                disabled={executing || receipt.isSuccess}
                className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-60"
              >
                {executing ? (
                  <><Loader2 className="size-4 animate-spin" /> {receipt.isLoading ? "Confirming…" : "Sign in wallet…"}</>
                ) : receipt.isSuccess ? (
                  <><CheckCircle2 className="size-4" /> Executed</>
                ) : (
                  "Approve & execute"
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
