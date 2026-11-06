export function syncNodesWithExec(exec, nodes) {
  if (!exec) return;
  const req = nodes.find(n => n.id === "req") || nodes[0];
  if (req) { req.status = "COMPLETED"; req.input = { message: exec.original_request }; }
  for (const call of (exec.completed_tool_calls || [])) {
    const node = nodes.find(n => n.tool === call.tool_name && n.status !== "COMPLETED")
      || nodes.find(n => n.tool === call.tool_name);
    if (node) {
      node.status = "COMPLETED";
      node.input = call.arguments;
      node.output = call.result;
      node.verification = call.verified ? { verified: true } : null;
    }
  }
}

export function renderNodes(nodes, selectedIdx, onSelect) {
  const container = document.getElementById("node-pipeline");
  if (!container) return;
  container.innerHTML = nodes.map((n, i) => {
    const isSel = i === selectedIdx, isLast = i === nodes.length - 1;
    const badge = n.status === "COMPLETED"
      ? '<span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">✓ DONE</span>'
      : n.status === "RUNNING"
      ? '<span class="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse font-bold">● ACTIVE</span>'
      : n.status === "WAITING_FOR_APPROVAL"
      ? '<span class="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse font-bold">⚠️ APPROVAL</span>'
      : '<span class="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">⏳ QUEUED</span>';

    const cardBorder = isSel ? "border-indigo-500 shadow-lg shadow-indigo-500/20 bg-zinc-900 ring-2 ring-indigo-500/30"
      : n.status === "RUNNING" ? "border-blue-500/60 shadow-lg shadow-blue-500/10 bg-zinc-900"
      : n.status === "COMPLETED" ? "border-emerald-500/30 bg-zinc-900/80"
      : "border-zinc-800 bg-zinc-950/60 opacity-80 hover:opacity-100 hover:border-zinc-700";

    return `<div class="flex items-center">
      <div data-idx="${i}" class="cursor-pointer transition-all duration-200 p-3 rounded-xl border ${cardBorder} w-48 min-w-[192px]">
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-1.5"><span class="text-sm">${n.icon || '⚙️'}</span><span class="text-xs font-semibold text-zinc-100 truncate">${n.title}</span></div>
          <span class="text-[10px] font-mono text-zinc-500">#${i + 1}</span>
        </div>
        <div class="text-[10px] font-mono text-zinc-400 truncate mb-2">${n.server}/${n.tool}</div>
        <div class="flex items-center justify-between pt-1 border-t border-zinc-800/80">${badge}<span class="text-[10px] font-mono text-zinc-400">${n.duration ? `${n.duration}ms` : ''}</span></div>
      </div>
      ${!isLast ? '<div class="px-1 text-zinc-600 font-bold text-xs select-none">→</div>' : ''}
    </div>`;
  }).join("");
  container.querySelectorAll("[data-idx]").forEach(el => el.onclick = () => onSelect(parseInt(el.dataset.idx, 10)));
}
