"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

function renderMessageText(text: string) {
  // Safety net: even though the system prompt tells the model not to use
  // markdown, models occasionally slip and use **bold** anyway. Rather than
  // showing raw asterisks, render them as actual bold text.
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    const boldMatch = part.match(/^\*\*(.*)\*\*$/);
    if (boldMatch) {
      return <strong key={i}>{boldMatch[1]}</strong>;
    }
    return part;
  });
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [notified, setNotified] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open && !greeted) {
      setGreeted(true);
      void sendToServer([
        {
          role: "user",
          content: "(A visitor just opened the chat window. Greet them.)",
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function sendToServer(newHistory: Message[]) {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory, notifiedAlready: notified }),
      });
      if (!res.ok) {
        throw new Error("Request failed");
      }
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
      setHistory([...newHistory, { role: "assistant", content: data.reply }]);
      if (data.notified) setNotified(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry — something went wrong on our end. Please call us directly, or try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    const newHistory: Message[] = [...history, { role: "user", content: text }];
    setHistory(newHistory);
    setInput("");
    void sendToServer(newHistory);
  }

  return (
    <>
      {/* Floating launcher button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-ink text-parchment px-5 py-3.5 shadow-panel hover:bg-[#22335A] transition-colors"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
          </span>
          <span className="text-sm font-semibold">Chat with us</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[50vw] sm:max-w-[520px] sm:min-w-[380px] h-[75vh] sm:h-[65vh] sm:max-h-[680px] bg-paper rounded-xl border border-line shadow-panel flex flex-col overflow-hidden">
          <div className="bg-ink text-parchment px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Chat with us</div>
              <div className="text-[11px] text-[#C9C2AE]">
                Usually replies instantly
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-[#C9C2AE] hover:text-white text-lg leading-none px-1"
            >
              ×
            </button>
          </div>

          <div
            ref={logRef}
            className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-[#FBF9F4]"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[82%] px-3 py-2 rounded-lg text-[13px] leading-snug whitespace-pre-wrap ${
                  m.role === "user"
                    ? "self-end bg-ink text-parchment"
                    : "self-start bg-paper border border-line text-ink"
                }`}
              >
                {renderMessageText(m.text)}
              </div>
            ))}
            {loading && (
              <div className="self-start text-[12.5px] italic text-slate">
                Typing…
              </div>
            )}
          </div>

          <div className="flex border-t border-line bg-paper">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              disabled={loading}
              placeholder="Type a message…"
              className="flex-1 px-3 py-2.5 text-[13px] outline-none disabled:bg-paper"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-brass hover:bg-brass-dark disabled:opacity-50 text-white text-xs font-semibold px-4"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
