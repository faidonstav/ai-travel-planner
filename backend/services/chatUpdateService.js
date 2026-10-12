const { askGeminiJson } = require('./geminiClient');

const MAX_ITEMS_PER_LIST = 3;

const isWet = (code) =>
  (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99);
const isSnow = (code) => (code >= 71 && code <= 77) || (code >= 85 && code <= 86);

function describeWeather(w) {
  if (!w || w.weatherCode == null || w.maxTemp == null) {
    return 'forecast unavailable (assume mild weather)';
  }
  const wet = isWet(w.weatherCode) || isSnow(w.weatherCode) || (w.precipitationChance ?? 0) >= 50;
  let advice = 'good for outdoor activities';
  if (wet) advice = 'wet weather: prefer indoor activities';
  else if (w.maxTemp >= 35) advice = 'very hot: avoid midday outdoor activities';
  else if (w.maxTemp <= 3) advice = 'very cold: prefer indoor activities';
  return `${w.minTemp} to ${w.maxTemp}°C, ${w.precipitationChance ?? 0}% chance of rain, ${advice}`;
}

function estimatePlannedCost(itinerary) {
  const travelers = itinerary.travelers || 1;
  const sum = (list) =>
    (list || []).reduce((s, item) => s + (Number(item?.pricePerPerson) || 0), 0);
  return itinerary.days.reduce(
    (total, day) =>
      total +
      (sum(day.attractions) + sum(day.restaurants) + (Number(day.localTransportPerPerson) || 0)) * travelers,
    0
  );
}

function buildBudgetInfo(itinerary) {
  const travelers = itinerary.travelers || 1;
  const numDays = itinerary.days.length || 1;

  const hotel = itinerary.days[0]?.hotel;
  const sameCurrency =
    String(hotel?.currency || '').toUpperCase() === String(itinerary.currency || '').toUpperCase();
  const hotelTotal = hotel && sameCurrency ? Number(hotel.totalPrice) || 0 : 0;

  const planned = estimatePlannedCost(itinerary);
  const forActivities = Math.max(0, itinerary.budget - hotelTotal);

  return {
    travelers,
    totalBudget: itinerary.budget,
    hotelTotal,
    plannedCost: Math.round(planned),
    remaining: Math.round(forActivities - planned),
    perPersonPerDay: Math.round(forActivities / travelers / numDays),
  };
}

function listItems(list) {
  return (
    (list || [])
      .map((x) => `${x?.name || x} (${Number(x?.pricePerPerson) || 0} per person)`)
      .join('; ') || 'none'
  );
}

function buildSystemPrompt(itinerary) {
  const b = buildBudgetInfo(itinerary);
  const cur = itinerary.currency;
  const prefs = (itinerary.preferences || []).join(', ') || 'none specified';

  const dayLines = itinerary.days
    .map(
      (day, i) =>
        `Day ${i + 1} | ${day.date} | Weather: ${describeWeather(day.weather)} | Attractions: ${listItems(day.attractions)} | Restaurants: ${listItems(day.restaurants)}`
    )
    .join('\n');

  return `You update a travel itinerary for ${itinerary.destination} based on the traveler's chat message.

Traveler preferences so far: ${prefs}.
Travelers: ${b.travelers}. Currency: ${cur}.
Budget: total ${b.totalBudget} ${cur}; hotel ${b.hotelTotal} ${cur}; already planned ${b.plannedCost} ${cur}; remaining ${b.remaining} ${cur}. About ${b.perPersonPerDay} ${cur} per person per day is available for attractions + restaurants + local transport.

Days:
${dayLines}

Respond with ONLY valid JSON, no markdown, exactly this shape:
{
  "newPreferences": string[],
  "changes": [
    {
      "date": string (one of the dates listed above),
      "attractions": [{ "name": string, "pricePerPerson": number }] or null,
      "restaurants": [{ "name": string, "pricePerPerson": number }] or null
    }
  ],
  "reply": string
}

SCOPE (which days):
- A day is named ("day 3", a date) -> only that day. Several days named -> one change per day.
- "every day", "all days", "the whole trip", or a general taste with no day -> every day.
- Weather mentioned instead of a day ("the rainy day") -> the days whose weather matches.

WHICH LISTS:
- "attractions" is for sightseeing, sports, activities, museums, nature; "restaurants" is for food, cuisines, dining.
- Set a list to null when the request does not concern it (null = keep that list as is). Only return a list you are replacing, with 1-2 items.
- A general taste ("I love sports", "I like seafood") also goes into "newPreferences" as short keywords, and refreshes the matching list on every day: sports/culture/nature/activities -> attractions; cuisines/food -> restaurants; unclear or whole-trip ("traveling with kids") -> both.

BUDGET (always applies):
- "free" or "no cost" -> every item you return in that list has pricePerPerson 0.
- "cheaper", "lower budget", "budget-friendly" -> every new item costs clearly less than what it replaces.
- "fancier", "more expensive" -> higher prices, but stay within the remaining budget.
- Otherwise keep each day's attractions + restaurants within the per-person-per-day amount.
- If the request cannot fit the budget, do your best and say so in the reply.

WEATHER (always applies, even if the user didn't mention it):
- Wet or very cold days -> indoor attractions (museums, covered markets, indoor sports venues, spas).
- Very hot days -> avoid midday outdoor activities (shaded, indoor, or evening options).
- Good weather -> outdoor is fine.
- If the request clashes with the weather (e.g. outdoor sports on a rainy day), pick an indoor version of it and mention that in the reply.

PREFERENCES:
- Respect every stored preference plus any new ones. Combine all constraints (e.g. cheaper AND seafood).

OTHER:
- Don't repeat the same place on several days. Prefer well-known places that really exist. Prices are rough estimates in ${cur}, not verified.
- Requests you can't handle here (hotels, flights, unrelated chat) -> "changes": [], "newPreferences": [], and the reply says briefly what you can do (update attractions, restaurants and preferences).
- "reply": 1-3 friendly sentences saying what you changed and why (mention weather or budget when they influenced it) and that prices are estimates.

Examples:
- "I love sports" -> newPreferences ["sports"]; every day gets sport-related attractions (indoor on wet/cold days); restaurants null.
- "I want a free cost attraction for day 3" -> one change for Day 3's date; attractions with pricePerPerson 0; restaurants null; newPreferences [].
- "I want lower budget restaurants for every day, with seafood preference" -> newPreferences ["seafood"]; every day gets seafood restaurants cheaper than the current ones; attractions null.
- "something for the rainy day" -> changes only for the wet days, with indoor attractions.`;
}

function askGemini(message, itinerary) {
  return askGeminiJson(buildSystemPrompt(itinerary), message);
}

function sanitizeItems(list) {
  if (!Array.isArray(list)) return null;
  const items = list
    .map((i) => ({
      name: String(i?.name || '').trim(),
      pricePerPerson: Math.max(0, Number(i?.pricePerPerson) || 0),
    }))
    .filter((i) => i.name)
    .slice(0, MAX_ITEMS_PER_LIST);
  return items.length ? items : null;
}

async function applyChatUpdate(message, itinerary) {
  // 1. Ask Gemini for a plan
  const plan = await askGemini(message, itinerary);

  // 2. Preferences apply to the whole trip
  const newPrefs = (Array.isArray(plan.newPreferences) ? plan.newPreferences : [])
    .map((p) => String(p).trim())
    .filter(Boolean);
  if (newPrefs.length) {
    itinerary.preferences = [...new Set([...(itinerary.preferences || []), ...newPrefs])];
  }

  // 3. Per-day changes (dates are checked against the real itinerary)
  let changedDays = 0;
  for (const change of plan.changes || []) {
    const day = itinerary.days.find((d) => d.date === change.date);
    if (!day) continue;

    const attractions = sanitizeItems(change.attractions);
    const restaurants = sanitizeItems(change.restaurants);
    if (attractions) day.attractions = attractions;
    if (restaurants) day.restaurants = restaurants;
    if (attractions || restaurants) changedDays++;
  }

  // 4. Budget check done in code, not by the model
  let reply = plan.reply || 'Done, I updated your itinerary.';
  if (changedDays > 0) {
    const after = buildBudgetInfo(itinerary);
    if (after.remaining < 0) {
      reply += ` Note: your planned activities and food now come to about ${after.plannedCost} ${itinerary.currency}, which is ${Math.abs(after.remaining)} ${itinerary.currency} over your budget after the hotel.`;
    }
  }

  return { reply };
}

module.exports = { applyChatUpdate };