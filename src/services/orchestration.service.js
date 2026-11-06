import { randomUUID } from "node:crypto";
import { executionRepository } from "../repositories/execution.repository.js";
import { recordExecutionCreated, recordUserInput } from "./audit.helpers.js";
import { getExecutionEvents } from "./audit.service.js";
import { runOrchestrationLoop } from "./orchestration.loop.js";

export async function createExecutionService(input) {
  const execution_id = `exec_${Date.now()}_${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  const initial = await executionRepository.create({
    execution_id,
    original_request: input.message,
    status: "RUNNING",
    iteration: 0,
    proposed_tool_calls: [],
    completed_tool_calls: [],
    pending_approval_id: null,
    pending_proposal: null,
    result_summary: null,
    created_at: now,
    updated_at: now,
    termination_reason: null,
    max_iterations: input.max_iterations ?? 10,
    max_tool_calls: input.max_tool_calls ?? 15
  });

  await recordExecutionCreated(execution_id, { actor: input.actor || null });
  await recordUserInput(execution_id, { message: input.message }, input.actor || null);

  return runOrchestrationLoop(initial);
}

export async function getExecutionService(id) {
  return executionRepository.findById(id);
}

export async function getExecutionEventsService(id, options) {
  return getExecutionEvents(id, options);
}
