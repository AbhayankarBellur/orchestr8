export function evaluateOperator(operator, observed, threshold) {
  if (operator === "EXISTS") return observed !== undefined && observed !== null;
  if (observed === undefined || observed === null) return false;

  switch (operator) {
    case "EQ": return observed === threshold;
    case "NEQ": return observed !== threshold;
    case "GT": return Number(observed) > Number(threshold);
    case "GTE": return Number(observed) >= Number(threshold);
    case "LT": return Number(observed) < Number(threshold);
    case "LTE": return Number(observed) <= Number(threshold);
    case "IN": return Array.isArray(threshold) && threshold.includes(observed);
    case "NOT_IN": return Array.isArray(threshold) && !threshold.includes(observed);
    case "CONTAINS":
      return Array.isArray(observed)
        ? observed.includes(threshold)
        : String(observed).includes(String(threshold));
    default:
      return false;
  }
}
