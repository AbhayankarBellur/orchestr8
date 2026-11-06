import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { createApprovalRequest } from "../../src/services/approval.service.js";
import { approveApprovalRequest } from "../../src/services/approval.decision.js";
import { consumeAuthorization } from "../../src/services/authorization.service.js";
import { approvalRepository } from "../../src/repositories/approval.repository.js";

describe("Concurrency & Approval Routes", () => {
  beforeEach(async () => { await approvalRepository.clear(); });

  const input = {
    execution_id: "e1", proposal_id: "p1", server: "taskos", tool_name: "task_create",
    arguments: { title: "Concurrent" }, policy_snapshot_id: "s1", policy_snapshot_hash: "f".repeat(64)
  };
  const action = { server: "taskos", tool_name: "task_create", arguments: { title: "Concurrent" } };

  it("prevents race condition: concurrent consumption attempts cannot both succeed", async () => {
    const req = await createApprovalRequest(input);
    await approveApprovalRequest(req.approval_id, { actorId: "alice", role: "approver" });

    const results = await Promise.allSettled([
      consumeAuthorization(req.approval_id, action),
      consumeAuthorization(req.approval_id, action)
    ]);

    expect(results.filter(r => r.status === "fulfilled")).toHaveLength(1);
    expect(results.filter(r => r.status === "rejected")).toHaveLength(1);
  });

  it("exposes CRUD and decision HTTP endpoints", async () => {
    const postRes = await request(app).post("/api/approvals").send(input);
    expect(postRes.status).toBe(201);
    const id = postRes.body.data.approval_id;

    const listRes = await request(app).get("/api/approvals");
    expect(listRes.status).toBe(200);

    const getRes = await request(app).get(`/api/approvals/${id}`);
    expect(getRes.status).toBe(200);

    const approveRes = await request(app).post(`/api/approvals/${id}/approve`)
      .set("x-trusted-actor-id", "admin_1").set("x-trusted-actor-role", "admin");
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe("APPROVED");
  });
});
