const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractTripDetails(userText) {
  const systemPrompt = `You extract structured trip details from a user's travel description.
Respond with ONLY valid JSON, no markdown, no explanation, matching exactly this shape:
{
  "destination": string,
  "startDate": string or null (YYYY-MM-DD if given, otherwise null),
  "endDate": string or null,
  "durationDays": number or null,
  "budget": number or null,
  "currency": string (default "USD"),
  "preferences": string[],
  "travelers": number (default 1)
}`;

  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash', systemInstruction: systemPrompt });
  const result = await model.generateContent(userText);
  const rawText = result.response.text();

  const cleaned = rawText.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { extractTripDetails };