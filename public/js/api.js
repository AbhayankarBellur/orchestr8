const HEADERS = { "Content-Type": "application/json", "x-trusted-actor-id": "admin", "x-trusted-actor-role": "admin" };

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
  const res = await fetch(`/api/approvals/${approvalId}/approve`, {
    method: "POST", headers: HEADERS, body: JSON.stringify({ reason: "Approved via Viewer" })
  });
  return res.json();
}

export async function rejectRequest(approvalId) {
  const res = await fetch(`/api/approvals/${approvalId}/reject`, {
    method: "POST", headers: HEADERS, body: JSON.stringify({ reason: "Rejected via Viewer" })
  });
  return res.json();
}

export async function resumeExecution(execId, approvalId, userResponse) {
  const body = userResponse ? { user_response: userResponse } : { approval_id: approvalId };
  const res = await fetch(`/api/executions/${execId}/resume`, {
    method: "POST", headers: HEADERS, body: JSON.stringify(body)
  });
  return (await res.json()).data;
}

export function connectSse(execId, onEvent) {
  const es = new EventSource(`/api/executions/${execId}/stream?actorId=${ACTOR.actorId}`);
  es.onmessage = e => { try { onEvent(JSON.parse(e.data)); } catch {} };
  return () => es.close();
}
