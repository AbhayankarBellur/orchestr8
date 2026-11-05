export const DASHBOARD_CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #F8FAFC; color: #0F172A; padding: 24px; line-height: 1.5; }
.container { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
.header { background: #FFFFFF; border-radius: 8px; padding: 20px; border: 1px solid #E2E8F0; }
.header h1 { font-size: 22px; color: #1E293B; margin-bottom: 6px; }
.meta { font-size: 13px; color: #64748B; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.card { background: #FFFFFF; border-radius: 8px; padding: 18px; border: 1px solid #E2E8F0; }
.card h2 { font-size: 15px; font-weight: 600; margin-bottom: 12px; color: #334155; }
.legend { display: flex; gap: 14px; font-size: 12px; margin-top: 8px; flex-wrap: wrap; }
.dot { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 4px; }
.item { padding: 8px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; }
.item:last-child { border-bottom: none; }
.badge { display: inline-block; padding: 2px 8px; font-size: 11px; border-radius: 4px; font-weight: 600; }
.badge-red { background: #FEE2E2; color: #991B1B; }
.badge-amber { background: #FEF3C7; color: #92400E; }
.badge-blue { background: #DBEAFE; color: #1E40AF; }
`;
