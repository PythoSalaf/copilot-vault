import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useWaitForTransactionReceipt } from "wagmi";
import { Card, SeverityBadge } from "@/components/shared/Card";
import { mockTreasury } from "@/lib/mock-treasury";
import { fmtUSD } from "@/lib/format";
import { useTreasuryContract } from "@/hooks/useTreasuryContract";
import { TREASURY_CHAIN_ID } from "@/lib/contracts/addresses";
import { EXPLORER_URLS } from "@/lib/wagmi";
import { CalendarDays, Clock, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

export default function PayrollPage() {
  const contract = useTreasuryContract();
  const liveRows = contract.isLive && contract.payrolls && contract.payrolls.length > 0 ? contract.payrolls : undefined;
  const rows = liveRows ?? mockTreasury.payroll.map((p, i) => ({ ...p, id: undefined as `0x${string}` | undefined, _key: `mock-${i}` }));

  const [activeId, setActiveId] = useState<string | null>(null);
  const { isPending, data: txHash, error: writeError, reset } = contract.executePayroll;
  const receipt = useWaitForTransactionReceipt({ hash: txHash, chainId: TREASURY_CHAIN_ID });

  useEffect(() => {
    if (!txHash) return;
    if (receipt.isSuccess) {
      toast.success("Payroll executed", {
        description: `${txHash.slice(0, 10)}…${txHash.slice(-6)}`,
        action: { label: "View tx", onClick: () => window.open(`${EXPLORER_URLS[TREASURY_CHAIN_ID]}/tx/${txHash}`, "_blank") },
      });
      reset();
      setActiveId(null);
    }
  }, [receipt.isSuccess, txHash, reset]);

  useEffect(() => {
    if (writeError) { toast.error("Payroll execution failed", { description: writeError.message.split("\n")[0] }); setActiveId(null); }
  }, [writeError]);

  const handleExecute = (id: `0x${string}` | undefined) => {
    if (!id) { toast.error("This payroll is not on-chain", { description: "Connect to Robinhood Chain Testnet to execute real payrolls." }); return; }
    setActiveId(id);
    contract.callExecutePayroll(id);
  };

  return (
    <div className="p-3 sm:p-6 max-w-[1600px] mx-auto grid grid-cols-12 gap-3 sm:gap-4">
      <div className="col-span-12 lg:col-span-8 space-y-3 sm:space-y-4">
        <Card title="Scheduled payroll" subtitle="Upcoming team & contractor payments">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
                  <th className="py-2">Recipient</th>
                  <th>Amount</th>
                  <th>Token</th>
                  <th>Next date</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p, i) => {
                  const pending = activeId && p.id === activeId && (isPending || receipt.isLoading);
                  const done = activeId && p.id === activeId && receipt.isSuccess;
                  return (
                    <tr key={p.id ?? `mock-${i}`} className="border-b border-border/50">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-md bg-primary/10 border border-primary/30 grid place-items-center shrink-0">
                            <CalendarDays className="size-4 text-primary" />
                          </div>
                          <span className="truncate">{p.name}</span>
                        </div>
                      </td>
                      <td className="font-mono whitespace-nowrap">{fmtUSD(p.amount)}</td>
                      <td className="font-mono">{p.token}</td>
                      <td className="font-mono text-muted-foreground whitespace-nowrap">{p.nextDate}</td>
                      <td><SeverityBadge severity={p.status === "scheduled" ? "good" : p.status === "pending" ? "medium" : "low"} /></td>
                      <td className="text-right">
                        <button
                          onClick={() => handleExecute(p.id)}
                          disabled={!!pending || !!done}
                          className="h-8 px-3 rounded-md border border-border bg-surface-elevated text-xs font-mono uppercase tracking-widest hover:border-primary/40 disabled:opacity-60 inline-flex items-center gap-1.5"
                        >
                          {pending ? (
                            <><Loader2 className="size-3 animate-spin" /> {receipt.isLoading ? "Confirming" : "Sign"}</>
                          ) : done ? (
                            <><CheckCircle2 className="size-3 text-success" /> Done</>
                          ) : "Execute"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Add payroll">
          <div className="grid md:grid-cols-2 gap-3">
            {[{ label: "Recipient", placeholder: "0x… or ENS" }, { label: "Amount (USD)", placeholder: "5000" }, { label: "Token", placeholder: "USDC" }, { label: "Frequency", placeholder: "Monthly" }].map((f) => (
              <div key={f.label}>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{f.label}</div>
                <input placeholder={f.placeholder} className="w-full h-10 px-3 rounded-md bg-input border border-border text-sm focus:outline-none focus:border-primary/60" />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm">Schedule payment</button>
          </div>
        </Card>
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-3 sm:space-y-4">
        <Card title="Copilot optimizer" action={<Sparkles className="size-4 text-primary" />}>
          <div className="space-y-3">
            <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Optimal window</div>
              <div className="mt-1 font-mono text-sm flex items-center gap-2"><Clock className="size-3.5 text-primary" /> Tue–Thu, 09:00–11:00 UTC</div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Gas is ~38% lower in this window vs Mon mornings. Stable yields settle every Monday so liquidity is unimpacted.</p>
            <button className="w-full h-9 rounded-md border border-border text-xs font-mono uppercase tracking-widest hover:border-primary/40">Move next payroll</button>
          </div>
        </Card>

        <Card title="Coverage">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-muted-foreground uppercase tracking-widest">Payroll runway</span>
                <span className="font-mono text-success">3.2 months</span>
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden"><div className="h-full w-[80%] bg-success" /></div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-muted-foreground uppercase tracking-widest">Liquidity buffer</span>
                <span className="font-mono text-primary">$210k</span>
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden"><div className="h-full w-[60%] bg-primary" /></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
