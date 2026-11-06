import { AuditEventSchema } from "../schemas/audit.schema.js";

const executions = new Map(), sequences = new Map();

export const auditRepository = {
  async appendEvent(eventData) {
    const valid = AuditEventSchema.parse(eventData);
    const execId = valid.execution_id, list = executions.get(execId) || [];
    if (list.some(e => e.event_id === valid.event_id)) throw new Error(`Duplicate event ID ${valid.event_id}`);
    if (list.some(e => e.sequence_number === valid.sequence_number)) throw new Error(`Duplicate sequence ${valid.sequence_number}`);

    list.push(Object.freeze({ ...valid }));
    executions.set(execId, list);
    sequences.set(execId, valid.sequence_number);
    return { ...valid };
  },

  async getLatestEvent(id) {
    const list = executions.get(id) || [];
    return list.length ? { ...list[list.length - 1] } : null;
  },

  async getNextSequence(id) { return (sequences.get(id) || 0) + 1; },

  async getEventsByExecution(id, { page = 1, limit = 50 } = {}) {
    const list = executions.get(id) || [], start = (page - 1) * limit;
    return list.slice(start, start + limit).map(e => ({ ...e }));
  },

  async listExecutions({ page = 1, limit = 50 } = {}) {
    const ids = Array.from(executions.keys()), start = (page - 1) * limit;
    return ids.slice(start, start + limit);
  },

  _tamper(id, idx, patch) {
    const list = executions.get(id);
    if (list && list[idx]) list[idx] = { ...list[idx], ...patch };
  },

  _remove(id, idx) {
    const list = executions.get(id);
    if (list) list.splice(idx, 1);
  },

  async clear() { executions.clear(); sequences.clear(); }
};
