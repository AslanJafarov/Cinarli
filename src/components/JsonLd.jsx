// Structured data for search engines. `data` is one schema.org node or an array of them.
// `<` is escaped so text from the data can never close the script tag.
export default function JsonLd({ data }) {
  const graph = {
    "@context": "https://schema.org",
    "@graph": Array.isArray(data) ? data : [data],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, "\\u003c"),
      }}
    />
  );
}
