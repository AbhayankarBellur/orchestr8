import { describe, it, expect } from "vitest";
import { evaluatePolicies } from "../../src/governance/governance.evaluator.js";

describe("Governance Unmeasured Metrics Handling", () => {
  it("does not silently pass unmeasured metrics", () => {
    const policies = [
      {
        policy_id: "unmeasured-deny",
        enabled: true,
        scope: { type: "execution" },
        condition: { metric: "custom_unmeasured_metric", operator: "LTE", threshold: 10 },
        enforcement: "deny",
        reason: "Must not exceed custom metric"
      }
    ];

    const proposal = { server: "taskos", tool_name: "project_list", arguments: {} };
    const metrics = { server: "taskos", tool: "project_list" };
    const res = evaluatePolicies(policies, proposal, metrics);

    expect(res.not_evaluated).toBe(1);
    expect(res.passed).toBe(0);
    expect(res.status).toBe("BLOCKED");
    expect(res.can_proceed).toBe(false);
    expect(res.results[0].result).toBe("NOT_EVALUATED");
  });

  it("permits EXISTS operator even if observed value is undefined", () => {
    const policies = [
      {
        policy_id: "exists-check",
        enabled: true,
        scope: { type: "execution" },
        condition: { metric: "optional_flag", operator: "EXISTS" },
        enforcement: "require_approval",
        reason: "Approval if optional flag exists"
      }
    ];

    const proposal = { server: "taskos", tool_name: "project_list", arguments: {} };
    const metrics = { server: "taskos", tool: "project_list" };
    const res = evaluatePolicies(policies, proposal, metrics);

    expect(res.results[0].result).toBe("PASSED");
    expect(res.status).toBe("ALLOWED");
    expect(res.can_proceed).toBe(true);
  });
});
