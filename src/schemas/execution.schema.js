import { z } from "zod";

export const ExecutionStatusSchema = z.enum([
  "RUNNING",
  "WAITING_FOR_APPROVAL",
  "WAITING_FOR_USER",
  "COMPLETED",
  "FAILED",
  "BLOCKED"
]);

export const CreateExecutionSchema = z.object({
  message: z.string().min(1),
  actor: z.record(z.any()).optional().nullable(),
  max_iterations: z.number().int().positive().max(30).optional().default(10),
  max_tool_calls: z.number().int().positive().max(30).optional().default(15)
});

export const ResumeExecutionSchema = z.object({
  approval_id: z.string().optional(),
  user_response: z.string().optional()
});

export const ExecutionRecordSchema = z.object({
  execution_id: z.string().min(1),
  original_request: z.string().min(1),
  status: ExecutionStatusSchema,
  iteration: z.number().int().nonnegative().default(0),
  proposed_tool_calls: z.array(z.record(z.any())).default([]),
  completed_tool_calls: z.array(z.record(z.any())).default([]),
  pending_approval_id: z.string().nullable().default(null),
  pending_proposal: z.record(z.any()).nullable().default(null),
  result_summary: z.string().nullable().default(null),
  created_at: z.string(),
  updated_at: z.string(),
  termination_reason: z.string().nullable().default(null),
  max_iterations: z.number().int().default(10),
  max_tool_calls: z.number().int().default(15)
});
