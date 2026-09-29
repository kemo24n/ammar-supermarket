import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF1F1", 100: "#FFE0E0", 200: "#FFC5C6", 300: "#FF9B9D",
          400: "#FF5F63", 500: "#F4282E", 600: "#E11A21", 700: "#BD1218",
          800: "#9C1318", 900: "#81161A", 950: "#470508",
        },
        ink: { DEFAULT: "#16161A", soft: "#3A3A42", mute: "#6B6B76", line: "#E8E8EC" },
        paper: "#F6F6F8",
      },
      fontFamily: { sans: ["Cairo", "system-ui", "sans-serif"] },
      borderRadius: { xl2: "1.25rem", xl3: "1.75rem" },
      boxShadow: {
        card: "0 1px 2px rgba(22,22,26,.04), 0 8px 24px -12px rgba(22,22,26,.12)",
        pop: "0 20px 50px -20px rgba(225,26,33,.45)",
      },
      keyframes: {
        rise: { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "none" } },
        pulseRing: { "0%": { transform: "scale(.9)", opacity: ".7" }, "100%": { transform: "scale(1.8)", opacity: "0" } },
        slide: { "0%": { backgroundPosition: "0 0" }, "100%": { backgroundPosition: "56px 0" } },
        pop: { "0%": { transform: "scale(1)" }, "40%": { transform: "scale(1.25)" }, "100%": { transform: "scale(1)" } },
      },
      animation: {
        rise: "rise .5s cubic-bezier(.2,.7,.2,1) both",
        ring: "pulseRing 1.6s ease-out infinite",
        stripes: "slide 1.2s linear infinite",
        pop: "pop .35s ease",
      },
    },
  },
  plugins: [],
} satisfies Config;
