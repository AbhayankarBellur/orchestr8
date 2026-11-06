import { ApprovalRequestSchema } from "../schemas/approval.schema.js";

const store = new Map();

export const approvalRepository = {
  async create(data) {
    const valid = ApprovalRequestSchema.parse(data);
    if (store.has(valid.approval_id)) throw new Error(`Approval ${valid.approval_id} already exists`);
    store.set(valid.approval_id, { ...valid });
    return { ...valid };
  },

  async findById(id) {
    const item = store.get(id);
    return item ? { ...item } : null;
  },

  async find(filter = {}) {
    let list = Array.from(store.values());
    if (filter.status) list = list.filter(item => item.status === filter.status);
    if (filter.server) list = list.filter(item => item.server === filter.server);
    if (filter.tool_name) list = list.filter(item => item.tool_name === filter.tool_name);
    return list.map(item => ({ ...item }));
  },

  async update(id, updates) {
    const item = store.get(id);
    if (!item) return null;
    const updated = { ...item, ...updates };
    store.set(id, updated);
    return { ...updated };
  },

  async atomicTransition(id, fromStatus, updates) {
    const item = store.get(id);
    if (!item || item.status !== fromStatus) return null;
    const updated = { ...item, ...updates };
    store.set(id, updated);
    return { ...updated };
  },

  async clear() {
    store.clear();
  }
};
