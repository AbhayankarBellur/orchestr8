import { normalizeTool } from "./taskos.normalize.js";

export async function discoverTools(client) {
  if (!client || typeof client.listTools !== "function") {
    throw new Error("Valid connected MCP client required for discovery");
  }

  const allTools = [];
  let cursor = undefined;

  do {
    const params = cursor ? { cursor } : undefined;
    const response = await client.listTools(params);
    const tools = response?.tools || [];
    for (const raw of tools) {
      allTools.push(normalizeTool(raw, "taskos"));
    }
    cursor = response?.nextCursor;
  } while (cursor);

  return {
    server: "taskos",
    count: allTools.length,
    tools: allTools,
    discoveredAt: new Date().toISOString()
  };
}
