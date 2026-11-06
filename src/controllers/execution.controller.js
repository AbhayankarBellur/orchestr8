import { CreateExecutionSchema, ResumeExecutionSchema } from "../schemas/execution.schema.js";
import { createExecutionService, getExecutionService, getExecutionEventsService } from "../services/orchestration.service.js";
import { resumeExecutionService } from "../services/orchestration.resume.js";

export async function createExecution(req, res, next) {
  try {
    const valid = CreateExecutionSchema.parse(req.body);
    const actor = { id: req.auth.actorId, role: req.auth.role, type: req.auth.type || "user" };
    const data = await createExecutionService({ ...valid, actor });
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
}

export async function getExecution(req, res, next) {
  try {
    const data = await getExecutionService(req.params.executionId);
    if (!data) return res.status(404).json({ success: false, message: "Execution not found" });
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function getExecutionEvents(req, res, next) {
  try {
    const data = await getExecutionEventsService(req.params.executionId, req.query);
    res.json({ success: true, count: data.length, data });
  } catch (err) { next(err); }
}

export async function resumeExecution(req, res, next) {
  try {
    const valid = ResumeExecutionSchema.parse(req.body || {});
    const data = await resumeExecutionService(req.params.executionId, valid);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}
