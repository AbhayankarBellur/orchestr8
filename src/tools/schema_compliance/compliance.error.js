export class SchemaValidationError extends Error {
  constructor(agent, schemaVersion, attempts, violations) {
    super(`Agent ${agent} output failed validation after ${attempts} attempts`);
    this.name = "SchemaValidationError";
    this.status = 422;
    this.payload = {
      status: "FAILED_SCHEMA",
      agent,
      schema_version: schemaVersion,
      attempts,
      violations
    };
  }
}
