import { fetchExecutions, fetchExecution, fetchEvents, createExecution, approveRequest, rejectRequest, resumeExecution, connectSse } from "./api.js";
import { buildNodes, renderNodes } from "./nodes.js";
import { renderInspector } from "./inspector.js";
import { renderApprovalBar } from "./approval.js";

let state = { exec: null, events: [], nodes: [], selIdx: 0, sseCleanup: null };

async function selectExec(id) {
  if (state.sseCleanup) state.sseCleanup();
  state.exec = await fetchExecution(id);
  state.events = await fetchEvents(id);
  refreshUI();
  state.sseCleanup = connectSse(id, evt => {
    state.events.push(evt);
    if (evt.event_type.startsWith("EXECUTION_") || evt.event_type.startsWith("APPROVAL_")) {
      fetchExecution(id).then(e => { state.exec = e; refreshUI(); });
    } else { refreshUI(); }
  });
}

function refreshUI() {
  state.nodes = buildNodes(state.exec, state.events);
  renderNodes(state.nodes, state.selIdx, idx => { state.selIdx = idx; refreshUI(); });
  renderInspector(state.nodes[state.selIdx]);
  renderApprovalBar(state.exec, async aid => {
    await approveRequest(aid);
    state.exec = await resumeExecution(state.exec.execution_id, aid);
    refreshUI();
  }, async aid => {
    await rejectRequest(aid);
    state.exec = await fetchExecution(state.exec.execution_id);
    refreshUI();
  });
}

export async function launchPrompt(prompt) {
  const exec = await createExecution(prompt);
  selectExec(exec.execution_id);
}

window.launchWorkflow = launchPrompt;
window.selectExecution = selectExec;
fetchExecutions().then(list => {
  const sel = document.getElementById("exec-select");
  if (sel && list.length) {
    sel.innerHTML = list.map(e => `<option value="${e.execution_id}">${e.execution_id} - ${e.status}</option>`).join("");
    sel.onchange = () => selectExec(sel.value);
    selectExec(list[0].execution_id);
  }
});
