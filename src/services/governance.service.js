import { listPolicies, getPolicy, createPolicy, updatePolicy } from "../repositories/policy.repository.js";
import { createPolicySnapshot, getSnapshot } from "../governance/governance.snapshot.js";
import { enforceGovernance } from "../governance/governance.guard.js";
import { recordGovernanceEvaluation } from "./audit.helpers.js";

export function getPolicies(filter) { return listPolicies(filter); }
export function getPolicyById(id) { return getPolicy(id); }
export function addPolicy(data) { return createPolicy(data); }
export function patchPolicy(id, patch) { return updatePolicy(id, patch); }
export function takeSnapshot() { return createPolicySnapshot(); }

export async function evaluateProposalService(proposal, context = {}, snapshotId = null) {
  const snapshot = snapshotId ? getSnapshot(snapshotId) : null;
  const res = enforceGovernance(proposal, context, snapshot);
  if (context.execution_id) await recordGovernanceEvaluation(context.execution_id, res, proposal);
  return res;
}

export function getGovernanceStatus() {
  const all = listPolicies();
  return {
    total_policies: all.length,
    enabled_policies: all.filter(p => p.enabled).length,
    disabled_policies: all.filter(p => !p.enabled).length
  };
}
