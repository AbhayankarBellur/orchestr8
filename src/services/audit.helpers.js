import { recordEvent } from "./audit.service.js";

export function recordExecutionCreated(executionId, metadata = {}) {
  return recordEvent({ execution_id: executionId, event_type: "EXECUTION_CREATED", metadata });
}

export function recordUserInput(executionId, input, actor = null) {
  return recordEvent({ execution_id: executionId, event_type: "USER_INPUT_RECEIVED", input, actor });
}

export function recordModelDecision(executionId, decision, metadata = {}) {
  return recordEvent({
    execution_id: executionId, event_type: "MODEL_DECISION_CREATED",
    output: decision, status: decision?.status || "RESOLVED", metadata
  });
}

export function recordGovernanceEvaluation(executionId, evaluation, proposal) {
  const isBlocked = !evaluation.can_proceed;
  return recordEvent({
    execution_id: executionId,
    event_type: isBlocked ? "GOVERNANCE_BLOCKED" : "GOVERNANCE_EVALUATED",
    governance: evaluation, target: proposal, status: evaluation.status
  });
}

export function recordApprovalTransition(executionId, eventType, approval) {
  return recordEvent({
    execution_id: executionId, event_type: eventType,
    approval: { approval_id: approval.approval_id, status: approval.status },
    status: approval.status
  });
}
