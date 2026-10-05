const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractTripDetails(userText) {
  const systemPrompt = `You extract structured trip details from a user's travel description, and also suggest daily attractions and restaurants for the trip.
Respond with ONLY valid JSON, no markdown, no explanation, matching exactly this shape:
{
  "destination": string (if the text does not clearly describe a travel destination, set "destination" to null),
  "startDate": string (if the text does not clearly describe the starting date of trip, set "startDate" to null),
  "endDate": string or null,
  "durationDays": number or null,
  "budget": number (if the text does not clearly describe the budget of trip, set "budget" to null),
  "currency": string (default "EURO"),
  "preferences": string[],
  "travelers": number (default 1),
  "dailySuggestions": [
  { "day": number (1-indexed, 1= first day of the trip), "attractions": string[] (1-2 items), "restaurants": string[] (1-2 items) }
   ]
}
  For "dailySuggestions": generate one entry per day of the trip. If durationDays is known, use that count; if unknown, assume 5 days. Base suggestions on the destination and preferences. Vary suggestions across days — don't repeat the same one twice.

  Important: since there is no live attractions/restaurants database connected yet, generate "dailySuggestions" entries as realistic-sounding, destination-appropriate placeholders — not claims about verified, currently operating businesses.`;

  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash', systemInstruction: systemPrompt });
  const result = await model.generateContent(userText);
  const rawText = result.response.text();

  const cleaned = rawText.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

async function generateDailySuggestions(destination, preferences, numDays, currency) {
  const systemPrompt = `You suggest daily attractions and restaurants for a trip to ${destination}.
  Traveler preferences: ${preferences.length ? preferences.join(', ') : 'none specified'}.
  The trip lasts ${numDays} days. All prices must be in ${currency}.

  Respond with ONLY valid JSON, no markdown, no explanation, matching exactly this shape:
  {
    "dailySuggestions": [
      {
        "day": number (1-indexed),
        "attractions": [ { "name": string, "pricePerPerson": number } ] (1-2 items),
        "restaurants": [ { "name": string, "pricePerPerson": number } ] (1-2 items),
        "localTransportPerPerson": number
      }
    ]
  }
  Rules:
  - Suggest real, well-known places in the destination where possible.
  - "pricePerPerson" is your best ESTIMATE of the typical cost for one adult: the entry fee for attractions (0 if free), an average meal (food and a drink) for restaurants.
  - "localTransportPerPerson" is the estimated cost of getting around locally for that day.
  - Use plain numbers only, no currency symbols. Generate exactly one entry per day and vary the suggestions.`;

  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash', systemInstruction: systemPrompt});
  const result = await model.generateContent('Generate the suggestions now.');
  const cleaned = result.response.text().replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  console.log(result.response.text());
  // Same defensive casing check as before: Gemini doesn't always match key casing exactly
  return parsed.dailySuggestions || parsed.DailySuggestions || [];
}

function getMissingFields(extracted){
  const missing = [];
  if(!extracted.destination) missing.push('destination');
  if(!extracted.startDate) missing.push('dates');
  if(!extracted.budget) missing.push('budget');
  return missing;
}

module.exports = { extractTripDetails, getMissingFields, generateDailySuggestions };