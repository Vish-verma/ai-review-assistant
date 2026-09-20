import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export async function complete({
  system,
  user,
  temperature = 0,
  maxTokens = 1500,
  responseSchema = null,   // Day 2
  tools = null,            // Day 3
  history = [],            // Day 4
}) {
  const started = Date.now();

  const generationConfig = { temperature, maxOutputTokens: maxTokens };
  if (responseSchema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = responseSchema;
  }

  const model = genAI.getGenerativeModel({
    model: env.GEMINI_MODEL,
    systemInstruction: system,
    generationConfig,
    ...(tools ? { tools } : {}),
  });

  const contents = user
  ? [...history, { role: "user", parts: [{ text: user }] }]
  : history;

  const result = await model.generateContent({ contents });
  const usage = result.response.usageMetadata;

  console.log("[llm]", {
    model: env.GEMINI_MODEL,
    ms: Date.now() - started,
    in: usage?.promptTokenCount,
    out: usage?.candidatesTokenCount,
    thoughts: usage?.thoughtsTokenCount,
  });

  return {
  text: result.response.text?.() ?? "",
  functionCalls: result.response.functionCalls?.() ?? [],
  modelContent: result.response.candidates?.[0]?.content,   // ← signature lives here
  usage: result.response.usageMetadata,
  };
}