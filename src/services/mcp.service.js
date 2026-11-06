import { connectTaskos, getConnectionStatus } from "../mcp/taskos.connection.js";
import { discoverTools } from "../mcp/taskos.discovery.js";
import { registerTools, getTools } from "../mcp/taskos.catalog.js";

export function getStatus() {
  const conn = getConnectionStatus();
  return {
    ...conn,
    catalogToolCount: getTools("taskos").length
  };
}

export function getCatalogTools() {
  return getTools("taskos");
}

export async function runDiscovery(customTransport = null, customClient = null) {
  const client = await connectTaskos(customTransport, customClient);
  const result = await discoverTools(client);
  registerTools("taskos", result.tools);
  return {
    server: "taskos",
    count: result.count,
    tools: result.tools,
    discoveredAt: result.discoveredAt
  };
}
