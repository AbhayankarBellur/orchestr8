import { describe, it, expect, vi } from "vitest";

vi.mock("../../src/llm/openrouter.client.js", () => ({
  chat: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "A project analysis." } }],
    usage: { prompt_tokens: 20, completion_tokens: 10 }
  })
}));

import { infer } from "../../src/llm/model.service.js";

describe("Model inference", () => {
  it("returns model output and metrics", async () => {
    const result = await infer("Analyse this project");
    expect(result.response).toBe("A project analysis.");
    expect(result.metrics.generatedTokens).toBe(10);
    expect(result.metrics.promptTokens).toBe(20);
  });

  it("propagates OpenRouter connection errors", async () => {
    const { chat } = await import("../../src/llm/openrouter.client.js");
    chat.mockRejectedValueOnce(new Error("OpenRouter unavailable"));
    await expect(infer("Test")).rejects.toThrow("OpenRouter unavailable");
  });
});
