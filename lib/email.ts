import { Resend } from "resend";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type LeadSummary = {
  name?: string;
  phone?: string;
  incident?: string;
  when?: string;
  location?: string;
  injured?: string;
};

const FIRM_NAME = process.env.FIRM_NAME || "Vegas Injury Partners";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderTranscript(messages: ChatMessage[]): string {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => {
      const label = m.role === "user" ? "Visitor" : "AI Assistant";
      // Strip our internal status/summary tags from assistant messages
      // before they ever reach a human inbox.
      const clean = m.content
        .replace(/\[\[SUMMARY:[\s\S]*?\]\]/g, "")
        .replace(/\[\[STATUS:[\s\S]*?\]\]/g, "")
        .trim();
      if (!clean) return "";
      return `<p style="margin:0 0 10px;"><strong>${label}:</strong> ${escapeHtml(
        clean
      )}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}

export async function sendLeadEmail({
  summary,
  messages,
  state,
}: {
  summary: LeadSummary;
  messages: ChatMessage[];
  state: "handoff" | "flagged";
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = (process.env.NOTIFY_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (!apiKey || to.length === 0) {
    console.warn(
      "Email not sent: RESEND_API_KEY or NOTIFY_EMAILS is not configured."
    );
    return { sent: false, reason: "not-configured" };
  }

  const resend = new Resend(apiKey);

  const urgentTag =
    state === "flagged"
      ? `<span style="background:#A83B32;color:#fff;padding:3px 8px;border-radius:4px;font-size:12px;font-weight:600;">URGENT — REVIEW ASAP</span>`
      : `<span style="background:#3E6B4F;color:#fff;padding:3px 8px;border-radius:4px;font-size:12px;font-weight:600;">NEW LEAD</span>`;

  const subject =
    state === "flagged"
      ? `⚠ Urgent: New intake lead — ${summary.name || "unknown name"}`
      : `New website lead — ${summary.name || "unknown name"}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
      <div style="margin-bottom:14px;">${urgentTag}</div>
      <h2 style="margin:0 0 4px;color:#17233D;">New intake from ${escapeHtml(
        FIRM_NAME
      )} website</h2>
      <p style="color:#5B6472;font-size:13px;margin:0 0 20px;">Captured automatically by the AI intake assistant.</p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tbody>
          <tr><td style="padding:6px 0;color:#5B6472;font-size:13px;width:110px;">Name</td><td style="padding:6px 0;font-size:14px;font-weight:600;">${escapeHtml(
            summary.name || "Not provided"
          )}</td></tr>
          <tr><td style="padding:6px 0;color:#5B6472;font-size:13px;">Phone</td><td style="padding:6px 0;font-size:14px;font-weight:600;">${escapeHtml(
            summary.phone || "Not provided"
          )}</td></tr>
          <tr><td style="padding:6px 0;color:#5B6472;font-size:13px;">Incident</td><td style="padding:6px 0;font-size:14px;">${escapeHtml(
            summary.incident || "Not provided"
          )}</td></tr>
          <tr><td style="padding:6px 0;color:#5B6472;font-size:13px;">When</td><td style="padding:6px 0;font-size:14px;">${escapeHtml(
            summary.when || "Not provided"
          )}</td></tr>
          <tr><td style="padding:6px 0;color:#5B6472;font-size:13px;">Location</td><td style="padding:6px 0;font-size:14px;">${escapeHtml(
            summary.location || "Not provided"
          )}</td></tr>
          <tr><td style="padding:6px 0;color:#5B6472;font-size:13px;">Injured</td><td style="padding:6px 0;font-size:14px;">${escapeHtml(
            summary.injured || "Not provided"
          )}</td></tr>
        </tbody>
      </table>

      <h3 style="margin:0 0 8px;font-size:14px;color:#17233D;">Full conversation</h3>
      <div style="background:#FBF9F4;border:1px solid #E2D9C6;border-radius:8px;padding:14px 16px;font-size:13px;line-height:1.5;color:#17233D;">
        ${renderTranscript(messages)}
      </div>

      <p style="color:#5B6472;font-size:11px;margin-top:20px;">This lead was captured by your website's AI intake assistant. Reply directly to the visitor using the phone number above.</p>
    </div>
  `;

  const result = await resend.emails.send({
    from: process.env.NOTIFY_FROM || "Intake Assistant <intake@resend.dev>",
    to,
    subject,
    html,
  });

  return { sent: true, result };
}
