import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { executionRepository } from "../../src/repositories/execution.repository.js";
import { auditRepository } from "../../src/repositories/audit.repository.js";
import * as modelService from "../../src/llm/model.service.js";

const dec = st => JSON.stringify({
  decision_version: "1.0.0", status: st, intent: { description: "Q", entities: [], operation: "read" },
  tool_selection: null, clarification: null, reasoning: { assumptions: ["Done"], uncertainties: [], risks: [] }
});

describe("Execution API Endpoints", () => {
  beforeEach(async () => {
    await executionRepository.clear();
    await auditRepository.clear();
  });

  it("POST /api/executions starts run and GET returns status and events", async () => {
    vi.spyOn(modelService, "structuredRaw").mockResolvedValueOnce({ model: "m", content: dec("NO_TOOL_REQUIRED") });
    const postRes = await request(app).post("/api/executions").set("x-trusted-actor-id", "u1").send({ message: "Hello" });
    expect(postRes.status).toBe(201);
    const execId = postRes.body.data.execution_id;

    const getRes = await request(app).get(`/api/executions/${execId}`).set("x-trusted-actor-id", "u1");
    expect(getRes.body.data.status).toBe("COMPLETED");

    const eventsRes = await request(app).get(`/api/executions/${execId}/events`).set("x-trusted-actor-id", "u1");
    expect(eventsRes.body.data.length).toBeGreaterThan(0);
    expect(eventsRes.body.data[0].event_type).toBe("EXECUTION_CREATED");
  });

  it("POST /api/executions/:id/resume resumes waiting execution", async () => {
    const now = new Date().toISOString();
    await executionRepository.create({
      execution_id: "exec_wait_user", original_request: "List tasks",
      status: "WAITING_FOR_USER", iteration: 1, proposed_tool_calls: [],
      completed_tool_calls: [], pending_approval_id: null, pending_proposal: null,
      result_summary: "Which?", created_at: now, updated_at: now,
      termination_reason: null, max_iterations: 10, max_tool_calls: 15
    });
    vi.spyOn(modelService, "structuredRaw").mockResolvedValueOnce({ model: "m", content: dec("NO_TOOL_REQUIRED") });

    const res = await request(app).post("/api/executions/exec_wait_user/resume").set("x-trusted-actor-id", "u1").send({ user_response: "Project A" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("COMPLETED");
  });
});
