export function renderStatusSvg(metrics) {
  const m = metrics || {};
  const total = m.total || 0;
  const completed = m.completed || 0;
  const inProgress = m.in_progress || 0;
  const blocked = m.blocked || 0;
  const notStarted = m.not_started || 0;

  const w = 400, h = 24;
  if (total === 0) {
    return `<svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" rx="6" fill="#E2E8F0"/></svg>`;
  }

  const wComp = Math.round((completed / total) * w);
  const wProg = Math.round((inProgress / total) * w);
  const wBlk = Math.round((blocked / total) * w);
  const wNot = Math.max(0, w - (wComp + wProg + wBlk));

  return `<svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="border-radius:6px;overflow:hidden">
    <rect x="0" y="0" width="${wComp}" height="${h}" fill="#10B981"/>
    <rect x="${wComp}" y="0" width="${wProg}" height="${h}" fill="#3B82F6"/>
    <rect x="${wComp + wProg}" y="0" width="${wBlk}" height="${h}" fill="#EF4444"/>
    <rect x="${wComp + wProg + wBlk}" y="0" width="${wNot}" height="${h}" fill="#94A3B8"/>
  </svg>`;
}

export function renderProgressGauge(pct) {
  const p = Math.max(0, Math.min(100, pct || 0));
  return `<svg width="80" height="80" viewBox="0 0 36 36">
    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E2E8F0" stroke-width="3.8"/>
    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2563EB" stroke-dasharray="${p}, 100" stroke-width="3.8" stroke-linecap="round"/>
    <text x="18" y="20.5" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle" fill="#0F172A">${p}%</text>
  </svg>`;
}
