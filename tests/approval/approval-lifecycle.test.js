import { describe, it, expect, beforeEach } from "vitest";
import { createApprovalRequest, getApprovalRequest } from "../../src/services/approval.service.js";
import { approveApprovalRequest } from "../../src/services/approval.decision.js";
import { consumeAuthorization } from "../../src/services/authorization.service.js";
import { approvalRepository } from "../../src/repositories/approval.repository.js";

describe("Approval Lifecycle & Expiration", () => {
  beforeEach(async () => { await approvalRepository.clear(); });

  const input = {
    execution_id: "e1", proposal_id: "p1", server: "taskos", tool_name: "task_create",
    arguments: { title: "Short TTL" }, policy_snapshot_id: "s1", policy_snapshot_hash: "c".repeat(64),
    ttl_ms: 10
  };

  it("transitions request to EXPIRED when TTL passes", async () => {
    const req = await createApprovalRequest(input);
    await new Promise(r => setTimeout(r, 25));
    const fetched = await getApprovalRequest(req.approval_id);
    expect(fetched.status).toBe("EXPIRED");
  });

  it("rejects approval attempts after expiration", async () => {
    const req = await createApprovalRequest(input);
    await new Promise(r => setTimeout(r, 25));
    await expect(approveApprovalRequest(req.approval_id, { actorId: "alice", role: "approver" }))
      .rejects.toThrow(/Cannot approve expired request/);
  });

  it("rejects consumption before approval is granted", async () => {
    const pending = await createApprovalRequest({ ...input, ttl_ms: 60000 });
    const action = {
      server: "taskos", tool_name: "task_create", arguments: { title: "Short TTL" },
      execution_id: "e1", proposal_id: "p1"
    };

    await expect(consumeAuthorization(pending.approval_id, action))
      .rejects.toThrow(/Cannot authorize action with status PENDING/);
  });
});
