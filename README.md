# Vegas Injury Partners — Site + AI Intake Assistant

A production-structured example: a law firm marketing site with a chat
widget that captures leads 24/7, qualifies them, and emails a summary +
full transcript to your client's team the moment a real lead comes in.

Built with Next.js (App Router) so it deploys to Vercel with almost no
configuration.

---

## What's actually happening here

- **The chat widget** (`components/ChatWidget.tsx`) is a client-side React
  component. It never talks to Anthropic directly — it only ever calls
  your own `/api/chat` endpoint.
- **`app/api/chat/route.ts`** is a server-side API route. It holds your
  real Anthropic API key (never exposed to the browser), calls Claude,
  and figures out when a conversation has become a real lead.
- **`lib/systemPrompt.ts`** is the instructions the AI follows — tone,
  what to ask, what it must never do, and a hidden tagging format it uses
  to signal "this is a real lead" back to your server.
- **`lib/email.ts`** sends the notification email via Resend once a lead
  is qualified (or flagged as urgent), to everyone listed in
  `NOTIFY_EMAILS`.

This is the same shape as the demo I showed you earlier, but rebuilt the
way you'd actually want it running on a real client's site: the API key
lives on the server, not in browser JavaScript anyone could inspect.

---

## 1. Prerequisites

- Node.js 18+ installed locally
- A free [Anthropic Console](https://console.anthropic.com) account with
  billing enabled, and an API key (this is separate from claude.ai — it's
  metered, pay-as-you-go, and this is what gives you the real per-token
  cost instead of a SaaS credit markup)
- A free [Resend](https://resend.com) account and API key
- A GitHub account and a [Vercel](https://vercel.com) account (free tier
  is fine to start)

## 2. Local setup

```bash
npm install
cp .env.example .env.local
# now fill in .env.local with your real keys and firm details
npm run dev
```

Visit `http://localhost:3000` — the site and chat widget will be live
locally. Test a few conversations (see the checklist below) before you
touch a real client's domain.

**Note on email while testing:** until you verify your own sending
domain in Resend, use `NOTIFY_FROM=Intake Assistant <onboarding@resend.dev>`
and Resend will only actually deliver to the email address you signed up
with. Verifying a real domain (a 10-minute DNS step in Resend's
dashboard) is required before sending to arbitrary client inboxes.

## 3. Deploy to Vercel

1. Push this project to a new GitHub repository.
2. In Vercel, click **Add New Project** and import that repo.
3. Vercel auto-detects Next.js — no build config needed.
4. Before deploying, add all the same variables from `.env.example` under
   **Project Settings → Environment Variables**.
5. Deploy. Vercel gives you a `*.vercel.app` URL immediately; you can
   attach the client's real domain afterward under **Settings → Domains**.

Every time you push to your GitHub repo's main branch, Vercel redeploys
automatically.

## 4. Reusing this for a different client

Everything client-specific lives in environment variables and
`app/page.tsx` copy — you don't need to touch the API route or the
chat widget logic at all:

- `FIRM_NAME` and `CALLBACK_WINDOW` reshape the AI's own instructions.
- `NOTIFY_EMAILS` controls who gets alerted.
- Colors live in `tailwind.config.ts` (the `ink` / `brass` / `parchment`
  tokens) — swap these per client's brand.
- Page copy, practice areas, and the phone number are plain text/JSX in
  `app/page.tsx` — edit directly.

## 5. If you want to use Lovable for the visual design

Lovable is great for quickly iterating on layout and copy. The cleanest
way to combine it with this project:

1. Use Lovable to design and refine `app/page.tsx` — the marketing page
   itself. Its output is standard React/JSX, so you can copy the
   generated component code in almost directly.
2. **Don't let Lovable touch `components/ChatWidget.tsx` or
   `app/api/chat/route.ts`.** Those hold the actual product logic and the
   secure API key handling — regenerating them from a design tool risks
   breaking the security model (e.g. accidentally calling Anthropic
   directly from the browser with an exposed key).
3. After pulling Lovable's JSX into `page.tsx`, just make sure
   `<ChatWidget />` is still rendered somewhere in the page, and the
   Tailwind class names still resolve against `tailwind.config.ts`.

## 6. Test before going live on a real client site

Same checklist as the build plan — run each of these in your local dev
environment or a Vercel preview deploy:

- A fresh accident, injured, has a police report → should qualify
  smoothly and trigger a "New lead" email.
- An incident from 3+ years ago → should trigger the **urgent** flag and
  a differently-styled "URGENT" email.
- An existing client asking "what's happening with my case?" → should
  redirect to a callback, not attempt to answer.
- Off-topic/spam message → should decline gracefully, no email sent.
- A medical emergency in progress → should tell them to call 911 first.
- Open the browser dev tools → Network tab and confirm no Anthropic API
  key is visible anywhere in the client-side requests (it shouldn't be —
  the browser only ever talks to `/api/chat` on your own domain).

## 7. Cost reality check

At the volume a single PI firm's website realistically generates
(20-150 conversations/month):

- **Anthropic API**: a few dollars a month at most, on Sonnet, for this
  conversation length and volume.
- **Resend**: free, comfortably inside the 3,000 emails/month / 100
  emails/day free tier.
- **Vercel hosting**: free tier covers this easily for a single
  low-traffic client site.

Your real monthly infrastructure cost for one client is realistically
under $10-15/month — which is the whole point of building this yourself
instead of paying a SaaS platform's credit markup and branding fee.

## 8. Known limitations to be upfront about with a client

- The rate limiter in `app/api/chat/route.ts` is in-memory and
  best-effort — fine for a single low-traffic site, but not a hard
  guarantee under serverless scaling. If a client's traffic grows a lot,
  swap it for Upstash Redis (a few lines of code, has a generous free
  tier).
- There's no persistent lead database yet — leads exist as emails only.
  A natural phase-2 upsell is writing each lead to a simple database or
  spreadsheet (Airtable, Google Sheets, or Postgres) in addition to the
  email, so nothing depends on an inbox alone.
