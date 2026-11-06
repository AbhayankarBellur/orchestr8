import { evaluateOperator } from "./governance.operators.js";
import { matchesScope } from "./governance.scope.js";

function evaluateSinglePolicy(policy, metrics) {
  const { condition, enforcement, reason } = policy;
  const observed = metrics[condition.metric];
  const matches = evaluateOperator(condition.operator, observed, condition.threshold);

  let result = "PASSED";
  if (enforcement === "require_approval") {
    result = matches ? "APPROVAL_REQUIRED" : "PASSED";
  } else if (enforcement === "deny") {
    result = matches ? "PASSED" : "VIOLATED";
  } else if (enforcement === "warn") {
    result = matches ? "PASSED" : "WARNED";
  }

  return {
    policy_id: policy.policy_id, enforcement, result,
    metric: condition.metric, observed, operator: condition.operator,
    threshold: condition.threshold, reason: result !== "PASSED" ? reason : undefined
  };
}

export function evaluatePolicies(policies, proposal, metrics, context = {}) {
  const applicable = policies.filter(p => p.enabled && matchesScope(p.scope, proposal, context));
  const results = applicable.map(p => evaluateSinglePolicy(p, metrics));

  const hasDeny = results.some(r => r.result === "VIOLATED" && r.enforcement === "deny");
  const hasApproval = results.some(r => r.result === "APPROVAL_REQUIRED");
  const hasWarning = results.some(r => r.result === "WARNED");

  let status = "ALLOWED", can_proceed = true;
  if (hasDeny) { status = "DENIED"; can_proceed = false; }
  else if (hasApproval) { status = "APPROVAL_REQUIRED"; can_proceed = false; }
  else if (hasWarning) { status = "WARNING"; can_proceed = true; }

  return {
    status, can_proceed, evaluated_policies: applicable.length,
    passed: results.filter(r => r.result === "PASSED").length,
    violated: results.filter(r => r.result === "VIOLATED").length,
    approval_required: results.filter(r => r.result === "APPROVAL_REQUIRED").length,
    results
  };
}
