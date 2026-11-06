import { AuditEventSchema } from "../schemas/audit.schema.js";
import { getDbCollection } from "./mongo.helper.js";
import * as mongo from "./audit.mongo.js";
import * as mem from "./audit.memory.js";

const c = () => getDbCollection("audit_events");

export const auditRepository = {
  async appendEvent(data) {
    const valid = AuditEventSchema.parse(data), coll = c();
    return coll ? mongo.appendMongoAudit(coll, valid) : mem.appendMemAudit(valid);
  },
  async getLatestEvent(id) {
    const coll = c();
    return coll ? mongo.findLatestMongoAudit(coll, id) : mem.findLatestMemAudit(id);
  },
  async getNextSequence(id) {
    const latest = await this.getLatestEvent(id);
    return latest ? latest.sequence_number + 1 : 1;
  },
  async getEventsByExecution(id, opt = {}) {
    const coll = c(), p = opt.page || 1, l = opt.limit || 50;
    return coll ? mongo.findMongoAuditEvents(coll, id, p, l) : mem.findMemAuditEvents(id, p, l);
  },
  async listExecutions(opt = {}) {
    const coll = c(), p = opt.page || 1, l = opt.limit || 50;
    return coll ? mongo.listMongoAuditExecutions(coll, p, l) : mem.listMemAuditExecutions(p, l);
  },
  async _tamper(id, idx, patch) {
    const coll = c();
    return coll ? mongo.tamperMongoAudit(coll, id, idx, patch) : mem.tamperMemAudit(id, idx, patch);
  },
  async _remove(id, idx) {
    const coll = c();
    return coll ? mongo.removeMongoAudit(coll, id, idx) : mem.removeMemAudit(id, idx);
  },
  async clear() {
    const coll = c();
    if (coll) await coll.deleteMany({});
    mem.clearMemAudit();
  }
};
