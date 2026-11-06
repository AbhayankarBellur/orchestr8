import { describe, it, expect } from "vitest";
import { canonicalStringify, computeActionFingerprint, computeArgumentsHash } from "../../src/approval/approval.fingerprint.js";

describe("Exact-Action Fingerprinting", () => {
  const base = {
    execution_id: "exec_1", proposal_id: "prop_1", server: "taskos",
    tool_name: "task_create", arguments: { title: "Deploy", priority: "high" },
    policy_snapshot_hash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
  };

  it("produces identical canonical string regardless of key ordering", () => {
    const o1 = { z: 1, a: { y: 2, x: 3 }, arr: [1, 2] };
    const o2 = { a: { x: 3, y: 2 }, arr: [1, 2], z: 1 };
    expect(canonicalStringify(o1)).toBe(canonicalStringify(o2));
    expect(computeArgumentsHash(o1)).toBe(computeArgumentsHash(o2));
  });

  it("produces identical fingerprint for identical actions with different key orders", () => {
    const actionA = { ...base, arguments: { b: 2, a: 1 } };
    const actionB = { ...base, arguments: { a: 1, b: 2 } };
    expect(computeActionFingerprint(actionA)).toBe(computeActionFingerprint(actionB));
  });

  it("changes fingerprint when arguments, tool, server, or policy snapshot change", () => {
    const fpBase = computeActionFingerprint(base);
    const fpArg = computeActionFingerprint({ ...base, arguments: { ...base.arguments, title: "Modified" } });
    const fpTool = computeActionFingerprint({ ...base, tool_name: "task_update" });
    const fpServer = computeActionFingerprint({ ...base, server: "other" });
    const fpSnap = computeActionFingerprint({ ...base, policy_snapshot_hash: "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" });

    expect(fpArg).not.toBe(fpBase);
    expect(fpTool).not.toBe(fpBase);
    expect(fpServer).not.toBe(fpBase);
    expect(fpSnap).not.toBe(fpBase);
  });
});
