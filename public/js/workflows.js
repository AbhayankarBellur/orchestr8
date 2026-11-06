import { WORKFLOWS_PART1 } from "./workflows.data.js";
import { WORKFLOWS_PART2 } from "./workflows.more.js";

export const WORKFLOWS = [...WORKFLOWS_PART1, ...WORKFLOWS_PART2];

export function getWorkflow(id) {
  const wf = WORKFLOWS.find(w => w.id === id) || WORKFLOWS[0];
  return {
    ...wf,
    nodes: wf.nodes.map(n => ({ ...n }))
  };
}
