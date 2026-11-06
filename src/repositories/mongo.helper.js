import { getDatabase } from "../config/database.js";

export function getDbCollection(name) {
  try {
    return getDatabase().collection(name);
  } catch (err) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Durable MongoDB storage required in production for collection: ${name}`);
    }
    return null;
  }
}

export async function ensureCollectionIndexes(db) {
  const auditColl = db.collection("audit_events");
  await auditColl.createIndex({ execution_id: 1, sequence_number: 1 }, { unique: true });
  await auditColl.createIndex({ event_id: 1 }, { unique: true });
  await auditColl.createIndex({ execution_id: 1, timestamp: 1 });

  const execColl = db.collection("executions");
  await execColl.createIndex({ execution_id: 1 }, { unique: true });
  await execColl.createIndex({ status: 1, created_at: -1 });
}
