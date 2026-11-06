const SENSITIVE_REGEX = /^(api_?key|token|access_?token|auth(orization)?|secret|password|nonce|authorization_nonce|credential|private_?key)$/i;

export function redactSensitiveData(data) {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;
  if (Array.isArray(data)) return data.map(item => redactSensitiveData(item));

  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_REGEX.test(key)) {
      clean[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      clean[key] = redactSensitiveData(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}
