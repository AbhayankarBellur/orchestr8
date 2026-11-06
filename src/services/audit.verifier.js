import { auditRepository } from "../repositories/audit.repository.js";
import { computeEventHash, GENESIS_HASH } from "../audit/audit.hasher.js";

export async function verifyExecutionIntegrity(executionId) {
  const events = await auditRepository.getEventsByExecution(executionId, { limit: 10000 });
  if (!events || events.length === 0) {
    return { valid: false, execution_id: executionId, error: "No audit events found" };
  }

  let expectedPrevHash = GENESIS_HASH;
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    const expectedSeq = i + 1;

    if (e.sequence_number !== expectedSeq) {
      return { valid: false, execution_id: executionId, error: `Sequence discontinuity at event ${e.event_id}: expected ${expectedSeq}, got ${e.sequence_number}` };
    }
    if (e.previous_event_hash !== expectedPrevHash) {
      return { valid: false, execution_id: executionId, error: `Broken hash chain linkage at event ${e.event_id}` };
    }

    const { event_hash, ...payload } = e;
    const computedHash = computeEventHash(payload, e.previous_event_hash);
    if (computedHash !== event_hash) {
      return { valid: false, execution_id: executionId, error: `Tampered payload detected at event ${e.event_id}` };
    }

    expectedPrevHash = e.event_hash;
  }

  return { valid: true, execution_id: executionId, total_events: events.length };
}
