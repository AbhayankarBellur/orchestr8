import { describe, it, expect, beforeEach, vi } from "vitest";
import { createExecutionService } from "../../src/services/orchestration.service.js";
import { seedMockMcpTools } from "../helpers/mock-mcp-tools.js";
import * as modelService from "../../src/llm/model.service.js";
import * as mcpInvoker from "../../src/executor/mcp.invoker.js";
import { executionRepository } from "../../src/repositories/execution.repository.js";
import { auditRepository } from "../../src/repositories/audit.repository.js";

const dec = (st, t = null, a = {}, q = null) => JSON.stringify({
  decision_version: "1.0.0", status: st,
  intent: { description: "Q", entities: [], operation: "read" },
  tool_selection: t ? { server: "taskos", tool_name: t, arguments: a, selection_rationale: "r", evidence: [], alternatives_considered: [] } : null,
  clarification: q ? { question: q, missing_information: ["id"] } : null,
  reasoning: { assumptions: ["Done"], uncertainties: [], risks: [] }
});

describe("Orchestration Loop - Multi-Step Reasoning", () => {
  beforeEach(async () => {
    await executionRepository.clear();
    await auditRepository.clear();
    seedMockMcpTools();
  });

  it("completes multi-step reasoning: project_list -> task_list -> completed", async () => {
    vi.spyOn(mcpInvoker, "invokeMcpTool")
      .mockResolvedValueOnce({ success: true, tool: "project_list", result: [{ id: "p1", name: "Backend" }] })
      .mockResolvedValueOnce({ success: true, tool: "task_list", result: [{ id: "t1", title: "Task 1" }] });
    vi.spyOn(modelService, "structuredRaw")
      .mockResolvedValueOnce({ model: "m", content: dec("TOOL_PROPOSED", "project_list") })
      .mockResolvedValueOnce({ model: "m", content: dec("TOOL_PROPOSED", "task_list", { projectId: "p1" }) })
      .mockResolvedValueOnce({ model: "m", content: dec("NO_TOOL_REQUIRED") });

    const exec = await createExecutionService({ message: "Find tasks for backend" });
    expect(exec.status).toBe("COMPLETED");
    expect(exec.completed_tool_calls.length).toBe(2);
    expect(exec.completed_tool_calls[1].arguments.projectId).toBe("p1");
  });

  it("transitions to WAITING_FOR_USER on clarification", async () => {
    vi.spyOn(modelService, "structuredRaw").mockResolvedValueOnce({
      model: "m", content: dec("CLARIFICATION_REQUIRED", null, {}, "Which project?")
    });
    const exec = await createExecutionService({ message: "Show tasks" });
    expect(exec.status).toBe("WAITING_FOR_USER");
    expect(exec.result_summary).toBe("Which project?");
  });
});
