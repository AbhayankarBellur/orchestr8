import { createHash } from "node:crypto";

export const GENESIS_HASH = "0".repeat(64);

export function canonicalJson(val) {
  if (val === null || val === undefined) return "null";
  if (typeof val !== "object") return JSON.stringify(val);
  if (Array.isArray(val)) return `[${val.map(canonicalJson).join(",")}]`;
  const keys = Object.keys(val).sort();
  return `{${keys.map(k => `${JSON.stringify(k)}:${canonicalJson(val[k])}`).join(",")}}`;
}

export function computeEventHash(payload, previousHash) {
  const canonical = canonicalJson(payload);
  return createHash("sha256").update(canonical + previousHash).digest("hex");
}
