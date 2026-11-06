export function renderInspector(node) {
  const el = document.getElementById("node-inspector");
  if (!el) return;
  if (!node) { el.innerHTML = '<div class="text-slate-400 text-xs italic p-4">Select a node to inspect</div>'; return; }
  const gov = node.governance;
  const hash = node.hash ? `${node.hash.slice(0, 16)}...` : "Pending";
  const art = node.output?.path || node.output?.result?.path || node.output?.paths?.html || null;
  const artUrl = art ? '/artifacts/' + art.replace(/\\/g, '/').split('/artifacts/')[1] : null;

  el.innerHTML = `
    <div class="space-y-3 text-xs">
      <div class="flex items-center justify-between border-b border-slate-200 pb-2">
        <div><h3 class="font-bold text-slate-900">${node.title}</h3><div class="text-[11px] font-mono text-slate-500">${node.server}/${node.tool}</div></div>
        <span class="px-2 py-0.5 rounded text-[10px] font-mono border border-slate-200 bg-slate-100 text-slate-700 font-semibold">${node.status}</span>
      </div>
      <div>
        <div class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Governance Policy Decision</div>
        <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800">
          ${gov ? `<div>Status: <span class="${gov.can_proceed !== false ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}">${gov.status || 'ALLOWED'}</span> (${gov.passed || 0}/${gov.evaluated_policies || 0} passed)</div>
          <div class="text-[10px] text-slate-500 mt-1">${(gov.results || []).map(r => `${r.policy_id} [${r.result}]`).join(', ')}</div>`
          : '<div class="text-slate-400">Read-only internal operation or pending governance evaluation</div>'}
        </div>
      </div>
      <div>
        <div class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Input / Arguments</div>
        <pre class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800 overflow-x-auto max-h-24">${JSON.stringify(node.input || {}, null, 2)}</pre>
      </div>
      <div>
        <div class="font-semibold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Execution Result ${node.verification ? '<span class="text-emerald-600 font-semibold">(Verified ✓)</span>' : ''}</div>
        <pre class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800 overflow-x-auto max-h-28">${JSON.stringify(node.output || {}, null, 2)}</pre>
      </div>
      ${artUrl ? `<div class="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-between"><span class="text-indigo-800 text-[11px] font-medium">Artifact Ready</span><button onclick="window.open('${artUrl}')" class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] rounded font-bold transition shadow-xs">Open</button></div>` : ''}
      <div class="pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500 flex justify-between">
        <span>Audit Hash: <span class="text-indigo-600 font-mono font-medium">${hash}</span></span>
        <span>Seq: #${node.sequence !== undefined ? node.sequence : '—'}</span>
      </div>
    </div>`;
}