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

describe("Trusted Execution Identity Guard", () => {
  beforeEach(async () => {
    await executionRepository.clear();
    await auditRepository.clear();
  });

  it("rejects unauthenticated execution requests with 401", async () => {
    const res = await request(app).post("/api/executions").send({ message: "Run task" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("derives actor strictly from header and ignores body impersonation", async () => {
    vi.spyOn(modelService, "structuredRaw").mockResolvedValueOnce({ model: "m", content: dec("NO_TOOL_REQUIRED") });
    const res = await request(app)
      .post("/api/executions")
      .set("x-trusted-actor-id", "trusted_dev_42")
      .set("x-trusted-actor-role", "developer")
      .send({ message: "Hello", actor: { id: "impersonated_admin", role: "admin" } });

    expect(res.status).toBe(201);
    const execId = res.body.data.execution_id;

    const events = await auditRepository.getEventsByExecution(execId);
    const inputEvt = events.find(e => e.event_type === "USER_INPUT_RECEIVED");
    expect(inputEvt.actor.id).toBe("trusted_dev_42");
    expect(inputEvt.actor.id).not.toBe("impersonated_admin");
  });
});
