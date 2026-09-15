// src/llm/client.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export async function complete({ system, user, temperature = 0, maxTokens = 1500 }) {
  const started = Date.now();

  const model = genAI.getGenerativeModel({
    model: env.GEMINI_MODEL,
    systemInstruction: system,
    generationConfig: { temperature, maxOutputTokens: maxTokens },
  });

  const result = await model.generateContent(user);
  const usage = result.response.usageMetadata;

  console.log("[llm]", {
    model: env.GEMINI_MODEL,
    ms: Date.now() - started,
    promptTokens: usage?.promptTokenCount,
    completionTokens: usage?.candidatesTokenCount,
  });

  return { text: result.response.text(), usage };
}