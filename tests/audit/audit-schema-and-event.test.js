import { describe, it, expect, beforeEach } from "vitest";
import { recordEvent, getExecutionEvents } from "../../src/services/audit.service.js";
import { auditRepository } from "../../src/repositories/audit.repository.js";
import { AuditEventSchema } from "../../src/schemas/audit.schema.js";

describe("Audit Schema & Event Creation", () => {
  beforeEach(async () => { await auditRepository.clear(); });

  it("creates a valid audit event with all required fields", async () => {
    const event = await recordEvent({
      execution_id: "exec_1", event_type: "EXECUTION_CREATED", metadata: { test: true }
    });
    expect(event.event_id).toMatch(/^evt_/);
    expect(event.sequence_number).toBe(1);
    expect(event.previous_event_hash).toHaveLength(64);
    expect(event.event_hash).toHaveLength(64);
    expect(AuditEventSchema.safeParse(event).success).toBe(true);
  });

  it("rejects invalid event schema or unknown event type", () => {
    expect(() => AuditEventSchema.parse({ event_id: "e1" })).toThrow();
    expect(() => AuditEventSchema.parse({
      event_id: "e1", execution_id: "ex1", sequence_number: 1,
      event_type: "INVALID_EVENT_TYPE", timestamp: new Date().toISOString(),
      previous_event_hash: "0".repeat(64), event_hash: "a".repeat(64)
    })).toThrow();
  });

  it("fails when execution_id is missing", async () => {
    await expect(recordEvent({ event_type: "EXECUTION_CREATED" })).rejects.toThrow(/execution_id/);
  });

  it("generates unique event IDs and does not fabricate tool execution events", async () => {
    const e1 = await recordEvent({ execution_id: "exec_u", event_type: "USER_INPUT_RECEIVED" });
    const e2 = await recordEvent({ execution_id: "exec_u", event_type: "USER_INPUT_RECEIVED" });
    expect(e1.event_id).not.toBe(e2.event_id);
    const events = await getExecutionEvents("exec_u");
    expect(events.some(e => e.event_type.startsWith("TOOL_EXECUTION_"))).toBe(false);
  });
});
