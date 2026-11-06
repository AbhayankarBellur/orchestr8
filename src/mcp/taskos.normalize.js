export function normalizeTool(tool, server = "taskos") {
  if (!tool || typeof tool !== "object" || !tool.name) {
    throw new Error("Invalid tool definition: missing name");
  }
  return {
    server,
    name: tool.name,
    description: tool.description || "",
    inputSchema: tool.inputSchema || tool.parameters || {},
    outputSchema: tool.outputSchema || null,
    annotations: tool.annotations || null,
    discoveredAt: new Date().toISOString()
  };
}
