import { z } from "zod";

export const AuditEventTypeSchema = z.enum([
  "EXECUTION_CREATED", "USER_INPUT_RECEIVED", "MODEL_REQUEST_STARTED",
  "MODEL_RESPONSE_RECEIVED", "MODEL_DECISION_CREATED", "TOOL_PROPOSED",
  "TOOL_SCHEMA_VALIDATED", "TOOL_SCHEMA_REJECTED", "GOVERNANCE_EVALUATED",
  "GOVERNANCE_BLOCKED", "APPROVAL_REQUESTED", "APPROVAL_GRANTED",
  "APPROVAL_REJECTED", "APPROVAL_EXPIRED", "AUTHORIZATION_CONSUMED",
  "TOOL_EXECUTION_STARTED", "TOOL_EXECUTION_SUCCEEDED", "TOOL_EXECUTION_FAILED",
  "TOOL_RESULT_VERIFIED", "TOOL_RESULT_VERIFICATION_FAILED",
  "EXECUTION_COMPLETED", "EXECUTION_FAILED", "USER_RESPONSE_SENT"
]);

export const AuditEventSchema = z.object({
  event_id: z.string().min(1),
  execution_id: z.string().min(1),
  sequence_number: z.number().int().positive(),
  event_type: AuditEventTypeSchema,
  event_version: z.string().default("1.0.0"),
  timestamp: z.string(),
  actor: z.record(z.any()).nullable().optional(),
  target: z.record(z.any()).nullable().optional(),
  input: z.record(z.any()).nullable().optional(),
  output: z.record(z.any()).nullable().optional(),
  status: z.string().nullable().optional(),
  governance: z.record(z.any()).nullable().optional(),
  approval: z.record(z.any()).nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  duration_ms: z.number().nullable().optional(),
  previous_event_hash: z.string().length(64),
  event_hash: z.string().length(64)
});
