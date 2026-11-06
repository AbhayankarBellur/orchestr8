import { fetchExecution, connectSse } from "./api.js";
import { appendLog } from "./console.js";

export function handleEvent(e, nodes, onUpdate) {
  appendLog(e);
  if (e.event_type === "USER_INPUT_RECEIVED") {
    const req = nodes.find(n => n.id === "req");
    if (req) { req.status = "COMPLETED"; req.input = e.input; req.hash = e.event_hash; req.sequence = e.sequence_number; }
  }
  const tool = e.target?.tool || e.input?.tool || e.target?.tool_name;
  const isGate = e.event_type.includes("APPROVAL");
  const node = nodes.find(n => (n.tool === tool && n.status !== "COMPLETED") || (n.id?.startsWith("gate") && n.status !== "COMPLETED" && isGate))
    || nodes.find(n => n.tool === tool || (n.id?.startsWith("gate") && isGate));

  if (node) {
    if (e.event_hash) node.hash = e.event_hash;
    if (e.sequence_number !== undefined) node.sequence = e.sequence_number;
    if (e.event_type.includes("GOVERNANCE")) node.governance = e.governance;
    if (e.event_type === "TOOL_PROPOSED" || e.event_type === "TOOL_EXECUTION_STARTED") {
      node.status = "RUNNING";
      if (e.input) node.input = e.input;
    }
    if (e.event_type === "TOOL_EXECUTION_SUCCEEDED") {
      node.status = "COMPLETED";
      node.output = e.output;
      node.duration = e.duration_ms;
    }
    if (e.event_type === "TOOL_RESULT_VERIFIED") node.verification = e.output;
    if (e.event_type === "APPROVAL_REQUEST_CREATED") node.status = "WAITING_FOR_APPROVAL";
    if (e.event_type === "APPROVAL_DECISION_RECORDED" && e.status === "APPROVED") node.status = "COMPLETED";
  }
  onUpdate();
}

export function subscribeExecutionStream(execId, nodes, onExecUpdate, onRefresh) {
  return connectSse(execId, evt => {
    handleEvent(evt, nodes, onRefresh);
    if (evt.event_type.startsWith("APPROVAL_") || evt.event_type.startsWith("EXECUTION_") || evt.event_type === "USER_RESPONSE_SENT") {
      fetchExecution(execId).then(e => onExecUpdate(e));
    }
  });
}
