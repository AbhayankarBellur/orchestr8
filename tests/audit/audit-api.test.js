import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { recordEvent } from "../../src/services/audit.service.js";
import { auditRepository } from "../../src/repositories/audit.repository.js";

describe("Audit Query APIs & Access Control", () => {
  beforeEach(async () => { await auditRepository.clear(); });

  it("rejects unauthorized access when auth is missing or invalid role", async () => {
    const unauth = await request(app).get("/api/audit/executions");
    expect(unauth.status).toBe(401);

    const badRole = await request(app).get("/api/audit/executions")
      .set("x-trusted-actor-id", "u1").set("x-trusted-actor-role", "guest");
    expect(badRole.status).toBe(403);
  });

  it("retrieves executions and events with pagination", async () => {
    await recordEvent({ execution_id: "exec_api", event_type: "EXECUTION_CREATED" });
    await recordEvent({ execution_id: "exec_api", event_type: "USER_INPUT_RECEIVED" });

    const listRes = await request(app).get("/api/audit/executions")
      .set("x-trusted-actor-id", "auditor_1").set("x-trusted-actor-role", "auditor");
    expect(listRes.status).toBe(200);
    expect(listRes.body.data).toContain("exec_api");

    const eventsRes = await request(app).get("/api/audit/executions/exec_api/events?limit=1&page=1")
      .set("x-trusted-actor-id", "auditor_1").set("x-trusted-actor-role", "auditor");
    expect(eventsRes.status).toBe(200);
    expect(eventsRes.body.count).toBe(1);
    expect(eventsRes.body.data[0].sequence_number).toBe(1);
  });

  it("exposes verification endpoint checking hash chain integrity", async () => {
    await recordEvent({ execution_id: "exec_v", event_type: "EXECUTION_CREATED" });
    const verifyRes = await request(app).get("/api/audit/executions/exec_v/verify")
      .set("x-trusted-actor-id", "admin_1").set("x-trusted-actor-role", "admin");
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.valid).toBe(true);
    expect(verifyRes.body.data.total_events).toBe(1);
  });
});
