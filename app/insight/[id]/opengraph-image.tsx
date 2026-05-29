import { ImageResponse } from "next/og";
import { getInsight, insights } from "@/lib/data";

// Per-insight branded share card. Inherits the page's generateStaticParams, so
// Next renders one PNG per insight at build (dynamic + static modes alike).
export const alt = "An LLA money lesson";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Cap the number pre-generated if the dataset grows huge; here we cover all.
export function generateStaticParams() {
  return insights.map((i) => ({ id: i.id }));
}

export default function OG({ params }: { params: { id: string } }) {
  const insight = getInsight(params.id);
  // The default OG font has no ₹ glyph (and dynamic font fetch is unreliable),
  // so render "Rs" in the share-card image text.
  const deRupee = (s: string) => s.replace(/₹\s?/g, "Rs ");
  const takeaway = deRupee(insight?.takeaway ?? "Everything LLA taught India about money.");
  const topic = insight?.topic ?? "Money";
  const videoTitle = deRupee(insight?.videoTitle ?? "Labour Law Advisor");

  // shrink the headline as the takeaway gets longer
  const len = takeaway.length;
  const fontSize = len > 150 ? 44 : len > 100 ? 52 : 62;

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
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#FBF6EE",
              color: "#7A1E1E",
              fontSize: 26,
              fontWeight: 800,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            LLA
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -1 }}>INSIGHTS</div>
          <div
            style={{
              marginLeft: "auto",
              background: "rgba(251,246,238,0.14)",
              color: "#FBF6EE",
              padding: "8px 18px",
              borderRadius: 999,
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            {topic}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: -1,
          }}
        >
          {takeaway}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 22, color: "#E0A33E" }}>FROM</div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              color: "#E8D9C5",
              maxWidth: 1000,
              overflow: "hidden",
            }}
          >
            {videoTitle.length > 78 ? videoTitle.slice(0, 78) + "…" : videoTitle}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
