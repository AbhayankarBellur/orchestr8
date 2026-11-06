import { describe, it, expect, beforeEach } from "vitest";
import { createPolicy, updatePolicy, getPolicy, listPolicies, resetPolicies } from "../../src/repositories/policy.repository.js";

describe("Policy Registry", () => {
  beforeEach(() => { resetPolicies(); });

  it("creates valid policy and retrieves it by ID", () => {
    const p = createPolicy({
      policy_id: "custom-p1", version: "1.0.0", name: "Custom Policy", enabled: true,
      scope: { type: "tool", tool: "test_tool" },
      condition: { metric: "tool_calls", operator: "LTE", threshold: 10 },
      enforcement: "deny", severity: "high", reason: "Limit exceeded"
    });
    expect(p.policy_id).toBe("custom-p1");
    expect(getPolicy("custom-p1")?.name).toBe("Custom Policy");
  });

  it("rejects duplicate policy ID", () => {
    createPolicy({
      policy_id: "dup-id", name: "P1", scope: { type: "execution" },
      condition: { metric: "x", operator: "EQ", threshold: 1 },
      enforcement: "deny", reason: "r"
    });
    expect(() => createPolicy({
      policy_id: "dup-id", name: "P2", scope: { type: "execution" },
      condition: { metric: "x", operator: "EQ", threshold: 1 },
      enforcement: "deny", reason: "r"
    })).toThrow("already exists");
  });

  it("updates policy and increments version", () => {
    const updated = updatePolicy("max-tool-calls", { name: "Updated Limit", condition: { metric: "tool_calls", operator: "LTE", threshold: 20 } });
    expect(updated.version).toBe("1.1.0");
    expect(updated.name).toBe("Updated Limit");
  });

  it("filters policies by enabled status", () => {
    updatePolicy("max-tool-calls", { enabled: false });
    const enabled = listPolicies({ enabled: true });
    const disabled = listPolicies({ enabled: false });
    expect(enabled.some(p => p.policy_id === "max-tool-calls")).toBe(false);
    expect(disabled.some(p => p.policy_id === "max-tool-calls")).toBe(true);
  });
});
