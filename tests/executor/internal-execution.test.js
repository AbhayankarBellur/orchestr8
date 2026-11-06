import { describe, it, expect, beforeEach } from "vitest";
import { executeTool } from "../../src/executor/tool.executor.js";
import { auditRepository } from "../../src/repositories/audit.repository.js";
import { existsSync } from "node:fs";

describe("Tool Executor - Internal Tools Execution", () => {
  beforeEach(async () => {
    await auditRepository.clear();
  });

  it("executes pdf_generator and verifies file exists on disk", async () => {
    const proposal = {
      server: "orchestr8",
      tool_name: "pdf_generator",
      arguments: { project_name: "Phase 10 Exec" }
    };
    const res = await executeTool({ executionId: "exec_pdf_1", proposal });
    expect(res.success).toBe(true);
    expect(res.result.artifactId).toBeDefined();
    expect(existsSync(res.result.path)).toBe(true);

    const events = await auditRepository.getEventsByExecution("exec_pdf_1");
    expect(events.some(e => e.event_type === "TOOL_EXECUTION_SUCCEEDED")).toBe(true);
  });

  it("executes dashboard_generator and verifies HTML exists", async () => {
    const proposal = {
      server: "orchestr8",
      tool_name: "dashboard_generator",
      arguments: { project_name: "Phase 10 Exec" }
    };
    const res = await executeTool({ executionId: "exec_dash_1", proposal });
    expect(res.success).toBe(true);
    expect(res.result.artifactId).toBeDefined();
    expect(existsSync(res.result.paths.html)).toBe(true);

    const events = await auditRepository.getEventsByExecution("exec_dash_1");
    expect(events.some(e => e.event_type === "TOOL_EXECUTION_SUCCEEDED")).toBe(true);
  });
});
