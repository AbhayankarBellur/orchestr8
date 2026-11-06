import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { connectDatabase, closeDatabase, getDatabase } from "../../src/config/database.js";
import { recordEvent, getExecutionEvents } from "../../src/services/audit.service.js";
import { verifyExecutionIntegrity } from "../../src/services/audit.verifier.js";

describe("Cross-Process Concurrency & Hash Continuity", () => {
  const concExecId = `exec_conc_${Date.now()}`;

  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    try {
      const db = getDatabase();
      await db.collection("audit_events").deleteMany({ execution_id: concExecId });
    } catch {}
    await closeDatabase();
  });

  it("safely serializes concurrent audit writes without sequence gaps or hash breaks", async () => {
    const concurrentWrites = Array.from({ length: 6 }, (_, i) =>
      recordEvent({
        execution_id: concExecId,
        event_type: "USER_INPUT_RECEIVED",
        input: { index: i, text: `Concurrent event ${i}` }
      })
    );

    const results = await Promise.all(concurrentWrites);
    expect(results.length).toBe(6);

    const events = await getExecutionEvents(concExecId);
    expect(events.length).toBe(6);

    const seqs = events.map(e => e.sequence_number);
    expect(seqs).toEqual([1, 2, 3, 4, 5, 6]);

    // Verify cryptographic integrity of the entire chain
    const verification = await verifyExecutionIntegrity(concExecId);
    expect(verification.valid).toBe(true);
    expect(verification.total_events).toBe(6);
  });
});
