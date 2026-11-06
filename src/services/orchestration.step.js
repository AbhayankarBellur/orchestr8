import { randomUUID } from "node:crypto";
import { decideTool } from "../orchestrator/decision.service.js";
import { enforceGovernance } from "../governance/governance.guard.js";
import { createPolicySnapshot } from "../governance/governance.snapshot.js";
import { createApprovalRequest } from "./approval.service.js";
import { executeTool } from "../executor/tool.executor.js";
import { verifyResult } from "./verification.service.js";
import { recordToolProposed } from "./execution.audit.js";
import { recordModelRequestStarted, recordModelResponseReceived } from "./model.audit.js";

export async function executeStep(exec, snapshot = null) {
  const context = {
    execution_id: exec.execution_id,
    completed_tool_calls: exec.completed_tool_calls || [],
    executed_tool_calls: exec.completed_tool_calls?.length || 0,
    proposed_tool_calls: (exec.proposed_tool_calls?.length || 0) + 1
  };
  await recordModelRequestStarted(exec.execution_id, { iteration: exec.iteration });
  const decRes = await decideTool(exec.original_request, context);
  await recordModelResponseReceived(exec.execution_id, { iteration: exec.iteration, model: decRes.model });

  const { status, tool_selection: proposal, clarification } = decRes.decision;
  if (status !== "TOOL_PROPOSED") return { status, clarification, summary: decRes.decision.reasoning };

  await recordToolProposed(exec.execution_id, proposal);
  const gov = enforceGovernance(proposal, context, snapshot);

  if (gov.status === "APPROVAL_REQUIRED") {
    const snap = snapshot || createPolicySnapshot();
    const propId = proposal.proposal_id || `prop_${Date.now()}_${randomUUID().slice(0, 8)}`;
    const full = { ...proposal, proposal_id: propId, execution_id: exec.execution_id, policy_snapshot_id: snap.snapshot_id, policy_snapshot_hash: snap.hash };
    const appr = await createApprovalRequest(full, gov);
    return { status: "APPROVAL_REQUIRED", proposal: full, approval: appr };
  }
  if (!gov.can_proceed) return { status: "BLOCKED", reason: gov.status };

  const execRes = await executeTool({ executionId: exec.execution_id, proposal, context, snapshot });
  const ver = await verifyResult({ executionId: exec.execution_id, proposal, executionResult: execRes, executor: executeTool, context });
  return { status: "EXECUTED", proposal, result: execRes.result, verified: ver.verified, verification: ver };
}
