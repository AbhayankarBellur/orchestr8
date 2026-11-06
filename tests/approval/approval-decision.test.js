import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { createApprovalRequest } from "../../src/services/approval.service.js";
import { approveApprovalRequest, rejectApprovalRequest } from "../../src/services/approval.decision.js";
import { approvalRepository } from "../../src/repositories/approval.repository.js";

describe("Approval Decisions and Identity Security", () => {
  beforeEach(async () => { await approvalRepository.clear(); });

  const input = {
    execution_id: "e1", proposal_id: "p1", server: "taskos", tool_name: "task_create",
    policy_snapshot_id: "s1", policy_snapshot_hash: "b".repeat(64), requester_id: "requester_bob"
  };

  it("approves request with valid approver and generates nonce", async () => {
    const req = await createApprovalRequest(input);
    const approved = await approveApprovalRequest(req.approval_id, { actorId: "alice_approver", role: "approver" }, "Looks safe");
    expect(approved.status).toBe("APPROVED");
    expect(approved.authorization_nonce).toHaveLength(32);
    expect(approved.decision.approver_id).toBe("alice_approver");
  });

  it("rejects request with valid approver", async () => {
    const req = await createApprovalRequest(input);
    const rejected = await rejectApprovalRequest(req.approval_id, { actorId: "alice_approver", role: "approver" }, "Denied");
    expect(rejected.status).toBe("REJECTED");
    expect(rejected.authorization_nonce).toBeNull();
  });

  it("prevents requester from self-approving", async () => {
    const req = await createApprovalRequest(input);
    await expect(approveApprovalRequest(req.approval_id, { actorId: "requester_bob", role: "approver" }))
      .rejects.toThrow(/Self-approval is forbidden/);
  });

  it("HTTP endpoints enforce authentication and approver role", async () => {
    const req = await createApprovalRequest(input);
    const unauth = await request(app).post(`/api/approvals/${req.approval_id}/approve`);
    expect(unauth.status).toBe(401);

    const badRole = await request(app).post(`/api/approvals/${req.approval_id}/approve`)
      .set("x-trusted-actor-id", "charlie").set("x-trusted-actor-role", "guest");
    expect(badRole.status).toBe(403);
  });
});
