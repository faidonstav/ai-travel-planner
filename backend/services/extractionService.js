const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractTripDetails(userText) {
  const systemPrompt = `You extract structured trip details from a user's travel description.
Respond with ONLY valid JSON, no markdown, no explanation, matching exactly this shape:
{
  "destination": string (if the text does not clearly describe a travel destination, set "destination" to null),
  "startDate": string (if the text does not clearly describe the starting date of trip, set "startDate" to null),
  "endDate": string or null,
  "durationDays": number or null,
  "budget": number (if the text does not clearly describe the budget of trip, set "budget" to null),
  "currency": string (default "EURO"),
  "preferences": string[],
  "travelers": number (default 1)
}`;

  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash', systemInstruction: systemPrompt });
  const result = await model.generateContent(userText);
  const rawText = result.response.text();

  const cleaned = rawText.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

function getMissingFields(extracted){
  const missing = [];
  if(!extracted.destination) missing.push('destination');
  if(!extracted.startDate) missing.push('dates');
  if(!extracted.budget) missing.push('budget');
  return missing;
}

module.exports = { extractTripDetails, getMissingFields };