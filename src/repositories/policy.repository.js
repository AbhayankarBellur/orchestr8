import { PolicySchema, PolicyPatchSchema } from "../schemas/policy.schema.js";
import { DEFAULT_POLICIES } from "../governance/default.policies.js";

const store = new Map(), history = new Map();

function init() {
  store.clear();
  history.clear();
  for (const p of DEFAULT_POLICIES) store.set(p.policy_id, { ...p });
}
init();

export function createPolicy(data) {
  const parsed = PolicySchema.parse(data);
  if (store.has(parsed.policy_id)) throw new Error(`Policy ${parsed.policy_id} already exists`);
  store.set(parsed.policy_id, parsed);
  return { ...parsed };
}

export function updatePolicy(id, patch) {
  const existing = store.get(id);
  if (!existing) throw new Error(`Policy ${id} not found`);
  const validPatch = PolicyPatchSchema.parse(patch);
  if (!history.has(id)) history.set(id, []);
  history.get(id).push({ ...existing });

  const [major, minor] = existing.version.split(".").map(Number);
  const updated = { ...existing, ...validPatch, version: `${major}.${minor + 1}.0` };
  store.set(id, updated);
  return { ...updated };
}

export function getPolicy(id) {
  const p = store.get(id);
  return p ? { ...p } : null;
}

export function listPolicies(filter = {}) {
  let list = Array.from(store.values());
  if (typeof filter.enabled === "boolean") list = list.filter(p => p.enabled === filter.enabled);
  return list.map(p => ({ ...p }));
}

export function resetPolicies() { init(); }
