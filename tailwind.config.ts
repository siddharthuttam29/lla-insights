import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // LLA brand — deep maroon + warm cream. See DESIGN-SYSTEM.md §6.2
        maroon: {
          DEFAULT: "#7A1E1E", // primary brand (LLA oxblood)
          deep: "#5E1414", // hover / gradient end
          alt: "#661539", // optional cross-brand maroon (Qubera)
        },
        cream: "#FBF6EE", // page background (warm paper)
        card: "#FFFFFF", // card surface
        ink: "#1A1413", // primary text (warm near-black)
        muted: "#6B5E5A", // secondary text
        gold: "#E0A33E", // accent / Insight of the Day / big figures
        line: "#E7DCCB", // hairline borders on cream
        success: "#2E7D52", // positive deltas
      },
      fontFamily: {
        // wired to next/font CSS variables in app/layout.tsx
        display: ["var(--font-display)", "Impact", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // fluid type scale (BUILD-SPEC §6.3)
        hero: ["clamp(2.6rem, 7vw, 6rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        section: ["clamp(1.4rem, 3vw, 2.2rem)", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
      },
      boxShadow: {
        card: "0 1px 2px rgba(26,20,19,0.04), 0 8px 24px -12px rgba(26,20,19,0.12)",
        "card-hover": "0 2px 4px rgba(26,20,19,0.06), 0 18px 40px -16px rgba(122,30,30,0.28)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
      },
      backgroundImage: {
        "maroon-grad": "linear-gradient(135deg, #7A1E1E 0%, #5E1414 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
