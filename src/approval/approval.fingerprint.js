import { createHash } from "node:crypto";

export function canonicalStringify(val) {
  if (val === null || typeof val !== "object") return JSON.stringify(val);
  if (Array.isArray(val)) return `[${val.map(canonicalStringify).join(",")}]`;
  const keys = Object.keys(val).sort();
  return `{${keys.map(k => `${JSON.stringify(k)}:${canonicalStringify(val[k])}`).join(",")}}`;
}

export function hashString(str) {
  return createHash("sha256").update(str).digest("hex");
}

export function computeArgumentsHash(args = {}) {
  return hashString(canonicalStringify(args));
}

export function computeActionFingerprint(action) {
  const { execution_id, proposal_id, server, tool_name, policy_snapshot_hash } = action;
  const canonical = canonicalStringify({
    arguments: action.arguments || {},
    execution_id: execution_id || "",
    policy_snapshot_hash: policy_snapshot_hash || "",
    proposal_id: proposal_id || "",
    server: server || "",
    tool_name: tool_name || ""
  });
  return hashString(canonical);
}
