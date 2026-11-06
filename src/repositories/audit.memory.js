const store = new Map();
const getList = id => store.get(id) || [];

export function appendMemAudit(valid) {
  const list = getList(valid.execution_id);
  if (list.some(e => e.event_id === valid.event_id || e.sequence_number === valid.sequence_number)) {
    const e = new Error(`Duplicate sequence: ${valid.sequence_number}`);
    e.code = 11000;
    throw e;
  }
  list.push(Object.freeze({ ...valid }));
  store.set(valid.execution_id, list);
  return { ...valid };
}

export function findLatestMemAudit(id) {
  const list = getList(id);
  return list.length ? { ...list[list.length - 1] } : null;
}

export function findMemAuditEvents(id, page = 1, limit = 50) {
  return getList(id).slice((page - 1) * limit, page * limit).map(e => ({ ...e }));
}

export function listMemAuditExecutions(page = 1, limit = 50) {
  return Array.from(store.keys()).slice((page - 1) * limit, page * limit);
}

export function tamperMemAudit(id, idx, patch) {
  const list = getList(id);
  if (list[idx]) list[idx] = { ...list[idx], ...patch };
}

export function removeMemAudit(id, idx) {
  const list = getList(id);
  if (list) list.splice(idx, 1);
}

export function clearMemAudit() {
  store.clear();
}
