import { describe, it, expect, beforeEach, vi } from "vitest";
import { decideTool } from "../../src/orchestrator/decision.service.js";
import * as modelService from "../../src/llm/model.service.js";
import { seedMockMcpTools } from "../helpers/mock-mcp-tools.js";

describe("Orchestrator Decision Security & Bounds", () => {
  beforeEach(() => { seedMockMcpTools(); });

  it("rejects an invented tool that does not exist in unified catalog", async () => {
    const mock = JSON.stringify({
      decision_version: "1.0.0",
      status: "TOOL_PROPOSED",
      intent: { description: "Hack", entities: [], operation: "exec" },
      tool_selection: {
        server: "taskos", tool_name: "invented_tool", arguments: {},
        selection_rationale: "r", evidence: [], alternatives_considered: []
      },
      clarification: null,
      reasoning: { assumptions: [], uncertainties: [], risks: [] }
    });
    vi.spyOn(modelService, "structuredRaw").mockResolvedValue({ model: "m", content: mock, metrics: {} });
    await expect(decideTool("Run invented tool")).rejects.toMatchObject({
      name: "SchemaValidationError"
    });
  });

  it("rejects invalid arguments violating the tool's JSON schema", async () => {
    const mock = JSON.stringify({
      decision_version: "1.0.0",
      status: "TOOL_PROPOSED",
      intent: { description: "Get project", entities: [], operation: "read" },
      tool_selection: {
        server: "taskos", tool_name: "project_get", arguments: { projectId: 12345 },
        selection_rationale: "r", evidence: [], alternatives_considered: []
      },
      clarification: null,
      reasoning: { assumptions: [], uncertainties: [], risks: [] }
    });
    vi.spyOn(modelService, "structuredRaw").mockResolvedValue({ model: "m", content: mock, metrics: {} });
    await expect(decideTool("Get project")).rejects.toMatchObject({
      name: "SchemaValidationError"
    });
  });
});
