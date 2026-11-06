import app from "./app.js";
import { env } from "./config/environment.js";
import { connectDatabase, closeDatabase } from "./config/database.js";
import { runDiscovery } from "./services/mcp.service.js";

await connectDatabase();
try { await runDiscovery(); } catch (e) { console.warn("MCP discovery deferred:", e.message); }

const server = app.listen(env.PORT, () => {
  console.log(`Orchestr8 running on port ${env.PORT}`);
});

async function shutdown() {
  server.close(async () => {
    await closeDatabase();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
