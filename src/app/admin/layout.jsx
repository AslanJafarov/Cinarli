import { fontVariables } from "@/lib/fonts";
import "../globals.css";

export const metadata = {
  title: { default: "Admin panel", template: "%s | Çınarlı Park" },
  robots: { index: false, follow: false },
};

// The admin panel sits outside the [lang] routes, so it has its own root layout.
export default function AdminLayout({ children }) {
  return (
    <html lang="az" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
