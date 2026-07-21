/**
 * Unit tests for escapeSearchTerm — mirrors src/lib/search.ts.
 * Kept inline so Node can run without a TS loader for that module.
 */

function escapeSearchTerm(raw) {
  return raw
    .replace(/[\\%_]/g, (c) => `\\${c}`)
    .replace(/[,()."]/g, " ")
    .trim();
}

let failures = 0;
const check = (name, cond) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) failures++;
};

check("empty stays empty", escapeSearchTerm("") === "");
check("plain term unchanged", escapeSearchTerm("education") === "education");
check("escapes percent", escapeSearchTerm("100%") === "100\\%");
check("escapes underscore", escapeSearchTerm("a_b") === "a\\_b");
check("escapes backslash", escapeSearchTerm("a\\b") === "a\\\\b");
check("commas become spaces", escapeSearchTerm("a,b") === "a b");
check("parens become spaces", escapeSearchTerm("a(b)") === "a b");
check("quotes become spaces", escapeSearchTerm('say "hi"') === "say  hi");
check("trims whitespace", escapeSearchTerm("  hello  ") === "hello");
check(
  "combined",
  escapeSearchTerm("  50%,_x(y)  ") === "50\\% \\_x y",
);

if (failures > 0) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log("\nAll search escape tests passed.");
