import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}", "./content/**/*.mdx"],
  theme: {
    extend: {
      colors: {
        bg: "var(--c-bg)",
        surface: "var(--c-surface)",
        "surface-strong": "var(--c-surface-strong)",
        border: "var(--c-border)",
        text: "var(--c-text)",
        "text-muted": "var(--c-text-muted)",
        accent: "var(--c-accent)",
        "accent-soft": "var(--c-accent-soft)",
        scrim: "var(--c-scrim)",
        "glow-a": "var(--c-glow-a)",
        "glow-b": "var(--c-glow-b)",
        "glow-c": "var(--c-glow-c)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      borderRadius: {
        card: "16px",
        control: "10px",
        pill: "999px",
      },
      boxShadow: {
        glass:
          "0 1px 2px rgba(0,0,0,.04), 0 12px 32px -16px rgba(15,23,42,.12)",
        "glass-dark": "0 1px 2px rgba(0,0,0,.3)",
        focus: "0 0 0 3px var(--c-accent-soft)",
      },
      maxWidth: {
        reading: "720px",
        wide: "1180px",
      },
      transitionDuration: {
        150: "150ms",
        200: "200ms",
      },
      keyframes: {
        "glow-drift-a": {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(6%, -4%, 0) scale(1.08)" },
        },
        "glow-drift-b": {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1.05)" },
          "50%": { transform: "translate3d(-7%, 5%, 0) scale(1)" },
        },
        "glow-drift-c": {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(4%, 6%, 0) scale(1.12)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "glow-a": "glow-drift-a 26s ease-in-out infinite",
        "glow-b": "glow-drift-b 22s ease-in-out infinite",
        "glow-c": "glow-drift-c 30s ease-in-out infinite",
        "fade-up": "fade-up 200ms ease-out both",
      },
      screens: {
        tablet: "768px",
        desktop: "1280px",
        wide: "1600px",
      },
    },
  },
  plugins: [typography],
};

export default config;
