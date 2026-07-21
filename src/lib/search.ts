/**
 * Escape a user search string for safe interpolation into a PostgREST `.or()`
 * filter. Commas and parentheses rewrite the expression; `%`/`_` are LIKE
 * wildcards; backslash is the escape character.
 */
export function escapeSearchTerm(raw: string): string {
  return raw
    .replace(/[\\%_]/g, (c) => `\\${c}`)
    .replace(/[,()."]/g, " ")
    .trim();
}
