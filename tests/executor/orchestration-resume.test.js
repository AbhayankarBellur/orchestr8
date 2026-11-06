import { describe, it, expect, beforeEach, vi } from "vitest";
import { createExecutionService } from "../../src/services/orchestration.service.js";
import { resumeExecutionService } from "../../src/services/orchestration.resume.js";
import { approveApprovalRequest } from "../../src/services/approval.decision.js";
import { seedMockMcpTools } from "../helpers/mock-mcp-tools.js";
import * as modelService from "../../src/llm/model.service.js";
import * as mcpInvoker from "../../src/executor/mcp.invoker.js";
import { executionRepository } from "../../src/repositories/execution.repository.js";
import { approvalRepository } from "../../src/repositories/approval.repository.js";
import { auditRepository } from "../../src/repositories/audit.repository.js";

const dec = (st, t = null, a = {}) => JSON.stringify({
  decision_version: "1.0.0", status: st, intent: { description: "Q", entities: [], operation: "write" },
  tool_selection: t ? { server: "taskos", tool_name: t, arguments: a, selection_rationale: "r", evidence: [], alternatives_considered: [] } : null,
  clarification: null, reasoning: { assumptions: ["Done"], uncertainties: [], risks: [] }
});

describe("Orchestration Resumption - Approval Lifecycle", () => {
  beforeEach(async () => {
    await executionRepository.clear();
    await approvalRepository.clear();
    await auditRepository.clear();
    seedMockMcpTools();
  });

  it("pauses on APPROVAL_REQUIRED, executes once approved, prevents re-mutation", async () => {
    vi.spyOn(mcpInvoker, "invokeMcpTool")
      .mockResolvedValueOnce({ success: true, tool: "task_create", result: { id: "t_new_1" } })
      .mockResolvedValueOnce({ success: true, tool: "task_get", result: { id: "t_new_1", title: "Auth" } });
    vi.spyOn(modelService, "structuredRaw")
      .mockResolvedValueOnce({ model: "m", content: dec("TOOL_PROPOSED", "task_create", { projectId: "p1", title: "Auth" }) })
      .mockResolvedValueOnce({ model: "m", content: dec("NO_TOOL_REQUIRED") });

    const exec = await createExecutionService({ message: "Create auth task" });
    expect(exec.status).toBe("WAITING_FOR_APPROVAL");
    expect(exec.pending_approval_id).toBeDefined();

    await approveApprovalRequest(exec.pending_approval_id, { id: "lead_1", role: "lead" }, "Approved");
    const resumed = await resumeExecutionService(exec.execution_id, { approval_id: exec.pending_approval_id });

    expect(resumed.status).toBe("COMPLETED");
    expect(resumed.completed_tool_calls.length).toBe(1);

    await expect(resumeExecutionService(exec.execution_id, { approval_id: exec.pending_approval_id }))
      .rejects.toThrow(/not in a resumable state/);
  });
});
