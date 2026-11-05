import { chat, checkOllama } from "./ollama.client.js";
import { calculateMetrics } from "./model.metrics.js";
import { MODEL_CONFIG } from "../config/model.config.js";

export async function infer(prompt, system = "") {
  const result = await chat([
    ...(system ? [{ role: "system", content: system }] : []),
    { role: "user", content: prompt }
  ]);
  return {
    model: MODEL_CONFIG.model,
    response: result.message.content || result.message.thinking || "",
    metrics: calculateMetrics(result)
  };
}

export async function structured(prompt, schema) {
  const result = await chat([{ role: "user", content: prompt }], schema);
  const parsed = JSON.parse(result.message.content);
  return {
    model: MODEL_CONFIG.model,
    response: parsed,
    metrics: calculateMetrics(result)
  };
}

export async function status() {
  const data = await checkOllama();
  const models = data.models || [];
  return {
    provider: "ollama",
    model: MODEL_CONFIG.model,
    available: models.some(item => item.name.startsWith(MODEL_CONFIG.model))
  };
}
