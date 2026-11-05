import { MODEL_CONFIG } from "../config/model.config.js";

async function request(path, body) {
  const response = await fetch(`${MODEL_CONFIG.baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(MODEL_CONFIG.timeoutMs)
  });
  if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);
  return response.json();
}

export function chat(messages, format) {
  return request("/api/chat", {
    model: MODEL_CONFIG.model,
    messages,
    stream: false,
    format: format || undefined,
    options: {
      temperature: MODEL_CONFIG.temperature,
      num_ctx: MODEL_CONFIG.contextWindow
    }
  });
}

export async function checkOllama() {
  const response = await fetch(`${MODEL_CONFIG.baseUrl}/api/tags`, {
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) throw new Error("Ollama unavailable");
  return response.json();
}
