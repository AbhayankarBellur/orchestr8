import { runAgent } from "./agent.service.js";

export function planningAgent(researchAnalysis) {
  return runAgent("planning", researchAnalysis);
}
