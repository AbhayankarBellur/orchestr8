import { describe, it, expect, beforeEach } from "vitest";
import { enforceGovernance, enforceOrBlock } from "../../src/governance/governance.guard.js";
import { updatePolicy, resetPolicies } from "../../src/repositories/policy.repository.js";

describe("Governance Fail-Fast Guard", () => {
  beforeEach(() => { resetPolicies(); });

  const proposal = { server: "taskos", tool_name: "task_create", arguments: { title: "Deploy", description: "Long enough description", projectId: "p1" } };

  it("blocks task_create when approval is required", () => {
    const res = enforceGovernance(proposal);
    expect(res.status).toBe("APPROVAL_REQUIRED");
    expect(res.can_proceed).toBe(false);
  });

  it("allows task_create when approval policy is disabled", () => {
    updatePolicy("task-create-approval", { enabled: false });
    const res = enforceGovernance(proposal);
    expect(res.status).toBe("ALLOWED");
    expect(res.can_proceed).toBe(true);
  });

  it("denies task_create when task creation limit is exceeded", () => {
    const res = enforceGovernance(proposal, { task_creations: 5 });
    expect(res.status).toBe("DENIED");
    expect(res.can_proceed).toBe(false);
  });

  it("denies execution on unknown server", () => {
    const rogue = { server: "rogue-server", tool_name: "task_create", arguments: {} };
    const res = enforceGovernance(rogue);
    expect(res.status).toBe("DENIED");
    expect(res.can_proceed).toBe(false);
  });

  it("throws GovernanceBlockError in enforceOrBlock when blocked", () => {
    expect(() => enforceOrBlock(proposal)).toThrow("Governance blocked");
  });
});
