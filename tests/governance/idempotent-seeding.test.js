import { describe, it, expect, beforeEach } from "vitest";
import { seedPolicies, listPolicies, resetPolicies } from "../../src/repositories/policy.repository.js";
import { DEFAULT_POLICIES } from "../../src/governance/default.policies.js";

describe("Policy Seeding Idempotency", () => {
  beforeEach(() => { resetPolicies(); });

  it("contains exactly 9 default policies", () => {
    expect(DEFAULT_POLICIES.length).toBe(9);
    const stored = listPolicies();
    expect(stored.length).toBe(9);
  });

  it("does not duplicate or corrupt entries when re-seeded", () => {
    seedPolicies();
    seedPolicies();
    const stored = listPolicies();
    expect(stored.length).toBe(9);
    const ids = stored.map(p => p.policy_id);
    expect(new Set(ids).size).toBe(9);
  });
});
