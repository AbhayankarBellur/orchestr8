import { recordVerificationResult } from "./execution.audit.js";

const READ_TOOLS = new Set([
  "project_list", "project_get", "task_list", "task_get",
  "report_blockers", "taskos_server_info", "pdf_generator", "dashboard_generator"
]);

function extractTaskId(res) {
  if (!res || typeof res !== "object") return null;
  return res.id || res.taskId || res._id || res.data?.id || res.data?.taskId || null;
}

export async function verifyResult({ executionId, proposal, executionResult, executor = null, context = {} }) {
  const toolName = proposal?.tool_name;
  const res = executionResult?.result ?? executionResult;

  if (READ_TOOLS.has(toolName)) {
    const verified = res !== undefined && res !== null;
    const status = verified ? "VERIFIED" : "VERIFICATION_FAILED";
    await recordVerificationResult(executionId, toolName, status, { read_verified: verified });
    return { status, verified, details: { read_verified: verified } };
  }

  if (toolName === "task_create" && executor) {
    const taskId = extractTaskId(res);
    if (!taskId) {
      await recordVerificationResult(executionId, toolName, "VERIFICATION_FAILED", { reason: "Missing task ID" });
      return { status: "VERIFICATION_FAILED", verified: false, details: { reason: "Missing task ID in response" } };
    }
    try {
      const readBack = await executor({
        executionId,
        proposal: { server: "taskos", tool_name: "task_get", arguments: { taskId } },
        context: { ...context, isVerification: true }
      });
      await recordVerificationResult(executionId, toolName, "VERIFIED", { taskId, readBack: readBack.result });
      return { status: "VERIFIED", verified: true, details: { taskId, readBack: readBack.result } };
    } catch (err) {
      await recordVerificationResult(executionId, toolName, "VERIFICATION_FAILED", { taskId, error: err.message });
      return { status: "VERIFICATION_FAILED", verified: false, details: { taskId, error: err.message } };
    }
  }

  await recordVerificationResult(executionId, toolName, "UNVERIFIED", { reason: "No read-back tool" });
  return { status: "UNVERIFIED", verified: false, details: { reason: "No read-back verification tool" } };
}
