import * as S from "./sections.js";

const FOCUS_SECTIONS = {
  security: S.SECURITY,
  performance: S.PERFORMANCE,
  maintainability: S.MAINTAINABILITY,
};

/**
 * Static content only — identical across requests so the provider can
 * cache the prefix. Per-request values go in the user message.
 */
export function buildSystemPrompt({ focus = ["security", "performance", "maintainability"] } = {}) {
  const selected = focus
    .filter((f) => FOCUS_SECTIONS[f])
    .map((f) => FOCUS_SECTIONS[f]);

  return [S.ROLE, ...selected, S.OUTPUT_RULES, S.TRUST_BOUNDARY].join("\n\n");
}

export function buildUserPrompt({ code, language }) {
  return [
    `Language: ${language}`,
    "",
    "<untrusted_code>",
    code,
    "</untrusted_code>",
    "",
    "Review the code above.",
  ].join("\n");
}