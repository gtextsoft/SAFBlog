import { signToken, verifyToken } from "../supabase/functions/unsubscribe/token.ts";

const SECRET = "test-secret-do-not-use-in-production";
const OTHER = "a-different-secret";

let failures = 0;
const check = (name, cond) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) failures++;
};

// Round trip
const token = await signToken("Reader@Example.COM", SECRET);
check("token has two dot-separated parts", token.split(".").length === 2);
check("token is URL-safe", !/[+/=]/.test(token));
check("round trip recovers normalized email", (await verifyToken(token, SECRET)) === "reader@example.com");

// Normalization: casing and whitespace must produce the same token
check(
  "casing/whitespace normalize to same token",
  (await signToken("  reader@example.com  ", SECRET)) === token,
);

// Wrong secret must not verify
check("wrong secret rejected", (await verifyToken(token, OTHER)) === null);

// Tampering with the email half must not verify
const [encEmail, encSig] = token.split(".");
const forgedEmail = Buffer.from("victim@example.com").toString("base64url");
check("swapped email rejected", (await verifyToken(`${forgedEmail}.${encSig}`, SECRET)) === null);

// Tampering with the signature half must not verify
const flipped = encSig.slice(0, -1) + (encSig.at(-1) === "A" ? "B" : "A");
check("altered signature rejected", (await verifyToken(`${encEmail}.${flipped}`, SECRET)) === null);

// Malformed input must return null, not throw
for (const bad of ["", ".", "no-dot", "a.b.c", "!!!.???", "Zm9v."]) {
  let threw = false;
  let result;
  try {
    result = await verifyToken(bad, SECRET);
  } catch {
    threw = true;
  }
  check(`malformed ${JSON.stringify(bad)} -> null, no throw`, !threw && result === null);
}

// Distinct addresses must produce distinct signatures
const a = await signToken("one@example.com", SECRET);
const b = await signToken("two@example.com", SECRET);
check("distinct emails produce distinct tokens", a !== b);
check("token for one address does not verify as another", (await verifyToken(a, SECRET)) !== "two@example.com");

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
