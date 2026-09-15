import { notFound } from "next/navigation";

// Unknown URLs inside a language render [lang]/not-found.jsx with the site layout and language.
export const dynamicParams = true;

export default function CatchAll() {
  notFound();
}
