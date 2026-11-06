import { randomUUID } from "node:crypto";
import { auditRepository } from "../repositories/audit.repository.js";
import { redactSensitiveData } from "../audit/audit.redactor.js";
import { computeEventHash, GENESIS_HASH } from "../audit/audit.hasher.js";

const locks = new Map();

export async function recordEvent(params) {
  if (!params?.execution_id) throw new Error("Missing required execution_id for audit event");
  const execId = params.execution_id;

  const prevLock = locks.get(execId) || Promise.resolve();
  let release;
  const currentLock = new Promise(res => { release = res; });
  locks.set(execId, currentLock);

  await prevLock;
  try {
    const seq = await auditRepository.getNextSequence(execId);
    const latest = await auditRepository.getLatestEvent(execId);
    const prevHash = latest ? latest.event_hash : GENESIS_HASH;
    const event_id = `evt_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const timestamp = new Date().toISOString();

    const payload = {
      event_id, execution_id: execId, sequence_number: seq,
      event_type: params.event_type, event_version: params.event_version || "1.0.0",
      timestamp, actor: redactSensitiveData(params.actor) || null,
      target: redactSensitiveData(params.target) || null,
      input: redactSensitiveData(params.input) || null,
      output: redactSensitiveData(params.output) || null,
      status: params.status || null,
      governance: redactSensitiveData(params.governance) || null,
      approval: redactSensitiveData(params.approval) || null,
      metadata: redactSensitiveData(params.metadata) || null,
      duration_ms: params.duration_ms ?? null, previous_event_hash: prevHash
    };

    const event_hash = computeEventHash(payload, prevHash);
    return await auditRepository.appendEvent({ ...payload, event_hash });
  } finally {
    release();
  }
}

export function getExecutionEvents(id, opt) { return auditRepository.getEventsByExecution(id, opt); }
export function listExecutions(opt) { return auditRepository.listExecutions(opt); }
