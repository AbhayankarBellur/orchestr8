import { ExecutionRecordSchema } from "../schemas/execution.schema.js";
import { getDbCollection } from "./mongo.helper.js";

const store = new Map();

export const executionRepository = {
  async create(data) {
    const valid = ExecutionRecordSchema.parse(data), coll = getDbCollection("executions");
    if (coll) {
      try { await coll.insertOne({ ...valid }); return { ...valid }; }
      catch (e) { if (e.code === 11000) throw new Error(`Execution ${valid.execution_id} already exists`); throw e; }
    }
    if (store.has(valid.execution_id)) throw new Error(`Execution ${valid.execution_id} already exists`);
    store.set(valid.execution_id, { ...valid });
    return { ...valid };
  },

  async findById(id) {
    const coll = getDbCollection("executions");
    if (coll) return coll.findOne({ execution_id: id }, { projection: { _id: 0 } });
    const item = store.get(id);
    return item ? { ...item } : null;
  },

  async update(id, updates) {
    const merged = { ...updates, updated_at: new Date().toISOString() };
    const coll = getDbCollection("executions");
    if (coll) {
      const res = await coll.findOneAndUpdate({ execution_id: id }, { $set: merged }, { returnDocument: "after", projection: { _id: 0 } });
      return res ? ExecutionRecordSchema.parse(res) : null;
    }
    const item = store.get(id);
    if (!item) return null;
    const valid = ExecutionRecordSchema.parse({ ...item, ...merged });
    store.set(id, { ...valid });
    return { ...valid };
  },

  async clear() {
    const coll = getDbCollection("executions");
    if (coll) await coll.deleteMany({});
    store.clear();
  }
};
