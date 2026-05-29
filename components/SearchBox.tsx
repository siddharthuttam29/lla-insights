"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Global header search. The URL (?q=) is the single source of truth, so the
// home Explorer re-renders as you type and any filtered state stays shareable.
// On non-home routes, submitting jumps to "/" with the query applied.
export default function SearchBox({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onHome = pathname === "/";

  const [value, setValue] = useState("");
  const [openMobile, setOpenMobile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  // Seed from URL on home so a shared ?q= link populates the field.
  useEffect(() => {
    if (onHome) setValue(searchParams.get("q") ?? "");
  }, [onHome, searchParams]);

  function push(next: string) {
    const params = new URLSearchParams(onHome ? Array.from(searchParams.entries()) : []);
    if (next.trim()) params.set("q", next.trim());
    else params.delete("q");
    const qs = params.toString();
    router.replace(`/${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  function onChange(next: string) {
    setValue(next);
    clearTimeout(debounce.current);
    // Debounce 120ms (spec §7). On non-home we wait for Enter instead.
    if (onHome) debounce.current = setTimeout(() => push(next), 120);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearTimeout(debounce.current);
    push(value);
  }

  return (
    <form onSubmit={onSubmit} className={`relative ${className}`} role="search">
      {/* Mobile: a search icon that expands the field */}
      <button
        type="button"
        aria-label="Open search"
        onClick={() => {
          setOpenMobile((v) => !v);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="grid h-9 w-9 place-items-center rounded-full text-cream/90 hover:bg-cream/10 sm:hidden"
      >
        <Search size={18} />
      </button>

      <div
        className={`${
          openMobile
            ? "absolute right-0 top-11 z-50 w-[min(78vw,20rem)]"
            : "hidden"
        } sm:relative sm:top-0 sm:block sm:w-64 lg:w-80`}
      >
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search money lessons…"
          aria-label="Search insights"
          className="w-full rounded-full border border-cream/20 bg-cream py-2 pl-9 pr-9 text-sm text-ink placeholder:text-muted/80 shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
        {value && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setValue("");
              push("");
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-line/60"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </form>
  );
}
