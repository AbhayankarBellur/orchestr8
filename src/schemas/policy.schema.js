import { z } from "zod";

export const ScopeSchema = z.object({
  type: z.enum(["execution", "agent", "tool", "server", "action", "input", "output"]),
  server: z.string().optional(),
  tool: z.string().optional(),
  agent: z.string().optional()
});

export const ConditionSchema = z.object({
  metric: z.string(),
  operator: z.enum(["EQ", "NEQ", "GT", "GTE", "LT", "LTE", "IN", "NOT_IN", "CONTAINS", "EXISTS"]),
  threshold: z.any().optional(),
  unit: z.string().optional()
});

export const PolicySchema = z.object({
  policy_id: z.string().min(1),
  version: z.string().default("1.0.0"),
  name: z.string().min(1),
  enabled: z.boolean().default(true),
  scope: ScopeSchema,
  condition: ConditionSchema,
  enforcement: z.enum(["allow", "deny", "require_approval", "warn", "redact"]),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  reason: z.string().min(1),
  priority: z.number().int().default(100)
});

export const PolicyPatchSchema = PolicySchema.partial().omit({ policy_id: true });
