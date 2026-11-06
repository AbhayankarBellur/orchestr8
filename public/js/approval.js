export function renderApprovalBar(exec, onApprove, onReject, onRespond) {
  const bar = document.getElementById("approval-bar");
  if (!bar) return;
  if (exec?.status === "WAITING_FOR_APPROVAL" && exec?.pending_approval_id) {
    bar.classList.remove("hidden");
    bar.innerHTML = `
      <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between shadow-sm">
        <div>
          <div class="text-xs font-bold text-amber-900">Approval Required for Exact Action</div>
          <div class="text-[11px] font-mono text-amber-700">Proposed: ${exec.pending_proposal?.server}/${exec.pending_proposal?.tool_name}</div>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-approve" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition shadow-xs">Approve & Resume</button>
          <button id="btn-reject" class="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition shadow-xs">Reject</button>
        </div>
      </div>`;
    document.getElementById("btn-approve").onclick = () => onApprove(exec.pending_approval_id);
    document.getElementById("btn-reject").onclick = () => onReject(exec.pending_approval_id);
    return;
  }
  if (exec?.status === "WAITING_FOR_USER") {
    bar.classList.remove("hidden");
    bar.innerHTML = `
      <div class="p-3.5 rounded-xl bg-sky-50 border border-sky-300 space-y-2 shadow-sm">
        <div class="text-xs font-bold text-sky-900">Clarification Requested by Agent</div>
        <div class="text-xs text-sky-700 font-mono">${exec.result_summary || "Please provide required input:"}</div>
        <div class="flex items-center gap-2 pt-1">
          <input id="user-clarify-input" type="text" placeholder="Type your response here..." class="flex-1 bg-white border border-sky-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-mono shadow-xs" />
          <button id="btn-clarify" class="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition shadow-md shadow-sky-600/20">Submit & Resume</button>
        </div>
      </div>`;
    document.getElementById("btn-clarify").onclick = () => {
      const val = document.getElementById("user-clarify-input").value;
      if (val && onRespond) onRespond(val);
    };
    return;
  }
  bar.classList.add("hidden");
}