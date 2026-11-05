import { describe, it, expect } from "vitest";
import { validateCompliance } from "../../src/tools/schema_compliance/compliance.service.js";

const schema = {
  type: "object", additionalProperties: false,
  required: ["schema_version", "count", "type"],
  properties: {
    schema_version: { const: "1.0.0" },
    count: { type: "integer" },
    type: { type: "string", enum: ["alpha", "beta"] }
  }
};

describe("Schema Compliance - JSON & Schema Validation", () => {
  it("rejects malformed JSON string", () => {
    const { compliance } = validateCompliance({ agent: "test", rawOutput: "{ bad", schema });
    expect(compliance.valid).toBe(false);
    expect(compliance.violations[0].code).toBe("MALFORMED_JSON");
  });

  it("accepts valid JSON conforming to schema", () => {
    const raw = JSON.stringify({ schema_version: "1.0.0", count: 5, type: "alpha" });
    const { compliance, data } = validateCompliance({ agent: "test", rawOutput: raw, schema });
    expect(compliance.valid).toBe(true);
    expect(data.count).toBe(5);
  });

  it("detects missing fields, wrong types, enums, extra properties", () => {
    const raw = JSON.stringify({ schema_version: "1.0.0", count: "wrong", extra: true, type: "none" });
    const { compliance } = validateCompliance({ agent: "test", rawOutput: raw, schema });
    expect(compliance.valid).toBe(false);
    const codes = compliance.violations.map(v => v.code);
    expect(codes).toContain("TYPE");
    expect(codes).toContain("ENUM");
    expect(codes).toContain("ADDITIONALPROPERTIES");
  });
});
