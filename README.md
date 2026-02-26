# LeakFixer Mini App

Telegram Mini App for the LeakFixer bot. Current state: daily lessons plus an advanced fitness module (activities, nutrition, water, supplements, weight, and gym periods) with Supabase sync.

## Project Structure

```text
leakfixer-miniapp/
├── index.html
├── app.js
├── fitness.js
├── fitness-sync.js
├── activity-calories.js
├── main.css
├── fitness.css
├── project-specs.md
├── fitness-module.md
├── api/
│   ├── telegram-avatar.js
│   └── nutrition.js
├── .gitignore
└── README.md
```

## Architecture

- `app.js`: app initialization, Telegram WebApp integration, navigation, and DOM glue.
- `fitness.js`: fitness domain logic (state helpers, view-model builders, pure merge/build/remove operations).
- `fitness-sync.js`: fitness sync with Supabase (`user_profile`, `fitness_daily`, `daily_state`, `measurements`).
- `activity-calories.js`: activity calorie references and calculators.
- `api/telegram-avatar.js`: server endpoint for real Telegram avatar loading with `initData` validation.
- `api/nutrition.js`: server endpoint for automatic nutrition estimation (CalorieNinjas).

## Implemented

### Core

- Safe Telegram WebApp initialization with browser demo fallback.
- User initialization via Supabase (`app_users` and legacy `users`).
- Daily lesson screen (`lessons`) and completion logging (`daily_logs`).
- Header profile UI (name, username, avatar) plus Telegram avatar fetching via API.
- Global mood widget with persistence to `daily_state` and `measurements`.
- Habit cards in profile based on `habits` and `habit_logs`.

### Fitness

- Body profile onboarding: weight, height, age, target weight, work profile, body measurements.
- Daily activity tracking: gym/strength, cardio, home, steps, daily.
- Calories summary: eaten/burned/balance with dashboard cards and mini summaries.
- Nutrition tracking with manual input.
- Nutrition tracking with auto mode through `/api/nutrition`.
- Water tracking: baseline/target, quick adjustments, hydration status.
- Supplements: profile, intake intervals, templates, actual intakes, history.
- Weight tracking: logging, history, chart, edit and delete flows.
- Gym module: periods, cycles, days, muscle groups, progress, calendar mapping.
- Local persistence (localStorage) with partial Supabase synchronization.

## In Progress

- Full habits screen and CRUD (currently only profile widget is available).
- Full buddy module (relationships, shared goals, interaction flows).
- Unified progression rules for `streak` and `points` as a dedicated domain layer.
- Consolidation of legacy/new user entities (`users` and `app_users`).

## Supabase Tables Used (Current Code)

- Core tables: `app_users`, `users`, `lessons`, `daily_logs`.
- Fitness tables: `user_profile`, `fitness_daily`, `daily_state`, `measurements`.
- Habit tables: `habits`, `habit_logs`.

## API and Environment Variables

For server endpoints (`api/*`) set:

- `TELEGRAM_BOT_TOKEN` for `/api/telegram-avatar`.
- `CALORIE_NINJAS_API_KEY` for `/api/nutrition`.

Note: `file://` mode does not support `api/*` routes; use a local server or deployment.

## Local Run

```bash
python -m http.server 8000
# or
npx serve
```

Then open the app in browser (demo mode) or through Telegram Mini App URL.

## Project Docs

- System-level specification: `project-specs.md`
- Fitness module specification: `fitness-module.md`

---

Last updated: 2026-02-26
