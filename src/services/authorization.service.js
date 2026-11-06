import { getApprovalRequest } from "./approval.service.js";
import { computeActionFingerprint } from "../approval/approval.fingerprint.js";
import { approvalRepository } from "../repositories/approval.repository.js";
import { recordApprovalTransition } from "./audit.helpers.js";

const makeErr = (msg, status) => Object.assign(new Error(msg), { status, statusCode: status });

export async function validateAuthorization(approvalId, proposedAction, currentSnapshot = null) {
  const req = await getApprovalRequest(approvalId);
  if (!req) throw makeErr(`Approval request ${approvalId} not found`, 404);
  if (req.status === "EXPIRED") throw makeErr("Authorization expired", 410);
  if (req.status === "CONSUMED") throw makeErr("Authorization already consumed", 409);
  if (req.status !== "APPROVED") throw makeErr(`Cannot authorize action with status ${req.status}`, 400);

  if (currentSnapshot && currentSnapshot.hash !== req.policy_snapshot_hash) {
    throw makeErr("Policy snapshot mismatch: governance policies have changed", 409);
  }

  const actionFingerprint = computeActionFingerprint({
    ...proposedAction,
    execution_id: proposedAction.execution_id || req.execution_id,
    proposal_id: proposedAction.proposal_id || req.proposal_id,
    policy_snapshot_hash: req.policy_snapshot_hash
  });

  if (actionFingerprint !== req.fingerprint) {
    throw makeErr("Exact-action fingerprint mismatch: action modified", 403);
  }
  return { valid: true, approval: req };
}

export async function consumeAuthorization(approvalId, proposedAction, currentSnapshot = null) {
  const { approval } = await validateAuthorization(approvalId, proposedAction, currentSnapshot);
  const consumed_at = new Date().toISOString();
  const updated = await approvalRepository.atomicTransition(approvalId, "APPROVED", {
    status: "CONSUMED", consumed_at
  });
  if (!updated) throw makeErr("Authorization already consumed or state changed", 409);
  await recordApprovalTransition(approval.execution_id, "AUTHORIZATION_CONSUMED", updated);

  return {
    consumed: true, approval_id: approvalId,
    authorization_nonce: approval.authorization_nonce,
    fingerprint: approval.fingerprint, consumed_at
  };
}
