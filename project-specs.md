## Project Purpose

LeakFixer Mini App is the Telegram Mini App frontend for a broader self-development platform. The target product model is a social network where users identify and close life “leaks” (gaps/deficits) across multiple domains, track progress, and interact with others (buddies, coaches, program authors).

## Repository Scope

This repository currently contains the Mini App client and Vercel server endpoints. Actual code coverage includes:

- daily lesson loop (lesson consumption and completion logging),
- user profile and basic progress UI,
- a mature fitness module as the main vertical,
- integrations with Supabase and Telegram WebApp.

## Product Roles

- User: primary current actor; all implemented workflows are user-centric.
- Buddy (goal partner): represented in concept/UI, but not fully implemented.
- Coach/trainer: planned role; no dedicated interface or permissions yet.
- Course/program author: planned role; current code only supports lesson consumption from `lessons`.

## Domains and Entities

### Core Domain (Implemented)

- `app_users`: canonical app user mapped to Telegram ID.
- `users` (legacy): progress profile for the 30-day loop (`day`, `streak`, `points`).
- `lessons`: day content (`title`, `description`, `video_url`).
- `daily_logs`: day completion facts.
- `habits`, `habit_logs`: profile-level habit reading and progress preview.
- Telegram identity and profile photo flow (`initDataUnsafe`, `/api/telegram-avatar`).

### Fitness Domain (Implemented, Main Module)

- Fitness profile: weight, height, age, target weight, work profile, body measurements.
- Daily data: activities, nutrition, water, daily work intensity.
- Activities: gym/strength, cardio (indoor/outdoor), home exercises, steps, daily activity.
- Nutrition: manual input and auto macro/calorie estimation through `/api/nutrition`.
- Supplements: profile, intake intervals, templates, actual intake history.
- Weight and measurements: logs in `measurements`, chart/history/edit/delete flows.
- Gym periodization: periods, cycles, days, muscle groups, progress state.
- Mood/resource: widget plus persistence to `daily_state` and `measurements`.

### Social/Coaching/Courses Domains (Planned)

- Buddy relationships and shared goals.
- Coach workspace for assignment and feedback.
- Program/course authoring and user distribution.
- Unified cross-domain leak model (finance, relationships, skills, etc.).

## Modular Structure

### Current Layout

- `index.html`, `main.css`, `fitness.css`: screens and visual shell.
- `app.js`: orchestration layer (init, navigation, DOM glue, screen flows).
- `fitness.js`: fitness domain logic (state helpers, view-models, pure helpers).
- `fitness-sync.js`: sync adapter for fitness data and measurements.
- `activity-calories.js`: calorie references/calculation helpers.
- `api/telegram-avatar.js`, `api/nutrition.js`: Vercel server functions.

### Target Modularity (Planned)

- `core`: identity, profiles, shared daily state, cross-domain leak/progress scoring.
- `fitness`: current mature reference module.
- `habits`, `social`, `coaching`, `courses`: separate domain modules with own contracts.

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
- Global progress (`streak`, `points`): visible and used, but no isolated domain policy layer.

### Planned Next

- Full social mechanics (buddies, shared goals, accountability).
- Multi-domain leak coverage beyond fitness.
- Coach and author roles with dedicated interfaces and permissions.
- Stronger module boundaries and core contracts for scaling.

## Current Constraints

- Supabase public keys are used in the client (MVP tradeoff; needs stronger security and RLS hardening).
- Significant fitness state is stored in localStorage with async synchronization.
- Legacy and new user entities (`users` vs `app_users`) coexist and should be unified.
