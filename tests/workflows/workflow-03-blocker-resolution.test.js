import { describe, it, expect, beforeEach, vi } from "vitest";
import { createExecutionService } from "../../src/services/orchestration.service.js";
import { resumeExecutionService } from "../../src/services/orchestration.resume.js";
import { approveApprovalRequest } from "../../src/services/approval.decision.js";
import { executionRepository } from "../../src/repositories/execution.repository.js";
import { approvalRepository } from "../../src/repositories/approval.repository.js";
import { auditRepository } from "../../src/repositories/audit.repository.js";
import { seedMockMcpTools } from "../helpers/mock-mcp-tools.js";
import * as modelService from "../../src/llm/model.service.js";
import * as mcpInvoker from "../../src/executor/mcp.invoker.js";
import { makeToolDecision, makeTerminalDecision } from "./workflow.helper.js";

describe("Workflow 03 — Blocker Resolution", () => {
  beforeEach(async () => {
    await executionRepository.clear();
    await approvalRepository.clear();
    await auditRepository.clear();
    seedMockMcpTools();
  });

  it("identifies blockers, gates prerequisite transition behind approval, and updates dashboard", async () => {
    vi.spyOn(mcpInvoker, "invokeMcpTool")
      .mockResolvedValueOnce({ success: true, tool: "report_blockers", result: [{ id: "t_bmig_4", blocked: true, blockedBy: "t_bmig_2" }] })
      .mockResolvedValueOnce({ success: true, tool: "task_transition", result: { id: "t_bmig_2", status: "done" } });

    vi.spyOn(modelService, "structuredRaw")
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("report_blockers", { projectId: "p1" }, "taskos") })
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("task_transition", { taskId: "t_bmig_2", status: "done" }, "taskos") })
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("dashboard_generator", { project_name: "Backend Migration", blockers: [] }, "orchestr8") })
      .mockResolvedValueOnce({ model: "m", content: makeTerminalDecision("Blockers resolved and dashboard refreshed") });

    const exec = await createExecutionService({ message: "Identify and resolve blockers in Backend Migration" });
    expect(exec.status).toBe("WAITING_FOR_APPROVAL");
    expect(exec.pending_approval_id).toBeDefined();

    await approveApprovalRequest(exec.pending_approval_id, { id: "admin", role: "lead" }, "Approve prerequisite completion");
    const resumed = await resumeExecutionService(exec.execution_id, { approval_id: exec.pending_approval_id });

    expect(resumed.status).toBe("COMPLETED");
    expect(resumed.completed_tool_calls.length).toBe(3);
    expect(resumed.completed_tool_calls.map(c => c.tool_name)).toEqual([
      "report_blockers", "task_transition", "dashboard_generator"
    ]);
  });
});
