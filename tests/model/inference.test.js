import { describe, it, expect, vi } from "vitest";

vi.mock("../../src/llm/ollama.client.js", () => ({
  chat: vi.fn().mockResolvedValue({
    message: { content: "A project analysis." },
    total_duration: 1000000000,
    eval_duration: 500000000,
    eval_count: 10,
    prompt_eval_count: 20
  }),
  checkOllama: vi.fn()
}));

import { infer } from "../../src/llm/model.service.js";

describe("Model inference", () => {
  it("returns model output and metrics", async () => {
    const result = await infer("Analyse this project");
    expect(result.response).toBe("A project analysis.");
    expect(result.metrics.generatedTokens).toBe(10);
    expect(result.metrics.tokensPerSecond).toBe(20);
  });

  it("propagates Ollama connection errors", async () => {
    const { chat } = await import("../../src/llm/ollama.client.js");
    chat.mockRejectedValueOnce(new Error("Ollama unavailable"));
    await expect(infer("Test")).rejects.toThrow("Ollama unavailable");
  });
});
