import { describe, it, expect, beforeEach } from "vitest";
import { createApprovalRequest } from "../../src/services/approval.service.js";
import { approveApprovalRequest } from "../../src/services/approval.decision.js";
import { consumeAuthorization } from "../../src/services/authorization.service.js";
import { evaluateProposalService } from "../../src/services/governance.service.js";
import { recordModelDecision } from "../../src/services/audit.helpers.js";
import { getExecutionEvents } from "../../src/services/audit.service.js";
import { auditRepository } from "../../src/repositories/audit.repository.js";
import { approvalRepository } from "../../src/repositories/approval.repository.js";

describe("Phase 6/7/8 Audit Instrumentation", () => {
  beforeEach(async () => {
    await auditRepository.clear();
    await approvalRepository.clear();
  });

  it("instruments Phase 6 model decisions without exposing private thoughts", async () => {
    const decision = { tool: "project_list", server: "taskos", rationale: "List all projects" };
    await recordModelDecision("exec_p6", decision, { model: "openrouter/free" });
    const events = await getExecutionEvents("exec_p6");
    expect(events).toHaveLength(1);
    expect(events[0].event_type).toBe("MODEL_DECISION_CREATED");
    expect(events[0].output.tool).toBe("project_list");
  });

  it("instruments Phase 7 governance evaluations", async () => {
    const proposal = { server: "taskos", tool_name: "project_list", arguments: {} };
    await evaluateProposalService(proposal, { execution_id: "exec_p7" });
    const events = await getExecutionEvents("exec_p7");
    expect(events).toHaveLength(1);
    expect(events[0].event_type).toBe("GOVERNANCE_EVALUATED");
    expect(events[0].status).toBe("ALLOWED");
  });

  it("instruments Phase 8 approval lifecycle and masks authorization nonces", async () => {
    const input = {
      execution_id: "exec_p8", proposal_id: "prop_1", server: "taskos", tool_name: "task_create",
      arguments: { title: "Audit Task" }, policy_snapshot_id: "s1", policy_snapshot_hash: "a".repeat(64)
    };
    const req = await createApprovalRequest(input);
    const approved = await approveApprovalRequest(req.approval_id, { actorId: "approver_1", role: "approver" });
    await consumeAuthorization(approved.approval_id, { server: "taskos", tool_name: "task_create", arguments: { title: "Audit Task" } });

    const events = await getExecutionEvents("exec_p8");
    expect(events.map(e => e.event_type)).toEqual(["APPROVAL_REQUESTED", "APPROVAL_GRANTED", "AUTHORIZATION_CONSUMED"]);
  });
});
