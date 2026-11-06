const ACTOR = { actorId: "admin", role: "admin" };
const HEADERS = { "Content-Type": "application/json", "x-trusted-actor-id": ACTOR.actorId, "x-trusted-actor-role": ACTOR.role };

export async function fetchExecutions() {
  const res = await fetch("/api/audit/executions", { headers: HEADERS });
  return (await res.json()).data || [];
}

export async function fetchExecution(id) {
  const res = await fetch(`/api/executions/${id}`, { headers: HEADERS });
  return (await res.json()).data;
}

export async function fetchEvents(id) {
  const res = await fetch(`/api/executions/${id}/events`, { headers: HEADERS });
  return (await res.json()).data || [];
}

export async function createExecution(message) {
  const res = await fetch("/api/executions", { method: "POST", headers: HEADERS, body: JSON.stringify({ message }) });
  return (await res.json()).data;
}

export async function approveRequest(approvalId) {
  const res = await fetch(`/api/approvals/${approvalId}/decision`, {
    method: "POST", headers: HEADERS, body: JSON.stringify({ decision: "APPROVED", rationale: "Approved via Viewer" })
  });
  return res.json();
}

export async function rejectRequest(approvalId) {
  const res = await fetch(`/api/approvals/${approvalId}/decision`, {
    method: "POST", headers: HEADERS, body: JSON.stringify({ decision: "REJECTED", rationale: "Rejected via Viewer" })
  });
  return res.json();
}

export async function resumeExecution(execId, approvalId) {
  const res = await fetch(`/api/executions/${execId}/resume`, {
    method: "POST", headers: HEADERS, body: JSON.stringify({ approval_id: approvalId })
  });
  return (await res.json()).data;
}

export function connectSse(execId, onEvent) {
  const es = new EventSource(`/api/executions/${execId}/stream?actorId=${ACTOR.actorId}`);
  es.onmessage = e => { try { onEvent(JSON.parse(e.data)); } catch {} };
  return () => es.close();
}
