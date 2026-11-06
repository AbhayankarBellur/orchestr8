import { executionRepository } from "../repositories/execution.repository.js";
import { executeStep } from "./orchestration.step.js";
import { recordExecTerminal, recordUserResponse } from "./execution.audit.js";

export async function runOrchestrationLoop(initialExec, snapshot = null) {
  let exec = initialExec;

  while (exec.status === "RUNNING") {
    if (exec.iteration >= exec.max_iterations) {
      await recordExecTerminal(exec.execution_id, false, null, "Iteration limit reached");
      return executionRepository.update(exec.execution_id, { status: "FAILED", termination_reason: "Iteration limit reached" });
    }
    if ((exec.completed_tool_calls?.length || 0) >= exec.max_tool_calls) {
      await recordExecTerminal(exec.execution_id, false, null, "Tool call budget exceeded");
      return executionRepository.update(exec.execution_id, { status: "FAILED", termination_reason: "Tool call budget exceeded" });
    }

    const step = await executeStep(exec, snapshot);

    if (step.status === "APPROVAL_REQUIRED") {
      return executionRepository.update(exec.execution_id, {
        status: "WAITING_FOR_APPROVAL", pending_approval_id: step.approval.approval_id,
        pending_proposal: step.proposal, proposed_tool_calls: [...exec.proposed_tool_calls, step.proposal]
      });
    }
    if (step.status === "BLOCKED") {
      await recordExecTerminal(exec.execution_id, false, null, step.reason);
      return executionRepository.update(exec.execution_id, { status: "BLOCKED", termination_reason: step.reason });
    }
    if (step.status === "CLARIFICATION_REQUIRED") {
      await recordUserResponse(exec.execution_id, step.clarification.question);
      return executionRepository.update(exec.execution_id, { status: "WAITING_FOR_USER", result_summary: step.clarification.question });
    }
    if (step.status === "NO_TOOL_REQUIRED" || step.status === "NO_SUITABLE_TOOL") {
      const summary = step.summary?.assumptions?.join("; ") || "Completed successfully";
      await recordExecTerminal(exec.execution_id, true, summary, null);
      await recordUserResponse(exec.execution_id, summary);
      return executionRepository.update(exec.execution_id, { status: "COMPLETED", result_summary: summary });
    }

    exec = await executionRepository.update(exec.execution_id, {
      iteration: exec.iteration + 1,
      proposed_tool_calls: [...exec.proposed_tool_calls, step.proposal],
      completed_tool_calls: [...exec.completed_tool_calls, { ...step.proposal, result: step.result, verified: step.verified }]
    });
  }
  return exec;
}
