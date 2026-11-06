import { describe, it, expect, beforeEach } from "vitest";
import { createApprovalRequest } from "../../src/services/approval.service.js";
import { approvalRepository } from "../../src/repositories/approval.repository.js";

describe("Approval Request Creation", () => {
  beforeEach(async () => { await approvalRepository.clear(); });

  const input = {
    execution_id: "exec_1", proposal_id: "prop_1", server: "taskos", tool_name: "task_create",
    arguments: { title: "Deploy" }, policy_snapshot_id: "snap_1",
    policy_snapshot_hash: "a".repeat(64), requester_id: "user_req"
  };

  it("creates a valid pending approval request", async () => {
    const res = await createApprovalRequest(input);
    expect(res.approval_id).toMatch(/^appr_/);
    expect(res.status).toBe("PENDING");
    expect(res.fingerprint).toHaveLength(64);
    expect(res.arguments_hash).toHaveLength(64);
  });

  it("rejects input with missing required fields", async () => {
    await expect(createApprovalRequest({ server: "taskos" })).rejects.toThrow();
  });

  it("rejects creation when governance returned DENIED or BLOCKED", async () => {
    await expect(createApprovalRequest(input, { status: "DENIED" }))
      .rejects.toThrow(/governance DENIED/);
    await expect(createApprovalRequest(input, { status: "BLOCKED" }))
      .rejects.toThrow(/governance BLOCKED/);
  });

  it("accepts creation when governance returned APPROVAL_REQUIRED", async () => {
    const res = await createApprovalRequest(input, { status: "APPROVAL_REQUIRED" });
    expect(res.status).toBe("PENDING");
  });
});
