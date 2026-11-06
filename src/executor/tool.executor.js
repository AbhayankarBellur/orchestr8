import { getUnifiedTool } from "../orchestrator/catalog.adapter.js";
import { validateSchema } from "../tools/schema_compliance/schema.validator.js";
import { enforceGovernance } from "../governance/governance.guard.js";
import { recordGovernanceEvaluation } from "../services/audit.helpers.js";
import { consumeAuthorization } from "../services/authorization.service.js";
import { invokeInternalTool } from "./internal.invoker.js";
import { invokeMcpTool } from "./mcp.invoker.js";
import { recordToolSchemaResult, recordToolExecStarted, recordToolExecResult } from "../services/execution.audit.js";

export async function executeTool({ executionId, proposal, authorization = null, context = {}, snapshot = null }) {
  const tool = getUnifiedTool(proposal?.server, proposal?.tool_name);
  if (!tool) throw new Error(`Tool not found in catalog: ${proposal?.server}:${proposal?.tool_name}`);

  const argErrors = validateSchema(proposal.arguments || {}, tool.inputSchema);
  await recordToolSchemaResult(executionId, proposal.tool_name, argErrors.length === 0, argErrors);
  if (argErrors.length > 0) throw new Error(`Schema validation failed for ${proposal.tool_name}: ${JSON.stringify(argErrors)}`);

  const gov = enforceGovernance(proposal, context, snapshot);
  await recordGovernanceEvaluation(executionId, gov, proposal);

  if (!gov.can_proceed) {
    if (gov.status === "APPROVAL_REQUIRED") {
      if (!authorization?.approval_id) throw new Error(`Approval required for ${proposal.tool_name}`);
      await consumeAuthorization(authorization.approval_id, proposal, snapshot);
    } else {
      throw new Error(`Governance blocked execution: ${gov.status}`);
    }
  }

  await recordToolExecStarted(executionId, proposal);
  const start = Date.now();
  try {
    const raw = proposal.server === "orchestr8"
      ? await invokeInternalTool(proposal.tool_name, proposal.arguments)
      : await invokeMcpTool(proposal.tool_name, proposal.arguments);
    const duration_ms = Date.now() - start;
    await recordToolExecResult(executionId, proposal, true, raw.result, duration_ms);
    return { success: true, server: proposal.server, tool: proposal.tool_name, result: raw.result, duration_ms };
  } catch (err) {
    const duration_ms = Date.now() - start;
    await recordToolExecResult(executionId, proposal, false, err.message, duration_ms);
    throw err;
  }
}
