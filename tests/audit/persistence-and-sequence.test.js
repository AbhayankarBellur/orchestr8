import { describe, it, expect, beforeEach } from "vitest";
import { recordEvent, getExecutionEvents } from "../../src/services/audit.service.js";
import { auditRepository } from "../../src/repositories/audit.repository.js";

describe("Append-Only Persistence & Sequence Allocation", () => {
  beforeEach(async () => { await auditRepository.clear(); });

  it("enforces append-only persistence without update or delete interfaces", () => {
    expect(auditRepository.update).toBeUndefined();
    expect(auditRepository.delete).toBeUndefined();
    expect(auditRepository.remove).toBeUndefined();
  });

  it("allocates strictly monotonic sequence numbers in order", async () => {
    const e1 = await recordEvent({ execution_id: "ex_seq", event_type: "EXECUTION_CREATED" });
    const e2 = await recordEvent({ execution_id: "ex_seq", event_type: "USER_INPUT_RECEIVED" });
    const e3 = await recordEvent({ execution_id: "ex_seq", event_type: "MODEL_DECISION_CREATED" });

    expect(e1.sequence_number).toBe(1);
    expect(e2.sequence_number).toBe(2);
    expect(e3.sequence_number).toBe(3);
  });

  it("handles concurrent event writes by preserving valid sequence order", async () => {
    const results = await Promise.all([
      recordEvent({ execution_id: "ex_conc", event_type: "USER_INPUT_RECEIVED" }),
      recordEvent({ execution_id: "ex_conc", event_type: "USER_INPUT_RECEIVED" }),
      recordEvent({ execution_id: "ex_conc", event_type: "USER_INPUT_RECEIVED" })
    ]);

    const seqs = results.map(r => r.sequence_number).sort((a, b) => a - b);
    expect(seqs).toEqual([1, 2, 3]);
  });

  it("rejects duplicate sequence numbers in repository", async () => {
    const e1 = await recordEvent({ execution_id: "ex_dup", event_type: "EXECUTION_CREATED" });
    await expect(auditRepository.appendEvent({
      ...e1, event_id: "evt_different_id"
    })).rejects.toThrow(/Duplicate sequence/);
  });
});
