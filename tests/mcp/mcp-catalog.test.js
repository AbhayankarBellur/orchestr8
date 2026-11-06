import { describe, it, expect, beforeEach } from "vitest";
import { registerTools, getTools, getTool, clearCatalog } from "../../src/mcp/taskos.catalog.js";
import { normalizeTool } from "../../src/mcp/taskos.normalize.js";

describe("MCP Tool Catalog", () => {
  beforeEach(() => { clearCatalog(); });

  it("normalizes and registers tools while preserving fidelity", () => {
    const raw = { name: "test_tool", description: "desc", inputSchema: { type: "object" } };
    const normalized = normalizeTool(raw, "taskos");
    registerTools("taskos", [normalized]);

    const tools = getTools("taskos");
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe("test_tool");
    expect(tools[0].server).toBe("taskos");
    expect(tools[0].inputSchema).toEqual({ type: "object" });
    expect(tools[0].discoveredAt).toBeDefined();
  });

  it("prevents duplicate entries and refreshes on new discovery", () => {
    const t1 = normalizeTool({ name: "tool_a" });
    const t2 = normalizeTool({ name: "tool_a" });
    registerTools("taskos", [t1, t2]);
    expect(getTools("taskos")).toHaveLength(1);

    const t3 = normalizeTool({ name: "tool_b" });
    registerTools("taskos", [t3]);
    const refreshed = getTools("taskos");
    expect(refreshed).toHaveLength(1);
    expect(refreshed[0].name).toBe("tool_b");
  });

  it("retrieves a single tool by name", () => {
    registerTools("taskos", [normalizeTool({ name: "t_find" })]);
    expect(getTool("taskos", "t_find")?.name).toBe("t_find");
    expect(getTool("taskos", "nonexistent")).toBeNull();
  });
});
