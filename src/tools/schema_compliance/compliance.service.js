import { createComplianceResult } from "./compliance.result.js";
import { validateSchema } from "./schema.validator.js";
import { validateSemantics } from "./semantic.validator.js";

export function validateCompliance({ agent, rawOutput, schema, input, attempt = 1 }) {
  const version = schema?.properties?.schema_version?.const || "1.0.0";
  let parsed;
  try {
    parsed = typeof rawOutput === "string" ? JSON.parse(rawOutput) : rawOutput;
  } catch (err) {
    return {
      compliance: createComplianceResult({
        agent, schemaVersion: version, attempt,
        violations: [{ code: "MALFORMED_JSON", field: "/", message: err.message }]
      }),
      data: null
    };
  }
  const sViolations = validateSchema(parsed, schema);
  const semViolations = sViolations.length === 0 ? validateSemantics(agent, parsed, input) : [];
  const allViolations = [...sViolations, ...semViolations];
  return {
    compliance: createComplianceResult({
      agent, schemaVersion: parsed?.schema_version || version, attempt, violations: allViolations
    }),
    data: allViolations.length === 0 ? parsed : null
  };
}
