import "dotenv/config";

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
);
const data = await res.json();

if (!data.models) {
  console.error(data);
  process.exit(1);
}

console.log("\n--- generateContent (chat) ---");
for (const m of data.models) {
  if (m.supportedGenerationMethods?.includes("generateContent")) {
    console.log(m.name.replace("models/", ""));
  }
}

console.log("\n--- embedContent (Day 5) ---");
for (const m of data.models) {
  if (m.supportedGenerationMethods?.includes("embedContent")) {
    console.log(m.name.replace("models/", ""));
  }
}