import { describe, it, expect, vi } from "vitest";
import { discoverTools } from "../../src/mcp/taskos.discovery.js";

describe("MCP Dynamic Tool Discovery", () => {
  it("discovers tools and preserves original names and schemas", async () => {
    const mockClient = {
      listTools: vi.fn().mockResolvedValue({
        tools: [
          { name: "project_list", description: "List all projects", inputSchema: { type: "object" } },
          { name: "task_create", description: "Create task", inputSchema: { properties: { title: { type: "string" } } } }
        ]
      })
    };
    const res = await discoverTools(mockClient);
    expect(res.count).toBe(2);
    expect(res.tools[0].name).toBe("project_list");
    expect(res.tools[1].inputSchema.properties.title.type).toBe("string");
  });

  it("handles paginated discovery with nextCursor", async () => {
    const mockClient = {
      listTools: vi.fn()
        .mockResolvedValueOnce({ tools: [{ name: "t1" }], nextCursor: "page2" })
        .mockResolvedValueOnce({ tools: [{ name: "t2" }], nextCursor: null })
    };
    const res = await discoverTools(mockClient);
    expect(res.count).toBe(2);
    expect(res.tools.map(t => t.name)).toEqual(["t1", "t2"]);
    expect(mockClient.listTools).toHaveBeenCalledTimes(2);
  });

  it("handles empty tool list gracefully", async () => {
    const mockClient = { listTools: vi.fn().mockResolvedValue({ tools: [] }) };
    const res = await discoverTools(mockClient);
    expect(res.count).toBe(0);
    expect(res.tools).toHaveLength(0);
  });

  it("rejects invalid or missing client", async () => {
    await expect(discoverTools(null)).rejects.toThrow("Valid connected MCP client required");
  });
});
