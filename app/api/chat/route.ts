import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/systemPrompt";
import { sendLeadEmail, type ChatMessage, type LeadSummary } from "@/lib/email";

export const runtime = "nodejs";

const MAX_MESSAGES = 24; // caps a runaway conversation
const MAX_MESSAGE_LENGTH = 2000; // characters, guards against pasted essays / abuse

// Naive in-memory rate limiter. Good enough for a single low-traffic law
// firm site. Serverless instances are not guaranteed to persist between
// requests, so treat this as a best-effort speed bump, not a hard limit.
// For real production hardening at scale, swap this for Upstash Redis or
// Vercel's Edge Config-based rate limiting.
const requestLog = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 15;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

function parseTags(raw: string) {
  const summaryMatch = raw.match(
    /\[\[SUMMARY:\s*name=(.*?)\s*\|\s*phone=(.*?)\s*\|\s*incident=(.*?)\s*\|\s*when=(.*?)\s*\|\s*location=(.*?)\s*\|\s*injured=(.*?)\]\]/
  );
  const statusMatch = raw.match(
    /\[\[STATUS:\s*state=(\w+)\s*\|\s*note=([^\]]+)\]\]/
  );

  let clean = raw
    .replace(/\[\[SUMMARY:[\s\S]*?\]\]/, "")
    .replace(/\[\[STATUS:[\s\S]*?\]\]/, "")
    .trim();

  const summary: LeadSummary | null = summaryMatch
    ? {
        name: summaryMatch[1].trim(),
        phone: summaryMatch[2].trim(),
        incident: summaryMatch[3].trim(),
        when: summaryMatch[4].trim(),
        location: summaryMatch[5].trim(),
        injured: summaryMatch[6].trim(),
      }
    : null;

  const state = (statusMatch?.[1] as
    | "collecting"
    | "handoff"
    | "flagged"
    | "offtopic"
    | undefined) || "collecting";
  const note = statusMatch?.[2]?.trim() || null;

  return { clean, summary, state, note };
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing ANTHROPIC_API_KEY." },
      { status: 500 }
    );
  }

  let body: { messages?: ChatMessage[]; notifiedAlready?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const incoming = body.messages || [];
  if (incoming.length === 0 || incoming.length > MAX_MESSAGES) {
    return NextResponse.json(
      { error: "Invalid conversation length." },
      { status: 400 }
    );
  }
  for (const m of incoming) {
    if (typeof m.content !== "string" || m.content.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: "Message too long." },
        { status: 400 }
      );
    }
  }

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: buildSystemPrompt(),
      messages: incoming,
    }),
  });

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text();
    console.error("Anthropic API error:", errText);
    return NextResponse.json(
      { error: "The assistant is temporarily unavailable." },
      { status: 502 }
    );
  }

  const data = await anthropicRes.json();
  const textBlock = (data.content || []).find(
    (b: { type: string }) => b.type === "text"
  );
  const raw = textBlock?.text || "Sorry, I'm having trouble responding right now.";

  const { clean, summary, state, note } = parseTags(raw);

  let notified = body.notifiedAlready || false;

  if (!notified && (state === "handoff" || state === "flagged")) {
    try {
      const fullTranscript: ChatMessage[] = [
        ...incoming,
        { role: "assistant", content: raw },
      ];
      await sendLeadEmail({
        summary: summary || {},
        messages: fullTranscript,
        state,
      });
      notified = true;
    } catch (err) {
      // Don't fail the chat response just because email delivery failed —
      // log it so it shows up in Vercel's function logs for follow-up.
      console.error("Failed to send lead email:", err);
    }
  }

  return NextResponse.json({
    reply: clean,
    state,
    note,
    notified,
  });
}
