import { ExecutionRecordSchema } from "../schemas/execution.schema.js";

const store = new Map();

export const executionRepository = {
  async create(data) {
    const valid = ExecutionRecordSchema.parse(data);
    if (store.has(valid.execution_id)) {
      throw new Error(`Execution ${valid.execution_id} already exists`);
    }
    store.set(valid.execution_id, { ...valid });
    return { ...valid };
  },

  async findById(id) {
    const item = store.get(id);
    return item ? { ...item } : null;
  },

  async update(id, updates) {
    const item = store.get(id);
    if (!item) return null;
    const merged = {
      ...item,
      ...updates,
      updated_at: new Date().toISOString()
    };
    const valid = ExecutionRecordSchema.parse(merged);
    store.set(id, { ...valid });
    return { ...valid };
  },

  async clear() {
    store.clear();
  }
};
