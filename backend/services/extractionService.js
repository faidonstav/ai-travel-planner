const { askGeminiJson } = require('./geminiClient');

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

  const parsed = await askGeminiJson(systemPrompt, `Generate the suggestions now.`);
  return parsed.dailySuggestions || parsed.DailySuggestions || [];
}


module.exports = { generateDailySuggestions };