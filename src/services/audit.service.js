import { randomUUID } from "node:crypto";
import { auditRepository } from "../repositories/audit.repository.js";
import { redactSensitiveData } from "../audit/audit.redactor.js";
import { computeEventHash, GENESIS_HASH } from "../audit/audit.hasher.js";
import { emitAuditEvent } from "./audit.emitter.js";

const locks = new Map();

export async function recordEvent(params, maxRetries = 10) {
  if (!params?.execution_id) throw new Error("Missing required execution_id for audit event");
  const execId = params.execution_id;
  const prevLock = locks.get(execId) || Promise.resolve();
  let release;
  locks.set(execId, new Promise(res => { release = res; }));
  await prevLock;

  try {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const latest = await auditRepository.getLatestEvent(execId);
        const seq = latest ? latest.sequence_number + 1 : 1;
        const prevHash = latest ? latest.event_hash : GENESIS_HASH;
        const event_id = `evt_${Date.now()}_${randomUUID().slice(0, 8)}`;
        const payload = {
          event_id, execution_id: execId, sequence_number: seq,
          event_type: params.event_type, event_version: params.event_version || "1.0.0",
          timestamp: new Date().toISOString(), actor: redactSensitiveData(params.actor) || null,
          target: redactSensitiveData(params.target) || null, input: redactSensitiveData(params.input) || null,
          output: redactSensitiveData(params.output) || null, status: params.status || null,
          governance: redactSensitiveData(params.governance) || null, approval: redactSensitiveData(params.approval) || null,
          metadata: redactSensitiveData(params.metadata) || null, duration_ms: params.duration_ms ?? null, previous_event_hash: prevHash
        };
        const event_hash = computeEventHash(payload, prevHash);
        const saved = await auditRepository.appendEvent({ ...payload, event_hash });
        emitAuditEvent(execId, saved);
        return saved;
      } catch (err) {
        if ((err.code === 11000 || /duplicate/i.test(err.message)) && attempt < maxRetries) {
          await new Promise(r => setTimeout(r, Math.random() * 20 + 5));
          continue;
        }
        throw err;
      }
    }
  } finally { release(); }
}

export const getExecutionEvents = (id, opt) => auditRepository.getEventsByExecution(id, opt);
export const listExecutions = (opt) => auditRepository.listExecutions(opt);
