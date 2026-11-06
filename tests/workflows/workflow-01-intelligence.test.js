import { describe, it, expect, beforeEach, vi } from "vitest";
import { createExecutionService } from "../../src/services/orchestration.service.js";
import { executionRepository } from "../../src/repositories/execution.repository.js";
import { auditRepository } from "../../src/repositories/audit.repository.js";
import { seedMockMcpTools } from "../helpers/mock-mcp-tools.js";
import * as modelService from "../../src/llm/model.service.js";
import * as mcpInvoker from "../../src/executor/mcp.invoker.js";
import { makeToolDecision, makeTerminalDecision } from "./workflow.helper.js";

describe("Workflow 01 — Project Intelligence", () => {
  beforeEach(async () => {
    await executionRepository.clear();
    await auditRepository.clear();
    seedMockMcpTools();
  });

  it("executes read-only project intelligence sequence without human approval", async () => {
    vi.spyOn(mcpInvoker, "invokeMcpTool")
      .mockResolvedValueOnce({ success: true, tool: "project_list", result: [{ id: "p1", name: "Backend Migration" }] })
      .mockResolvedValueOnce({ success: true, tool: "project_get", result: { id: "p1", name: "Backend Migration" } })
      .mockResolvedValueOnce({ success: true, tool: "task_list", result: [{ id: "t1", title: "Task 1" }] })
      .mockResolvedValueOnce({ success: true, tool: "report_blockers", result: [{ id: "t2", blocked: true }] });

    vi.spyOn(modelService, "structuredRaw")
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("project_list", {}, "taskos") })
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("project_get", { projectId: "p1" }, "taskos") })
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("task_list", { projectId: "p1" }, "taskos") })
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("report_blockers", { projectId: "p1" }, "taskos") })
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("dashboard_generator", { project_name: "Backend Migration" }, "orchestr8") })
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("pdf_generator", { project_name: "Backend Migration" }, "orchestr8") })
      .mockResolvedValueOnce({ model: "m", content: makeTerminalDecision("Intelligence report generated") });

    const exec = await createExecutionService({ message: "Generate intelligence report for Backend Migration" });
    expect(exec.status).toBe("COMPLETED");
    expect(exec.completed_tool_calls.length).toBe(6);
    expect(exec.completed_tool_calls.map(c => c.tool_name)).toEqual([
      "project_list", "project_get", "task_list", "report_blockers", "dashboard_generator", "pdf_generator"
    ]);

    const events = await auditRepository.getEventsByExecution(exec.execution_id);
    expect(events.some(e => e.event_type === "TOOL_EXECUTION_SUCCEEDED")).toBe(true);
  });
});
