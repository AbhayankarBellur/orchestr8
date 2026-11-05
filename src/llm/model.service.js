import { chat } from "./openrouter.client.js";
import { calculateMetrics } from "./model.metrics.js";
import { MODEL_CONFIG } from "../config/model.config.js";

const clean = t => (t.match(/```(?:json)?\s*([\s\S]*?)\s*```/)?.[1] || t).trim();

async function request(messages, format) {
  const start = performance.now();
  const result = await chat(messages, format);
  const elapsed = performance.now() - start;
  const content = result.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned empty content");
  return { content, metrics: calculateMetrics(result, elapsed) };
}

export async function infer(prompt, system = "") {
  const msgs = [...(system ? [{ role: "system", content: system }] : []), { role: "user", content: prompt }];
  const result = await request(msgs);
  return { model: MODEL_CONFIG.model, response: result.content, metrics: result.metrics };
}

export async function structured(prompt, schema) {
  const instruction = `Return JSON matching this schema:\n${JSON.stringify(schema)}`;
  const result = await request([
    { role: "system", content: instruction },
    { role: "user", content: prompt }
  ], { type: "json_object" });
  return { model: MODEL_CONFIG.model, response: JSON.parse(clean(result.content)), metrics: result.metrics };
}

export async function status() {
  return { provider: "openrouter", model: MODEL_CONFIG.model, available: Boolean(MODEL_CONFIG.apiKey) };
}
