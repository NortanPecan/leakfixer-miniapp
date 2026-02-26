## Module Role in the Platform

The fitness module is the current production vertical of LeakFixer and acts as a reference template for future domains. Its mission is to convert daily user actions (training, nutrition, water, supplements, weight, subjective condition) into measurable progress and connect that progress to the global leak model.

## Fitness Module Goals

- Provide a single daily health and fitness tracker flow.
- Reduce manual input using guided scenarios (quick activities, auto nutrition, supplement templates).
- Produce objective progress signals (calorie balance, weight trend, adherence, mood).
- Prepare data structures for future social and coaching layers.

## Core Entities

### Profile and Baseline Metrics

- `ProfileFitnessSettings`: weight, height, age, target weight, `workProfile`, body measurements, water baseline.
- `measurements` (Supabase): event records (`weight`, `height`, `work_profile`, `mood`, etc.).
- `user_profile` (Supabase): current aggregated profile values.

### Daily Fitness State

- `FitnessDayData`: `activities[]`, `foods[]`, `water`, `workDay`, optional supplements.
- `fitness_daily` (Supabase): daily fitness snapshot.
- `daily_state.data.fitness`: fitness aggregate in the shared daily state.

### Workouts

- `ActivityEntry` as the generic activity type.
- `GymEntry` with optional links to gym period/cycle/day.
- `CardioEntry` with indoor/outdoor mode, cardio type, distance.
- `HomeExerciseEntry`.
- `StepsEntry`.
- `DailyActivityEntry`.
- Gym runtime/state: periods, cycles, days, muscle groups, completed workouts, progress.

### Nutrition

- `FoodEntry` with `manual` and `auto` sources.
- `/api/nutrition` as CalorieNinjas proxy plus Russian query normalization.

### Supplements

- `Supplement`: profile, unit, daily flag, interval, target daily dose, intake template.
- `SupplementIntake`: actual intake event (time, dose, checked/edited flags).
- Per-day history and auto-generated planned intakes for active intervals.

## Key Flows

### User Flows (Implemented)

- Complete fitness onboarding or skip it.
- Track day-by-day data: add/edit/delete activities and foods.
- Choose manual or auto nutrition mode (text-based macro/calorie estimation).
- Track and adjust hydration (current level and baseline/target).
- Manage supplements: create profile, mark intakes, edit doses, review history.
- Manage strength cycles in the gym module (periods, days, exercises, completion).
- Log weight and review trend chart/history.
- Update mood and persist it into shared daily state.

### Coach/Trainer Flows (Planned)

- Review trainee fitness feed and summary (load, nutrition, adherence).
- Assign training periods and cycle adjustments.
- Monitor supplement adherence and trend deviations.
- Provide recommendations based on daily outliers.

These coach flows are not implemented yet as a dedicated interface; current data structures are prepared for this layer.

## Connection to Leak System and Global Progress

- The module closes health-related leaks through measurable daily signals.
- Signal: energy balance.
- Signal: workout completion and load.
- Signal: hydration.
- Signal: nutrition quality and intake.
- Signal: supplement adherence.
- Signal: weight trend.
- Signal: mood/resource dynamics.
- Fitness aggregates are already written into `daily_state`, which enables cross-domain progress composition.
- A unified scoring/leak model is still needed in `core` to normalize fitness signals into shared day/week/cycle scores.

## Technical Boundaries Today

- Main domain logic is centralized in `fitness.js` (pure helpers + local state).
- `app.js` is responsible for UI glue and screen orchestration.
- Supabase sync is partial and asynchronous via `fitness-sync.js`.
- Part of the state remains local (localStorage), acceptable for MVP but should be consolidated server-side over time.
