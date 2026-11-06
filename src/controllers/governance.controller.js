import * as service from "../services/governance.service.js";

export function getPolicies(req, res) {
  const enabled = req.query.enabled === "true" ? true : req.query.enabled === "false" ? false : undefined;
  res.json({ success: true, data: service.getPolicies({ enabled }) });
}

export function createPolicy(req, res, next) {
  try {
    const policy = service.addPolicy(req.body);
    res.status(201).json({ success: true, data: policy });
  } catch (err) { next(err); }
}

export function updatePolicy(req, res, next) {
  try {
    const policy = service.patchPolicy(req.params.id, req.body);
    res.json({ success: true, data: policy });
  } catch (err) { next(err); }
}

export async function evaluateProposal(req, res, next) {
  try {
    const { proposal, context, snapshot_id } = req.body;
    if (!proposal || typeof proposal !== "object") {
      return res.status(400).json({ success: false, error: "Valid proposal object required" });
    }
    const result = await service.evaluateProposalService(proposal, context || {}, snapshot_id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export function createSnapshot(req, res) {
  res.status(201).json({ success: true, data: service.takeSnapshot() });
}

export function getStatus(req, res) {
  res.json({ success: true, data: service.getGovernanceStatus() });
}
