import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-background": "#e5e2e1",
        "surface-dim": "#131313",
        "primary-container": "#d4d4d4",
        "surface-container-low": "#1c1b1b",
        "on-tertiary-fixed": "#ffffff",
        "inverse-surface": "#e5e2e1",
        "on-primary": "#1a1c1c",
        "surface-container": "#201f1f",
        "tertiary-fixed-dim": "#464747",
        "surface-variant": "#353534",
        "on-surface": "#e5e2e1",
        "on-primary-fixed-variant": "#e2e2e2",
        "error": "#ffb4ab",
        "surface": "#131313",
        "secondary-fixed-dim": "#ababab",
        "secondary": "#c6c6c6",
        "secondary-fixed": "#c6c6c6",
        "on-secondary": "#1a1c1c",
        "primary-fixed-dim": "#454747",
        "on-tertiary-fixed-variant": "#e3e2e2",
        "primary-fixed": "#5d5f5f",
        "on-primary-fixed": "#ffffff",
        "background": "#131313",
        "surface-tint": "#c6c6c7",
        "inverse-on-surface": "#313030",
        "primary": "#ffffff",
        "on-secondary-container": "#e2e2e2",
        "outline-variant": "#474747",
        "on-tertiary": "#1b1c1c",
        "on-error": "#690005",
        "outline": "#919191",
        "surface-container-high": "#2a2a2a",
        "tertiary-fixed": "#5e5e5e",
        "on-error-container": "#ffdad6",
        "on-surface-variant": "#c6c6c6",
        "on-tertiary-container": "#000000",
        "secondary-container": "#454747",
        "on-primary-container": "#000000",
        "surface-bright": "#393939",
        "inverse-primary": "#5d5f5f",
        "tertiary": "#e3e2e2",
        "tertiary-container": "#919191",
        "on-secondary-fixed-variant": "#3a3c3c",
        "surface-container-lowest": "#0e0e0e",
        "error-container": "#93000a",
        "surface-container-highest": "#353534",
        "on-secondary-fixed": "#1a1c1c"
      },
      borderRadius: {
        DEFAULT: "0px",
        lg: "0px",
        xl: "0px",
        full: "9999px"
      },
      fontFamily: {
        headline: ["Noto Serif", "serif"],
        body: ["Manrope", "sans-serif"],
        label: ["Manrope", "sans-serif"]
      }
    },
  },
  plugins: [],
};
export default config;
