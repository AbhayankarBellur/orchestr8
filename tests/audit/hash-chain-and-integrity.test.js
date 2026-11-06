import { describe, it, expect, beforeEach } from "vitest";
import { recordEvent } from "../../src/services/audit.service.js";
import { verifyExecutionIntegrity } from "../../src/services/audit.verifier.js";
import { computeEventHash, GENESIS_HASH } from "../../src/audit/audit.hasher.js";
import { auditRepository } from "../../src/repositories/audit.repository.js";

describe("Hash Chain & Integrity Verification", () => {
  beforeEach(async () => { await auditRepository.clear(); });

  it("produces deterministic hashes regardless of object key order", () => {
    const p1 = { a: 1, b: { z: 9, y: 8 } };
    const p2 = { b: { y: 8, z: 9 }, a: 1 };
    expect(computeEventHash(p1, GENESIS_HASH)).toBe(computeEventHash(p2, GENESIS_HASH));
  });

  it("verifies hash-chain continuity across an execution", async () => {
    const e1 = await recordEvent({ execution_id: "ex_chain", event_type: "EXECUTION_CREATED" });
    const e2 = await recordEvent({ execution_id: "ex_chain", event_type: "USER_INPUT_RECEIVED" });
    const e3 = await recordEvent({ execution_id: "ex_chain", event_type: "MODEL_DECISION_CREATED" });

    expect(e1.previous_event_hash).toBe(GENESIS_HASH);
    expect(e2.previous_event_hash).toBe(e1.event_hash);
    expect(e3.previous_event_hash).toBe(e2.event_hash);

    const verification = await verifyExecutionIntegrity("ex_chain");
    expect(verification.valid).toBe(true);
    expect(verification.total_events).toBe(3);
  });

  it("detects tampered event contents", async () => {
    await recordEvent({ execution_id: "ex_tamp", event_type: "EXECUTION_CREATED", status: "OK" });
    auditRepository._tamper("ex_tamp", 0, { status: "TAMPERED" });

    const verification = await verifyExecutionIntegrity("ex_tamp");
    expect(verification.valid).toBe(false);
    expect(verification.error).toMatch(/Tampered payload detected/);
  });

  it("detects missing events in sequence", async () => {
    await recordEvent({ execution_id: "ex_gap", event_type: "EXECUTION_CREATED" });
    await recordEvent({ execution_id: "ex_gap", event_type: "USER_INPUT_RECEIVED" });
    auditRepository._remove("ex_gap", 0);

    const verification = await verifyExecutionIntegrity("ex_gap");
    expect(verification.valid).toBe(false);
    expect(verification.error).toMatch(/Sequence discontinuity/);
  });
});
