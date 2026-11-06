import { describe, it, expect, beforeEach, vi } from "vitest";
import { createExecutionService } from "../../src/services/orchestration.service.js";
import { executionRepository } from "../../src/repositories/execution.repository.js";
import { auditRepository } from "../../src/repositories/audit.repository.js";
import { seedMockMcpTools } from "../helpers/mock-mcp-tools.js";
import * as modelService from "../../src/llm/model.service.js";
import * as mcpInvoker from "../../src/executor/mcp.invoker.js";
import { makeToolDecision, makeTerminalDecision } from "./workflow.helper.js";

describe("Workflow 04 — Project Execution Review", () => {
  beforeEach(async () => {
    await executionRepository.clear();
    await auditRepository.clear();
    seedMockMcpTools();
  });

  it("performs risk review, generates visual dashboard and executive PDF report", async () => {
    vi.spyOn(mcpInvoker, "invokeMcpTool")
      .mockResolvedValueOnce({ success: true, tool: "project_list", result: [{ id: "p1", name: "Backend Migration" }] })
      .mockResolvedValueOnce({ success: true, tool: "project_get", result: { id: "p1", name: "Backend Migration", status: "active" } })
      .mockResolvedValueOnce({ success: true, tool: "task_list", result: [{ id: "t1", status: "in_progress", priority: "critical" }] });

    vi.spyOn(modelService, "structuredRaw")
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("project_list", {}, "taskos") })
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("project_get", { projectId: "p1" }, "taskos") })
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("task_list", { projectId: "p1" }, "taskos") })
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("dashboard_generator", { project_name: "Backend Migration", risks: ["1 critical in-progress"] }, "orchestr8") })
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("pdf_generator", { project_name: "Backend Migration", risks: ["1 critical in-progress"] }, "orchestr8") })
      .mockResolvedValueOnce({ model: "m", content: makeTerminalDecision("Execution review completed") });

    const exec = await createExecutionService({ message: "Perform execution review and risk assessment for Backend Migration" });
    expect(exec.status).toBe("COMPLETED");
    expect(exec.completed_tool_calls.length).toBe(5);
    expect(exec.completed_tool_calls.map(c => c.tool_name)).toEqual([
      "project_list", "project_get", "task_list", "dashboard_generator", "pdf_generator"
    ]);

    const events = await auditRepository.getEventsByExecution(exec.execution_id);
    expect(events.length).toBeGreaterThanOrEqual(10);
  });
});
