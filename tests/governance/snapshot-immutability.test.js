import { describe, it, expect, beforeEach } from "vitest";
import { createPolicySnapshot, getSnapshot, clearSnapshots } from "../../src/governance/governance.snapshot.js";
import { updatePolicy, resetPolicies } from "../../src/repositories/policy.repository.js";
import { enforceGovernance } from "../../src/governance/governance.guard.js";

describe("Policy Snapshot Immutability", () => {
  beforeEach(() => { resetPolicies(); clearSnapshots(); });

  it("creates immutable snapshot with hash", () => {
    const snap = createPolicySnapshot();
    expect(snap.snapshot_id).toMatch(/^snap_/);
    expect(snap.hash).toHaveLength(64);
    expect(snap.policies.length).toBeGreaterThan(0);
    expect(getSnapshot(snap.snapshot_id)).toBe(snap);
  });

  it("prevents direct mutation of snapshot object and policy definitions", () => {
    const snap = createPolicySnapshot();
    expect(Object.isFrozen(snap)).toBe(true);
    expect(Object.isFrozen(snap.policies)).toBe(true);
    expect(Object.isFrozen(snap.policies[0])).toBe(true);
    expect(() => { snap.policies[0].enabled = false; }).toThrow();
  });

  it("remains immutable when policy is modified later", () => {
    const snap = createPolicySnapshot();
    const originalCount = snap.policies.length;
    updatePolicy("task-create-approval", { enabled: false });
    expect(snap.policies.length).toBe(originalCount);
    const snapPolicy = snap.policies.find(p => p.policy_id === "task-create-approval");
    expect(snapPolicy.enabled).toBe(true);

    const proposal = { server: "taskos", tool_name: "task_create", arguments: { description: "Detailed description" } };
    const resWithSnapshot = enforceGovernance(proposal, {}, snap);
    expect(resWithSnapshot.status).toBe("APPROVAL_REQUIRED");

    const resLive = enforceGovernance(proposal, {});
    expect(resLive.status).toBe("ALLOWED");
    expect(resLive.can_proceed).toBe(true);
  });
});
