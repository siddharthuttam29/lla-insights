// POST /api/subscribe — Footer email capture for "Jagruk Learners".
//
// Zero-DB design: forwards to Resend's hosted services so we never store an
// email ourselves. Behaviour falls through these branches in order:
//
//  1. RESEND_API_KEY + RESEND_AUDIENCE_ID → add the contact to a Resend
//     audience (a managed mailing list you can later email in one click).
//  2. RESEND_API_KEY + RESEND_NOTIFY_EMAIL → email the new signup to you,
//     no audience setup required. Subject: "New Jagruk Learner: <email>".
//  3. Nothing configured → 503 with {needsSetup:true}. The client form
//     falls back to a mailto: link so a user can still reach you.
//
// Set env vars in Vercel: Project → Settings → Environment Variables.
// Grab a free key at resend.com (3000 emails/mo, 100 contacts on free).
//
// Bot defence: a hidden "company" honeypot field. Real users leave it blank;
// most spam bots fill every input.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ORIGIN_BRAND = "Jagruk Learners";

export async function POST(req: NextRequest) {
  let body: { email?: string; company?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot: any value means it's a bot. Return "success" so they don't retry.
  if (body.company && body.company.trim() !== "") {
    return NextResponse.json({ ok: true, status: "subscribed" });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  const notifyEmail = process.env.RESEND_NOTIFY_EMAIL;
  const fromAddr = process.env.RESEND_FROM || "onboarding@resend.dev";

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, needsSetup: true, error: "Signups are not configured yet." },
      { status: 503 }
    );
  }

  try {
    if (audienceId) {
      // Path 1: add to an audience (real mailing list).
      const res = await fetch(
        `https://api.resend.com/audiences/${audienceId}/contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, unsubscribed: false }),
        }
      );
      // Resend returns 422 if contact already exists, which we treat as success.
      if (!res.ok && res.status !== 422) {
        const t = await res.text();
        console.error("Resend audience error", res.status, t);
        return NextResponse.json(
          { ok: false, error: "Couldn't add you right now, please try again." },
          { status: 502 }
        );
      }
      return NextResponse.json({ ok: true, status: "subscribed" });
    }

    if (notifyEmail) {
      // Path 2: just forward a notification email to the site owner.
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${ORIGIN_BRAND} <${fromAddr}>`,
          to: notifyEmail,
          subject: `New ${ORIGIN_BRAND}: ${email}`,
          html: `<p>New signup on LLA Insights:</p><p><strong>${email}</strong></p>`,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        console.error("Resend send error", res.status, t);
        return NextResponse.json(
          { ok: false, error: "Couldn't add you right now, please try again." },
          { status: 502 }
        );
      }
      return NextResponse.json({ ok: true, status: "notified" });
    }

    return NextResponse.json(
      { ok: false, needsSetup: true, error: "Signups are not configured yet." },
      { status: 503 }
    );
  } catch (err) {
    console.error("subscribe handler error", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong, please try again." },
      { status: 500 }
    );
  }
}
