import { describe, it, expect, beforeEach } from "vitest";
import { executeTool } from "../../src/executor/tool.executor.js";
import { seedMockMcpTools } from "../helpers/mock-mcp-tools.js";
import { auditRepository } from "../../src/repositories/audit.repository.js";

describe("Tool Executor - Resolution & Guarding", () => {
  beforeEach(async () => {
    await auditRepository.clear();
    seedMockMcpTools();
  });

  it("rejects unknown tool not present in unified catalog", async () => {
    const proposal = { server: "taskos", tool_name: "unknown_hack", arguments: {} };
    await expect(executeTool({ executionId: "exec_test_1", proposal }))
      .rejects.toThrow(/Tool not found in catalog/);
  });

  it("rejects invalid arguments violating tool input schema", async () => {
    const proposal = { server: "taskos", tool_name: "project_get", arguments: {} };
    await expect(executeTool({ executionId: "exec_test_2", proposal }))
      .rejects.toThrow(/Schema validation failed/);
  });

  it("blocks execution when governance policy denies action", async () => {
    const proposal = { server: "unapproved_server", tool_name: "test_tool", arguments: {} };
    await expect(executeTool({ executionId: "exec_test_3", proposal }))
      .rejects.toThrow(/Tool not found in catalog/);
  });

  it("rejects approval-required tool if no authorization is provided", async () => {
    const proposal = { server: "taskos", tool_name: "task_create", arguments: { projectId: "p1", title: "T1" } };
    await expect(executeTool({ executionId: "exec_test_4", proposal }))
      .rejects.toThrow(/Approval required/);
  });
});
