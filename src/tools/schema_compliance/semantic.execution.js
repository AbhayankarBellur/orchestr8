const ALLOWED = new Set(["create_task", "add_dependency", "generate_dashboard", "generate_pdf"]);

export function validateExecutionSemantics(data) {
  const violations = [], actions = data?.actions || [];
  const seen = new Set(), allIds = new Set(actions.map(a => a.action_id));
  actions.forEach((a, i) => {
    if (seen.has(a.action_id)) violations.push({ code: "DUPLICATE_ACTION_ID", field: `/actions/${i}/action_id`, message: `Duplicate action id: ${a.action_id}` });
    seen.add(a.action_id);
    if (!ALLOWED.has(a.action_type)) violations.push({ code: "INVALID_ACTION_TYPE", field: `/actions/${i}/action_type`, message: `Invalid action type: ${a.action_type}` });
    (a.depends_on || []).forEach(dep => {
      if (!allIds.has(dep)) violations.push({ code: "UNKNOWN_ACTION_DEPENDENCY", field: `/actions/${i}/depends_on`, message: `Unknown action dependency: ${dep}` });
    });
    if (["create_task", "add_dependency"].includes(a.action_type) && a.requires_approval !== true) {
      violations.push({ code: "UNAPPROVED_TASK_MUTATION", field: `/actions/${i}/requires_approval`, message: `Action ${a.action_type} requires approval` });
    }
    if (!Array.isArray(a.verification_steps) || a.verification_steps.length === 0) {
      violations.push({ code: "MISSING_VERIFICATION_STEPS", field: `/actions/${i}/verification_steps`, message: "Action must include verification steps" });
    }
  });
  return violations;
}
