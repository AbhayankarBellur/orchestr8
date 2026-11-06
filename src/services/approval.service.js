import { randomUUID } from "node:crypto";
import { CreateApprovalInputSchema } from "../schemas/approval.schema.js";
import { computeArgumentsHash, computeActionFingerprint } from "../approval/approval.fingerprint.js";
import { approvalRepository } from "../repositories/approval.repository.js";

const DEFAULT_TTL = 15 * 60 * 1000;
const makeErr = (msg, status) => Object.assign(new Error(msg), { status, statusCode: status });

export async function createApprovalRequest(input, gov) {
  const data = CreateApprovalInputSchema.parse(input);
  if (gov && ["DENIED", "BLOCKED"].includes(gov.status)) {
    throw makeErr(`Cannot create approval request: governance ${gov.status}`, 403);
  }
  if (gov && gov.status !== "APPROVAL_REQUIRED") {
    throw makeErr("Approval request only permitted when governance status is APPROVAL_REQUIRED", 400);
  }

  const approval_id = `appr_${Date.now()}_${randomUUID().slice(0, 8)}`;
  const now = Date.now(), created_at = new Date(now).toISOString();
  const expires_at = new Date(now + (data.ttl_ms || DEFAULT_TTL)).toISOString();
  const args = data.arguments || {};

  return approvalRepository.create({
    ...data, approval_id, created_at, expires_at, arguments: args,
    arguments_hash: computeArgumentsHash(args),
    fingerprint: computeActionFingerprint({ ...data, arguments: args }),
    status: "PENDING", requester_id: data.requester_id || "anonymous",
    decision: null, authorization_nonce: null, consumed_at: null
  });
}

export async function getApprovalRequest(id) {
  const req = await approvalRepository.findById(id);
  if (!req) return null;
  if ((req.status === "PENDING" || req.status === "APPROVED") && Date.now() >= new Date(req.expires_at).getTime()) {
    return approvalRepository.update(id, { status: "EXPIRED" });
  }
  return req;
}

export async function listApprovalRequests(filter = {}) {
  const all = await approvalRepository.find(filter), now = Date.now();
  const check = r => (r.status === "PENDING" || r.status === "APPROVED") && now >= new Date(r.expires_at).getTime();
  return Promise.all(all.map(r => check(r) ? approvalRepository.update(r.approval_id, { status: "EXPIRED" }) : r));
}
