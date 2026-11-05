import { runAgent } from "./agent.service.js";

export function researchAgent(projectData) {
  return runAgent("research", projectData);
}
