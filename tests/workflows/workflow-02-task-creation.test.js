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

describe("Workflow 02 — Task Creation & Verification", () => {
  beforeEach(async () => {
    await executionRepository.clear();
    await approvalRepository.clear();
    await auditRepository.clear();
    seedMockMcpTools();
  });

  it("gates task_create behind approval, authorizes, executes and verifies read-back", async () => {
    vi.spyOn(mcpInvoker, "invokeMcpTool")
      .mockResolvedValueOnce({ success: true, tool: "project_list", result: [{ id: "p1", name: "Backend Migration" }] })
      .mockResolvedValueOnce({ success: true, tool: "task_list", result: [{ id: "t1", title: "Existing" }] })
      .mockResolvedValueOnce({ success: true, tool: "task_create", result: { id: "t_jwt_1", title: "Implement JWT" } })
      .mockResolvedValueOnce({ success: true, tool: "task_get", result: { id: "t_jwt_1", title: "Implement JWT" } });

    vi.spyOn(modelService, "structuredRaw")
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("project_list", {}, "taskos") })
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("task_list", { projectId: "p1" }, "taskos") })
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("task_create", { projectId: "p1", title: "Implement JWT" }, "taskos") })
      .mockResolvedValueOnce({ model: "m", content: makeTerminalDecision("Task created and verified") });

    const exec = await createExecutionService({ message: "Add task to Backend Migration: Implement JWT" });
    expect(exec.status).toBe("WAITING_FOR_APPROVAL");
    expect(exec.pending_approval_id).toBeDefined();

    await approveApprovalRequest(exec.pending_approval_id, { id: "lead_dev", role: "lead" }, "Approved JWT task creation");
    const resumed = await resumeExecutionService(exec.execution_id, { approval_id: exec.pending_approval_id });

    expect(resumed.status).toBe("COMPLETED");
    expect(resumed.completed_tool_calls.length).toBe(3);
    expect(resumed.completed_tool_calls[2].tool_name).toBe("task_create");
    expect(resumed.completed_tool_calls[2].verified).toBe(true);
  });
});
