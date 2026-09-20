import { complete } from "../llm/client.js";
import { buildSystemPrompt, buildUserPrompt } from "../prompts/promptBuilder.js";
import { REVIEW_SCHEMA } from "../llm/schemas.js";
import { parseStructured, reviewResultSchema } from "../llm/parse.js";
import { getToolsForRole, executeTool } from "../tools/index.js";
import { judgeFindings } from "../agent/judge.js";
import { runAgent } from "../agent/loop.js";

const STRICTER = `
Your previous response could not be parsed as valid JSON.
Return ONLY the JSON object. No markdown, no commentary, no code fences.
`.trim();

export async function reviewCode({ code, language, focus }) {
  const system = buildSystemPrompt({ focus });
  const user = buildUserPrompt({ code, language });
  const lineCount = code.split("\n").length;

  let lastError;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const { text, usage } = await complete({
      system: attempt === 1 ? system : `${system}\n\n${STRICTER}`,
      user,
      responseSchema: REVIEW_SCHEMA,
    });

    try {
      const result = parseStructured(text, reviewResultSchema);

      const withinBounds = result.findings.filter((f) => f.line <= lineCount);
      // Schema-valid but nonsensical: drop hallucinated line numbers.
      const { findings, dropped } = await judgeFindings({
        code,
        findings: withinBounds,
      });

      return {
        ...result,
        findings,
        dropped,
        usage,
        attempts: attempt,
      };
    } catch (err) {
      lastError = err;
      console.warn(`[parse] attempt ${attempt} failed: ${err.message}`);
    }
  }

  const err = new Error(`Model returned unparseable output: ${lastError.message}`);
  err.status = 502;
  throw err;
}



const AGENT_SYSTEM = `
You review a codebase. Use the tools to read real files — never guess contents.
Cite only line numbers that appear in tool output.
When you have enough information, give your final answer as text.
`.trim();

export async function askAboutCode({ question, role = "reviewer" }) {
  return runAgent({ question, role, system: AGENT_SYSTEM });
}

// export async function askAboutCode({ question, role = "reviewer" }) {
//   const { declarations, allowed } = getToolsForRole(role);

//   const first = await complete({
//     system: "You review a codebase. Use tools to read real files. Never guess file contents.",
//     user: question,
//     tools: declarations,
//   });

//   if (!first.functionCalls.length) {
//     return { answer: first.text, toolsUsed: [] };
//   }

//   // Parallel — unrelated lookups shouldn't be sequential.
//   const results = await Promise.all(
//     first.functionCalls.map(async (call) => ({
//       name: call.name,
//       response: await executeTool(call.name, call.args, allowed),
//     }))
//   );

//   const history = [
//     { role: "user", parts: [{ text: question }] },
//     first.modelContent,                                   // verbatim, signature intact
//     {
//       role: "user", parts: results.map((r) => ({
//         functionResponse: { name: r.name, response: r.response },
//       }))
//     },
//   ];

//   const second = await complete({
//     system: "You review a codebase. Cite only line numbers present in tool output.",
//     user: "",
//     history,
//     tools: declarations,
//   });

//   if (!second.text && second.functionCalls.length) {
//     return {
//       answer: "",
//       toolsUsed: results.map((r) => r.name),
//       wantsMoreTools: second.functionCalls.map((c) => c.name),
//       note: "Model needs another round-trip. This is what the Day 4 loop solves.",
//     };
//   }

//   return { answer: second.text, toolsUsed: results.map((r) => r.name) };
// }