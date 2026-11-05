import app from "./app.js";
import { env } from "./config/environment.js";
import { connectDatabase, closeDatabase } from "./config/database.js";

await connectDatabase();

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
