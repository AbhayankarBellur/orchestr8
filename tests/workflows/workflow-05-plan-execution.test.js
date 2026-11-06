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

describe("Workflow 05 — Project Plan Execution", () => {
  beforeEach(async () => {
    await executionRepository.clear();
    await approvalRepository.clear();
    await auditRepository.clear();
    seedMockMcpTools();
  });

  it("executes multi-task plan with separate exact-action approvals and dependency linking", async () => {
    vi.spyOn(mcpInvoker, "invokeMcpTool")
      .mockResolvedValueOnce({ success: true, tool: "task_create", result: { id: "t_rbac_1", title: "RBAC Schema" } })
      .mockResolvedValueOnce({ success: true, tool: "task_get", result: { id: "t_rbac_1", title: "RBAC Schema" } })
      .mockResolvedValueOnce({ success: true, tool: "task_create", result: { id: "t_rbac_2", title: "Role Middleware" } })
      .mockResolvedValueOnce({ success: true, tool: "task_get", result: { id: "t_rbac_2", title: "Role Middleware" } })
      .mockResolvedValueOnce({ success: true, tool: "task_dependency_add", result: { success: true } });

    vi.spyOn(modelService, "structuredRaw")
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("task_create", { projectId: "p1", title: "RBAC Schema" }, "taskos") })
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("task_create", { projectId: "p1", title: "Role Middleware" }, "taskos") })
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("task_dependency_add", { taskId: "t_rbac_2", dependsOnTaskId: "t_rbac_1" }, "taskos") })
      .mockResolvedValueOnce({ model: "m", content: makeToolDecision("pdf_generator", { project_name: "Backend Migration" }, "orchestr8") })
      .mockResolvedValueOnce({ model: "m", content: makeTerminalDecision("Plan executed successfully") });

    let exec = await createExecutionService({ message: "Execute RBAC plan" });
    expect(exec.status).toBe("WAITING_FOR_APPROVAL");
    await approveApprovalRequest(exec.pending_approval_id, { id: "lead", role: "lead" }, "Approve task 1");

    exec = await resumeExecutionService(exec.execution_id, { approval_id: exec.pending_approval_id });
    expect(exec.status).toBe("WAITING_FOR_APPROVAL");
    await approveApprovalRequest(exec.pending_approval_id, { id: "lead", role: "lead" }, "Approve task 2");

    exec = await resumeExecutionService(exec.execution_id, { approval_id: exec.pending_approval_id });
    expect(exec.status).toBe("COMPLETED");
    expect(exec.completed_tool_calls.length).toBe(4);
    expect(exec.completed_tool_calls.map(c => c.tool_name)).toEqual([
      "task_create", "task_create", "task_dependency_add", "pdf_generator"
    ]);
  });
});
