export function syncNodesWithExec(exec, nodes) {
  if (!exec) return;
  const req = nodes.find(n => n.id === "req") || nodes[0];
  if (req) { req.status = "COMPLETED"; req.input = { message: exec.original_request }; }
  for (const call of (exec.completed_tool_calls || [])) {
    const node = nodes.find(n => n.tool === call.tool_name && n.status !== "COMPLETED")
      || nodes.find(n => n.tool === call.tool_name);
    if (node) {
      node.status = "COMPLETED"; node.input = call.arguments;
      node.output = call.result; node.verification = call.verified ? { verified: true } : null;
    }
  }
}

export function renderNodes(nodes, selectedIdx, onSelect) {
  const container = document.getElementById("node-pipeline");
  if (!container) return;
  container.innerHTML = nodes.map((n, i) => {
    const isSel = i === selectedIdx, isLast = i === nodes.length - 1;
    const badge = n.status === "COMPLETED"
      ? '<span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold">✓ DONE</span>'
      : n.status === "RUNNING"
      ? '<span class="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-300 font-bold animate-pulse">● ACTIVE</span>'
      : n.status === "WAITING_FOR_APPROVAL"
      ? '<span class="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-300 font-bold animate-pulse">⚠️ APPROVAL</span>'
      : '<span class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-500 border border-slate-200">⏳ QUEUED</span>';

    const cardBorder = isSel ? "border-indigo-600 shadow-md bg-white ring-2 ring-indigo-500/30"
      : n.status === "RUNNING" ? "border-blue-500 shadow-md bg-blue-50/40 ring-1 ring-blue-400/40"
      : n.status === "COMPLETED" ? "border-emerald-300 shadow-xs bg-white hover:border-emerald-400"
      : "border-slate-200 bg-white hover:border-slate-300 shadow-xs";

    return `<div class="flex items-center">
      <div data-idx="${i}" class="cursor-pointer transition-all duration-200 p-3 rounded-xl border ${cardBorder} w-48 min-w-[192px]">
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-1.5"><span class="text-sm">${n.icon || '⚙️'}</span><span class="text-xs font-bold text-slate-800 truncate">${n.title}</span></div>
          <span class="text-[10px] font-mono text-slate-400">#${i + 1}</span>
        </div>
        <div class="text-[10px] font-mono text-slate-500 truncate mb-2">${n.server}/${n.tool}</div>
        <div class="flex items-center justify-between pt-1 border-t border-slate-100">${badge}<span class="text-[10px] font-mono text-slate-500">${n.duration ? `${n.duration}ms` : ''}</span></div>
      </div>
      ${!isLast ? '<div class="px-1 text-slate-300 font-bold text-xs select-none">→</div>' : ''}
    </div>`;
  }).join("");
  container.querySelectorAll("[data-idx]").forEach(el => el.onclick = () => onSelect(parseInt(el.dataset.idx, 10)));
}