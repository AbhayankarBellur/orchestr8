import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { resetPolicies } from "../../src/repositories/policy.repository.js";

describe("Governance API Routes", () => {
  beforeEach(() => { resetPolicies(); });

  it("GET /api/governance/policies returns policies", async () => {
    const res = await request(app).get("/api/governance/policies");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("POST /api/governance/policies creates new policy", async () => {
    const res = await request(app).post("/api/governance/policies").send({
      policy_id: "api-test-policy", name: "API Test", scope: { type: "execution" },
      condition: { metric: "tool_calls", operator: "LTE", threshold: 10 },
      enforcement: "deny", reason: "Limit"
    });
    expect(res.status).toBe(201);
    expect(res.body.data.policy_id).toBe("api-test-policy");
  });

  it("POST /api/governance/evaluate evaluates a proposal", async () => {
    const res = await request(app).post("/api/governance/evaluate").send({
      proposal: { server: "taskos", tool_name: "project_list", arguments: {} }
    });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("ALLOWED");
    expect(res.body.data.can_proceed).toBe(true);
  });

  it("POST /api/governance/snapshot creates immutable snapshot", async () => {
    const res = await request(app).post("/api/governance/snapshot");
    expect(res.status).toBe(201);
    expect(res.body.data.snapshot_id).toMatch(/^snap_/);
    expect(res.body.data.hash).toBeDefined();
  });
});
