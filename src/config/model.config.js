import "dotenv/config";

export const MODEL_CONFIG = {
  provider: process.env.LLM_PROVIDER || "openrouter",
  model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat",
  baseUrl: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  timeoutMs: Number(process.env.OPENROUTER_TIMEOUT_MS || 120000),
  temperature: 0.2
};
