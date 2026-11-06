import { EventEmitter } from "node:events";

export const auditBus = new EventEmitter();

export function emitAuditEvent(execId, event) {
  auditBus.emit(execId, event);
}

export function subscribeAuditEvent(execId, handler) {
  auditBus.on(execId, handler);
  return () => auditBus.off(execId, handler);
}
