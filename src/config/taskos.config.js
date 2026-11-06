import "dotenv/config";

export const TASKOS_CONFIG = {
  url: process.env.TASKOS_MCP_URL || "https://taskos-7pgk.onrender.com/mcp",
  apiKey: process.env.TASKOS_API_KEY || "",
  timeoutMs: parseInt(process.env.TASKOS_TIMEOUT_MS || "30000", 10)
};

export function validateTaskosConfig() {
  if (!TASKOS_CONFIG.url) throw new Error("TASKOS_MCP_URL is required");
  if (!TASKOS_CONFIG.apiKey) throw new Error("TASKOS_API_KEY is required");
}

export function getSanitizedTaskosConfig() {
  return {
    url: TASKOS_CONFIG.url,
    hasApiKey: Boolean(TASKOS_CONFIG.apiKey),
    timeoutMs: TASKOS_CONFIG.timeoutMs
  };
}
