import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { structuredRaw } from "../llm/model.service.js";
import { getUnifiedCatalog } from "./catalog.adapter.js";
import { buildDecisionPrompt } from "./decision.prompt.js";
import { validateDecision } from "./decision.validator.js";
import { requestCorrection } from "../agents/correction.service.js";
import { SchemaValidationError } from "../tools/schema_compliance/compliance.error.js";
import { recordModelDecision } from "../services/audit.helpers.js";

const schemaUrl = new URL("../schemas/decision.v1.schema.json", import.meta.url);
let cachedSchema = null;
async function getSchema() {
  if (!cachedSchema) cachedSchema = JSON.parse(await readFile(schemaUrl, "utf8"));
  return cachedSchema;
}

export async function decideTool(userMessage, context = {}) {
  const schema = await getSchema(), catalog = getUnifiedCatalog();
  const prompt = buildDecisionPrompt(userMessage, catalog, context);

  let raw, parsed, check, lastOutput;
  for (let attempt = 1; attempt <= 3; attempt++) {
    raw = attempt === 1 ? await structuredRaw(prompt, schema)
      : await requestCorrection({ prompt, input: { message: userMessage }, previousOutput: lastOutput, violations: check.violations, schema, schemaVersion: "1.0.0" });
    lastOutput = raw.content;
    try { parsed = JSON.parse(raw.content); } catch (e) {
      check = { valid: false, violations: [{ code: "MALFORMED_JSON", field: "/", message: e.message }] };
      continue;
    }
    check = validateDecision(parsed, schema);
    if (check.valid) {
      const result = {
        decision_id: `dec_${Date.now()}_${randomUUID().slice(0, 8)}`,
        timestamp: new Date().toISOString(), model: raw.model,
        attempt, decision: parsed, validation: check, metrics: raw.metrics
      };
      if (context.execution_id) await recordModelDecision(context.execution_id, result);
      return result;
    }
  }
  throw new SchemaValidationError("orchestrator", "1.0.0", 3, check.violations);
}
