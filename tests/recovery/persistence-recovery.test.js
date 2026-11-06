import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { connectDatabase, closeDatabase, getDatabase } from "../../src/config/database.js";
import { executionRepository } from "../../src/repositories/execution.repository.js";
import { recordEvent, getExecutionEvents } from "../../src/services/audit.service.js";
import { verifyExecutionIntegrity } from "../../src/services/audit.verifier.js";

describe("MongoDB Persistence & Restart Recovery", () => {
  const testExecId = `exec_persist_${Date.now()}`;

  beforeAll(async () => { await connectDatabase(); });
  afterAll(async () => {
    try {
      const db = getDatabase();
      await db.collection("executions").deleteMany({ execution_id: testExecId });
      await db.collection("audit_events").deleteMany({ execution_id: testExecId });
    } catch {}
    await closeDatabase();
  });

  it("persists execution record and audit hash chain across restarts", async () => {
    const now = new Date().toISOString();
    await executionRepository.create({
      execution_id: testExecId, original_request: "Persist test",
      status: "WAITING_FOR_APPROVAL", iteration: 2, proposed_tool_calls: [{ tool_name: "task_create" }],
      completed_tool_calls: [{ tool_name: "project_list", result: [{ id: "p1" }] }],
      pending_approval_id: "appr_test_persist", pending_proposal: { tool_name: "task_create" },
      result_summary: null, created_at: now, updated_at: now, termination_reason: null,
      max_iterations: 10, max_tool_calls: 15
    });

    await recordEvent({ execution_id: testExecId, event_type: "EXECUTION_CREATED" });
    await recordEvent({ execution_id: testExecId, event_type: "USER_INPUT_RECEIVED", input: { message: "Persist test" } });

    const recovered = await executionRepository.findById(testExecId);
    expect(recovered.status).toBe("WAITING_FOR_APPROVAL");
    expect(recovered.pending_approval_id).toBe("appr_test_persist");
    expect(recovered.completed_tool_calls.length).toBe(1);

    const events = await getExecutionEvents(testExecId);
    expect(events.length).toBe(2);
    expect(events[1].sequence_number).toBe(2);

    const integrity = await verifyExecutionIntegrity(testExecId);
    expect(integrity.valid).toBe(true);
  });
});
