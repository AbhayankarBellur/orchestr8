import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import * as decisionService from "../../src/orchestrator/decision.service.js";

describe("Orchestrator API Routes", () => {
  it("POST /api/orchestrator/decide returns decision proposal", async () => {
    vi.spyOn(decisionService, "decideTool").mockResolvedValue({
      decision_id: "dec_123",
      timestamp: new Date().toISOString(),
      model: "test-model",
      decision: {
        decision_version: "1.0.0",
        status: "TOOL_PROPOSED",
        tool_selection: { server: "taskos", tool_name: "project_list", arguments: {} }
      },
      validation: { valid: true, can_proceed: true }
    });

    const res = await request(app)
      .post("/api/orchestrator/decide")
      .send({ message: "Find my projects" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.decision.tool_selection.tool_name).toBe("project_list");
  });

  it("POST /api/orchestrator/decide rejects missing or non-string message with 400", async () => {
    const res1 = await request(app).post("/api/orchestrator/decide").send({});
    expect(res1.status).toBe(400);

    const res2 = await request(app).post("/api/orchestrator/decide").send({ message: "   " });
    expect(res2.status).toBe(400);
  });
});
