import { executionRepository } from "../repositories/execution.repository.js";
import { getApprovalRequest } from "./approval.service.js";
import { getSnapshot } from "../governance/governance.snapshot.js";
import { executeTool } from "../executor/tool.executor.js";
import { verifyResult } from "./verification.service.js";
import { runOrchestrationLoop } from "./orchestration.loop.js";

export async function resumeExecutionService(executionId, input = {}) {
  const exec = await executionRepository.findById(executionId);
  if (!exec) throw Object.assign(new Error(`Execution ${executionId} not found`), { status: 404 });

  if (exec.status === "WAITING_FOR_APPROVAL") {
    const apprId = input.approval_id || exec.pending_approval_id;
    const appr = await getApprovalRequest(apprId);
    if (!appr || appr.status !== "APPROVED") {
      throw Object.assign(new Error(`Cannot resume: approval status is ${appr?.status || "NOT_FOUND"}`), { status: 400 });
    }

    const proposal = exec.pending_proposal;
    const snap = getSnapshot(appr.policy_snapshot_id);
    const context = { execution_id: exec.execution_id, completed_tool_calls: exec.completed_tool_calls };
    const execRes = await executeTool({ executionId: exec.execution_id, proposal, authorization: { approval_id: apprId }, context, snapshot: snap });
    const ver = await verifyResult({ executionId: exec.execution_id, proposal, executionResult: execRes, executor: executeTool, context });

    const updated = await executionRepository.update(executionId, {
      status: "RUNNING", pending_approval_id: null, pending_proposal: null,
      iteration: exec.iteration + 1,
      completed_tool_calls: [...exec.completed_tool_calls, { ...proposal, result: execRes.result, verified: ver.verified }]
    });

    return runOrchestrationLoop(updated, snap);
  }

  if (exec.status === "WAITING_FOR_USER" && input.user_response) {
    const updated = await executionRepository.update(executionId, {
      status: "RUNNING", iteration: exec.iteration + 1,
      original_request: `${exec.original_request} (Clarification: ${input.user_response})`
    });
    return runOrchestrationLoop(updated);
  }

  throw Object.assign(new Error(`Execution ${executionId} is not in a resumable state (${exec.status})`), { status: 400 });
}
