import { evaluateOperator } from "./governance.operators.js";
import { matchesScope } from "./governance.scope.js";

function evaluateSinglePolicy(policy, metrics) {
  const { condition, enforcement, reason } = policy;
  const observed = metrics[condition.metric];
  if (condition.operator !== "EXISTS" && observed === undefined) {
    return {
      policy_id: policy.policy_id, enforcement, result: "NOT_EVALUATED",
      metric: condition.metric, observed, operator: condition.operator,
      threshold: condition.threshold, reason: `Metric ${condition.metric} unmeasured`
    };
  }
  const matches = evaluateOperator(condition.operator, observed, condition.threshold);
  let result = "PASSED";
  if (enforcement === "require_approval") result = matches ? "APPROVAL_REQUIRED" : "PASSED";
  else if (enforcement === "deny") result = matches ? "PASSED" : "VIOLATED";
  else if (enforcement === "warn") result = matches ? "PASSED" : "WARNED";

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
  const hasBlocked = results.some(r => r.result === "NOT_EVALUATED" && (r.enforcement === "deny" || r.enforcement === "require_approval"));
  const hasApproval = results.some(r => r.result === "APPROVAL_REQUIRED");
  const hasWarn = results.some(r => r.result === "WARNED");

  let status = "ALLOWED", can_proceed = true;
  if (hasDeny) { status = "DENIED"; can_proceed = false; }
  else if (hasBlocked) { status = "BLOCKED"; can_proceed = false; }
  else if (hasApproval) { status = "APPROVAL_REQUIRED"; can_proceed = false; }
  else if (hasWarn) { status = "WARNING"; can_proceed = true; }

  const count = res => results.filter(r => r.result === res).length;
  return {
    status, can_proceed, evaluated_policies: applicable.length,
    passed: count("PASSED"), violated: count("VIOLATED"),
    approval_required: count("APPROVAL_REQUIRED"), not_evaluated: count("NOT_EVALUATED"),
    results
  };
}