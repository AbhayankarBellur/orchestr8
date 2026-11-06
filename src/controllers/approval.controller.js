import { createApprovalRequest, getApprovalRequest, listApprovalRequests } from "../services/approval.service.js";
import { approveApprovalRequest, rejectApprovalRequest } from "../services/approval.decision.js";

export async function createApproval(req, res, next) {
  try {
    const item = await createApprovalRequest(req.body, req.body.governance);
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
}

export async function listApprovals(req, res, next) {
  try {
    const items = await listApprovalRequests(req.query);
    res.json({ success: true, count: items.length, data: items });
  } catch (err) { next(err); }
}

export async function getApproval(req, res, next) {
  try {
    const item = await getApprovalRequest(req.params.approvalId);
    if (!item) return res.status(404).json({ success: false, message: "Approval not found" });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
}

export async function approveApproval(req, res, next) {
  try {
    const item = await approveApprovalRequest(req.params.approvalId, req.auth, req.body?.reason);
    res.json({ success: true, message: "Approval granted", data: item });
  } catch (err) { next(err); }
}

export async function rejectApproval(req, res, next) {
  try {
    const item = await rejectApprovalRequest(req.params.approvalId, req.auth, req.body?.reason);
    res.json({ success: true, message: "Approval rejected", data: item });
  } catch (err) { next(err); }
}
