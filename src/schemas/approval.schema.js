import { z } from "zod";

export const ApprovalStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED", "CONSUMED"]);

export const DecisionSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  approver_id: z.string().min(1),
  decided_at: z.string(),
  reason: z.string().optional()
});

export const ApprovalRequestSchema = z.object({
  approval_id: z.string().min(1),
  execution_id: z.string().min(1),
  proposal_id: z.string().min(1),
  server: z.string().min(1),
  tool_name: z.string().min(1),
  arguments: z.record(z.any()).default({}),
  arguments_hash: z.string().length(64),
  policy_snapshot_hash: z.string().length(64),
  policy_snapshot_id: z.string().min(1),
  requester_id: z.string().default("anonymous"),
  status: ApprovalStatusSchema.default("PENDING"),
  created_at: z.string(),
  expires_at: z.string(),
  fingerprint: z.string().length(64),
  decision: DecisionSchema.nullable().default(null),
  authorization_nonce: z.string().nullable().default(null),
  consumed_at: z.string().nullable().default(null)
});

export const CreateApprovalInputSchema = z.object({
  execution_id: z.string().min(1),
  proposal_id: z.string().min(1),
  server: z.string().min(1),
  tool_name: z.string().min(1),
  arguments: z.record(z.any()).default({}),
  policy_snapshot_id: z.string().min(1),
  policy_snapshot_hash: z.string().length(64),
  requester_id: z.string().optional(),
  ttl_ms: z.number().int().positive().optional()
});
