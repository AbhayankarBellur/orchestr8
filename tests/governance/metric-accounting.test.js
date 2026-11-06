import { describe, it, expect } from "vitest";
import { extractMetrics } from "../../src/governance/governance.metrics.js";

describe("Governance Metric Accounting", () => {
  it("increments proposed_tool_calls and keeps executed_tool_calls at zero", () => {
    const proposal = { server: "taskos", tool_name: "task_create", arguments: { description: "Task desc" } };
    const metrics = extractMetrics(proposal, { proposed_tool_calls: 2, executed_tool_calls: 0 });

    expect(metrics.proposed_tool_calls).toBe(3);
    expect(metrics.executed_tool_calls).toBe(0);
    expect(metrics.approved_tool_calls).toBe(0);
    expect(metrics.failed_tool_calls).toBe(0);
    expect(metrics.retried_tool_calls).toBe(0);
  });

  it("preserves backward-compatible tool_calls alias", () => {
    const proposal = { server: "taskos", tool_name: "project_list", arguments: {} };
    const metrics = extractMetrics(proposal, { tool_calls: 4 });

    expect(metrics.tool_calls).toBe(5);
    expect(metrics.proposed_tool_calls).toBe(5);
    expect(metrics.executed_tool_calls).toBe(0);
  });

  it("calculates description length and dependencies", () => {
    const proposal = {
      server: "taskos",
      tool_name: "task_create",
      arguments: { description: "1234567890", dependencies: ["t1", "t2"] }
    };
    const metrics = extractMetrics(proposal);

    expect(metrics.description_length).toBe(10);
    expect(metrics.dependency_count).toBe(2);
    expect(metrics.task_creations).toBe(1);
  });
});
