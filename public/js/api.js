const ACTOR = { actorId: "admin", role: "admin" };
const HEADERS = { "Content-Type": "application/json", "x-trusted-actor-id": ACTOR.actorId, "x-trusted-actor-role": ACTOR.role };

export async function fetchExecutions() {
  const res = await fetch(`/api/audit/executions?actorId=${ACTOR.actorId}&role=${ACTOR.role}`);
  const data = await res.json();
  return data.data || [];
}

export async function fetchExecution(id) {
  const res = await fetch(`/api/executions/${id}?actorId=${ACTOR.actorId}&role=${ACTOR.role}`);
  const data = await res.json();
  return data.data;
}

export async function createExecution(message) {
  const res = await fetch("/api/executions", { method: "POST", headers: HEADERS, body: JSON.stringify({ message }) });
  const data = await res.json();
  return data.data;
}

export async function approveRequest(approvalId) {
  const res = await fetch(`/api/approvals/${approvalId}/decision`, {
    method: "POST", headers: HEADERS, body: JSON.stringify({ decision: "APPROVED", rationale: "Approved via Live Execution Viewer" })
  });
  return res.json();
}

export async function rejectRequest(approvalId) {
  const res = await fetch(`/api/approvals/${approvalId}/decision`, {
    method: "POST", headers: HEADERS, body: JSON.stringify({ decision: "REJECTED", rationale: "Rejected via Live Execution Viewer" })
  });
  return res.json();
}

export async function resumeExecution(execId, approvalId) {
  const res = await fetch(`/api/executions/${execId}/resume`, {
    method: "POST", headers: HEADERS, body: JSON.stringify({ approval_id: approvalId })
  });
  const data = await res.json();
  return data.data;
}

export function connectSse(execId, onEvent) {
  const es = new EventSource(`/api/executions/${execId}/stream?actorId=${ACTOR.actorId}&role=${ACTOR.role}`);
  es.onmessage = (e) => { try { onEvent(JSON.parse(e.data)); } catch {} };
  return () => es.close();
}
