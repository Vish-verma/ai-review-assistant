import { toolDeclarations } from "./definitions.js";
import { toolImplementations } from "./implementations.js";

const TOOLSETS = {
  reviewer: ["listFiles", "getFileContents", "searchCode", "formatDuration"],
  readonly: ["listFiles", "searchCode"],
};

export function getToolsForRole(role = "reviewer") {
  const allowed = TOOLSETS[role] ?? TOOLSETS.readonly;
  return {
    declarations: [{
      functionDeclarations: toolDeclarations.filter((t) => allowed.includes(t.name)),
    }],
    allowed,
  };
}

export async function executeTool(name, args, allowed) {
  if (!allowed.includes(name)) {
    return { error: `Tool "${name}" is not available to this role.` };   // ← second check
  }
  const impl = toolImplementations[name];
  if (!impl) return { error: `Unknown tool "${name}".` };

  try {
    return await impl(args ?? {});
  } catch (err) {
    return { error: err.message };   // ← errors go BACK to the model, not up the stack
  }
}