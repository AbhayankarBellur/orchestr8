import { decideTool } from "../orchestrator/decision.service.js";

export async function createDecision(req, res, next) {
  try {
    const { message, context } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: false, error: "Non-empty string 'message' required" });
    }
    const result = await decideTool(message.trim(), context || {});
    res.json({ success: true, data: result });
  } catch (err) {
    if (err.name === "SchemaValidationError") {
      return res.status(422).json({ success: false, error: err.payload });
    }
    next(err);
  }
}
