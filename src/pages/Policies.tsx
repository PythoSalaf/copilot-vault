import { useState } from "react";
import { Card, SeverityBadge } from "@/components/shared/Card";
import { mockTreasury } from "@/lib/mock-treasury";
import { useTreasuryContract } from "@/hooks/useTreasuryContract";
import { Sparkles, ShieldAlert, ShieldCheck } from "lucide-react";

export default function PoliciesPage() {
  const contract = useTreasuryContract();
  const policies = contract.isLive && contract.policies && contract.policies.length > 0 ? contract.policies : mockTreasury.policies;
  const t = { ...mockTreasury, policies };
  const [draft, setDraft] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const parse = () => {
    if (!draft.trim()) return;
    setPreview(JSON.stringify({ type: "natural_language_rule", source: draft.trim(), parsed: { condition: "auto-derived", action: "block_or_alert" } }, null, 2));
  };

  return (
    <div className="p-3 sm:p-6 max-w-[1600px] mx-auto grid grid-cols-12 gap-3 sm:gap-4">
      <div className="col-span-12 lg:col-span-8 space-y-4">
        <Card title="Active policies" subtitle={`${t.policies.length} rules · ${t.policies.filter((p) => p.violated).length} violated`}>
          <div className="space-y-2">
            {t.policies.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-md border border-border bg-surface-elevated p-3">
                {p.violated ? <ShieldAlert className="size-4 text-destructive shrink-0" /> : <ShieldCheck className="size-4 text-success shrink-0" />}
                <div className="flex-1">
                  <div className="text-sm">{p.text}</div>
                  <div className="text-[11px] text-muted-foreground font-mono mt-0.5">id: {p.id}</div>
                </div>
                <SeverityBadge severity={p.violated ? "high" : "good"} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Natural language policy" subtitle="Describe a rule in plain English — copilot translates it into a structured policy" action={<Sparkles className="size-4 text-primary" />}>
          <textarea
            rows={4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`e.g. "Don't put money in any protocol that got hacked in the last 2 years"`}
            className="w-full p-3 rounded-md bg-input border border-border text-sm font-sans focus:outline-none focus:border-primary/60"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => { setDraft(""); setPreview(null); }} className="h-9 px-4 rounded-md border border-border text-xs">Clear</button>
            <button onClick={parse} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-xs">Parse with copilot</button>
          </div>
          {preview && <pre className="mt-3 p-3 rounded-md border border-primary/30 bg-primary/5 font-mono text-[11px] overflow-x-auto text-foreground">{preview}</pre>}
        </Card>
      </div>

      <div className="col-span-12 lg:col-span-4">
        <Card title="Current violations">
          <div className="space-y-2">
            {t.policies.filter((p) => p.violated).map((p) => (
              <div key={p.id} className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert className="size-3.5 text-destructive" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-destructive">violation</span>
                </div>
                <p className="text-sm">{p.text}</p>
                <p className="mt-2 text-xs text-muted-foreground">Recommended: rebalance $127k from idle USDC into T-bills to drop concentration to 64%.</p>
              </div>
            ))}
            {t.policies.every((p) => !p.violated) && <div className="text-sm text-muted-foreground">All policies satisfied.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
