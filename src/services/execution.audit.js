import { recordEvent } from "./audit.service.js";

const toRecord = v => (v !== null && typeof v === "object" && !Array.isArray(v)) ? v : { result: v };

export const recordToolProposed = (execId, p) => recordEvent({
  execution_id: execId, event_type: "TOOL_PROPOSED",
  target: { server: p.server, tool: p.tool_name },
  input: toRecord(p.arguments || {}), status: "PROPOSED"
});

export const recordToolSchemaResult = (execId, tool, valid, violations = []) => recordEvent({
  execution_id: execId,
  event_type: valid ? "TOOL_SCHEMA_VALIDATED" : "TOOL_SCHEMA_REJECTED",
  target: { tool }, output: { valid, violations }, status: valid ? "VALID" : "INVALID"
});

export const recordToolExecStarted = (execId, p) => recordEvent({
  execution_id: execId, event_type: "TOOL_EXECUTION_STARTED",
  target: { server: p.server, tool: p.tool_name },
  input: toRecord(p.arguments || {}), status: "RUNNING"
});

export const recordToolExecResult = (execId, p, ok, out, duration_ms) => recordEvent({
  execution_id: execId,
  event_type: ok ? "TOOL_EXECUTION_SUCCEEDED" : "TOOL_EXECUTION_FAILED",
  target: { server: p.server, tool: p.tool_name },
  output: ok ? toRecord(out) : { error: String(out) },
  status: ok ? "SUCCESS" : "FAILURE", duration_ms
});

export const recordVerificationResult = (execId, tool, status, details) => recordEvent({
  execution_id: execId,
  event_type: status === "VERIFIED" ? "TOOL_RESULT_VERIFIED" : "TOOL_RESULT_VERIFICATION_FAILED",
  target: { tool }, output: toRecord(details || {}), status
});

export const recordExecTerminal = (execId, ok, summary, reason) => recordEvent({
  execution_id: execId,
  event_type: ok ? "EXECUTION_COMPLETED" : "EXECUTION_FAILED",
  output: { summary, reason }, status: ok ? "COMPLETED" : "FAILED"
});

export const recordUserResponse = (execId, response) => recordEvent({
  execution_id: execId, event_type: "USER_RESPONSE_SENT",
  output: { response }, status: "SENT"
});
