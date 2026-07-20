/**
 * WCAG contrast gate for the design tokens in src/index.css.
 *
 * Run: npm run test:contrast
 * Exits non-zero if any token pair drops below its threshold in either theme,
 * so a token edit that breaks accessibility fails loudly instead of shipping.
 */
import { readFileSync } from "node:fs";

// Normalise line endings first: the checked-out file uses CRLF on Windows and
// the block regex below would never match against a stray carriage return.
const css = readFileSync(new URL("../src/index.css", import.meta.url), "utf8").replace(
  /\r\n/g,
  "\n",
);

const parse = (block) => {
  const m = css.match(new RegExp(`${block}\\s*\\{(.*?)\\n  \\}`, "s"));
  if (!m) throw new Error(`Token block ${block} not found in src/index.css`);
  return Object.fromEntries(
    [...m[1].matchAll(/--([\w-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%;/g)].map(([, k, h, s, l]) => [
      k,
      [+h, +s, +l],
    ]),
  );
};

const hslToRgb = (h, s, l) => {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][Math.floor(h / 60) % 6];
  return [r + m, g + m, b + m];
};

const luminance = (rgb) => {
  const [r, g, b] = rgb.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a, b) => {
  const [la, lb] = [luminance(hslToRgb(...a)), luminance(hslToRgb(...b))];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

// Thresholds: 4.5 is WCAG AA for normal text; 3.0 is AA for non-text UI
// indicators; 1.33 is our own floor for hairline rules staying perceptible.
const PAIRS = [
  ["foreground", "background", "body text", 4.5],
  ["muted-foreground", "background", "secondary text", 4.5],
  ["primary", "background", "link / CTA", 4.5],
  ["accent", "background", "accent text", 4.5],
  ["primary-foreground", "primary", "text on primary button", 4.5],
  ["accent-foreground", "accent", "text on accent", 4.5],
  ["destructive", "background", "error text", 4.5],
  ["success", "background", "success text", 4.5],
  ["border", "background", "hairline rule", 1.33],
  ["ring", "background", "focus ring", 3.0],
];

let failures = 0;
for (const [theme, tokens] of [
  ["LIGHT", parse(":root")],
  ["DARK", parse("\\.dark")],
]) {
  console.log(`--- ${theme} ---`);
  for (const [fg, bg, label, min] of PAIRS) {
    const r = ratio(tokens[fg], tokens[bg]);
    const ok = r >= min;
    if (!ok) failures++;
    console.log(`  ${ok ? "OK  " : "FAIL"} ${r.toFixed(2).padStart(5)}:1 (min ${min})  ${label}`);
  }
}

console.log(failures === 0 ? "\nAll contrast checks passed." : `\n${failures} contrast FAILURE(S).`);
process.exit(failures === 0 ? 0 : 1);
