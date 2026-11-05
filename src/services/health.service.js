import { checkDatabase } from "../repositories/health.repository.js";

export async function getHealth() {
  const database = await checkDatabase();

  return {
    status: "healthy",
    database: database ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  };
}
