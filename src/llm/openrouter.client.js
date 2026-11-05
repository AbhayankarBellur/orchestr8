import { MODEL_CONFIG } from "../config/model.config.js";

export async function chat(messages, responseFormat) {
  if (!MODEL_CONFIG.apiKey) throw new Error("OPENROUTER_API_KEY missing");
  const response = await fetch(`${MODEL_CONFIG.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MODEL_CONFIG.apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "Orchestr8"
    },
    body: JSON.stringify({
      model: MODEL_CONFIG.model,
      messages,
      temperature: MODEL_CONFIG.temperature,
      response_format: responseFormat
    }),
    signal: AbortSignal.timeout(MODEL_CONFIG.timeoutMs)
  });
  if (!response.ok) {
    throw new Error(`OpenRouter HTTP ${response.status}: ${await response.text()}`);
  }
  return response.json();
}
