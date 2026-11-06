import { validateSchema } from "../tools/schema_compliance/schema.validator.js";
import { getUnifiedTool } from "./catalog.adapter.js";

export function validateDecision(decision, decisionSchema) {
  const violations = [];
  const schemaErrors = validateSchema(decision, decisionSchema);
  if (schemaErrors.length > 0) return { valid: false, can_proceed: false, violations: schemaErrors };

  const { status, tool_selection: ts, clarification: c } = decision;
  if (status === "TOOL_PROPOSED") {
    if (!ts) {
      violations.push({ code: "MISSING_TOOL_SELECTION", field: "/tool_selection", message: "tool_selection required for TOOL_PROPOSED" });
    } else {
      const tool = getUnifiedTool(ts.server, ts.tool_name);
      if (!tool) {
        violations.push({ code: "UNKNOWN_TOOL", field: "/tool_selection", message: `Tool ${ts.tool_name} not found on ${ts.server}` });
      } else {
        const argErrors = validateSchema(ts.arguments || {}, tool.inputSchema);
        argErrors.forEach(e => violations.push({ code: "INVALID_ARGUMENT", field: `/tool_selection/arguments${e.field}`, message: e.message }));
      }
      if (!ts.selection_rationale?.trim()) {
        violations.push({ code: "EMPTY_RATIONALE", field: "/tool_selection/selection_rationale", message: "Rationale required" });
      }
    }
  } else if (status === "CLARIFICATION_REQUIRED") {
    if (!c?.question?.trim() || !c?.missing_information?.length) {
      violations.push({ code: "INCOMPLETE_CLARIFICATION", field: "/clarification", message: "Question and missing information required" });
    }
  }
  return { valid: violations.length === 0, can_proceed: violations.length === 0, violations };
}
