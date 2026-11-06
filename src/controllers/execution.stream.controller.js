import { getExecutionEventsService } from "../services/orchestration.service.js";
import { subscribeAuditEvent } from "../services/audit.emitter.js";

export async function streamExecution(req, res, next) {
  try {
    const { executionId } = req.params;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    const existing = await getExecutionEventsService(executionId);
    for (const event of (existing || [])) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    const unsubscribe = subscribeAuditEvent(executionId, (event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    });

    req.on("close", () => {
      unsubscribe();
      res.end();
    });
  } catch (err) {
    next(err);
  }
}
