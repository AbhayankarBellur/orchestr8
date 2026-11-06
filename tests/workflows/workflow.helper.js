export function makeToolDecision(tool_name, args = {}, server = "taskos") {
  return JSON.stringify({
    decision_version: "1.0.0",
    status: "TOOL_PROPOSED",
    intent: { description: `Call ${tool_name}`, entities: [], operation: "execute" },
    tool_selection: {
      server, tool_name, arguments: args,
      selection_rationale: "Selected for step",
      evidence: [], alternatives_considered: []
    },
    clarification: null,
    reasoning: { assumptions: ["Proceed"], uncertainties: [], risks: [] }
  });
}

export function makeTerminalDecision(summary = "Workflow complete") {
  return JSON.stringify({
    decision_version: "1.0.0",
    status: "NO_TOOL_REQUIRED",
    intent: { description: "Finish", entities: [], operation: "read" },
    tool_selection: null,
    clarification: null,
    reasoning: { assumptions: [summary], uncertainties: [], risks: [] }
  });
}
