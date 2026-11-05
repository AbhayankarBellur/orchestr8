import { runAgent } from "./agent.service.js";

export function executionAgent(planData) {
  return runAgent("execution", planData);
}
