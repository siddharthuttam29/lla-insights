// Number / duration / date formatters and timestamp helpers.

/** 2055924364 → "2.06B", 4440841 → "4.44M", 12500 → "12.5K". */
export function compactNumber(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e9) return trim(n / 1e9) + "B";
  if (abs >= 1e6) return trim(n / 1e6) + "M";
  if (abs >= 1e3) return trim(n / 1e3) + "K";
  return String(n);
}
function trim(x: number): string {
  // 2 sig digits after the unit, no trailing ".0"
  return x.toFixed(x >= 100 ? 0 : x >= 10 ? 1 : 2).replace(/\.?0+$/, "");
}

/** Full grouped number: 2055924364 → "2,05,59,24,364" is Indian grouping;
 *  we use en-IN so /numbers reads natively for the audience. */
export function indianNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(Math.round(n));
}

/** offsetSec → "mm:ss" or "h:mm:ss" for the "Watch at …" chip. */
export function timestamp(sec: number): string {
  const s = Math.max(0, Math.floor(sec || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const pad = (x: number) => String(x).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(r)}` : `${m}:${pad(r)}`;
}

/** durationSec → human "X days", "Xh Ym" etc. for the /numbers runtime panel. */
export function humanDuration(sec: number): { days: string; long: string } {
  const totalMin = Math.round(sec / 60);
  const days = sec / 86400;
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return {
    days: days >= 1 ? `${days.toFixed(1)} days` : `${Math.floor(sec / 3600)} hours`,
    long: `${Math.floor(sec / 3600)}h ${m}m (${totalMin.toLocaleString("en-IN")} minutes)`,
  };
}

/** ISO → "May 2023" */
export function monthYear(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
}

/** ISO → "2023" */
export function year(iso: string): string {
  return (iso || "").slice(0, 4);
}

/** Deterministic day-of-year (UTC) for the stable "Insight of the Day" pick. */
export function dayOfYear(date = new Date()): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const now = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((now - start) / 86400000);
}

/** YouTube watch URL with timestamp (canonical, for non-deep-link uses). */
export function watchUrl(videoId: string, offsetSec?: number): string {
  const t = offsetSec ? `&t=${Math.floor(offsetSec)}` : "";
  return `https://www.youtube.com/watch?v=${videoId}${t}`;
}
