import { getActiveClient, connectTaskos } from "../mcp/taskos.connection.js";

const MUTATING_TOOLS = new Set([
  "task_create", "task_update", "task_assign",
  "task_transition", "task_comment_create", "task_dependency_add"
]);

function parseMcpContent(res) {
  if (res?.structuredContent?.data !== undefined) return res.structuredContent.data;
  if (res?.structuredContent !== undefined) return res.structuredContent;
  if (!res?.content || !Array.isArray(res.content)) return res;
  const textItems = res.content.filter(c => c.type === "text").map(c => c.text);
  const rawText = textItems.join("\n");
  try { return JSON.parse(rawText); } catch { return rawText; }
}

export async function invokeMcpTool(toolName, args = {}) {
  const client = getActiveClient() || await connectTaskos();
  const isMutating = MUTATING_TOOLS.has(toolName);
  const maxAttempts = isMutating ? 1 : 2;

  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await client.callTool({ name: toolName, arguments: args });
      if (response?.isError) {
        const msg = typeof response.content === "string" ? response.content : "MCP tool execution returned error";
        const err = new Error(msg);
        err.isMcpError = true;
        throw err;
      }
      return { success: true, tool: toolName, result: parseMcpContent(response), raw: response };
    } catch (err) {
      lastError = err;
      if (isMutating || err.isMcpError) break;
    }
  }
  throw lastError;
}
