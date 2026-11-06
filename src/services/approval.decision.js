import { randomBytes } from "node:crypto";
import { getApprovalRequest } from "./approval.service.js";
import { approvalRepository } from "../repositories/approval.repository.js";
import { recordApprovalTransition } from "./audit.helpers.js";

const makeErr = (msg, status) => Object.assign(new Error(msg), { status, statusCode: status });

export async function approveApprovalRequest(id, actor, reason) {
  const req = await getApprovalRequest(id);
  if (!req) throw makeErr(`Approval request ${id} not found`, 404);
  if (req.status === "EXPIRED") throw makeErr("Cannot approve expired request", 400);
  if (req.status !== "PENDING") throw makeErr(`Cannot approve request with status ${req.status}`, 400);
  if (actor?.actorId && req.requester_id && actor.actorId === req.requester_id) {
    throw makeErr("Self-approval is forbidden: requester cannot approve own request", 403);
  }

  const decision = { decision: "APPROVED", approver_id: actor?.actorId || "unknown", decided_at: new Date().toISOString(), reason };
  const authorization_nonce = randomBytes(16).toString("hex");
  const updated = await approvalRepository.atomicTransition(id, "PENDING", { status: "APPROVED", decision, authorization_nonce });
  if (!updated) throw makeErr("Approval failed: concurrent transition", 409);
  await recordApprovalTransition(req.execution_id, "APPROVAL_GRANTED", updated);
  return updated;
}

export async function rejectApprovalRequest(id, actor, reason) {
  const req = await getApprovalRequest(id);
  if (!req) throw makeErr(`Approval request ${id} not found`, 404);
  if (req.status === "EXPIRED") throw makeErr("Cannot reject expired request", 400);
  if (req.status !== "PENDING") throw makeErr(`Cannot reject request with status ${req.status}`, 400);

  const decision = { decision: "REJECTED", approver_id: actor?.actorId || "unknown", decided_at: new Date().toISOString(), reason };
  const updated = await approvalRepository.atomicTransition(id, "PENDING", { status: "REJECTED", decision });
  if (!updated) throw makeErr("Rejection failed: concurrent transition", 409);
  await recordApprovalTransition(req.execution_id, "APPROVAL_REJECTED", updated);
  return updated;
}
