import { describe, it, expect, beforeEach } from "vitest";
import { createPolicy, resetPolicies } from "../../src/repositories/policy.repository.js";
import { PolicySchema } from "../../src/schemas/policy.schema.js";

describe("Redaction Enforcement Rejection", () => {
  beforeEach(() => { resetPolicies(); });

  it("rejects policy creation with enforcement: redact", () => {
    const invalidPolicy = {
      policy_id: "redact-policy",
      name: "Redact Sensitive Info",
      scope: { type: "execution" },
      condition: { metric: "input_size", operator: "LT", threshold: 100 },
      enforcement: "redact",
      reason: "Redact inputs"
    };

    expect(() => createPolicy(invalidPolicy)).toThrow();
    expect(() => PolicySchema.parse(invalidPolicy)).toThrow(/invalid_value/);
  });

  it("accepts supported enforcements allow, deny, require_approval, warn", () => {
    for (const enforcement of ["allow", "deny", "require_approval", "warn"]) {
      const valid = {
        policy_id: `test-${enforcement}`,
        name: `Test ${enforcement}`,
        scope: { type: "execution" },
        condition: { metric: "tool_calls", operator: "LTE", threshold: 10 },
        enforcement,
        reason: "Valid enforcement"
      };
      expect(() => createPolicy(valid)).not.toThrow();
    }
  });
});
