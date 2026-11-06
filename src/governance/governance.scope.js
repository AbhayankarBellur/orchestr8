export function matchesScope(scope, proposal, context = {}) {
  if (!scope || !scope.type) return false;
  const toolName = proposal?.tool_name || proposal?.name || "";
  const server = proposal?.server || "";

  switch (scope.type) {
    case "execution":
      return true;
    case "server":
      return !scope.server || scope.server === server;
    case "tool":
      const toolMatch = !scope.tool || scope.tool === toolName;
      const serverMatch = !scope.server || scope.server === server;
      return toolMatch && serverMatch;
    case "agent":
      return !scope.agent || scope.agent === context.agent;
    case "action":
      return !scope.action || scope.action === context.action || scope.action === toolName;
    default:
      return false;
  }
}
