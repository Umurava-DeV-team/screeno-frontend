import localFont from "next/font/local";
export const landingFont = localFont({
  src: "../public/fonts/manrope/Manrope-Variable.ttf",
  weight: "200 800",
  variable: "--font-manrope",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export const displayFont = localFont({
  src: "../public/fonts/barlow-condensed/BarlowCondensed-ExtraBold.ttf",
  weight: "800",
  variable: "--font-display",
  display: "swap",
  fallback: ["Impact", "Arial Narrow", "sans-serif"],
});
