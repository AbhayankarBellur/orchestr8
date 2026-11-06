import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { connectDatabase, closeDatabase, getDatabase } from "../../src/config/database.js";
import { executionRepository } from "../../src/repositories/execution.repository.js";
import { resumeExecutionService } from "../../src/services/orchestration.resume.js";
import { createApprovalRequest } from "../../src/services/approval.service.js";
import { approveApprovalRequest } from "../../src/services/approval.decision.js";
import { createPolicySnapshot } from "../../src/governance/governance.snapshot.js";
import * as mcpInvoker from "../../src/executor/mcp.invoker.js";
import * as modelService from "../../src/llm/model.service.js";
import { seedMockMcpTools } from "../helpers/mock-mcp-tools.js";

const decDone = JSON.stringify({ decision_version: "1.0.0", status: "NO_TOOL_REQUIRED", intent: { description: "Q", entities: [], operation: "read" }, tool_selection: null, clarification: null, reasoning: { assumptions: ["Done"], uncertainties: [], risks: [] } });

describe("Restart Recovery - Resumption after Reinitialization", () => {
  const execId = `exec_res_${Date.now()}`;
  let apprId;

  beforeAll(async () => {
    await connectDatabase();
    seedMockMcpTools();
    const snap = createPolicySnapshot();
    const appr = await createApprovalRequest({ server: "taskos", tool_name: "task_create", arguments: { projectId: "p1", title: "Recovered task" }, execution_id: execId, proposal_id: "prop_rec_1", policy_snapshot_id: snap.snapshot_id, policy_snapshot_hash: snap.hash }, { status: "APPROVAL_REQUIRED" });
    apprId = appr.approval_id;
    await approveApprovalRequest(apprId, { id: "admin_1", role: "admin" }, "Approved");
  });

  afterAll(async () => {
    try { const db = getDatabase(); await db.collection("executions").deleteMany({ execution_id: execId }); await db.collection("audit_events").deleteMany({ execution_id: execId }); } catch {}
    await closeDatabase();
  });

  it("resumes WAITING_FOR_APPROVAL from MongoDB without re-executing completed tools", async () => {
    const now = new Date().toISOString();
    await executionRepository.create({ execution_id: execId, original_request: "Resume recovery", status: "WAITING_FOR_APPROVAL", iteration: 1, proposed_tool_calls: [{ tool_name: "task_create" }], completed_tool_calls: [{ server: "taskos", tool_name: "project_list", result: [{ id: "p1" }] }], pending_approval_id: apprId, pending_proposal: { server: "taskos", tool_name: "task_create", arguments: { projectId: "p1", title: "Recovered task" } }, result_summary: null, created_at: now, updated_at: now, termination_reason: null, max_iterations: 10, max_tool_calls: 15 });

    vi.spyOn(mcpInvoker, "invokeMcpTool").mockResolvedValueOnce({ success: true, tool: "task_create", result: { id: "t_rec_99" } });
    vi.spyOn(modelService, "structuredRaw").mockResolvedValueOnce({ model: "m", content: decDone });

    const resumed = await resumeExecutionService(execId, { approval_id: apprId });
    expect(resumed.status).toBe("COMPLETED");
    expect(resumed.completed_tool_calls.length).toBe(2);
    expect(resumed.completed_tool_calls[0].tool_name).toBe("project_list");
    expect(resumed.completed_tool_calls[1].tool_name).toBe("task_create");
  });
});
