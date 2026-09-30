const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function interpretUpdateRequest(message, itinerary) {
  const dayList = itinerary.days.map((d, i) => `Day ${i + 1} = ${d.date}`).join(', ');

  const systemPrompt = `You help update a travel itinerary based on a user's follow-up chat message.
The itinerary is for ${itinerary.destination}. The days are: ${dayList}.

Given the user's message, respond with ONLY valid JSON, no markdown:
{
  "targetDate": string (the actual date, e.g. "2026-09-04", matched from the day list above; null if unclear or not applicable),
  "field": "attractions" | "restaurants" | "hotel" | "preferences" | "other",
  "suggestion": string (see rules below)
}

Field classification rules:
- "restaurants": use this for ANY request about food, dining, eating, restaurants, cafes, or where to eat.
- "attractions": use this for sightseeing, landmarks, museums, temples, parks, or things to do/visit.
- "hotel": use this for accommodation, lodging, or where to stay.
- "preferences": use this when the user states a general travel taste or interest for the WHOLE trip, not tied to one day (e.g. "I love seafood and hiking", "add museums as a preference", "I'm traveling with kids"). For this field, "targetDate" is always null, and "suggestion" is a comma-separated list of short preference keywords extracted from the message (e.g. "seafood, hiking").
- "other": anything that doesn't fit the above.

Examples:
- "find me the best restaurant for day 3" -> field: "restaurants", targetDate matched, suggestion: a restaurant name
- "where should I eat on day 2" -> field: "restaurants"
- "what temple should I visit on day 1" -> field: "attractions"
- "find me a hotel near the station" -> field: "hotel"
- "I really love seafood and history" -> field: "preferences", targetDate: null, suggestion: "seafood, history"
- "add hiking to my preferences" -> field: "preferences", targetDate: null, suggestion: "hiking"

Important: since there is no live restaurant/hotel/attraction database connected yet, clearly generate the "suggestion" as a realistic-sounding placeholder for restaurants/attractions/hotel, not a claim about a real, verified business.`;
  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash', systemInstruction: systemPrompt });
  const result = await model.generateContent(message);
  const rawText = result.response.text();
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { interpretUpdateRequest };