import { Montserrat, Noto_Sans } from "next/font/google";

// Shared by the site and admin root layouts. Cyrillic is needed for the Russian site.
const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

export const fontVariables = `${notoSans.variable} ${montserrat.variable}`;
