export function buildNodes(exec, events) {
  const nodes = [{ id: "req", title: "User Request", type: "prompt", status: "COMPLETED", data: { request: exec?.original_request } }];
  (events || []).forEach(e => {
    if (e.event_type === "TOOL_PROPOSED" || e.event_type === "TOOL_EXECUTION_SUCCEEDED") {
      const tool = e.target?.tool || e.input?.tool || e.metadata?.tool || "tool";
      const server = e.target?.server || e.input?.server || "taskos";
      let existing = nodes.find(n => n.tool === tool && n.seq === e.sequence_number);
      if (!existing) {
        existing = { id: e.event_id, seq: e.sequence_number, title: `${server}/${tool}`, tool, server, status: "RUNNING", duration: e.duration_ms, data: e };
        nodes.push(existing);
      }
      if (e.event_type === "TOOL_EXECUTION_SUCCEEDED") { existing.status = "COMPLETED"; existing.data = e; existing.duration = e.duration_ms; }
    } else if (e.event_type === "APPROVAL_REQUEST_CREATED") {
      nodes.push({ id: e.event_id, seq: e.sequence_number, title: `Approval Gate`, type: "approval", status: "WAITING_FOR_APPROVAL", data: e });
    }
  });
  return nodes;
}

export function renderNodes(nodes, selectedIdx, onSelect) {
  const container = document.getElementById("node-pipeline");
  if (!container) return;
  container.innerHTML = nodes.map((n, i) => {
    const isSel = i === selectedIdx;
    const badgeColor = n.status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
      : n.status === "WAITING_FOR_APPROVAL" ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
      : n.status === "BLOCKED" ? "bg-red-500/20 text-red-300 border-red-500/40"
      : "bg-blue-500/20 text-blue-300 border-blue-500/40";
    return `<div data-idx="${i}" class="cursor-pointer transition p-3 rounded-lg border ${isSel ? 'border-indigo-500 bg-indigo-950/40' : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'} flex items-center justify-between mb-2">
      <div class="flex items-center gap-3">
        <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono bg-zinc-800 text-zinc-300">${i + 1}</div>
        <div><div class="text-sm font-medium text-zinc-100">${n.title}</div><div class="text-xs text-zinc-400 font-mono">${n.duration ? `${n.duration}ms` : n.type || 'tool'}</div></div>
      </div>
      <span class="text-xs px-2 py-0.5 rounded border font-mono ${badgeColor}">${n.status}</span>
    </div>`;
  }).join("");
  container.querySelectorAll("[data-idx]").forEach(el => el.onclick = () => onSelect(parseInt(el.dataset.idx, 10)));
}
