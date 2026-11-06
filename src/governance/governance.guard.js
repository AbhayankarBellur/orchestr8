import { randomUUID } from "node:crypto";
import { extractMetrics } from "./governance.metrics.js";
import { evaluatePolicies } from "./governance.evaluator.js";
import { listPolicies } from "../repositories/policy.repository.js";

export function enforceGovernance(proposal, context = {}, snapshot = null) {
  const evaluation_id = `eval_${Date.now()}_${randomUUID().slice(0, 8)}`;
  const policies = snapshot ? snapshot.policies : listPolicies({ enabled: true });
  const metrics = extractMetrics(proposal, context);
  const evaluation = evaluatePolicies(policies, proposal, metrics, context);

  return {
    evaluation_id,
    timestamp: new Date().toISOString(),
    proposal: {
      server: proposal?.server || "",
      tool: proposal?.tool_name || proposal?.name || "",
      arguments: proposal?.arguments || {}
    },
    metrics,
    snapshot_id: snapshot?.snapshot_id || null,
    ...evaluation
  };
}

export function enforceOrBlock(proposal, context = {}, snapshot = null) {
  const result = enforceGovernance(proposal, context, snapshot);
  if (!result.can_proceed) {
    const blocking = result.results.find(r => r.result === "VIOLATED" || r.result === "APPROVAL_REQUIRED");
    const err = new Error(`Governance blocked: ${blocking?.reason || result.status}`);
    err.name = "GovernanceBlockError";
    err.status = 403;
    err.evaluation = result;
    throw err;
  }
  return result;
}
