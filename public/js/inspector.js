export function renderInspector(node) {
  const el = document.getElementById("node-inspector");
  if (!el) return;
  if (!node) { el.innerHTML = `<div class="text-zinc-500 text-sm italic p-4">Select a node to inspect its execution and governance details</div>`; return; }
  const d = node.data || {};
  const gov = d.governance || d.metadata?.governance || null;
  const hash = d.event_hash ? `${d.event_hash.slice(0, 16)}...` : "N/A";

  el.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div><h3 class="text-base font-semibold text-zinc-100">${node.title}</h3><div class="text-xs text-zinc-400 font-mono">Status: ${node.status}</div></div>
        <div class="text-xs font-mono text-zinc-400">Seq #${d.sequence_number || 0}</div>
      </div>
      <div>
        <div class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Governance Policy</div>
        <div class="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
          ${gov ? `<div>Status: <span class="${gov.can_proceed !== false ? 'text-emerald-400' : 'text-amber-400'}">${gov.status || 'ALLOWED'}</span></div>
          <div>Checks: ${(gov.checks || []).map(c => `${c.policy_id} [${c.result}]`).join(', ') || 'Default Policy'}</div>`
          : '<div class="text-zinc-500">Read-only internal/system action</div>'}
        </div>
      </div>
      <div>
        <div class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Input / Arguments</div>
        <pre class="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto max-h-36">${JSON.stringify(d.input || node.data?.request || {}, null, 2)}</pre>
      </div>
      <div>
        <div class="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Output / Result</div>
        <pre class="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto max-h-40">${JSON.stringify(d.output || {}, null, 2)}</pre>
      </div>
      <div class="pt-2 border-t border-zinc-800 text-[11px] font-mono text-zinc-500">
        Audit Hash: <span class="text-indigo-400">${hash}</span>
      </div>
    </div>`;
}
