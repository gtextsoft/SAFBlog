/**
 * Renders a JSON-LD document into the page.
 *
 * Server-rendered, so the structured data is in the HTML source rather than
 * being appended by an effect after hydration.
 *
 * The `<` escape is not cosmetic: a post title or excerpt containing the
 * literal text `</script>` would otherwise close this tag early and let the
 * rest of the field be parsed as markup. Escaping it to < keeps the JSON
 * valid while making that impossible.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
