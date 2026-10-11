# AI Travel Planner

> A full-stack web app that turns a destination, dates and budget
> into a day-by-day itinerary with weather, hotels, AI-suggested activities and a live budget tracker.

![Screenshot or GIF of the main flow](docs/demo.gif)

## Table of Contents
(Overview · Features · Tech Stack · Architecture · Getting Started · API Reference · Design Decisions · Challenges & Lessons · Limitations · Roadmap)

## Overview
The app allows users to select a destination, the number of travelers, travel dates, and a budget, and based on this information, it creates a comprehensive travel plan. 
The app provides recommendations for hotels, attractions, and restaurants along with their respective costs, a weather forecast for each day, and an overall estimate of the trip’s cost. 
The entire app isa bases on the use of free-tier APIs.

## Features
- Trip form: destination, travelers, date-range picker, budget
- Day-by-day itinerary with weather forecast and icons per day
- AI-generated attractions, restaurants and local transport, with per-person price estimates
- Hotel suggestions (rating, nightly and total price, link)
- Budget tracker: per-day and trip totals, under/near/over-budget status
- Natural-language chat to edit the trip ("cheaper seafood restaurants every day", "something for the rainy day")
- Drag-and-drop reordering between days, plus item deletion
- Save, reopen and delete trips (PostgreSQL persistence)

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, @hello-pangea/dnd, react-day-picker |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL (JSONB for itineraries) |
| AI | Google Gemini (`gemini-3.6-flash`) |
| External APIs | Open-Meteo (geocoding + weather), StayingAPI (hotels) |

## Architecture
Diagram (simple box diagram is fine): React client → Express routes → services
(extraction, geocoding, weather, hotels, itinerary, chatUpdate, tripStore) → Gemini / Open-Meteo / StayingAPI / PostgreSQL.
Then a short description of the `/plan` request flow:
validate → geocode → weather → hotels → build itinerary → Gemini suggestions → save → respond.
Mention which steps are non-critical and degrade gracefully (weather, hotels, suggestions).

## Project Structure
Tree of backend/ (routes, services, db, setup script) and frontend/src (components, utils, api.js) with one-line comments.

## Getting Started
### Prerequisites
Node version, PostgreSQL, Gemini API key, StayingAPI key
### Installation
Clone, install backend, install frontend
### Environment variables
Table of every variable in `.env.example` (PORT, GEMINI_API_KEY, STAYINGAPI_KEY, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME) with where to get each key
### Database setup
Create the DB, run `node scripts/setupDb.js` (adjust to your real path)
### Run
Backend: `npm run dev` (port 5000). Frontend: `npm run dev`.

## API Reference
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/trips/plan | Create an itinerary |
| POST | /api/trips/:id/update | Chat-based itinerary update |
| POST | /api/trips/:id/save | Mark trip as saved |
| GET | /api/trips/saved | List saved trips |
| GET | /api/trips/:id | Get one trip |
| PUT | /api/trips/:id | Overwrite itinerary (drag-drop/delete) |
| DELETE | /api/trips/:id | Delete a trip |
Add an example request/response for `/plan`.

## How the AI Is Used
- Daily suggestions: prompt design, strict JSON output, price estimates, currency
- Chat updates: the model gets the itinerary, weather, budget and preferences, and returns structured changes
- Guardrails: output sanitized in code, dates validated against the real itinerary, max 3 items per list, budget check done in code, not by the model

## Design Decisions
Short bullets with the "why": service-layer separation (swap a provider by editing one file), JSONB storage, graceful degradation, free-tier-only constraints, Gemini JSON key-casing defense.

## Challenges & Lessons Learned
OpenTripMap 401s, Amadeus decommissioned, Makcorps paid-only → vetting APIs first;
merging Gemini calls to respect quota; model deprecation; LLM output not matching the schema.

## Known Limitations
- AI prices and place names are estimates, not verified or live
- Hotel data comes from an unofficial sandbox API
- Weather forecast only reaches about 16 days ahead
- No authentication: trips are not tied to users
- Trips capped at 14 days

## Roadmap
Real attractions API, user accounts, tests, deployment, export/share itinerary, map view.

## License / Author
Your name, LinkedIn/GitHub link, license (MIT is typical).
