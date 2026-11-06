import { listExecutions, getExecutionEvents } from "../services/audit.service.js";
import { verifyExecutionIntegrity } from "../services/audit.verifier.js";

export async function getExecutions(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1, limit = parseInt(req.query.limit) || 50;
    const items = await listExecutions({ page, limit });
    res.json({ success: true, count: items.length, page, data: items });
  } catch (err) { next(err); }
}

export async function getExecutionDetail(req, res, next) {
  try {
    const { executionId } = req.params;
    const events = await getExecutionEvents(executionId, { page: 1, limit: 1 });
    if (!events.length) return res.status(404).json({ success: false, message: "Execution not found" });
    const verify = await verifyExecutionIntegrity(executionId);
    res.json({ success: true, data: { execution_id: executionId, verified: verify.valid, first_event: events[0] } });
  } catch (err) { next(err); }
}

export async function getExecutionEventsList(req, res, next) {
  try {
    const { executionId } = req.params;
    const page = parseInt(req.query.page) || 1, limit = parseInt(req.query.limit) || 50;
    const events = await getExecutionEvents(executionId, { page, limit });
    res.json({ success: true, count: events.length, page, data: events });
  } catch (err) { next(err); }
}

export async function verifyExecution(req, res, next) {
  try {
    const result = await verifyExecutionIntegrity(req.params.executionId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}
