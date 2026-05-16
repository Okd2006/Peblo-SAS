"use client";
import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2, ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "ai";
  text: string;
}

// Gemini API history format
interface GeminiHistory {
  role: "user" | "model";
  parts: { text: string }[];
}

const SUGGESTIONS = [
  "Summarize my recent notes",
  "What are good note-taking strategies?",
  "Explain the Feynman technique",
  "How do I stay productive?",
];

export function GeminiSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Build Gemini-format history from current messages (for memory)
  function buildHistory(msgs: Message[]): GeminiHistory[] {
    return msgs.map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));
  }

  async function handleSend(overrideQuery?: string) {
    const q = (overrideQuery ?? query).trim();
    if (!q || loading) return;
    setQuery("");

    const newMessages: Message[] = [...messages, { role: "user", text: q }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          // Send all prior messages as history so Gemini remembers context
          history: buildHistory(messages),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: data.answer || "No response." }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white shadow-xl transition-all duration-200 hover:scale-105 active:scale-95",
          open && "opacity-0 pointer-events-none scale-90"
        )}
        style={{
          background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
          boxShadow: "0 4px 24px rgba(124,58,237,0.45)",
        }}
      >
        <Sparkles size={15} />
        Ask AI
      </button>

      {/* Panel */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl overflow-hidden transition-all duration-200 origin-bottom-right",
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        )}
        style={{
          width: "480px",
          height: "600px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(124,58,237,0.08)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)" }}>
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Ask Gemini
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded-md font-medium"
              style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
              2.5 Flash
            </span>
            {messages.length > 0 && (
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                · {Math.floor(messages.length / 2)} turn{messages.length > 2 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button onClick={() => setMessages([])}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--surface-2)]"
                style={{ color: "var(--text-muted)" }} title="Clear chat">
                <RotateCcw size={13} />
              </button>
            )}
            <button onClick={() => setOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--surface-2)]"
              style={{ color: "var(--text-muted)" }}>
              <ChevronDown size={15} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--accent-light)" }}>
                <Sparkles size={24} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  How can I help?
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                  Powered by Gemini 2.5 Flash · remembers your conversation
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full mt-2">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => handleSend(s)}
                    className="text-xs px-3 py-2.5 rounded-xl text-left leading-snug transition-all hover:border-[var(--accent)]"
                    style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "var(--surface-2)" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "ai" && (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)" }}>
                    <Sparkles size={12} className="text-white" />
                  </div>
                )}
                <div
                  className={cn("rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user" ? "rounded-tr-sm max-w-[75%]" : "rounded-tl-sm flex-1 min-w-0"
                  )}
                  style={msg.role === "user"
                    ? { background: "var(--accent)", color: "white" }
                    : { background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)" }
                  }
                >
                  {msg.role === "user" ? (
                    <p>{msg.text}</p>
                  ) : (
                    <div className="gemini-response">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                          strong: ({ children }) => (
                            <strong className="font-semibold" style={{ color: "var(--text-primary)" }}>{children}</strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic" style={{ color: "var(--text-secondary)" }}>{children}</em>
                          ),
                          ul: ({ children }) => <ul className="my-2 space-y-1.5">{children}</ul>,
                          ol: ({ children }) => <ol className="my-2 space-y-1.5 list-decimal list-inside">{children}</ol>,
                          li: ({ children }) => (
                            <li className="flex items-start gap-2 text-sm" style={{ color: "var(--text-primary)" }}>
                              <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--accent)" }} />
                              <span className="flex-1">{children}</span>
                            </li>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-base font-bold mt-3 mb-1.5" style={{ color: "var(--text-primary)" }}>{children}</h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-sm font-semibold mt-3 mb-1" style={{ color: "var(--text-primary)" }}>{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-medium mt-2 mb-1" style={{ color: "var(--text-secondary)" }}>{children}</h3>
                          ),
                          code: ({ children, className }) => {
                            const isBlock = className?.includes("language-");
                            return isBlock ? (
                              <code className="block my-2 p-3 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre"
                                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--accent)" }}>
                                {children}
                              </code>
                            ) : (
                              <code className="px-1.5 py-0.5 rounded text-xs font-mono"
                                style={{ background: "var(--surface)", color: "var(--accent)", border: "1px solid var(--border)" }}>
                                {children}
                              </code>
                            );
                          },
                          blockquote: ({ children }) => (
                            <blockquote className="pl-3 my-2 italic text-sm"
                              style={{ borderLeft: "3px solid var(--accent)", color: "var(--text-secondary)" }}>
                              {children}
                            </blockquote>
                          ),
                          hr: () => <hr className="my-3" style={{ borderColor: "var(--border)" }} />,
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noreferrer"
                              className="underline underline-offset-2 hover:opacity-70"
                              style={{ color: "var(--accent)" }}>
                              {children}
                            </a>
                          ),
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-2">
                              <table className="text-xs w-full" style={{ borderCollapse: "collapse" }}>{children}</table>
                            </div>
                          ),
                          th: ({ children }) => (
                            <th className="px-3 py-1.5 text-left font-semibold text-xs"
                              style={{ borderBottom: "2px solid var(--border)", color: "var(--text-primary)" }}>{children}</th>
                          ),
                          td: ({ children }) => (
                            <td className="px-3 py-1.5 text-xs"
                              style={{ borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" }}>{children}</td>
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)" }}>
                <Sparkles size={12} className="text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-3"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: "var(--accent)", animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-3 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything…"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--text-primary)", fontFamily: "Inter, sans-serif" }}
            />
            <button onClick={() => handleSend()} disabled={!query.trim() || loading}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 hover:opacity-80 shrink-0"
              style={{ background: "var(--accent)", color: "white" }}>
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            </button>
          </div>
          <p className="text-center text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Gemini remembers this conversation · <kbd>Enter</kbd> to send
          </p>
        </div>
      </div>
    </>
  );
}
