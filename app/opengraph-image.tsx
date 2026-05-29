import { ImageResponse } from "next/og";
import { stats, totalInsights } from "@/lib/data";
import { compactNumber } from "@/lib/format";

// Site-wide default OG card. Pre-rendered at build → works in dynamic AND static
// (output: export) modes. Applies to every route without its own opengraph-image.
export const alt = "LLA Insights, everything Labour Law Advisor taught India about money";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  const subline = `${totalInsights().toLocaleString("en-IN")}+ searchable money lessons · ${compactNumber(
    stats.totals.total_views
  )} views distilled`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #7A1E1E 0%, #5E1414 100%)",
          color: "#FBF6EE",
          padding: "70px 76px",
          fontFamily: "sans-serif",
        }}
      >
        {/* lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#FBF6EE",
              color: "#7A1E1E",
              fontSize: 30,
              fontWeight: 800,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            LLA
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1 }}>INSIGHTS</div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 70, fontWeight: 800, lineHeight: 1.02, letterSpacing: -1.5 }}>
            Everything LLA taught India about money.
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 30, color: "#E8D9C5" }}>
            {subline}
          </div>
        </div>

        {/* footer */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#E0A33E" }}>
          <span>The LLA Money Library</span>
          <span style={{ color: "#C9B9A6" }}>Unofficial · not affiliated</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
