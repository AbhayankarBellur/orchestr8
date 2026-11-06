import { describe, it, expect, beforeEach, vi } from "vitest";
import { invokeMcpTool } from "../../src/executor/mcp.invoker.js";
import * as mcpConn from "../../src/mcp/taskos.connection.js";

describe("MCP Invoker - Tool Execution & Normalization", () => {
  let mockClient;

  beforeEach(() => {
    mockClient = { callTool: vi.fn() };
    vi.spyOn(mcpConn, "getActiveClient").mockReturnValue(mockClient);
    vi.spyOn(mcpConn, "connectTaskos").mockResolvedValue(mockClient);
  });

  it("normalizes json string in text content to object", async () => {
    mockClient.callTool.mockResolvedValueOnce({
      content: [{ type: "text", text: JSON.stringify([{ id: "p1", name: "Backend" }]) }]
    });
    const res = await invokeMcpTool("project_list", {});
    expect(res.success).toBe(true);
    expect(Array.isArray(res.result)).toBe(true);
    expect(res.result[0].name).toBe("Backend");
  });

  it("handles isError from MCP as failure", async () => {
    mockClient.callTool.mockResolvedValueOnce({ isError: true, content: "DB Connection Error" });
    await expect(invokeMcpTool("project_list", {})).rejects.toThrow(/error/i);
  });

  it("never retries mutating tools like task_create", async () => {
    mockClient.callTool.mockRejectedValue(new Error("Network glitch"));
    await expect(invokeMcpTool("task_create", { projectId: "p1", title: "T1" })).rejects.toThrow("Network glitch");
    expect(mockClient.callTool).toHaveBeenCalledTimes(1);
  });
});
