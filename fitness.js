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
 * @property {string|null} amount
 * @property {number|null} calories
 * @property {number|null} protein
 * @property {number|null} fat
 * @property {number|null} carbs
 * @property {string} time
 * @property {'manual'|'auto'} source
...
 * @typedef {Object} SupplementEntry
 * @property {string} id
 * @property {string} name
 * @property {string} dose
 * @property {boolean} taken
 * @property {string} time

 * @typedef {Object} WaterData
 * @property {number} targetMl
 * @property {number} currentMl
 *
 * @typedef {Object} FitnessDayData
 * @property {ActivityEntry[]} activities
 * @property {FoodEntry[]} foods
 * @property {WaterData} [water]
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
 * @property {string} macrosText
 * @property {string} timeText
 * @property {'manual'|'auto'} source
 *
 * @typedef {Object} SupplementListItem
 * @property {string} id
 * @property {string} name
 * @property {string} dose
 * @property {boolean} taken
 * @property {string} timeText
 */

// ===================== SUPPLEMENTS TRACKING TYPES =====================

/** Single intake record
 * @typedef {Object} SupplementIntake
 * @property {string} id - unique ID
 * @property {string} time - "HH:MM"
 * @property {number} dose - actual dose taken
 * @property {boolean} checked - true if actually taken
 * @property {boolean} edited - true if dose differs from template/standard
 */

/** All intakes for one day
 * @typedef {Object} SupplementDayIntakes
 * @property {string} date - "YYYY-MM-DD"
 * @property {SupplementIntake[]} intakes
 */

/** Template for auto-generating intakes
 * @typedef {Object} SupplementTemplateIntake
 * @property {number} defaultDose - base dose for this intake (e.g. 40 mg)
 * @property {string} [time] - optional default time "HH:MM"
 */

/** Supplement definition in user's profile
 * @typedef {Object} Supplement
 * @property {string} id
 * @property {string} name - e.g. "Кленбутерол", "Креатин"
 * @property {'мг'|'г'|'табл'} unit
 * @property {boolean} daily - "every day" flag
 * @property {number} standardDailyDose - current daily norm (e.g. 80 mg)
 * @property {SupplementTemplateIntake[]} templateIntakes
 * @property {SupplementDayIntakes[]} history - actual history by date
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/** User's supplements profile
 * @typedef {Object} SupplementsProfile
 * @property {Supplement[]} supplements
 */

const FITNESS_PROFILE_KEY = 'leakfixer_fitness_profile';
const FITNESS_DATA_KEY = 'leakfixer_fitness_data';
const SUPPLEMENTS_PROFILE_KEY = 'leakfixer_supplements_profile';

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
  return { activities: [], foods: [], water: undefined, supplements: [], workDay: undefined };
}

/** Get water data for a day with defaults from profile
 * @param {string} dateKey
 * @returns {WaterData}
 */
function getWaterData(dateKey) {
  const dayData = getDayData(dateKey);
  const profile = getFitnessProfile();
  const baseline = profile.waterBaselineMl || 2000;
  
  if (dayData.water) {
    return dayData.water;
  }
  
  // Default: current = target = baseline
  return { targetMl: baseline, currentMl: baseline };
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
  if (patch.water !== undefined) day.water = patch.water;
  if (patch.supplements !== undefined) day.supplements = patch.supplements;
  if (patch.workDay !== undefined) day.workDay = patch.workDay;
  all[dateKey] = day;
  saveAllFitnessData(all);

  // синхронизация дня в Supabase
  if (window.FitnessSync && window.currentAppUserId) {
    window.FitnessSync.saveDay(dateKey, {
      water_ml: day.water?.currentMl || 0,
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

// ===================== SUPPLEMENTS STORAGE LAYER =====================

/** Get storage key for supplements profile
 * @returns {string} */
function getSupplementsStorageKey() {
  const id = window.currentAppUserId || 'anon';
  return `${SUPPLEMENTS_PROFILE_KEY}_${id}`;
}

/** Load supplements profile from localStorage
 * @returns {SupplementsProfile} */
function loadSupplementsProfile() {
  try {
    const raw = localStorage.getItem(getSupplementsStorageKey());
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('loadSupplementsProfile error:', e);
  }
  return { supplements: [] };
}
  
/** Save supplements profile to localStorage
 * @param {SupplementsProfile} profile */
function saveSupplementsProfile(profile) {
  localStorage.setItem(getSupplementsStorageKey(), JSON.stringify(profile));
}

// ===================== SUPPLEMENTS LOGIC =====================

/** Get all supplements from profile
 * @returns {Supplement[]} */
function getAllSupplements() {
  const profile = loadSupplementsProfile();
  return profile.supplements || [];
}

/** Find supplement by ID
 * @param {string} id
 * @returns {Supplement|undefined} */
function getSupplementById(id) {
  const supplements = getAllSupplements();
  return supplements.find(s => s.id === id);
}

/** Get or create history entry for a specific date
 * @param {Supplement} supplement
 * @param {string} dateKey - "YYYY-MM-DD"
 * @returns {SupplementDayIntakes} */
function getOrCreateDayIntakes(supplement, dateKey) {
  let dayIntakes = supplement.history?.find(h => h.date === dateKey);
  if (!dayIntakes) {
    dayIntakes = { date: dateKey, intakes: [] };
    supplement.history = supplement.history || [];
    supplement.history.push(dayIntakes);
  }
  return dayIntakes;
}
  
/** Generate planned intakes for today based on template
 * @param {Supplement} supplement
 * @param {string} dateKey - "YYYY-MM-DD"
 * @returns {SupplementIntake[]} */
function generatePlannedIntakes(supplement, dateKey) {
  const dayIntakes = getOrCreateDayIntakes(supplement, dateKey);
  
  // If already has intakes for this day, return existing (don't regenerate)
  if (dayIntakes.intakes.length > 0) {
    return dayIntakes.intakes;
  }
  
  // Generate from template
  const intakes = [];
  for (const template of supplement.templateIntakes) {
    intakes.push({
      id: generateId(),
      time: template.time || '',
      dose: template.defaultDose,
      checked: false,
      edited: false,
    });
  }
  dayIntakes.intakes = intakes;
  return intakes;
}

/** Get intakes for a specific date (with auto-generation if needed for today)
 * @param {string} supplementId
 * @param {string} dateKey - "YYYY-MM-DD"
 * @returns {SupplementIntake[]} */
function getSupplementIntakesForDay(supplementId, dateKey) {
  const supplement = getSupplementById(supplementId);
  if (!supplement) return [];
  
  // For daily supplements, generate plan if needed
  if (supplement.daily) {
    return generatePlannedIntakes(supplement, dateKey);
  }
  
  // For non-daily, just return history if exists
  const dayIntakes = supplement.history?.find(h => h.date === dateKey);
  return dayIntakes?.intakes || [];
}

/** Toggle intake checked status
 * @param {string} supplementId
 * @param {string} dateKey - "YYYY-MM-DD"
 * @param {string} intakeId
 * @returns {SupplementIntake|undefined} updated intake */
function toggleSupplementIntakeChecked(supplementId, dateKey, intakeId) {
  const profile = loadSupplementsProfile();
  const supplement = profile.supplements.find(s => s.id === supplementId);
  if (!supplement) return undefined;
  
  const dayIntakes = getOrCreateDayIntakes(supplement, dateKey);
  const intake = dayIntakes.intakes.find(i => i.id === intakeId);
  if (!intake) return undefined;
  
  // Toggle checked
  intake.checked = !intake.checked;
  
  // If checking and no time set, set current time
  if (intake.checked && !intake.time) {
    intake.time = formatTimeHM(new Date());
  }
  
  saveSupplementsProfile(profile);
  return intake;
}

/** Update intake dose/time
 * @param {string} supplementId
 * @param {string} dateKey - "YYYY-MM-DD"
 * @param {string} intakeId
 * @param {Partial<SupplementIntake>} updates - dose, time, checked
 * @returns {SupplementIntake|undefined} updated intake */
function updateSupplementIntake(supplementId, dateKey, intakeId, updates) {
  const profile = loadSupplementsProfile();
  const supplement = profile.supplements.find(s => s.id === supplementId);
  if (!supplement) return undefined;
  
  const dayIntakes = getOrCreateDayIntakes(supplement, dateKey);
  const intake = dayIntakes.intakes.find(i => i.id === intakeId);
  if (!intake) return undefined;
  
  // Apply updates
  if (updates.dose !== undefined) {
    intake.dose = updates.dose;
    // Mark as edited if dose differs from template default
    const templateIdx = dayIntakes.intakes.findIndex(i => i.id === intakeId);
    if (templateIdx >= 0 && supplement.templateIntakes[templateIdx]) {
      intake.edited = updates.dose !== supplement.templateIntakes[templateIdx].defaultDose;
    }
  }
  if (updates.time !== undefined) intake.time = updates.time;
  if (updates.checked !== undefined) intake.checked = updates.checked;
  
  saveSupplementsProfile(profile);
  return intake;
}

/** Add new intake for a specific date
 * @param {string} supplementId
 * @param {string} dateKey - "YYYY-MM-DD"
 * @param {number} dose
 * @param {string} time - "HH:MM"
 * @returns {SupplementIntake} created intake */
function addSupplementIntake(supplementId, dateKey, dose, time) {
  const profile = loadSupplementsProfile();
  const supplement = profile.supplements.find(s => s.id === supplementId);
  if (!supplement) throw new Error('Supplement not found');
  
  const dayIntakes = getOrCreateDayIntakes(supplement, dateKey);
  const newIntake = {
    id: generateId(),
    time,
    dose,
    checked: false,
    edited: true, // Custom intake is always "edited" from template
  };
  
  dayIntakes.intakes.push(newIntake);
  saveSupplementsProfile(profile);
  return newIntake;
}

/** Remove intake from a specific date
 * @param {string} supplementId
 * @param {string} dateKey - "YYYY-MM-DD"
 * @param {string} intakeId
 * @returns {boolean} success */
function removeSupplementIntake(supplementId, dateKey, intakeId) {
  const profile = loadSupplementsProfile();
  const supplement = profile.supplements.find(s => s.id === supplementId);
  if (!supplement) return false;
  
  const dayIntakes = supplement.history?.find(h => h.date === dateKey);
  if (!dayIntakes) return false;
  
  const idx = dayIntakes.intakes.findIndex(i => i.id === intakeId);
  if (idx < 0) return false;
  
  dayIntakes.intakes.splice(idx, 1);
  saveSupplementsProfile(profile);
  return true;
}

/** Add new supplement to profile
 * @param {Object} params
 * @param {string} params.name
 * @param {'мг'|'г'|'табл'} params.unit
 * @param {boolean} params.daily
 * @param {number} params.standardDailyDose
 * @param {SupplementTemplateIntake[]} params.templateIntakes
 * @returns {Supplement} created supplement */
function createSupplement({ name, unit, daily, standardDailyDose, templateIntakes }) {
  const profile = loadSupplementsProfile();
  const now = new Date().toISOString();
  
  const supplement = {
    id: generateId(),
    name,
    unit,
    daily,
    standardDailyDose,
    templateIntakes: templateIntakes || [],
    history: [],
    createdAt: now,
    updatedAt: now,
  };
  
  profile.supplements = profile.supplements || [];
  profile.supplements.push(supplement);
  saveSupplementsProfile(profile);
  return supplement;
}

/** Update supplement settings (not history)
 * @param {string} id
 * @param {Partial<Pick<Supplement, 'name' | 'unit' | 'daily' | 'standardDailyDose' | 'templateIntakes'>>} updates
 * @returns {Supplement|undefined} updated supplement */
function updateSupplement(id, updates) {
  const profile = loadSupplementsProfile();
  const supplement = profile.supplements.find(s => s.id === id);
  if (!supplement) return undefined;
  
  if (updates.name !== undefined) supplement.name = updates.name;
  if (updates.unit !== undefined) supplement.unit = updates.unit;
  if (updates.daily !== undefined) supplement.daily = updates.daily;
  if (updates.standardDailyDose !== undefined) supplement.standardDailyDose = updates.standardDailyDose;
  if (updates.templateIntakes !== undefined) supplement.templateIntakes = updates.templateIntakes;
  
  supplement.updatedAt = new Date().toISOString();
  saveSupplementsProfile(profile);
  return supplement;
}

/** Delete supplement from profile
 * @param {string} id
 * @returns {boolean} success */
function deleteSupplement(id) {
  const profile = loadSupplementsProfile();
  const idx = profile.supplements?.findIndex(s => s.id === id);
  if (idx < 0) return false;
  
  profile.supplements.splice(idx, 1);
  saveSupplementsProfile(profile);
  return true;
}

/** Get total dose for a day
 * @param {SupplementIntake[]} intakes
 * @returns {number} */
function getTotalDoseForDay(intakes) {
  return intakes.reduce((sum, i) => sum + (i.checked ? i.dose : 0), 0);
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
  return (foods || []).map((f) => {
    // Build macros text: "Б: X г, Ж: Y г, У: Z г"
    const macros = [];
    if (f.protein != null) macros.push(`Б: ${f.protein}г`);
    if (f.fat != null) macros.push(`Ж: ${f.fat}г`);
    if (f.carbs != null) macros.push(`У: ${f.carbs}г`);
    const macrosText = macros.length > 0 ? macros.join(', ') : '';
    
    return {
      id: f.id,
      name: f.name,
      amount: f.amount || '',
      caloriesText: f.calories != null ? `${f.calories} ккал` : '',
      macrosText,
      timeText: f.time || '',
      source: f.source || 'manual',
    };
  });
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

// ─── Pure: water tracking helpers ─────────────────────────────────────────

/** Clamp value between min and max
 * @param {number} x
 * @param {number} min
 * @param {number} max
 * @returns {number} */
function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

/** Get water status based on current vs target
 * @param {number} currentMl
 * @param {number} targetMl
 * @returns {'low'|'normal'|'high'} */
function getWaterStatus(currentMl, targetMl) {
  const ratio = currentMl / targetMl;
  if (ratio < 0.8) return 'low';
  if (ratio > 1.2) return 'high';
  return 'normal';
}

/** Get water status text in Russian
 * @param {'low'|'normal'|'high'} status
 * @returns {string} */
function getWaterStatusText(status) {
  if (status === 'low') return 'Воды меньше обычного.';
  if (status === 'high') return 'Воды больше обычного.';
  return 'Вода как обычно.';
}

/** Format water in liters with 1 decimal
 * @param {number} ml
 * @returns {string} e.g. "1.5" */
function formatWaterLiters(ml) {
  return ((ml || 0) / 1000).toFixed(1);
}

/** Adjust water for a day by delta ml
 * @param {string} dateKey
 * @param {number} deltaMl - positive or negative adjustment
 * @returns {WaterData} updated water data */
function adjustWater(dateKey, deltaMl) {
  const profile = getFitnessProfile();
  const baseline = profile.waterBaselineMl || 2000;
  
  let dayData;
  try {
    dayData = getDayData(dateKey);
  } catch {
    dayData = createEmptyDayData();
  }
  
  // Initialize water if not present
  if (!dayData.water) {
    dayData.water = { targetMl: baseline, currentMl: baseline };
  }
  
  // Calculate new current value with clamp
  const maxMl = Math.max(0, 3 * dayData.water.targetMl);
  const newCurrent = clamp(dayData.water.currentMl + deltaMl, 0, maxMl);
  
  const updatedWater = {
    targetMl: dayData.water.targetMl,
    currentMl: newCurrent,
  };
  
  updateDayData(dateKey, { water: updatedWater });
  return updatedWater;
}

/** Legacy function - converts old waterMl format to new water format
 * @deprecated Use getWaterData instead
 * @param {number} waterMl
 * @returns {string} */
function formatWaterLitersLegacy(waterMl) {
  return ((waterMl || 0) / 1000).toFixed(1);
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

/** @param {{ name?: string, amount?: string, calories?: string|number, protein?: string|number, fat?: string|number, carbs?: string|number, time?: string, source?: 'manual'|'auto' }} form
 *  @param {string} [editId]
 *  @returns {FoodEntry} */
function buildFoodEntry(form, editId) {
  const name = String(form.name || '').trim();
  const amount = form.amount != null && String(form.amount).trim() ? String(form.amount).trim() : null;
  const calories = form.calories !== '' && form.calories != null ? Number(form.calories) : null;
  const protein = form.protein !== '' && form.protein != null ? Number(form.protein) : null;
  const fat = form.fat !== '' && form.fat != null ? Number(form.fat) : null;
  const carbs = form.carbs !== '' && form.carbs != null ? Number(form.carbs) : null;
  const time = form.time && String(form.time).trim() ? String(form.time).trim() : formatTimeHM(new Date());
  const source = form.source || 'manual';
  return {
    id: editId || generateId(),
    name,
    amount,
    calories,
    protein,
    fat,
    carbs,
    time,
    source,
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

// ─── API Ninjas Nutrition integration ───────────────────────────────────

/** Call backend nutrition API
 * @param {string} inputText - food text like "гречка 200г вареная"
 * @returns {Promise<{kcal: number, b: number, zh: number, u: number}>}
 */
async function fetchNutritionForInput(inputText) {
  const res = await fetch(`/api/nutrition?query=${encodeURIComponent(inputText)}`);
  if (!res.ok) {
    throw new Error('Nutrition API error');
  }
  return res.json();
}

/** Handle food submission with API Ninjas nutrition lookup
 * @param {string} inputText - user input like "гречка 200г вареная"
 * @param {Date} [time] - optional time, defaults to now
 * @returns {Promise<{success: boolean, entry?: FoodEntry, error?: string}>}
 */
async function onFoodSubmit(inputText, time = new Date()) {
  try {
    // Get nutrition data from API
    const nutrition = await fetchNutritionForInput(inputText);

    // Build food entry with nutrition data
    const entry = {
      id: generateId(),
      name: inputText,
      amount: '',
      calories: nutrition.kcal,
      protein: nutrition.b,
      fat: nutrition.zh,
      carbs: nutrition.u,
      time: formatTimeHM(time),
    };

    // Get current day data and add entry
    const dateKey = formatDateKey(time);
    const dayData = getDayData(dateKey);
    const updatedFoods = mergeFood(dayData.foods || [], entry);
    updateDayData(dateKey, { foods: updatedFoods });

    return { success: true, entry };
  } catch (err) {
    console.error('onFoodSubmit error:', err);
    return { success: false, error: err.message || 'Failed to get nutrition data' };
  }
}

window.FitnessState = {
  getFitnessProfile,
  setFitnessProfile,
  getAllFitnessData,
  getDayData,
  getWaterData,
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
  // UPDATED: water helpers
  adjustWater,
  getWaterStatus,
  getWaterStatusText,
  clamp,
  parseProfileFromValues,
  buildActivityEntry,
  buildFoodEntry,
  buildSupplementEntry,
  BALANCE_GREEN_MAX,
  BALANCE_RED_THRESHOLD,
  getWorkActivityMultiplier,
  // NEW: API Ninjas integration
  fetchNutritionForInput,
  onFoodSubmit,
  // NEW: Supplements tracking
  loadSupplementsProfile,
  saveSupplementsProfile,
  getAllSupplements,
  getSupplementById,
  getSupplementIntakesForDay,
  toggleSupplementIntakeChecked,
  updateSupplementIntake,
  addSupplementIntake,
  removeSupplementIntake,
  createSupplement,
  updateSupplement,
  deleteSupplement,
  getTotalDoseForDay,
};
