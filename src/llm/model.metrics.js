export function calculateMetrics(result) {
  const total = result.total_duration || 0;
  const evaluation = result.eval_duration || 0;
  const tokens = result.eval_count || 0;
  return {
    totalDurationMs: total / 1e6,
    loadDurationMs: (result.load_duration || 0) / 1e6,
    promptTokens: result.prompt_eval_count || 0,
    generatedTokens: tokens,
    tokensPerSecond: evaluation ? tokens / (evaluation / 1e9) : 0,
    timeToFirstTokenMs: null
  };
}
