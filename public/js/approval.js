export function renderApprovalBar(exec, onApprove, onReject) {
  const bar = document.getElementById("approval-bar");
  if (!bar) return;
  if (exec?.status !== "WAITING_FOR_APPROVAL" || !exec?.pending_approval_id) {
    bar.classList.add("hidden");
    return;
  }
  bar.classList.remove("hidden");
  bar.innerHTML = `
    <div class="p-4 rounded-lg bg-amber-950/40 border border-amber-500/40 flex items-center justify-between">
      <div>
        <div class="text-sm font-semibold text-amber-200">Approval Required for Exact Action</div>
        <div class="text-xs font-mono text-amber-300/80 mt-0.5">Proposed: ${exec.pending_proposal?.server}/${exec.pending_proposal?.tool_name}</div>
      </div>
      <div class="flex items-center gap-2">
        <button id="btn-approve" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition">Approve & Resume</button>
        <button id="btn-reject" class="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded transition">Reject</button>
      </div>
    </div>`;
  document.getElementById("btn-approve").onclick = () => onApprove(exec.pending_approval_id);
  document.getElementById("btn-reject").onclick = () => onReject(exec.pending_approval_id);
}
