export const MODEL_CONFIG = {
  provider: "ollama",
  model: process.env.OLLAMA_MODEL || "qwen3.5:0.8b",
  baseUrl: process.env.OLLAMA_URL || "http://localhost:11434",
  timeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS || 120000),
  temperature: 0.2,
  contextWindow: 4096
};
