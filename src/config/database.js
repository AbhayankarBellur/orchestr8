import dns from "node:dns";
import { MongoClient } from "mongodb";
import { env } from "./environment.js";

try { dns.setServers(["8.8.8.8", "1.1.1.1"]); } catch {}

const client = new MongoClient(env.MONGODB_URI);
let database;

export async function connectDatabase() {
  await client.connect();
  database = client.db(env.DB_NAME);
  return database;
}

export function getDatabase() {
  if (!database) throw new Error("Database not connected");
  return database;
}

export async function closeDatabase() {
  await client.close();
}
