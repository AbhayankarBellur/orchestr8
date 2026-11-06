import { createHash, randomUUID } from "node:crypto";
import { listPolicies } from "../repositories/policy.repository.js";

const snapshots = new Map();

export function createPolicySnapshot() {
  const policies = listPolicies({ enabled: true });
  const snapshotPolicies = policies.map(p => Object.freeze({
    policy_id: p.policy_id,
    version: p.version,
    name: p.name,
    scope: Object.freeze({ ...p.scope }),
    condition: Object.freeze({ ...p.condition }),
    enforcement: p.enforcement,
    severity: p.severity,
    reason: p.reason,
    priority: p.priority,
    enabled: p.enabled
  }));

  const json = JSON.stringify(snapshotPolicies);
  const hash = createHash("sha256").update(json).digest("hex");
  const snapshot_id = `snap_${Date.now()}_${randomUUID().slice(0, 8)}`;

  const snapshot = Object.freeze({
    snapshot_id,
    hash,
    created_at: new Date().toISOString(),
    policies: Object.freeze(snapshotPolicies)
  });

  snapshots.set(snapshot_id, snapshot);
  return snapshot;
}

export function getSnapshot(snapshotId) {
  return snapshots.get(snapshotId) || null;
}

export function clearSnapshots() {
  snapshots.clear();
}
