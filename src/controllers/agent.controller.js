import { listAgents, runAgent } from "../agents/agent.service.js";

export function getAgents(req, res) {
  res.json({ success: true, data: listAgents() });
}

export async function executeAgent(req, res, next) {
  try {
    const { input } = req.body;
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return res.status(400).json({ success: false, error: "Input object required" });
    }
    const result = await runAgent(req.params.agent, input);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.name === "SchemaValidationError") {
      return res.status(422).json({ success: false, error: error.payload });
    }
    next(error);
  }
}
