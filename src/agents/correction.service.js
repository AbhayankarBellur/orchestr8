import { structuredRaw } from "../llm/model.service.js";

export function buildCorrectionPrompt({ prompt, input, previousOutput, violations, schemaVersion }) {
  const issues = violations.map(v => `- [${v.code}] at ${v.field}: ${v.message}`).join("\n");
  const rawPrev = typeof previousOutput === "string" ? previousOutput : JSON.stringify(previousOutput, null, 2);
  return `The previous output violated the schema (version ${schemaVersion}).\n` +
    `Fix ONLY the violations listed below, keep all other valid fields, and output valid JSON:\n\n` +
    `ORIGINAL INSTRUCTION:\n${prompt}\n\n` +
    `INPUT:\n${JSON.stringify(input)}\n\n` +
    `PREVIOUS INVALID OUTPUT:\n${rawPrev}\n\n` +
    `VIOLATIONS TO FIX:\n${issues}`;
}

export async function requestCorrection({ prompt, input, previousOutput, violations, schema, schemaVersion }) {
  const correctionPrompt = buildCorrectionPrompt({ prompt, input, previousOutput, violations, schemaVersion });
  return structuredRaw(correctionPrompt, schema);
}
