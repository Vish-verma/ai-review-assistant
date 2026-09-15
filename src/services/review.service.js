import { complete } from "../llm/client.js";
import { buildSystemPrompt, buildUserPrompt } from "../prompts/promptBuilder.js";

export async function reviewCode({ code, language, focus }) {
  const system = buildSystemPrompt({ focus });
  const user = buildUserPrompt({ code, language });

  const { text, usage } = await complete({ system, user });

  return { review: text, usage };
}