import { fetchExecution, createExecution, approveRequest, rejectRequest, resumeExecution } from "./api.js";
import { getWorkflow } from "./workflows.js";
import { renderNodes } from "./nodes.js";
import { renderInspector } from "./inspector.js";
import { renderApprovalBar } from "./approval.js";
import { clearLogs } from "./console.js";
import { subscribeExecutionStream } from "./stream.js";
import { initHistory } from "./history.js";

let state = { wfId: "wf-1", exec: null, nodes: [], selIdx: 0, sseCleanup: null };

export function selectWorkflow(id) {
  if (state.sseCleanup) state.sseCleanup();
  state.wfId = id;
  const wf = getWorkflow(id);
  state.nodes = wf.nodes;
  state.selIdx = 0;
  state.exec = null;
  clearLogs();
  document.getElementById("prompt-input").value = wf.prompt;
  document.querySelectorAll("[data-wfid]").forEach(b => {
    b.className = b.dataset.wfid === id ? "px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-xs border border-indigo-500 shadow-md transition" : "px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-300 hover:bg-zinc-800 text-xs border border-zinc-800 transition";
  });
  refreshUI();
}

export async function runCurrentWorkflow() {
  const prompt = document.getElementById("prompt-input").value;
  if (!prompt) return;
  state.nodes.forEach(n => { n.status = "PENDING"; n.duration = null; n.data = null; });
  clearLogs();
  refreshUI();
  state.exec = await createExecution(prompt);
  state.sseCleanup = subscribeExecutionStream(state.exec.execution_id, state.nodes, e => { state.exec = e; refreshUI(); }, refreshUI);
}

function refreshUI() {
  renderNodes(state.nodes, state.selIdx, idx => { state.selIdx = idx; refreshUI(); });
  renderInspector(state.nodes[state.selIdx]);
  const onApprove = async aid => { await approveRequest(aid); state.exec = await resumeExecution(state.exec.execution_id, aid); refreshUI(); };
  const onReject = async aid => { await rejectRequest(aid); state.exec = await fetchExecution(state.exec.execution_id); refreshUI(); };
  const onRespond = async text => { state.exec = await resumeExecution(state.exec.execution_id, null, text); refreshUI(); };
  renderApprovalBar(state.exec, onApprove, onReject, onRespond);
}
window.selectWorkflow = selectWorkflow; window.runCurrentWorkflow = runCurrentWorkflow;
selectWorkflow("wf-1");
initHistory(id => {
  fetchExecution(id).then(e => { state.exec = e; refreshUI(); });
  subscribeExecutionStream(id, state.nodes, e => { state.exec = e; refreshUI(); }, refreshUI); });
