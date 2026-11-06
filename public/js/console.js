export function appendLog(event) {
  const box = document.getElementById("log-console");
  if (!box) return;
  const time = new Date(event.timestamp || Date.now()).toLocaleTimeString();
  const seq = event.sequence_number ? `#${event.sequence_number}` : "-";
  const type = event.event_type || "EVENT";
  const hash = event.event_hash ? event.event_hash.slice(0, 10) : "";

  let color = "text-zinc-400";
  if (type.includes("GOVERNANCE")) color = "text-cyan-400";
  else if (type.includes("APPROVAL")) color = "text-amber-400";
  else if (type.includes("VERIFIED")) color = "text-indigo-400";
  else if (type.includes("SUCCEEDED") || type.includes("COMPLETED")) color = "text-emerald-400";
  else if (type.includes("FAILED") || type.includes("BLOCKED")) color = "text-red-400";

  const target = event.target ? `${event.target.server || ''}/${event.target.tool || event.target.tool_name || ''}` : '';
  const detail = target ? `[${target}]` : (event.status || '');

  const row = document.createElement("div");
  row.className = "py-0.5 hover:bg-zinc-900/60 transition flex items-center gap-2 text-xs font-mono";
  row.innerHTML = `<span class="text-zinc-500">${time}</span><span class="text-zinc-500 w-8">${seq}</span><span class="${color} font-semibold">${type}</span><span class="text-zinc-300 truncate">${detail}</span><span class="text-zinc-600 ml-auto">${hash}</span>`;
  box.appendChild(row);
  box.scrollTop = box.scrollHeight;
}

export function clearLogs() {
  const box = document.getElementById("log-console");
  if (box) box.innerHTML = '<div class="text-xs font-mono text-zinc-500 italic py-1">Console initialized. Awaiting execution stream...</div>';
}
