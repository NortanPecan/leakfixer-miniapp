/**
 * Fitness tab: state, pure logic, and persistence.
 * Architecture: this file = state + logic (React-ready); app.js = DOM glue; index.html = markup.
 *
 * React migration: copy JSDoc types to types/fitness.ts; use getCaloriesSummary, *ListViewModel,
 * merge*, remove*ById, build*Entry as pure helpers; replace getDayData/updateDayData with
 * React state or API calls.
 *
 * @typedef {Object} ProfileFitnessSettings
 * @property {number} [weight] - kg
 * @property {number} [height] - cm
 * @property {number} [age] - years
 * @property {number} [targetWeight] - kg
 * @property {'sedentary'|'mixed'|'physical'|'variable'} [workProfile]
 *
 * @typedef {'gym'|'cardio'|'steps'} ActivityKind
 * @typedef {'low'|'medium'|'high'} GymIntensity
 * @typedef {'run'|'walk'|'bike'|'other'} CardioType
 *
 * @typedef {Object} GymEntry
 * @property {string} id
 * @property {'gym'} kind
 * @property {number} durationMinutes
 * @property {GymIntensity} intensity
 *
 * @typedef {Object} CardioEntry
 * @property {string} id
 * @property {'cardio'} kind
 * @property {number} durationMinutes
 * @property {CardioType} type
 *
 * @typedef {Object} StepsEntry
 * @property {string} id
 * @property {'steps'} kind
 * @property {number} steps
 *
 * @typedef {GymEntry|CardioEntry|StepsEntry} ActivityEntry
 *
 * @typedef {Object} FoodEntry
 * @property {string} id
 * @property {string} name
 * @property {string} amount
 * @property {number} [calories]
 * @property {string} time
...
 * @typedef {Object} SupplementEntry
 * @property {string} id
 * @property {string} name
 * @property {string} dose
 * @property {boolean} taken
 * @property {string} time

 *
 * @typedef {Object} FitnessDayData
 * @property {ActivityEntry[]} activities
 * @property {FoodEntry[]} foods
 * @property {number} waterMl
 * @property {SupplementEntry[]} supplements
 * @property {'low'|'normal'|'high'|undefined} [workDay]
 *
 * @typedef {Object} CaloriesSummary
 * @property {number} eaten
 * @property {number} burned
 * @property {number} balance
 * @property {'green'|'red'|'white'} balanceColor
 *
 * @typedef {Object} ActivityListItem
 * @property {string} id
 * @property {string} label
 *
 * @typedef {Object} FoodListItem
 * @property {string} id
 * @property {string} name
 * @property {string} amount
 * @property {string} caloriesText
 * @property {string} timeText
 *
 * @typedef {Object} SupplementListItem
 * @property {string} id
 * @property {string} name
 * @property {string} dose
 * @property {boolean} taken
 * @property {string} timeText
 */

const FITNESS_PROFILE_KEY = 'leakfixer_fitness_profile';
const FITNESS_DATA_KEY = 'leakfixer_fitness_data';

const BALANCE_GREEN_MAX = 300;
const BALANCE_RED_THRESHOLD = 500;


// ─── Persistence (Supabase + localStorage cache) ─────────────────────────

function getProfileStorageKey() {
  const id = window.currentAppUserId || 'anon';
  return `${FITNESS_PROFILE_KEY}_${id}`;
}

function getDataStorageKey() {
  const id = window.currentAppUserId || 'anon';
  return `${FITNESS_DATA_KEY}_${id}`;
}

/** @returns {ProfileFitnessSettings} */
function getFitnessProfile() {
  try {
    const raw = localStorage.getItem(getProfileStorageKey());
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** @param {ProfileFitnessSettings} profile */
function setFitnessProfile(profile) {
  localStorage.setItem(getProfileStorageKey(), JSON.stringify(profile));
  if (window.FitnessSync && window.currentAppUserId) {
    window.FitnessSync.saveProfile(profile).catch(() => {});
  }
}

/** @returns {Record<string, FitnessDayData>} */
function getAllFitnessData() {
  try {
    const raw = localStorage.getItem(getDataStorageKey());
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** @param {Record<string, FitnessDayData>} data */
function saveAllFitnessData(data) {
  localStorage.setItem(getDataStorageKey(), JSON.stringify(data));
}

/** @returns {FitnessDayData} */
function createEmptyDayData() {
  return { activities: [], foods: [], waterMl: 0, supplements: [], workDay: undefined };
}

/** @param {string} dateKey YYYY-MM-DD
 *  @returns {FitnessDayData} */
function getDayData(dateKey) {
  const all = getAllFitnessData();
  if (!all[dateKey]) {
    all[dateKey] = createEmptyDayData();
  }
  return all[dateKey];
}

/** @param {string} dateKey
 *  @param {Partial<FitnessDayData>} patch */
function updateDayData(dateKey, patch) {
  const all = getAllFitnessData();
  const day = getDayData(dateKey);
  if (patch.activities !== undefined) day.activities = patch.activities;
  if (patch.foods !== undefined) day.foods = patch.foods;
  if (patch.waterMl !== undefined) day.waterMl = patch.waterMl;
  if (patch.supplements !== undefined) day.supplements = patch.supplements;
  if (patch.workDay !== undefined) day.workDay = patch.workDay;
  all[dateKey] = day;
  saveAllFitnessData(all);

  // синхронизация дня в Supabase
  if (window.FitnessSync && window.currentAppUserId) {
    window.FitnessSync.saveDay(dateKey, {
      water_ml: day.waterMl || 0,
      work_day: day.workDay || 'normal',
      data: {
        activities: day.activities || [],
        foods: day.foods || [],
        supplements: day.supplements || [],
      },
    }).catch(() => {});
  }
}

/** @returns {string} */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ─── Pure: date helpers ───────────────────────────────────────────────────

/** @param {Date} date
 *  @returns {string} YYYY-MM-DD */
function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** @param {string} dateKey
 *  @returns {Date} */
function parseDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** @param {Date} date
 *  @returns {string} localized */
function formatDateLocal(date) {
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTimeHM(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// ─── Pure: calorie calculations (replace with real formulas later) ───────────

/**
 * BMR placeholder. Replace with Mifflin-St Jeor / Harris-Benedict when needed.
 * @param {ProfileFitnessSettings} profile
 * @returns {number}
 */
function calculateBaseMetabolism(profile) {
  if (profile.weight && profile.height && profile.age) {
    return Math.round(10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5);
  }
  return 1800;
}

/**
 * Activity calories placeholder. Replace with MET-based calc later.
 * @param {ActivityEntry[]} activities
 * @returns {number}
 */
function calculateActivityCalories(activities) {
  const GYM_FACTOR = 8;
  const CARDIO_FACTOR = 10;
  const STEPS_FACTOR = 0.04;
  let total = 0;
  for (const a of activities) {
    if (a.kind === 'gym') total += (a.durationMinutes || 0) * GYM_FACTOR;
    if (a.kind === 'cardio') total += (a.durationMinutes || 0) * CARDIO_FACTOR;
    if (a.kind === 'steps') total += (a.steps || 0) * STEPS_FACTOR;
  }
  return Math.round(total);
}

/** @param {number} balance
 *  @returns {'green'|'red'|'white'} */
function getBalanceColor(balance) {
  if (balance >= -BALANCE_GREEN_MAX && balance <= BALANCE_GREEN_MAX) return 'green';
  if (balance > BALANCE_RED_THRESHOLD) return 'red';
  return 'white';
}

/**
 * Single source for daily calories summary. Use in React: useMemo(() => getCaloriesSummary(profile, dayData), [profile, dayData]).
 * @param {ProfileFitnessSettings} profile
 * @param {FitnessDayData} dayData
 * @returns {CaloriesSummary}
 */
function getCaloriesSummary(profile, dayData) {
  const eaten = (dayData.foods || []).reduce((s, f) => s + (f.calories || 0), 0);
  const baseRest = calculateBaseMetabolism(profile); // чистый BMR
  const activityCal = calculateActivityCalories(dayData.activities || []);

  const workMultiplier = getWorkActivityMultiplier(profile, dayData);
  const baseWithWork = Math.round(baseRest * workMultiplier);

  const burned = baseWithWork + activityCal;
  const balance = eaten - burned;
  return {
    eaten,
    burned,
    balance,
    balanceColor: getBalanceColor(balance),
  };
}

/**
 * @param {ProfileFitnessSettings} profile
 * @param {FitnessDayData} dayData
 * @returns {number} multiplier
 */
function getWorkActivityMultiplier(profile, dayData) {
  let base = 1.2; // по умолчанию сидячий
  if (profile.workProfile === 'mixed') base = 1.4;
  if (profile.workProfile === 'physical') base = 1.6;
  if (profile.workProfile === 'variable' || !profile.workProfile) base = 1.3;

  // дневная поправка
  if (dayData.workDay === 'low') base -= 0.1;
  if (dayData.workDay === 'high') base += 0.1;

  if (base < 1.1) base = 1.1;
  if (base > 1.8) base = 1.8;
  return base;
}


// ─── Pure: list view models (for rendering; React can map over these) ───────

/** @param {ActivityEntry} a
 *  @returns {string} */
function getActivityLabel(a) {
  if (a.kind === 'gym') return `Спортзал ${a.durationMinutes} мин (${a.intensity || '-'})`;
  if (a.kind === 'cardio') return `Аэробная ${a.durationMinutes} мин (${a.type || '-'})`;
  if (a.kind === 'steps') return `Шаги: ${a.steps}`;
  return '';
}

/** @param {ActivityEntry[]} activities
 *  @returns {ActivityListItem[]} */
function getActivityListViewModel(activities) {
  return (activities || []).map((a) => ({ id: a.id, label: getActivityLabel(a) }));
}

/** @param {FoodEntry[]} foods
 *  @returns {FoodListItem[]} */
function getFoodListViewModel(foods) {
  return (foods || []).map((f) => ({
    id: f.id,
    name: f.name,
    amount: f.amount,
    caloriesText: f.calories != null ? `${f.calories} ккал` : '',
    timeText: f.time || '',
  }));
}


/** @param {SupplementEntry[]} supplements
 *  @returns {SupplementListItem[]} */
function getSupplementListViewModel(supplements) {
  return (supplements || []).map((s) => ({
    id: s.id,
    name: s.name,
    dose: s.dose,
    taken: s.taken,
    timeText: s.time || '',
  }));
}


/** @param {number} waterMl
 *  @returns {string} e.g. "1.5" */
function formatWaterLiters(waterMl) {
  return ((waterMl || 0) / 1000).toFixed(1);
}

// ─── Pure: merge/remove (return new arrays for React immutability) ─────────

/** @param {ActivityEntry[]} activities
 *  @param {ActivityEntry} entry
 *  @param {string} [editId]
 *  @returns {ActivityEntry[]} */
function mergeActivity(activities, entry, editId) {
  const list = [...(activities || [])];
  const idx = editId ? list.findIndex((a) => a.id === editId) : -1;
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  return list;
}

/** @param {FoodEntry[]} foods
 *  @param {FoodEntry} entry
 *  @param {string} [editId]
 *  @returns {FoodEntry[]} */
function mergeFood(foods, entry, editId) {
  const list = [...(foods || [])];
  const idx = editId ? list.findIndex((f) => f.id === editId) : -1;
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  return list;
}

/** @param {SupplementEntry[]} supplements
 *  @param {SupplementEntry} entry
 *  @param {string} [editId]
 *  @returns {SupplementEntry[]} */
function mergeSupplement(supplements, entry, editId) {
  const list = [...(supplements || [])];
  const idx = editId ? list.findIndex((s) => s.id === editId) : -1;
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  return list;
}

/** @param {ActivityEntry[]} activities
 *  @param {string} id
 *  @returns {ActivityEntry[]} */
function removeActivityById(activities, id) {
  return (activities || []).filter((a) => a.id !== id);
}

/** @param {FoodEntry[]} foods
 *  @param {string} id
 *  @returns {FoodEntry[]} */
function removeFoodById(foods, id) {
  return (foods || []).filter((f) => f.id !== id);
}

/** @param {SupplementEntry[]} supplements
 *  @param {string} id
 *  @returns {SupplementEntry[]} */
function removeSupplementById(supplements, id) {
  return (supplements || []).filter((s) => s.id !== id);
}

/** @param {number} currentMl
 *  @param {number} addMl
 *  @returns {number} */
function addWaterToDay(currentMl, addMl) {
  return (currentMl || 0) + addMl;
}

// ─── Pure: parse form values → domain objects (React: pass form state here) ──

/** @param {{ weight?: string|number, height?: string|number, age?: string|number, targetWeight?: string|number, workProfile?: string }} values
 *  @returns {ProfileFitnessSettings} */
function parseProfileFromValues(values) {
  const profile = {};
  if (values.weight != null && values.weight !== '') profile.weight = Number(values.weight);
  if (values.height != null && values.height !== '') profile.height = Number(values.height);
  if (values.age != null && values.age !== '') profile.age = Number(values.age);
  if (values.targetWeight != null && values.targetWeight !== '') profile.targetWeight = Number(values.targetWeight);

  const allowedWork = ['sedentary', 'mixed', 'physical', 'variable'];
  if (values.workProfile && allowedWork.includes(values.workProfile)) {
    profile.workProfile = /** @type {'sedentary'|'mixed'|'physical'|'variable'} */ (values.workProfile);
  }

  return profile;
}

/**
 * Build activity entry from form values. React: pass form state object.
 * @param {ActivityKind} kind
 * @param {Object} form - { durationMinutes?, intensity?, type?, steps? }
 * @param {string} [editId]
 * @returns {ActivityEntry}
 */
function buildActivityEntry(kind, form, editId) {
  const id = editId || generateId();
  if (kind === 'gym') {
    const intensity = ['low', 'medium', 'high'].includes(form.intensity) ? form.intensity : 'medium';
    return {
      id,
      kind: 'gym',
      durationMinutes: Number(form.durationMinutes) || 0,
      intensity,
    };
  }
  if (kind === 'cardio') {
    const type = ['run', 'walk', 'bike', 'other'].includes(form.type) ? form.type : 'other';
    return {
      id,
      kind: 'cardio',
      durationMinutes: Number(form.durationMinutes) || 0,
      type,
    };
  }
  return {
    id,
    kind: 'steps',
    steps: Number(form.steps) || 0,
  };
}

/** @param {{ name?: string, amount?: string, calories?: string|number }} form
 *  @param {string} [editId]
 *  @returns {FoodEntry} */
function buildFoodEntry(form, editId) {
  const name = String(form.name || '').trim();
  const amount = String(form.amount || '').trim();
  const calories = form.calories !== '' && form.calories != null ? Number(form.calories) : undefined;
  const time = form.time && String(form.time).trim() ? String(form.time).trim() : formatTimeHM(new Date());
  return {
    id: editId || generateId(),
    name,
    amount,
    calories,
    time,
  };
}


/** @param {{ name?: string, dose?: string, taken?: boolean }} form
 *  @param {string} [editId]
 *  @returns {SupplementEntry} */
function buildSupplementEntry(form, editId) {
  const time = form.time && String(form.time).trim() ? String(form.time).trim() : formatTimeHM(new Date());
  return {
    id: editId || generateId(),
    name: String(form.name || '').trim(),
    dose: String(form.dose || '').trim(),
    taken: !!form.taken,
    time,
  };
}


// ─── Public API ───────────────────────────────────────────────────────────

window.FitnessState = {
  getFitnessProfile,
  setFitnessProfile,
  getAllFitnessData,
  getDayData,
  createEmptyDayData,
  updateDayData,
  generateId,
  formatDateKey,
  parseDateKey,
  formatDateLocal,
  formatTimeHM,
  calculateBaseMetabolism,
  calculateActivityCalories,
  getBalanceColor,
  getCaloriesSummary,
  getActivityLabel,
  getActivityListViewModel,
  getFoodListViewModel,
  getSupplementListViewModel,
  formatWaterLiters,
  mergeActivity,
  mergeFood,
  mergeSupplement,
  removeActivityById,
  removeFoodById,
  removeSupplementById,
  addWaterToDay,
  parseProfileFromValues,
  buildActivityEntry,
  buildFoodEntry,
  buildSupplementEntry,
  BALANCE_GREEN_MAX,
  BALANCE_RED_THRESHOLD,
  getWorkActivityMultiplier,
};
