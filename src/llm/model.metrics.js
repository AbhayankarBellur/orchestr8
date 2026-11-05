export function calculateMetrics(result, elapsedMs) {
  const usage = result.usage || {};
  const tokens = usage.completion_tokens || 0;
  return {
    totalDurationMs: elapsedMs,
    loadDurationMs: null,
    promptTokens: usage.prompt_tokens || 0,
    generatedTokens: tokens,
    tokensPerSecond: elapsedMs ? tokens / (elapsedMs / 1000) : 0,
    timeToFirstTokenMs: null
  };
}
