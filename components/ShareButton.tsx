"use client";

import { Check, Copy, Link2, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SITE_URL } from "@/lib/site";

// Native navigator.share on mobile; copy-link + WhatsApp/X/LinkedIn intents on
// desktop, plus "copy as text" (takeaway + deep-link). (BUILD-SPEC §8)
export default function ShareButton({
  insightId,
  takeaway,
  deepLink,
  size = "sm",
}: {
  insightId: string;
  takeaway: string;
  deepLink: string;
  size?: "sm" | "md";
}) {
  const permalink = `${SITE_URL}/insight/${insightId}`;
  const shareText = `${takeaway}\n\nvia LLA Insights`;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"link" | "text" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  async function onClick() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "LLA Insights", text: shareText, url: permalink });
        return;
      } catch {
        /* user cancelled or unsupported, fall through to popover */
      }
    }
    setOpen((v) => !v);
  }

  async function copy(kind: "link" | "text") {
    const payload = kind === "link" ? permalink : `${takeaway}\n${deepLink}`;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* clipboard blocked, ignore */
    }
  }

  const dim = size === "md" ? 18 : 16;
  const enc = encodeURIComponent;
  const intents = [
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(shareText + " " + permalink)}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(permalink)}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(permalink)}` },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={onClick}
        aria-label="Share this lesson"
        aria-haspopup="menu"
        aria-expanded={open}
        className="grid h-8 w-8 place-items-center rounded-full text-muted transition hover:bg-maroon/10 hover:text-maroon focus-visible:ring-brand"
      >
        <Share2 size={dim} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-10 right-0 z-50 w-52 animate-fade-up rounded-xl border border-line bg-card p-1.5 shadow-card-hover"
        >
          <button
            role="menuitem"
            onClick={() => copy("link")}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-cream"
          >
            {copied === "link" ? <Check size={15} className="text-success" /> : <Link2 size={15} />}
            {copied === "link" ? "Link copied" : "Copy link"}
          </button>
          <button
            role="menuitem"
            onClick={() => copy("text")}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-cream"
          >
            {copied === "text" ? <Check size={15} className="text-success" /> : <Copy size={15} />}
            {copied === "text" ? "Text copied" : "Copy as text"}
          </button>
          <div className="my-1 h-px bg-line" />
          {intents.map((i) => (
            <a
              key={i.label}
              role="menuitem"
              href={i.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg px-3 py-2 text-sm text-ink hover:bg-cream"
            >
              Share to {i.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
