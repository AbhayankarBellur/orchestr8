import { describe, it, expect } from "vitest";
import { evaluatePolicies } from "../../src/governance/governance.evaluator.js";

describe("Governance Evaluator Precedence", () => {
  it("DENIED takes precedence over approval and warning", () => {
    const policies = [
      { policy_id: "p1", enabled: true, scope: { type: "execution" }, condition: { metric: "task_creations", operator: "LTE", threshold: 2 }, enforcement: "deny", reason: "Deny rule" },
      { policy_id: "p2", enabled: true, scope: { type: "execution" }, condition: { metric: "tool", operator: "EQ", threshold: "task_create" }, enforcement: "require_approval", reason: "Approval rule" },
      { policy_id: "p3", enabled: true, scope: { type: "execution" }, condition: { metric: "description_length", operator: "GTE", threshold: 10 }, enforcement: "warn", reason: "Warning rule" }
    ];
    const metrics = { server: "taskos", tool: "task_create", task_creations: 5, description_length: 2 };
    const res = evaluatePolicies(policies, { server: "taskos", tool_name: "task_create" }, metrics);

    expect(res.status).toBe("DENIED");
    expect(res.can_proceed).toBe(false);
    expect(res.violated).toBe(1);
    expect(res.approval_required).toBe(1);
  });

  it("APPROVAL_REQUIRED blocks when no deny violation occurs", () => {
    const policies = [
      { policy_id: "p1", enabled: true, scope: { type: "execution" }, condition: { metric: "task_creations", operator: "LTE", threshold: 5 }, enforcement: "deny" },
      { policy_id: "p2", enabled: true, scope: { type: "execution" }, condition: { metric: "tool", operator: "EQ", threshold: "task_create" }, enforcement: "require_approval", reason: "Needs approval" }
    ];
    const metrics = { server: "taskos", tool: "task_create", task_creations: 1 };
    const res = evaluatePolicies(policies, { server: "taskos", tool_name: "task_create" }, metrics);

    expect(res.status).toBe("APPROVAL_REQUIRED");
    expect(res.can_proceed).toBe(false);
  });

  it("WARNING allows continuation with can_proceed: true", () => {
    const policies = [
      { policy_id: "p1", enabled: true, scope: { type: "execution" }, condition: { metric: "description_length", operator: "GTE", threshold: 10 }, enforcement: "warn", reason: "Short description" }
    ];
    const metrics = { description_length: 5 };
    const res = evaluatePolicies(policies, { server: "taskos", tool_name: "task_create" }, metrics);

    expect(res.status).toBe("WARNING");
    expect(res.can_proceed).toBe(true);
  });
});
