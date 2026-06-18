// import { motion, AnimatePresence } from "framer-motion";
// import { Sparkles, X, Send } from "lucide-react";
// import { useState } from "react";
// import { useChat } from "@ai-sdk/react";
// import { DefaultChatTransport, type UIMessage } from "ai";
// import { cn } from "@/lib/utils";

// const suggestions = [
//   "How long can we survive if ETH drops 40%?",
//   "Optimize our treasury for low risk over 6 months",
//   "What's our biggest financial risk right now?",
// ];

// export function AgentPanel() {
//   const [open, setOpen] = useState(false);
//   const [input, setInput] = useState("");
//   const { messages, sendMessage, status } = useChat({
//     transport: new DefaultChatTransport({ api: "/api/chat" }),
//   });
//   const busy = status === "submitted" || status === "streaming";

//   const send = (text: string) => {
//     if (!text.trim() || busy) return;
//     sendMessage({ text: text.trim() });
//     setInput("");
//   };

//   return (
//     <>
//       <button
//         onClick={() => setOpen(true)}
//         className="fixed z-30 grid transition-transform rounded-full bottom-6 right-6 size-14 bg-primary text-primary-foreground place-items-center shadow-glow pulse-ring hover:scale-105"
//         aria-label="Open Copilot"
//       >
//         <Sparkles className="size-6" />
//       </button>

//       <AnimatePresence>
//         {open && (
//           <>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
//               onClick={() => setOpen(false)}
//             />
//             <motion.aside
//               initial={{ x: 400, opacity: 0 }}
//               animate={{ x: 0, opacity: 1 }}
//               exit={{ x: 400, opacity: 0 }}
//               transition={{ type: "spring", stiffness: 240, damping: 28 }}
//               className="fixed top-0 right-0 h-full w-full sm:w-[380px] max-w-full z-50 bg-surface border-l border-border flex flex-col"
//             >
//               <div className="flex items-center justify-between px-4 border-b h-14 border-border">
//                 <div className="flex items-center gap-2">
//                   <div className="grid border rounded-md size-7 bg-primary/15 border-primary/40 place-items-center">
//                     <Sparkles className="size-3.5 text-primary" />
//                   </div>
//                   <div className="font-mono text-sm">copilot</div>
//                 </div>
//                 <button onClick={() => setOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
//                   <X className="size-4" />
//                 </button>
//               </div>

//               <div className="flex-1 p-4 space-y-4 overflow-y-auto">
//                 {messages.length === 0 && (
//                   <div className="space-y-2">
//                     <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">Try asking</p>
//                     {suggestions.map((s) => (
//                       <button
//                         key={s}
//                         onClick={() => send(s)}
//                         className="w-full p-3 text-sm text-left transition-colors border rounded-md border-border bg-surface-elevated hover:border-primary/40"
//                       >
//                         {s}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//                 {messages.map((m) => (
//                   <MessageBubble key={m.id} message={m} />
//                 ))}
//                 {busy && messages.at(-1)?.role !== "assistant" && (
//                   <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
//                     <span className="size-1.5 rounded-full bg-primary animate-bounce" />
//                     <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:120ms]" />
//                     <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:240ms]" />
//                   </div>
//                 )}
//               </div>

//               <form
//                 onSubmit={(e) => { e.preventDefault(); send(input); }}
//                 className="flex gap-2 p-3 border-t border-border"
//               >
//                 <input
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   placeholder="Ask the copilot…"
//                   className="flex-1 h-10 px-3 text-sm border rounded-md bg-input border-border focus:outline-none focus:border-primary/60"
//                 />
//                 <button
//                   type="submit"
//                   disabled={busy || !input.trim()}
//                   className="grid rounded-md size-10 bg-primary text-primary-foreground place-items-center disabled:opacity-40"
//                 >
//                   <Send className="size-4" />
//                 </button>
//               </form>
//             </motion.aside>
//           </>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }

// function MessageBubble({ message }: { message: UIMessage }) {
//   const text = message.parts
//     .map((p) => (p.type === "text" ? p.text : ""))
//     .join("");
//   const isUser = message.role === "user";
//   return (
//     <div className={cn("flex gap-3", isUser && "justify-end")}>
//       {!isUser && (
//         <div className="grid mt-1 border rounded-full size-7 bg-primary/15 border-primary/40 place-items-center shrink-0">
//           <span className="text-primary text-[10px] font-mono">AI</span>
//         </div>
//       )}
//       <div
//         className={cn(
//           "max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap",
//           isUser
//             ? "bg-surface-elevated border border-border rounded-lg px-3 py-2"
//             : "text-foreground border-l-2 border-primary/60 pl-3",
//         )}
//       >
//         {text}
//       </div>
//     </div>
//   );
// }

// AgentPanel.tsx
// Updated: removed @ai-sdk/react dependency, now streams from Groq via /api/chat
// Drop-in replacement — UI is identical, only the data layer changes

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useOnchainTreasury } from "@/hooks/useOnchainTreasury";
import { buildTreasuryContext } from "@/lib/mock-treasury";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "How long can we survive if ETH drops 40%?",
  "Optimize our treasury for low risk over 6 months",
  "What's our biggest financial risk right now?",
];

export function AgentPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { treasury: t } = useOnchainTreasury();

  // Auto-scroll when new content arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setBusy(true);

    // Build full history for Groq
    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          context: buildTreasuryContext(t), // live treasury data as context
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      if (!res.body) throw new Error("No response body");

      // Add empty assistant message — we'll stream into it
      const assistantId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);

            // Vercel AI SDK SSE format (from our route.ts)
            if (parsed.type === "text-delta" && parsed.textDelta) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: m.content + parsed.textDelta } : m,
                ),
              );
            }

            // Plain Groq delta format (fallback)
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + delta } : m)),
              );
            }
          } catch {
            // Not JSON — skip
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: `Error: ${err instanceof Error ? err.message : "Unknown error"}. Make sure GROQ_API_KEY is set in .env.local`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed z-30 grid transition-transform rounded-full bottom-6 right-6 size-14 bg-primary text-primary-foreground place-items-center shadow-glow pulse-ring hover:scale-105"
        aria-label="Open Copilot"
      >
        <Sparkles className="size-6" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Slide-in panel */}
            <motion.aside
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 28 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[380px] max-w-full z-50 bg-surface border-l border-border flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 border-b h-14 border-border">
                <div className="flex items-center gap-2">
                  <div className="grid border rounded-md size-7 bg-primary/15 border-primary/40 place-items-center">
                    <Sparkles className="size-3.5 text-primary" />
                  </div>
                  <div>
                    <div className="font-mono text-sm">copilot</div>
                    <div className="text-[10px] text-muted-foreground">groq · llama-3.3-70b</div>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.length === 0 && (
                  <div className="space-y-2">
                    <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
                      Try asking
                    </p>
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="w-full p-3 text-sm text-left transition-colors border rounded-md border-border bg-surface-elevated hover:border-primary/40"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {messages.map((m) => (
                  <MessageBubble key={m.id} role={m.role} content={m.content} />
                ))}

                {/* Thinking dots — only show if last message isn't assistant yet */}
                {busy && messages.at(-1)?.role !== "assistant" && (
                  <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-primary animate-bounce" />
                    <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:120ms]" />
                    <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:240ms]" />
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex gap-2 p-3 border-t border-border"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask the copilot…"
                  className="flex-1 h-10 px-3 text-sm border rounded-md bg-input border-border focus:outline-none focus:border-primary/60"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="grid rounded-md size-10 bg-primary text-primary-foreground place-items-center disabled:opacity-40"
                >
                  <Send className="size-4" />
                </button>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function MessageBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "justify-end")}>
      {!isUser && (
        <div className="grid mt-1 border rounded-full size-7 bg-primary/15 border-primary/40 place-items-center shrink-0">
          <span className="text-primary text-[10px] font-mono">AI</span>
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-surface-elevated border border-border rounded-lg px-3 py-2"
            : "text-foreground border-l-2 border-primary/60 pl-3",
        )}
      >
        {content}
        {/* Blinking cursor while streaming empty message */}
        {!isUser && content === "" && (
          <span className="inline-block w-1.5 h-4 bg-primary/70 animate-pulse ml-0.5" />
        )}
      </div>
    </div>
  );
}
