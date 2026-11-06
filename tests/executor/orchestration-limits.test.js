import { describe, it, expect, beforeEach, vi } from "vitest";
import { createExecutionService } from "../../src/services/orchestration.service.js";
import { seedMockMcpTools } from "../helpers/mock-mcp-tools.js";
import { createPolicy } from "../../src/repositories/policy.repository.js";
import * as modelService from "../../src/llm/model.service.js";
import * as mcpInvoker from "../../src/executor/mcp.invoker.js";
import { executionRepository } from "../../src/repositories/execution.repository.js";
import { auditRepository } from "../../src/repositories/audit.repository.js";

const dec = (st, t = null, a = {}) => JSON.stringify({
  decision_version: "1.0.0", status: st, intent: { description: "Q", entities: [], operation: "read" },
  tool_selection: t ? { server: "taskos", tool_name: t, arguments: a, selection_rationale: "r", evidence: [], alternatives_considered: [] } : null,
  clarification: null, reasoning: { assumptions: ["Done"], uncertainties: [], risks: [] }
});

describe("Orchestration Limits & Safeguards", () => {
  beforeEach(async () => {
    await executionRepository.clear();
    await auditRepository.clear();
    seedMockMcpTools();
  });

  it("terminates with FAILED when max_iterations reached", async () => {
    vi.spyOn(mcpInvoker, "invokeMcpTool").mockResolvedValue({ success: true, tool: "project_list", result: [] });
    vi.spyOn(modelService, "structuredRaw").mockResolvedValue({ model: "m", content: dec("TOOL_PROPOSED", "project_list") });

    const exec = await createExecutionService({ message: "Loop test", max_iterations: 2 });
    expect(exec.status).toBe("FAILED");
    expect(exec.termination_reason).toBe("Iteration limit reached");
  });

  it("terminates with BLOCKED when governance denies proposal", async () => {
    createPolicy({
      policy_id: "deny-project-list-test", name: "Deny Project List", enabled: true,
      scope: { type: "tool", server: "taskos", tool: "project_list" },
      condition: { metric: "tool", operator: "NEQ", threshold: "project_list" },
      enforcement: "deny", priority: 1, reason: "Project list forbidden"
    });
    vi.spyOn(modelService, "structuredRaw").mockResolvedValueOnce({
      model: "m", content: dec("TOOL_PROPOSED", "project_list")
    });
    const exec = await createExecutionService({ message: "Blocked test" });
    expect(exec.status).toBe("BLOCKED");
  });
});
