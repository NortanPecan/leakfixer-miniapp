## Project Purpose

LeakFixer Mini App is the Telegram Mini App frontend of a broader self‑development platform.  
The long‑term product model is a social network where users identify and close life “leaks” (gaps/deficits) across multiple domains (health, money, relationships, skills, habits, etc.), track progress, and interact with others (buddies, coaches, program authors).

The current implementation focuses on:
- a 30‑day lesson loop,
- a mature fitness module as the main vertical,
- basic habits and mood tracking,
- foundation for future social and coaching layers.

## Repository Scope

This repository currently contains:
- the Mini App client (HTML/CSS/JS),
- Vercel server endpoints used by the Mini App.

Implemented code covers:
- daily lesson loop (lesson consumption and completion logging),
- user profile and basic progress UI,
- the fitness module as the main domain vertical,
- integrations with Supabase and Telegram WebApp.

## Product Roles

- **User**: primary actor; all implemented workflows are user‑centric.
- **Buddy (goal partner)**: part of the concept and navigation; relationship flows are not implemented yet.
- **Coach / Trainer**: planned role; no dedicated interface or permissions yet.
- **Course / Program Author**: planned role; current code only supports lesson consumption from `lessons`.

## Domains and Entities

### Core Domain (Implemented)

- `app_users`: canonical app user mapped to Telegram ID.
- `users` (legacy): progress profile for the 30‑day loop (`day`, `streak`, `points`).
- `lessons`: day content (`title`, `description`, `video_url`).
- `daily_logs`: day completion facts.
- `habits`, `habit_logs`: habit definitions and per‑user habit logs.
- Telegram identity and profile photo flow (`initDataUnsafe`, `/api/telegram-avatar`).

### Fitness Domain (Implemented, Main Module)

(See `fitness-module.md` for the full specification.)

High‑level coverage:
- Fitness profile: weight, height, age, target weight, work profile, body measurements.
- Daily data: activities, nutrition, water, daily work intensity and mood.
- Activities: gym/strength, cardio (indoor/outdoor), home exercises, steps, daily activity.
- Nutrition: manual input and auto macro/calorie estimation via `/api/nutrition`.
- Supplements:
  - clear separation between supplement definitions/templates and actual intake events;
  - planned intakes are generated per day from templates and merged with actual events;
  - adherence and deviations are available as structured signals for the core leak model.
- Weight and measurements: logs in `measurements`, chart/history/edit/delete flows.
- Gym periodization: periods, cycles, days, muscle groups, progress state.
- Mood/resource: widget plus persistence to `daily_state` and `measurements`.
- Daily fitness state:
  - normalized `FitnessDayData` shape with explicit `supplements[]` list;
  - helper functions ensure that reads/writes always use a consistent structure and propagate into `fitness_daily` and `daily_state.data.fitness`.

### Social / Coaching / Courses Domains (Planned)

- Buddy relationships and shared goals.
- Coach workspace for assignments, monitoring, and feedback.
- Program / course authoring and user distribution.
- A unified cross‑domain leak model (finance, relationships, skills, etc.) built on top of daily signals from all modules.

## Modular Structure

### Current Layout

- `index.html`, `main.css`, `fitness.css`: screens and visual shell.
- `app.js`:
  - orchestration layer (init, navigation, DOM glue, screen flows),
  - includes a dedicated “Fitness Settings” panel that exposes fitness configuration (e.g. water baseline and related settings) independently of body/support panels.
- `fitness.js`: fitness domain logic (state helpers, view‑models, pure helpers).
- `fitness-sync.js`: sync adapter for fitness data and measurements.
- `activity-calories.js`: calorie references and calculation helpers.
- `api/telegram-avatar.js`, `api/nutrition.js`: Vercel server functions.

### Target Modularity (Planned)

- `core`: identity, profiles, shared daily state, cross‑domain leak/progress scoring.
- `fitness`: current mature reference module.
- `habits`, `social`, `coaching`, `courses`: separate domain modules with their own contracts and specs.

## Implementation Status

### Working Now

- Telegram WebApp startup with browser fallback.
- User resolution/creation in Supabase (`app_users`, `users`).
- Daily lesson loading and completion tracking in `daily_logs`.
- Global mood widget with Supabase persistence.
- Fitness dashboard: profile, activity/nutrition/water tracking, supplements, gym, avatar, themes, weight chart.
- Partial Supabase sync through `FitnessSync`.

### Partially Implemented

- Habits: profile cards are loaded; no full habits screen/CRUD.
- Buddy: navigation path exists; no complete relationship flow.
- Global progress (`streak`, `points`): visible and used, but no dedicated domain policy layer.

### Planned Next

- Full social mechanics (buddies, shared goals, accountability).
- Multi‑domain leak coverage beyond fitness.
- Coach and author roles with dedicated interfaces and permissions.
- Stronger module boundaries and core contracts for scaling.
- Unification of legacy and new user entities (`users` and `app_users`).

## Current Constraints

- Supabase public keys are used in the client (MVP trade‑off; requires stronger security and RLS hardening).
- Significant fitness state is stored in localStorage with async synchronization.
- Legacy and new user entities (`users` vs `app_users`) coexist and should be unified.

## i18n and Language Policy

- The Mini App UI currently targets Russian as the primary language.
- All long‑living documentation and spec files (`*.md`) must be written in English.
- The architecture must support future language switching (RU/EN) for:
  - static text (labels, copy, lesson text),
  - domain‑level messages and notifications.
- Future UI work should introduce a language switcher and a structured way to store translations (e.g. JSON resource bundles or i18n library of choice).

## i18n and Language Strategy

### Current State

- The Mini App UI is currently designed primarily for Russian‑speaking users.
- All long‑living documentation and specification files (`*.md`) are written in English only.
- Telegram Mini App shell (hosted inside Telegram) can be localized gradually without changing the core domain logic.

### Goals

- Support at least two UI languages: Russian (`ru`) and English (`en`).
- Keep domain models and database schemas language‑agnostic (no hard‑coded language in table/field names).
- Make it possible to add new UI languages in the future with minimal code changes.

### UI Localization Approach

- Introduce a language setting at the app level (e.g. `uiLanguage` in a core profile or local state).
- Store UI strings in dedicated translation resources (e.g. JSON files or JS objects), for example:
  - `locales/ru.json`
  - `locales/en.json`
- Use stable translation keys (e.g. `fitness.header.title`, `lessons.button.start`) instead of hard‑coding text in components.
- When rendering UI, always resolve text via a simple i18n helper function (e.g. `t(key)`).

### Telegram and Environment

- Detect initial language from Telegram WebApp data when possible and fall back to a default language.
- Allow the user to change language explicitly inside the app (language switcher in settings).

### Non‑Goals (for now)

- No need for server‑side locale negotiation at this stage; client‑side switching is sufficient for the Mini App.
- Content such as lesson texts can be stored in a single primary language initially, with multi‑language content added later as a separate concern.
