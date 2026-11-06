import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { TASKOS_CONFIG } from "../../src/config/taskos.config.js";
import { connectTaskos, disconnectTaskos } from "../../src/mcp/taskos.connection.js";
import { discoverTools } from "../../src/mcp/taskos.discovery.js";
import { registerTools } from "../../src/mcp/taskos.catalog.js";
import { executeTool } from "../../src/executor/tool.executor.js";
import { auditRepository } from "../../src/repositories/audit.repository.js";

const hasApiKey = Boolean(TASKOS_CONFIG.apiKey);

describe.skipIf(!hasApiKey)("Live TaskOS MCP Governed Execution", () => {
  beforeAll(async () => {
    const client = await connectTaskos();
    const discovered = await discoverTools(client);
    registerTools("taskos", discovered.tools);
  }, 45000);

  afterAll(async () => {
    await disconnectTaskos();
  });

  it("executes live project_list through central governed executor", async () => {
    const proposal = { server: "taskos", tool_name: "project_list", arguments: {} };
    const res = await executeTool({ executionId: "exec_live_mcp_1", proposal });

    expect(res.success).toBe(true);
    expect(res.server).toBe("taskos");
    expect(res.tool).toBe("project_list");
    expect(res.duration_ms).toBeGreaterThanOrEqual(0);

    const events = await auditRepository.getEventsByExecution("exec_live_mcp_1");
    expect(events.some(e => e.event_type === "TOOL_EXECUTION_SUCCEEDED")).toBe(true);
  }, 45000);
});
