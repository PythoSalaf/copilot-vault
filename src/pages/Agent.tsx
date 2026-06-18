import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useState } from "react";
import { Card } from "@/components/shared/Card";
import { mockTreasury } from "@/lib/mock-treasury";
import { fmtUSD } from "@/lib/format";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const suggestions = [
  "How long can we survive if ETH drops 40%?",
  "Optimize our treasury for low risk over 6 months",
  "Can we afford to hire 2 more engineers?",
  "What's our biggest financial risk right now?",
  "Show me a payroll schedule for next quarter",
];

export default function AgentPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const busy = status === "submitted" || status === "streaming";
  const t = mockTreasury;

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    sendMessage({ text: text.trim() });
    setInput("");
  };

  return (
    <div className="p-3 sm:p-6 max-w-[1600px] mx-auto grid grid-cols-12 gap-3 sm:gap-4 lg:h-[calc(100vh-4rem)]">
      <div className="col-span-12 lg:col-span-8 flex flex-col min-h-[70vh] lg:min-h-0">
        <Card className="flex-1 flex flex-col !p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-primary/15 border border-primary/40 grid place-items-center">
                <Sparkles className="size-3.5 text-primary" />
              </div>
              <div>
                <div className="font-mono text-sm">treasury copilot</div>
                <div className="text-[11px] text-muted-foreground">context-aware · streams live</div>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-success">● online</span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Suggested prompts</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => send(s)} className="text-left text-sm p-3 rounded-md border border-border bg-surface-elevated hover:border-primary/40 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => <Bubble key={m.id} m={m} />)}
            {busy && messages.at(-1)?.role !== "assistant" && <Thinking />}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="p-3 border-t border-border flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about the treasury…"
              className="flex-1 h-11 px-4 rounded-md bg-input border border-border text-sm focus:outline-none focus:border-primary/60"
            />
            <button type="submit" disabled={busy || !input.trim()} className="h-11 px-4 rounded-md bg-primary text-primary-foreground flex items-center gap-2 disabled:opacity-40">
              <Send className="size-4" />
              <span className="text-sm hidden sm:inline">Send</span>
            </button>
          </form>
        </Card>
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-3 sm:space-y-4 lg:overflow-y-auto">
        <Card title="Treasury snapshot" subtitle="Live context fed to the copilot">
          <div className="space-y-2 text-sm">
            <Row label="Total AUM" value={fmtUSD(t.totalAUM)} />
            <Row label="Health" value={`${t.healthScore}/100`} />
            <Row label="Runway" value={`${t.runwayMonths} mo`} />
            <Row label="Net burn" value={`${fmtUSD(t.netMonthlyBurn)}/mo`} />
            <Row label="Stablecoin %" value="71.3%" tone="danger" />
            <Row label="Protocols" value="4 active" />
          </div>
        </Card>
        <Card title="Active policies">
          <ul className="space-y-1.5 text-xs">
            {t.policies.map((p) => (
              <li key={p.id} className="flex items-start gap-2">
                <span className={cn("mt-1 size-1.5 rounded-full", p.violated ? "bg-destructive" : "bg-success")} />
                <span className={cn(p.violated && "text-destructive")}>{p.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "danger" }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground font-mono text-[11px] uppercase tracking-widest">{label}</span>
      <span className={cn("font-mono", tone === "danger" && "text-destructive")}>{value}</span>
    </div>
  );
}

function Thinking() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="size-7 rounded-full bg-primary/15 border border-primary/40 grid place-items-center">
        <span className="text-primary text-[10px] font-mono">AI</span>
      </div>
      <div className="flex gap-1">
        <span className="size-1.5 rounded-full bg-primary animate-bounce" />
        <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:120ms]" />
        <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:240ms]" />
      </div>
    </div>
  );
}

function Bubble({ m }: { m: UIMessage }) {
  const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
  const isUser = m.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "justify-end")}>
      {!isUser && (
        <div className="size-7 rounded-full bg-primary/15 border border-primary/40 grid place-items-center shrink-0 mt-1">
          <span className="text-primary text-[10px] font-mono">AI</span>
        </div>
      )}
      <div className={cn("max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap", isUser ? "bg-surface-elevated border border-border rounded-lg px-3 py-2" : "border-l-2 border-primary/60 pl-3")}>
        {text}
      </div>
    </div>
  );
}
