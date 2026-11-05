import { readFile } from "node:fs/promises";
import { AGENTS } from "./agent.registry.js";
import { structuredRaw } from "../llm/model.service.js";
import { validateCompliance } from "../tools/schema_compliance/compliance.service.js";
import { requestCorrection } from "./correction.service.js";
import { SchemaValidationError } from "../tools/schema_compliance/compliance.error.js";

export function listAgents() {
  return Object.entries(AGENTS).map(([id, agent]) => ({
    id, name: agent.name, version: agent.version
  }));
}

export async function runAgent(id, input) {
  const agent = AGENTS[id];
  if (!agent) throw new Error("Unknown agent");
  const prompt = await readFile(new URL(`../prompts/${agent.prompt}`, import.meta.url), "utf8");
  const schema = JSON.parse(await readFile(new URL(`../schemas/${agent.schema}`, import.meta.url), "utf8"));
  let raw, check, lastOutput;
  for (let attempt = 1; attempt <= 3; attempt++) {
    raw = attempt === 1
      ? await structuredRaw(`${prompt}\n\nINPUT DATA:\n${JSON.stringify(input)}`, schema)
      : await requestCorrection({ prompt, input, previousOutput: lastOutput, violations: check.compliance.violations, schema, schemaVersion: agent.version });
    lastOutput = raw.content;
    check = validateCompliance({ agent: id, rawOutput: raw.content, schema, input, attempt });
    if (check.compliance.valid) {
      return { status: "SUCCESS", agent: id, version: agent.version, model: raw.model, response: check.data, metrics: raw.metrics, attempt, compliance: check.compliance };
    }
  }
  throw new SchemaValidationError(id, agent.version, 3, check.compliance.violations);
}
