import { access, constants } from "node:fs/promises";
import { getTool } from "../tools/tool.registry.js";

async function verifyArtifact(path) {
  if (!path) throw new Error("Artifact path missing in output");
  await access(path, constants.R_OK);
}

export async function invokeInternalTool(toolName, args = {}) {
  const tool = getTool(toolName);
  if (!tool) throw new Error(`Unknown internal tool: ${toolName}`);

  const output = await tool.execute(args);
  if (output?.path) {
    await verifyArtifact(output.path);
  } else if (output?.paths?.html) {
    await verifyArtifact(output.paths.html);
    if (output?.paths?.json) await verifyArtifact(output.paths.json);
  } else {
    throw new Error(`Tool ${toolName} did not produce verifiable artifacts`);
  }

  return { success: true, tool: toolName, result: output };
}
