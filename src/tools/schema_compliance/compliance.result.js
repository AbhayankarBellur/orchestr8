import { z } from "zod";

export const ViolationSchema = z.object({
  code: z.string(),
  field: z.string(),
  message: z.string()
});

export const ComplianceResultSchema = z.object({
  tool: z.literal("schema_compliance"),
  valid: z.boolean(),
  can_proceed: z.boolean(),
  agent: z.string(),
  schema_version: z.string(),
  attempt: z.number().int().min(1),
  violations: z.array(ViolationSchema)
});

export function createComplianceResult({
  agent,
  schemaVersion,
  attempt = 1,
  violations = []
}) {
  const valid = violations.length === 0;
  return ComplianceResultSchema.parse({
    tool: "schema_compliance",
    valid,
    can_proceed: valid,
    agent: agent || "unknown",
    schema_version: schemaVersion || "unknown",
    attempt,
    violations
  });
}
