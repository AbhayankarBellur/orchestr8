import { fetchExecution, connectSse } from "./api.js";
import { appendLog } from "./console.js";

export function handleEvent(e, nodes, onUpdate) {
  appendLog(e);
  const tool = e.target?.tool || e.input?.tool || e.target?.tool_name;
  const node = nodes.find(n => n.tool === tool || (n.id?.startsWith("gate") && e.event_type.includes("APPROVAL")));
  if (node) {
    node.data = e;
    if (e.event_type === "TOOL_EXECUTION_STARTED") node.status = "RUNNING";
    if (e.event_type === "TOOL_EXECUTION_SUCCEEDED") { node.status = "COMPLETED"; node.duration = e.duration_ms; }
    if (e.event_type === "APPROVAL_REQUEST_CREATED") node.status = "WAITING_FOR_APPROVAL";
  }
  onUpdate();
}

export function subscribeExecutionStream(execId, nodes, onExecUpdate, onRefresh) {
  return connectSse(execId, evt => {
    handleEvent(evt, nodes, onRefresh);
    if (evt.event_type.startsWith("APPROVAL_") || evt.event_type.startsWith("EXECUTION_")) {
      fetchExecution(execId).then(e => onExecUpdate(e));
    }
  });
}
