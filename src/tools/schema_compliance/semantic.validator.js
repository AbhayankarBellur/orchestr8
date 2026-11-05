import { validateResearchSemantics } from "./semantic.research.js";
import { validatePlanningSemantics } from "./semantic.planning.js";
import { validateExecutionSemantics } from "./semantic.execution.js";

const VALIDATORS = {
  research: validateResearchSemantics,
  planning: validatePlanningSemantics,
  execution: validateExecutionSemantics
};

export function validateSemantics(agent, data, input) {
  const fn = VALIDATORS[agent];
  return fn ? fn(data, input) : [];
}
