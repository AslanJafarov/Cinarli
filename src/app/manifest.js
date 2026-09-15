import { seo } from "@/data/mock";

export default function manifest() {
  return {
    name: seo.siteName,
    short_name: "Çınarlı",
    description: seo.home.description,
    lang: "az",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f0e9",
    theme_color: "#13271f",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
