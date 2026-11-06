export function renderInspector(node) {
  const el = document.getElementById("node-inspector");
  if (!el) return;
  if (!node) { el.innerHTML = '<div class="text-zinc-500 text-xs italic p-4">Select a node to inspect</div>'; return; }
  const gov = node.governance;
  const hash = node.hash ? `${node.hash.slice(0, 16)}...` : "Pending";
  const art = node.output?.path || node.output?.result?.path || node.output?.paths?.html || null;
  const artUrl = art ? '/artifacts/' + art.replace(/\\/g, '/').split('/artifacts/')[1] : null;

  el.innerHTML = `
    <div class="space-y-3 text-xs">
      <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div><h3 class="font-bold text-zinc-100">${node.title}</h3><div class="text-[11px] font-mono text-zinc-400">${node.server}/${node.tool}</div></div>
        <span class="px-2 py-0.5 rounded text-[10px] font-mono border border-zinc-700 bg-zinc-800 text-zinc-300">${node.status}</span>
      </div>
      <div>
        <div class="font-semibold text-zinc-400 uppercase tracking-wider text-[10px] mb-1">Governance Policy Decision</div>
        <div class="p-2 rounded bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-zinc-300">
          ${gov ? `<div>Status: <span class="${gov.can_proceed !== false ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}">${gov.status || 'ALLOWED'}</span> (${gov.passed || 0}/${gov.evaluated_policies || 0} passed)</div>
          <div class="text-[10px] text-zinc-400 mt-1">${(gov.results || []).map(r => `${r.policy_id} [${r.result}]`).join(', ')}</div>`
          : '<div class="text-zinc-500">Read-only internal operation or pending governance evaluation</div>'}
        </div>
      </div>
      <div>
        <div class="font-semibold text-zinc-400 uppercase tracking-wider text-[10px] mb-1">Input / Arguments</div>
        <pre class="p-2 rounded bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-24">${JSON.stringify(node.input || {}, null, 2)}</pre>
      </div>
      <div>
        <div class="font-semibold text-zinc-400 uppercase tracking-wider text-[10px] mb-1">Execution Result ${node.verification ? '<span class="text-emerald-400 font-normal">(Verified ✓)</span>' : ''}</div>
        <pre class="p-2 rounded bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-28">${JSON.stringify(node.output || {}, null, 2)}</pre>
      </div>
      ${artUrl ? `<div class="p-2 rounded bg-indigo-950/40 border border-indigo-500/40 flex items-center justify-between"><span class="text-indigo-300 text-[11px]">Artifact Ready</span><button onclick="window.open('${artUrl}')" class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] rounded font-bold transition">Open</button></div>` : ''}
      <div class="pt-2 border-t border-zinc-800 text-[10px] font-mono text-zinc-500 flex justify-between">
        <span>Audit Hash: <span class="text-indigo-400 font-mono">${hash}</span></span>
        <span>Seq: #${node.sequence !== undefined ? node.sequence : '—'}</span>
      </div>
    </div>`;
}
