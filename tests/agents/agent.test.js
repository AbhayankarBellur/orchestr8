import { describe, it, expect, vi } from "vitest";
import { MOCK_OUTPUTS } from "../helpers/mock-outputs.js";

vi.mock("../../src/llm/model.service.js", () => ({
  structuredRaw: vi.fn().mockImplementation((prompt, schema) => {
    const key = schema.title.replace("AgentOutput", "").toLowerCase();
    return Promise.resolve({
      model: "test-model",
      content: JSON.stringify(MOCK_OUTPUTS[key] || {}),
      metrics: { generatedTokens: 20 }
    });
  })
}));

import { runAgent, listAgents } from "../../src/agents/agent.service.js";

describe("Agent architecture", () => {
  it("registers three independent agents", () => {
    expect(listAgents()).toHaveLength(3);
  });

  it.each(["research", "planning", "execution"])(
    "loads and runs the %s agent", async id => {
      const result = await runAgent(id, { project: "TaskOS" });
      expect(result.agent).toBe(id);
      expect(result.version).toBe("1.0.0");
      expect(result.status).toBe("SUCCESS");
    }
  );

  it("rejects unknown agents", async () => {
    await expect(runAgent("unknown", {})).rejects.toThrow("Unknown agent");
  });
});
