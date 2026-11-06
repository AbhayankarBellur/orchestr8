import { describe, it, expect, beforeEach } from "vitest";
import { createApprovalRequest } from "../../src/services/approval.service.js";
import { approveApprovalRequest } from "../../src/services/approval.decision.js";
import { consumeAuthorization } from "../../src/services/authorization.service.js";
import { approvalRepository } from "../../src/repositories/approval.repository.js";

describe("Exact-Action Authorization Consumption", () => {
  beforeEach(async () => { await approvalRepository.clear(); });

  const input = {
    execution_id: "e1", proposal_id: "p1", server: "taskos", tool_name: "task_create",
    arguments: { title: "Original" }, policy_snapshot_id: "s1", policy_snapshot_hash: "d".repeat(64)
  };
  const action = { server: "taskos", tool_name: "task_create", arguments: { title: "Original" } };

  async function getApproved() {
    const req = await createApprovalRequest(input);
    return approveApprovalRequest(req.approval_id, { actorId: "alice", role: "approver" });
  }

  it("consumes authorization exactly once and prevents second consumption", async () => {
    const appr = await getApproved();
    const consumed = await consumeAuthorization(appr.approval_id, action);
    expect(consumed.consumed).toBe(true);
    await expect(consumeAuthorization(appr.approval_id, action))
      .rejects.toThrow(/Authorization already consumed/);
  });

  it("invalidates authorization when arguments are modified", async () => {
    const appr = await getApproved();
    await expect(consumeAuthorization(appr.approval_id, { ...action, arguments: { title: "Tampered" } }))
      .rejects.toThrow(/Exact-action fingerprint mismatch/);
  });

  it("invalidates authorization when tool or server are modified", async () => {
    const appr = await getApproved();
    await expect(consumeAuthorization(appr.approval_id, { ...action, tool_name: "task_delete" }))
      .rejects.toThrow(/Exact-action fingerprint mismatch/);
    await expect(consumeAuthorization(appr.approval_id, { ...action, server: "other" }))
      .rejects.toThrow(/Exact-action fingerprint mismatch/);
  });

  it("invalidates authorization when current policy snapshot changes", async () => {
    const appr = await getApproved();
    await expect(consumeAuthorization(appr.approval_id, action, { hash: "e".repeat(64) }))
      .rejects.toThrow(/Policy snapshot mismatch/);
  });
});
