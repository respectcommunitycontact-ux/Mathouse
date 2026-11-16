import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dribelot: {
          beige: '#F9F6F0',
          'beige-light': '#FDFAF5',
          'beige-dark': '#EFE9DE',
          cream: '#FFFDF9',
          orange: '#E85D04',
          'orange-light': '#F48C06',
          'orange-glow': '#FAA307',
          'orange-deep': '#DC2F02',
          charcoal: '#2B2D42',
          'charcoal-light': '#4A4E69',
          'charcoal-dark': '#1A1B29',
          border: '#E8E1D5',
          parchment: '#F3EDE2',
        },
        brand: {
          bg: "#0B1017",
          dark: "#0B1017",
          navy: "#0E141D",
          surface: "#121822",
          surfaceElevated: "#1A2230",
          card: "#121822",
          cardHover: "#18202D",
          border: "rgba(255, 255, 255, 0.08)",
          borderLight: "rgba(255, 255, 255, 0.14)",
          gold: "#D4AF37",
          goldHover: "#E5C158",
          goldLight: "#F5E6B3",
          goldMuted: "rgba(212, 175, 55, 0.15)",
          goldBorder: "rgba(212, 175, 55, 0.35)",
          red: "#E11D48",
          emerald: "#10B981",
          text: "#FFFFFF",
          muted: "#94A3B8",
        },
      },
      boxShadow: {
        "gold-subtle": "0 4px 20px -2px rgba(212, 175, 55, 0.25)",
        "card": "0 6px 24px -6px rgba(0, 0, 0, 0.5)",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "'Playfair Display'", "Georgia", "serif"],
        sans: [
          "var(--font-montserrat)",
          "'Montserrat'",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif"
        ],
        script: ["var(--font-caveat)", "'Caveat'", "cursive"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ken-burns": "kenburns 20s ease-in-out infinite alternate",
        "float": "float 4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        kenburns: {
          "0%": { transform: "scale(1.0) translate(0, 0)" },
          "50%": { transform: "scale(1.08) translate(-1%, -1%)" },
          "100%": { transform: "scale(1.03) translate(1%, 1%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
