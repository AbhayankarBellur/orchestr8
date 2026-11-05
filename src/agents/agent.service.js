import { readFile } from "node:fs/promises";
import { AGENTS } from "./agent.registry.js";
import { structured } from "../llm/model.service.js";

export function listAgents() {
  return Object.entries(AGENTS).map(([id, agent]) => ({
    id, name: agent.name, version: agent.version
  }));
}

export async function runAgent(id, input) {
  const agent = AGENTS[id];
  if (!agent) throw new Error("Unknown agent");
  const prompt = await readFile(new URL(`../prompts/${agent.prompt}`, import.meta.url), "utf8");
  const schemaText = await readFile(new URL(`../schemas/${agent.schema}`, import.meta.url), "utf8");
  const request = `${prompt}\n\nINPUT DATA:\n${JSON.stringify(input)}`;
  const result = await structured(request, JSON.parse(schemaText));
  return { agent: id, version: agent.version, ...result };
}
