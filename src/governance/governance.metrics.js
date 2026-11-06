export function extractMetrics(proposal, context = {}) {
  const toolName = proposal?.tool_name || proposal?.name || "";
  const server = proposal?.server || "";
  const args = proposal?.arguments || {};

  const isTaskCreate = toolName === "task_create";
  const isMcp = server === "taskos" || context.isMcp === true;

  const desc = typeof args.description === "string" ? args.description : "";
  const depCount = args.dependsOnTaskId ? 1 : (Array.isArray(args.dependencies) ? args.dependencies.length : 0);

  return {
    server,
    tool: toolName,
    tool_calls: (context.tool_calls || 0) + 1,
    mcp_calls: (context.mcp_calls || 0) + (isMcp ? 1 : 0),
    task_creations: (context.task_creations || 0) + (isTaskCreate ? 1 : 0),
    description_length: desc.length,
    dependency_count: depCount,
    input_size: JSON.stringify(args).length,
    tokens: context.tokens || null
  };
}
