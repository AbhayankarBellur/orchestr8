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
      return (!scope.tool || scope.tool === toolName) && (!scope.server || scope.server === server);
    case "agent":
      return !scope.agent || scope.agent === context.agent;
    case "action":
      return !scope.action || scope.action === context.action || scope.action === toolName;
    case "input":
      return (!scope.tool || scope.tool === toolName) && (!scope.server || scope.server === server);
    case "output":
      return context.output !== undefined && (!scope.tool || scope.tool === toolName) && (!scope.server || scope.server === server);
    default:
      return false;
  }
}
