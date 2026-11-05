import Ajv2020 from "ajv/dist/2020.js";

const ajv = new Ajv2020({ allErrors: true, strict: false });
const cache = new Map();

function getValidator(schema) {
  const key = schema.$id || schema.title || JSON.stringify(schema);
  if (!cache.has(key)) cache.set(key, ajv.compile(schema));
  return cache.get(key);
}

export function validateSchema(data, schema) {
  if (!schema) return [];
  const validate = getValidator(schema);
  if (validate(data)) return [];
  return (validate.errors || []).map(err => ({
    code: (err.keyword || "SCHEMA_ERROR").toUpperCase(),
    field: err.instancePath || "/",
    message: err.message || "Schema violation"
  }));
}
