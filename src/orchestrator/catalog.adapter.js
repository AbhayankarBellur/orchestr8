import { TOOLS } from "../tools/tool.registry.js";
import { getTools as getMcpTools } from "../mcp/taskos.catalog.js";

export function getInternalCatalog() {
  return Object.values(TOOLS).map(t => ({
    server: "orchestr8",
    type: "internal",
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema || {}
  }));
}

export function getMcpCatalog(server = "taskos") {
  return getMcpTools(server).map(t => ({
    server: t.server || server,
    type: "mcp",
    name: t.name,
    description: t.description || "",
    inputSchema: t.inputSchema || {},
    annotations: t.annotations || null
  }));
}

export function getUnifiedCatalog() {
  return [...getInternalCatalog(), ...getMcpCatalog("taskos")];
}

export function getUnifiedTool(server, name) {
  const all = getUnifiedCatalog();
  return all.find(t => t.server === server && t.name === name) || null;
}
