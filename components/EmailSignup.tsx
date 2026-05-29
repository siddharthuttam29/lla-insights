"use client";

import { Check, Mail, Send } from "lucide-react";
import { useState } from "react";
import { SITE } from "@/lib/site";

// "Jagruk Learners" footer signup. Posts to /api/subscribe; gracefully falls
// back to a mailto: link if the server replies needsSetup=true (i.e. you haven't
// added RESEND_API_KEY yet). No DB on our side either way.

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok" }
  | { kind: "fallback"; mailto: string }
  | { kind: "error"; msg: string };

export default function EmailSignup() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.kind === "loading") return;
    setState({ kind: "loading" });

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        needsSetup?: boolean;
      };

      if (data.ok) {
        setState({ kind: "ok" });
        setEmail("");
        return;
      }

      if (data.needsSetup) {
        // Owner hasn't wired Resend yet, give the user a real way to reach out.
        const subj = encodeURIComponent("I want to join Jagruk Learners");
        const body = encodeURIComponent(
          `Hi,\n\nPlease add ${email || "me"} to the LLA Insights mailing list.\n`
        );
        setState({
          kind: "fallback",
          mailto: `mailto:siddharthuttam.work@gmail.com?subject=${subj}&body=${body}`,
        });
        return;
      }

      setState({ kind: "error", msg: data.error || "Couldn't sign you up." });
    } catch {
      setState({ kind: "error", msg: "Network error, please try again." });
    }
  }

  if (state.kind === "ok") {
    return (
      <div className="rounded-xl border border-cream/20 bg-cream/5 p-4">
        <div className="flex items-center gap-2">
          <Check size={16} className="text-gold" />
          <p className="font-display text-base uppercase tracking-tight text-cream">
            You&apos;re in.
          </p>
        </div>
        <p className="mt-1.5 text-xs text-cream/70">
          New money lessons land in your inbox every few weeks. No spam, ever.
        </p>
      </div>
    );
  }

  if (state.kind === "fallback") {
    return (
      <div className="rounded-xl border border-cream/20 bg-cream/5 p-4">
        <p className="font-display text-base uppercase tracking-tight text-cream">
          One more click
        </p>
        <p className="mt-1.5 text-xs text-cream/70">
          Signups aren&apos;t auto-wired yet, send us a quick email to get added.
        </p>
        <a
          href={state.mailto}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-semibold text-maroon-deep hover:brightness-95"
        >
          <Mail size={14} /> Email to subscribe
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} aria-label="Join Jagruk Learners" className="space-y-2">
      <label htmlFor="jl-email" className="block">
        <span className="font-display text-base uppercase tracking-tight text-cream">
          Join Jagruk Learners
        </span>
        <span className="mt-1 block text-xs text-cream/70">
          One short email when we add new lessons, distilled. No spam.
        </span>
      </label>

      {/* honeypot, hidden from real users */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="jl-email"
          type="email"
          required
          placeholder="you@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state.kind === "loading"}
          className="w-full min-w-0 flex-1 rounded-full border border-cream/20 bg-cream/10 px-4 py-2 text-sm text-cream placeholder:text-cream/40 focus:border-gold focus:bg-cream/15 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={state.kind === "loading" || !email}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-maroon-deep transition hover:brightness-95 disabled:opacity-60"
        >
          <Send size={14} />
          {state.kind === "loading" ? "Joining…" : "Join"}
        </button>
      </div>

      {state.kind === "error" && (
        <p className="text-xs text-gold/90" role="alert">
          {state.msg}
        </p>
      )}
      <p className="sr-only">Powered by Resend, hosted on Vercel. {SITE.name}.</p>
    </form>
  );
}
