import { complete } from "../llm/client.js";
import { getToolsForRole, executeTool } from "../tools/index.js";

const MAX_ITERATIONS = 5;
const MAX_TOOL_CALLS = 12;

export async function runAgent({ question, role = "reviewer", system }) {
  const { declarations, allowed } = getToolsForRole(role);

  const history = [{ role: "user", parts: [{ text: question }] }];
  const trace = [];
  let toolCallCount = 0;

  for (let i = 1; i <= MAX_ITERATIONS; i++) {
    const res = await complete({
      system,
      user: i === 1 ? question : "Continue. Use the tool results above.",
      tools: declarations,
      history: i === 1 ? [] : history,
    });

    if (!res.functionCalls.length) {
      trace.push({ iteration: i, action: "final_answer" });
      return { answer: res.text, trace, iterations: i };
    }

    if (toolCallCount + res.functionCalls.length > MAX_TOOL_CALLS) {
      trace.push({ iteration: i, action: "budget_exceeded" });
      return {
        answer: res.text || "Stopped: tool call budget exceeded.",
        trace,
        iterations: i,
        degraded: true,
      };
    }

    toolCallCount += res.functionCalls.length;

    const results = await Promise.all(
      res.functionCalls.map(async (call) => ({
        name: call.name,
        response: await executeTool(call.name, call.args, allowed),
      }))
    );

    trace.push({
      iteration: i,
      action: "tool_calls",
      tools: results.map((r) => ({ name: r.name, ok: !r.response.error })),
    });

    history.push(
      { role: "model", parts: res.functionCalls.map((c) => ({ functionCall: c })) },
      { role: "user", parts: results.map((r) => ({
          functionResponse: { name: r.name, response: r.response },
        })) }
    );
  }

  trace.push({ action: "max_iterations_reached" });
  return {
    answer: "Could not complete within the iteration limit.",
    trace,
    iterations: MAX_ITERATIONS,
    degraded: true,
  };
}