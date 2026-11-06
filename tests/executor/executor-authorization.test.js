import { describe, it, expect, beforeEach, vi } from "vitest";
import { executeTool } from "../../src/executor/tool.executor.js";
import { seedMockMcpTools } from "../helpers/mock-mcp-tools.js";
import { createApprovalRequest } from "../../src/services/approval.service.js";
import { approveApprovalRequest } from "../../src/services/approval.decision.js";
import { createPolicySnapshot } from "../../src/governance/governance.snapshot.js";
import * as mcpInvoker from "../../src/executor/mcp.invoker.js";
import { approvalRepository } from "../../src/repositories/approval.repository.js";
import { auditRepository } from "../../src/repositories/audit.repository.js";

describe("Tool Executor - Exact-Action Authorization", () => {
  const rawProposal = { server: "taskos", tool_name: "task_create", arguments: { projectId: "p1", title: "Build feature" } };
  const authUser = { id: "user_lead", role: "lead" };
  let snap, proposal;

  beforeEach(async () => {
    await approvalRepository.clear();
    await auditRepository.clear();
    seedMockMcpTools();
    snap = createPolicySnapshot();
    proposal = {
      ...rawProposal, proposal_id: "prop_auth_1",
      policy_snapshot_id: snap.snapshot_id, policy_snapshot_hash: snap.hash
    };
    vi.spyOn(mcpInvoker, "invokeMcpTool").mockResolvedValue({
      success: true, tool: "task_create", result: { id: "task_123", title: "Build feature" }
    });
  });

  it("consumes authorization once and rejects replay", async () => {
    const appr = await createApprovalRequest({ ...proposal, execution_id: "e1" }, { status: "APPROVAL_REQUIRED" });
    await approveApprovalRequest(appr.approval_id, authUser, "Approved");
    const res = await executeTool({ executionId: "e1", proposal, authorization: { approval_id: appr.approval_id }, snapshot: snap });
    expect(res.success).toBe(true);

    await expect(executeTool({ executionId: "e1", proposal, authorization: { approval_id: appr.approval_id }, snapshot: snap }))
      .rejects.toThrow(/already consumed/);
  });

  it("rejects execution if arguments modified after approval", async () => {
    const appr = await createApprovalRequest({ ...proposal, execution_id: "e2" }, { status: "APPROVAL_REQUIRED" });
    await approveApprovalRequest(appr.approval_id, authUser, "Approved");
    const tampered = { ...proposal, arguments: { projectId: "p1", title: "Tampered title" } };
    await expect(executeTool({ executionId: "e2", proposal: tampered, authorization: { approval_id: appr.approval_id }, snapshot: snap }))
      .rejects.toThrow(/fingerprint mismatch/);
  });
});
