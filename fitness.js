/**
 * Fitness tab: state, pure logic, and persistence.
 * Architecture: this file = state + logic (React-ready); app.js = DOM glue; index.html = markup.
 *
 * React migration: copy JSDoc types to types/fitness.ts; use getCaloriesSummary, *ListViewModel,
 * merge*, remove*ById, build*Entry as pure helpers; replace getDayData/updateDayData with
 * React state or API calls.
 *
 * @typedef {Object} BodyMeasurements
 * @property {number} [waist] - С‚Р°Р»РёСЏ (СЃРј)
 * @property {number} [hips] - Р±С‘РґСЂР° (СЃРј)
 * @property {number} [chest] - РіСЂСѓРґСЊ (СЃРј)
 * @property {number} [bicep] - Р±РёС†РµРїСЃ (СЃРј)
 * @property {number} [thigh] - Р±РµРґСЂРѕ (СЃРј)
 *
 * @typedef {Object} ProfileFitnessSettings
 * @property {number} [weight] - kg
 * @property {number} [height] - cm
 * @property {number} [age] - years
 * @property {number} [targetWeight] - kg
 * @property {'sedentary'|'mixed'|'physical'|'variable'} [workProfile]
 * @property {BodyMeasurements} [measurements] - Р·Р°РјРµСЂС‹ С‚РµР»Р°
 *
 * @typedef {'gym'|'strength'|'cardio'|'cardio_indoor'|'cardio_outdoor'|'home'|'home_exercise'|'steps'|'daily'} ActivityKind
 * @typedef {'light'|'medium'|'high'} GymIntensity
 * @typedef {'run'|'walk'|'bike'|'other'} CardioType
 *
 * @typedef {Object} GymEntry
 * @property {string} id
 * @property {'gym'|'strength'} kind
 * @property {number} durationMinutes
 * @property {GymIntensity} [intensity]
 * @property {Object} [gymData] - linked GYM workout data
 * @property {string} [gymData.periodId]
 * @property {number} [gymData.cycleIndex]
 * @property {number} [gymData.dayIndex]
 * @property {number} [calories] - pre-calculated calories
 *
 * @typedef {Object} CardioEntry
 * @property {string} id
 * @property {'cardio'|'cardio_indoor'|'cardio_outdoor'} kind
 * @property {number} durationMinutes
 * @property {string} [cardioType] - MET key from ActivityCalories
 * @property {number} [distanceKm]
 * @property {number} [calories] - pre-calculated calories
 *
 * @typedef {Object} HomeExerciseEntry
 * @property {string} id
 * @property {'home'|'home_exercise'} kind
 * @property {string} exerciseType - MET key from ActivityCalories
 * @property {number} [durationMinutes] - for time-based exercises
 * @property {number} [repetitions] - for rep-based exercises
 * @property {number} [calories] - pre-calculated calories
 *
 * @typedef {Object} StepsEntry
 * @property {string} id
 * @property {'steps'} kind
 * @property {number} steps
 * @property {number} [calories] - pre-calculated calories
 *
 * @typedef {Object} DailyActivityEntry
 * @property {string} id
 * @property {'daily'} kind
 * @property {string} activityType
 * @property {number} durationMinutes
 * @property {number} [calories]
 *
 * @typedef {GymEntry|CardioEntry|HomeExerciseEntry|StepsEntry|DailyActivityEntry} ActivityEntry
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
 * @typedef {Object} WaterData
 * @property {number} targetMl
 * @property {number} currentMl
 *
 * @typedef {Object} FitnessDayData
 * @property {ActivityEntry[]} activities
 * @property {FoodEntry[]} foods
 * @property {WaterData} [water]
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
 * @property {string} name - e.g. "РљР»РµРЅР±СѓС‚РµСЂРѕР»", "РљСЂРµР°С‚РёРЅ"
 * @property {'РјРі'|'Рі'|'С‚Р°Р±Р»'} unit
 * @property {boolean} daily - "every day" flag
 * @property {string|null} dailyStartDate - "YYYY-MM-DD" when daily generation starts, null if not set
 * @property {string|null} dailyEndDate - "YYYY-MM-DD" when daily generation ends (inclusive), null for infinite
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


// в”Ђв”Ђв”Ђ Persistence (Supabase + localStorage cache) в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

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
  return { activities: [], foods: [], water: undefined, workDay: undefined, supplements: [] };
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
  const day = all[dateKey] || {};
  return {
    activities: Array.isArray(day.activities) ? day.activities : [],
    foods: Array.isArray(day.foods) ? day.foods : [],
    water: day.water && typeof day.water === 'object' ? day.water : undefined,
    workDay: day.workDay,
    supplements: Array.isArray(day.supplements) ? day.supplements : [],
  };
}

/** @param {string} dateKey
 *  @param {Partial<FitnessDayData>} patch */
function updateDayData(dateKey, patch) {
  const all = getAllFitnessData();
  const current = all[dateKey] || createEmptyDayData();
  const day = {
    activities: patch.activities !== undefined ? patch.activities : (Array.isArray(current.activities) ? current.activities : []),
    foods: patch.foods !== undefined ? patch.foods : (Array.isArray(current.foods) ? current.foods : []),
    water: patch.water !== undefined ? patch.water : (current.water && typeof current.water === 'object' ? current.water : undefined),
    supplements: patch.supplements !== undefined ? patch.supplements : (Array.isArray(current.supplements) ? current.supplements : []),
    workDay: patch.workDay !== undefined ? patch.workDay : current.workDay,
  };
  all[dateKey] = day;
  saveAllFitnessData(all);

  // СЃРёРЅС…СЂРѕРЅРёР·Р°С†РёСЏ РґРЅСЏ РІ Supabase
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

function loadSupplementsProfile() {
  try {
    const raw = localStorage.getItem(getSupplementsStorageKey());
    const parsed = raw ? JSON.parse(raw) : {};
    const supplements = Array.isArray(parsed?.supplements) ? parsed.supplements : [];
    return { supplements: supplements.map(normalizeSupplementDefinition) };
  } catch (e) {
    console.error('loadSupplementsProfile error:', e);
    return { supplements: [] };
  }
}
  
function saveSupplementsProfile(profile) {
  localStorage.setItem(getSupplementsStorageKey(), JSON.stringify(profile || { supplements: [] }));
}

function normalizeSupplementDefinition(supplement) {
  const nowIso = new Date().toISOString();
  const templateIntakes = Array.isArray(supplement?.templateIntakes) ? supplement.templateIntakes : [];
  const normalizedTemplates = templateIntakes.length > 0
    ? templateIntakes.map((template) => ({
      defaultDose: Number(template?.defaultDose) > 0 ? Number(template.defaultDose) : 1,
      time: typeof template?.time === 'string' ? template.time : '',
    }))
    : [{ defaultDose: Number(supplement?.standardDailyDose) > 0 ? Number(supplement.standardDailyDose) : 1, time: '' }];
  const history = Array.isArray(supplement?.history) ? supplement.history : [];
  return {
    id: supplement?.id || generateId(),
    name: typeof supplement?.name === 'string' ? supplement.name : '',
    unit: supplement?.unit || 'mg',
    daily: Boolean(supplement?.daily),
    dailyStartDate: supplement?.dailyStartDate || null,
    dailyEndDate: supplement?.dailyEndDate || null,
    standardDailyDose: Number(supplement?.standardDailyDose) > 0 ? Number(supplement.standardDailyDose) : normalizedTemplates[0].defaultDose,
    templateIntakes: normalizedTemplates,
    history: history.map((day) => ({
      date: day?.date,
      intakes: Array.isArray(day?.intakes) ? day.intakes.map(normalizeSupplementIntakeEvent) : [],
    })).filter((day) => typeof day.date === 'string'),
    createdAt: supplement?.createdAt || nowIso,
    updatedAt: supplement?.updatedAt || nowIso,
  };
}

function normalizeSupplementIntakeEvent(intake) {
  return {
    id: intake?.id || generateId(),
    plannedId: typeof intake?.plannedId === 'string' ? intake.plannedId : null,
    time: typeof intake?.time === 'string' ? intake.time : '',
    dose: Number(intake?.dose) > 0 ? Number(intake.dose) : 1,
    checked: Boolean(intake?.checked),
    edited: Boolean(intake?.edited),
  };
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
  return getAllSupplements().find((supplement) => supplement.id === id);
}

/** Get or create history entry for a specific date
 * @param {Supplement} supplement
 * @param {string} dateKey - "YYYY-MM-DD"
 * @returns {SupplementDayIntakes} */
function getOrCreateDayIntakes(supplement, dateKey) {
  let dayIntakes = supplement.history?.find((h) => h.date === dateKey);
  if (!dayIntakes) {
    dayIntakes = { date: dateKey, intakes: [] };
    supplement.history = supplement.history || [];
    supplement.history.push(dayIntakes);
  }
  if (!Array.isArray(dayIntakes.intakes)) dayIntakes.intakes = [];
  return dayIntakes;
}

function getDayIntakes(supplement, dateKey) {
  const day = supplement.history?.find((h) => h.date === dateKey);
  return day && Array.isArray(day.intakes) ? day.intakes.map(normalizeSupplementIntakeEvent) : [];
}

function getCreatedDateKey(supplement) {
  return supplement.createdAt ? formatDateKey(new Date(supplement.createdAt)) : null;
}

function buildPlannedIntakeId(supplementId, dateKey, templateIndex) {
  return `plan_${supplementId}_${dateKey}_${templateIndex}`;
}

function isDateInDailyInterval(supplement, dateKey) {
  if (!supplement.daily) return false;
  if (!supplement.dailyStartDate) return false;
  if (dateKey < supplement.dailyStartDate) return false;
  if (supplement.dailyEndDate && dateKey > supplement.dailyEndDate) return false;
  return true;
}

function buildPlannedIntakesForDate(supplement, dateKey) {
  const templates = Array.isArray(supplement.templateIntakes) ? supplement.templateIntakes : [];
  if (templates.length === 0) return [];
  if (!supplement.daily || !isDateInDailyInterval(supplement, dateKey)) return [];
  return templates.map((template, index) => ({
    id: buildPlannedIntakeId(supplement.id, dateKey, index),
    plannedId: buildPlannedIntakeId(supplement.id, dateKey, index),
    time: template.time || '',
    dose: Number(template.defaultDose) > 0 ? Number(template.defaultDose) : 1,
    checked: false,
    edited: false,
    planned: true,
    templateIndex: index,
  }));
}

function sortSupplementIntakes(intakes) {
  return [...intakes].sort((a, b) => {
    const timeA = a.time || '99:99';
    const timeB = b.time || '99:99';
    if (timeA !== timeB) return timeA.localeCompare(timeB);
    return String(a.id || '').localeCompare(String(b.id || ''));
  });
}

function inferLegacyPlannedId(supplement, dateKey, event, plannedIntakes, usedPlannedIds) {
  if (!event || !plannedIntakes.length) return null;
  if (typeof event.templateIndex === 'number') {
    const templateId = buildPlannedIntakeId(supplement.id, dateKey, event.templateIndex);
    if (!usedPlannedIds.has(templateId)) return templateId;
  }
  if (event.time) {
    const byTime = plannedIntakes.find((planned) => !usedPlannedIds.has(planned.id) && planned.time === event.time);
    if (byTime) return byTime.id;
  }
  return null;
}

function getSupplementIntakesForDay(supplementId, dateKey) {
  const supplement = getSupplementById(supplementId);
  if (!supplement) return [];

  const createdDateKey = getCreatedDateKey(supplement);
  if (createdDateKey && dateKey < createdDateKey) return [];

  const plannedIntakes = buildPlannedIntakesForDate(supplement, dateKey);
  const actualEvents = getDayIntakes(supplement, dateKey);
  const actualByPlannedId = new Map();
  const linkedActualIds = new Set();
  const usedPlannedIds = new Set();

  for (const event of actualEvents) {
    let plannedId = event.plannedId || '';
    if (!plannedId) {
      plannedId = inferLegacyPlannedId(supplement, dateKey, event, plannedIntakes, usedPlannedIds) || '';
    }
    if (plannedId && !actualByPlannedId.has(plannedId)) {
      actualByPlannedId.set(plannedId, { ...event, plannedId });
      linkedActualIds.add(event.id);
      usedPlannedIds.add(plannedId);
    }
  }

  const merged = [];
  for (const planned of plannedIntakes) {
    const actual = actualByPlannedId.get(planned.id);
    if (actual) merged.push({ ...planned, ...actual, planned: false });
    else merged.push(planned);
  }
  for (const event of actualEvents) {
    if (!linkedActualIds.has(event.id)) {
      merged.push({ ...event, planned: false });
    }
  }
  return sortSupplementIntakes(merged);
}

/** Toggle intake checked status
 * @param {string} supplementId
 * @param {string} dateKey - "YYYY-MM-DD"
 * @param {string} intakeId
 * @returns {SupplementIntake|undefined} updated intake */
/** Compare two date keys (YYYY-MM-DD format)
 * @param {string} dateKey1
 * @param {string} dateKey2
 * @returns {number} -1 if date1 < date2, 0 if equal, 1 if date1 > date2 */
function compareDateKeys(dateKey1, dateKey2) {
  if (dateKey1 < dateKey2) return -1;
  if (dateKey1 > dateKey2) return 1;
  return 0;
}

/** Check if dateKey is in the future relative to today
 * @param {string} dateKey - "YYYY-MM-DD"
 * @returns {boolean} */
function isFutureDate(dateKey) {
  const todayKey = formatDateKey(new Date());
  return compareDateKeys(dateKey, todayKey) > 0;
}

/** Check if dateKey is today
 * @param {string} dateKey - "YYYY-MM-DD"
 * @returns {boolean} */
function isToday(dateKey) {
  const todayKey = formatDateKey(new Date());
  return dateKey === todayKey;
}

/** Check if dateKey is in the past relative to today
 * @param {string} dateKey - "YYYY-MM-DD"
 * @returns {boolean} */
function isPastDate(dateKey) {
  const todayKey = formatDateKey(new Date());
  return compareDateKeys(dateKey, todayKey) < 0;
}

function toggleSupplementIntakeChecked(supplementId, dateKey, intakeId) {
  if (isFutureDate(dateKey)) return null;

  const profile = loadSupplementsProfile();
  const supplement = profile.supplements.find((s) => s.id === supplementId);
  if (!supplement) return undefined;

  const renderedIntakes = getSupplementIntakesForDay(supplementId, dateKey);
  const rendered = renderedIntakes.find((intake) => intake.id === intakeId);
  if (!rendered) return undefined;

  const dayIntakes = getOrCreateDayIntakes(supplement, dateKey);
  let event = dayIntakes.intakes.find((intake) => intake.id === intakeId || intake.plannedId === intakeId);
  if (!event) {
    event = {
      id: generateId(),
      plannedId: rendered.plannedId || rendered.id || null,
      time: rendered.time || '',
      dose: rendered.dose,
      checked: false,
      edited: Boolean(rendered.edited),
    };
    dayIntakes.intakes.push(event);
  }

  event.checked = !event.checked;
  if (event.checked && !event.time) event.time = formatTimeHM(new Date());
  supplement.updatedAt = new Date().toISOString();
  saveSupplementsProfile(profile);
  return getSupplementIntakesForDay(supplementId, dateKey).find((item) => item.id === intakeId || item.plannedId === intakeId) || event;
}

/** Update intake dose/time
 * @param {string} supplementId
 * @param {string} dateKey - "YYYY-MM-DD"
 * @param {string} intakeId
 * @param {Partial<SupplementIntake>} updates - dose, time, checked
 * @returns {SupplementIntake|undefined|null} updated intake, undefined if not found, null if deleted */
function updateSupplementIntake(supplementId, dateKey, intakeId, updates) {
  const profile = loadSupplementsProfile();
  const supplement = profile.supplements.find((s) => s.id === supplementId);
  if (!supplement) return undefined;

  const rendered = getSupplementIntakesForDay(supplementId, dateKey).find((intake) => intake.id === intakeId || intake.plannedId === intakeId);
  if (!rendered) return undefined;

  const dayIntakes = getOrCreateDayIntakes(supplement, dateKey);
  let intake = dayIntakes.intakes.find((item) => item.id === intakeId || item.plannedId === intakeId);
  if (updates.dose === 0 || updates.dose === '0' || updates._delete === true) {
    const idx = dayIntakes.intakes.findIndex((item) => item.id === intakeId || item.plannedId === intakeId);
    if (idx >= 0) {
      dayIntakes.intakes.splice(idx, 1);
      supplement.updatedAt = new Date().toISOString();
      saveSupplementsProfile(profile);
      return null;
    }
    return undefined;
  }

  if (!intake) {
    intake = {
      id: generateId(),
      plannedId: rendered.plannedId || rendered.id || null,
      time: rendered.time || '',
      dose: rendered.dose,
      checked: Boolean(rendered.checked),
      edited: Boolean(rendered.edited),
    };
    dayIntakes.intakes.push(intake);
  }

  if (updates.dose !== undefined) {
    intake.dose = Number(updates.dose);
    const templateIndex = rendered.templateIndex;
    if (typeof templateIndex === 'number' && supplement.templateIntakes[templateIndex]) {
      intake.edited = intake.dose !== Number(supplement.templateIntakes[templateIndex].defaultDose);
    } else intake.edited = true;
  }
  if (updates.time !== undefined) intake.time = updates.time;
  if (updates.checked !== undefined) intake.checked = updates.checked;
  supplement.updatedAt = new Date().toISOString();
  saveSupplementsProfile(profile);
  return getSupplementIntakesForDay(supplementId, dateKey).find((item) => item.id === intakeId || item.plannedId === intakeId) || intake;
}

/** Add new intake for a specific date
 * @param {string} supplementId
 * @param {string} dateKey - "YYYY-MM-DD"
 * @param {number} dose
 * @param {string} time - "HH:MM"
 * @returns {SupplementIntake} created intake */
function addSupplementIntake(supplementId, dateKey, dose, time) {
  const profile = loadSupplementsProfile();
  const supplement = profile.supplements.find((s) => s.id === supplementId);
  if (!supplement) throw new Error('Supplement not found');
  
  const dayIntakes = getOrCreateDayIntakes(supplement, dateKey);
  const newIntake = {
    id: generateId(),
    plannedId: null,
    time,
    dose,
    checked: false,
    edited: true,
  };
  
  dayIntakes.intakes.push(newIntake);
  supplement.updatedAt = new Date().toISOString();
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
  const supplement = profile.supplements.find((s) => s.id === supplementId);
  if (!supplement) return false;

  const dayIntakes = supplement.history?.find(h => h.date === dateKey);
  if (!dayIntakes) return false;
  
  const idx = dayIntakes.intakes.findIndex((i) => i.id === intakeId || i.plannedId === intakeId);
  if (idx < 0) return false;
  
  dayIntakes.intakes.splice(idx, 1);
  supplement.updatedAt = new Date().toISOString();
  saveSupplementsProfile(profile);
  return true;
}

/** Remove ALL intakes for a supplement on a specific date (clear day)
 * This removes the supplement from this day's view without deleting the supplement itself
 * @param {string} supplementId
 * @param {string} dateKey - "YYYY-MM-DD"
 * @returns {boolean} success */
function removeAllSupplementIntakesForDay(supplementId, dateKey) {
  const profile = loadSupplementsProfile();
  const supplement = profile.supplements.find((s) => s.id === supplementId);
  if (!supplement) return false;

  const dayIntakes = supplement.history?.find(h => h.date === dateKey);
  if (!dayIntakes) return false;

  dayIntakes.intakes = [];
  supplement.updatedAt = new Date().toISOString();
  saveSupplementsProfile(profile);
  return true;
}

/** Clear ALL history for ALL supplements (keep supplement profiles and daily settings)
 * This removes all intake records but preserves supplement settings including daily interval
 * @returns {boolean} success */
function clearAllSupplementsHistory() {
  const profile = loadSupplementsProfile();
  if (!profile || !profile.supplements) return false;

  for (const supplement of profile.supplements) {
    supplement.history = [];
    supplement.updatedAt = new Date().toISOString();
  }

  saveSupplementsProfile(profile);
  return true;
}

/** COMPLETELY RESET supplements - delete ALL supplements and their history
 * Use this to clean up old data when migrating to new system
 * @returns {boolean} success */
function resetAllSupplements() {
  const id = window.currentAppUserId || 'anon';
  const key = `${SUPPLEMENTS_PROFILE_KEY}_${id}`;
  localStorage.removeItem(key);
  return true;
}

/** Add new supplement to profile
 * @param {Object} params
 * @param {string} params.name
 * @param {'РјРі'|'Рі'|'С‚Р°Р±Р»'} params.unit
 * @param {boolean} params.daily
 * @param {string|null} params.dailyStartDate - "YYYY-MM-DD" or null
 * @param {string|null} params.dailyEndDate - "YYYY-MM-DD" or null
 * @param {number} params.standardDailyDose
 * @param {SupplementTemplateIntake[]} params.templateIntakes
 * @returns {Supplement} created supplement */
function createSupplement({ name, unit, daily, dailyStartDate, dailyEndDate, standardDailyDose, templateIntakes }) {
  const profile = loadSupplementsProfile();
  const now = new Date();
  const nowISO = now.toISOString();
  const todayKey = formatDateKey(now);
  
  const finalDailyStartDate = daily ? (dailyStartDate || todayKey) : null;
  const finalDailyEndDate = daily ? (dailyEndDate || null) : null;
  const normalizedTemplates = Array.isArray(templateIntakes) && templateIntakes.length > 0
    ? templateIntakes.map((template) => ({
      defaultDose: Number(template?.defaultDose) > 0 ? Number(template.defaultDose) : 1,
      time: typeof template?.time === 'string' ? template.time : '',
    }))
    : [{ defaultDose: Number(standardDailyDose) > 0 ? Number(standardDailyDose) : 1, time: '' }];

  const supplement = {
    id: generateId(),
    name,
    unit,
    daily: daily || false,
    dailyStartDate: finalDailyStartDate,
    dailyEndDate: finalDailyEndDate,
    standardDailyDose: Number(standardDailyDose) > 0 ? Number(standardDailyDose) : normalizedTemplates[0].defaultDose,
    templateIntakes: normalizedTemplates,
    history: [],
    createdAt: nowISO,
    updatedAt: nowISO,
  };

  profile.supplements = profile.supplements || [];
  profile.supplements.push(supplement);
  saveSupplementsProfile(profile);
  return supplement;
}

/** Update supplement settings (not history)
 * @param {string} id
 * @param {Partial<Pick<Supplement, 'name' | 'unit' | 'daily' | 'dailyStartDate' | 'dailyEndDate' | 'standardDailyDose' | 'templateIntakes'>>} updates
 * @returns {Supplement|undefined} updated supplement */
function updateSupplement(id, updates) {
  const profile = loadSupplementsProfile();
  const supplement = profile.supplements.find((s) => s.id === id);
  if (!supplement) return undefined;
  
  if (updates.name !== undefined) supplement.name = updates.name;
  if (updates.unit !== undefined) supplement.unit = updates.unit;
  if (updates.daily !== undefined) supplement.daily = updates.daily;
  if (updates.dailyStartDate !== undefined) supplement.dailyStartDate = updates.dailyStartDate;
  if (updates.dailyEndDate !== undefined) supplement.dailyEndDate = updates.dailyEndDate;
  if (updates.standardDailyDose !== undefined) supplement.standardDailyDose = updates.standardDailyDose;
  if (updates.templateIntakes !== undefined) {
    supplement.templateIntakes = updates.templateIntakes.map((template) => ({
      defaultDose: Number(template?.defaultDose) > 0 ? Number(template.defaultDose) : 1,
      time: typeof template?.time === 'string' ? template.time : '',
    }));
  }
  
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

// в”Ђв”Ђв”Ђ Pure: date helpers в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

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
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTimeHM(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

// в”Ђв”Ђв”Ђ Pure: calorie calculations (replace with real formulas later) в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

/**
 * Calculate base metabolism (BMR) using Mifflin-St Jeor formula.
 * Uses weight from profile. Falls back to targetCalories or default.
 * @param {ProfileFitnessSettings} profile
 * @returns {number}
 */
function calculateBaseMetabolism(profile) {
  if (!profile || typeof profile !== 'object') return 2000;
  // Р•СЃР»Рё РµСЃС‚СЊ РІРµСЃ РІ РїСЂРѕС„РёР»Рµ - РёСЃРїРѕР»СЊР·СѓРµРј С„РѕСЂРјСѓР»Сѓ РњРёС„С„Р»РёРЅР°-РЎР°РЅ Р–РµРѕСЂР°
  if (profile.weight && profile.weight > 0) {
    const weight = profile.weight;
    const height = profile.height || 170; // СѓРјРѕР»С‡Р°РЅРёРµ РµСЃР»Рё РЅРµС‚
    const age = profile.age || 30; // СѓРјРѕР»С‡Р°РЅРёРµ РµСЃР»Рё РЅРµС‚
    
    // РџРѕ СѓРјРѕР»С‡Р°РЅРёСЋ РјСѓР¶СЃРєРѕР№ РїРѕР» (РјРѕР¶РЅРѕ РґРѕР±Р°РІРёС‚СЊ РІС‹Р±РѕСЂ РІ РїСЂРѕС„РёР»Рµ)
    // Р¤РѕСЂРјСѓР»Р° РњРёС„С„Р»РёРЅР°-РЎР°РЅ Р–РµРѕСЂР° РґР»СЏ РјСѓР¶С‡РёРЅ:
    // BMR = 10 Г— РІРµСЃ(РєРі) + 6.25 Г— СЂРѕСЃС‚(СЃРј) в€’ 5 Г— РІРѕР·СЂР°СЃС‚(Р»РµС‚) + 5
    const sex = String(profile.sex || profile.gender || '').toLowerCase();
    const sexOffset = sex === 'female' || sex === 'f' || sex === 'Р¶РµРЅ' ? -161 : 5;
    let bmr = 10 * weight + 6.25 * height - 5 * age + sexOffset;
    
    // РћРєСЂСѓРіР»СЏРµРј
    return Math.round(bmr);
  }
  
  // Р•СЃР»Рё РІРµСЃР° РЅРµС‚ - РёСЃРїРѕР»СЊР·СѓРµРј targetCalories РёР»Рё СѓРјРѕР»С‡Р°РЅРёРµ
  if (profile.targetCalories && profile.targetCalories > 0) {
    return Math.round(profile.targetCalories);
  }
  
  // РЈРјРѕР»С‡Р°РЅРёРµ
  return 2000;
}

/**
 * Activity calories calculation using MET-based formulas from ActivityCalories module.
 * Falls back to old calculation if ActivityCalories not loaded.
 * @param {ActivityEntry[]} activities
 * @returns {number}
 */
function calculateActivityCalories(activities) {
  // Use new ActivityCalories module if available
  if (window.ActivityCalories && window.ActivityCalories.calculateActivityCaloriesUniversal) {
    let total = 0;
    for (const a of activities || []) {
      total += window.ActivityCalories.calculateActivityCaloriesUniversal(a);
    }
    return Math.round(total);
  }
  
  // Fallback to old simple calculation
  const GYM_FACTOR = 8;
  const CARDIO_FACTOR = 10;
  const STEPS_FACTOR = 0.04;
  let total = 0;
  for (const a of activities || []) {
    if (a.kind === 'gym') total += (a.durationMinutes || 0) * GYM_FACTOR;
    if (a.kind === 'cardio') total += (a.durationMinutes || 0) * CARDIO_FACTOR;
    if (a.kind === 'cardio_indoor') total += (a.durationMinutes || 0) * CARDIO_FACTOR;
    if (a.kind === 'cardio_outdoor') total += (a.durationMinutes || 0) * CARDIO_FACTOR;
    if (a.kind === 'home' || a.kind === 'home_exercise') total += (a.durationMinutes || 0) * 5;
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
  // Р—Р°С‰РёС‚Р° РѕС‚ undefined dayData
  if (!dayData) {
    return {
      eaten: 0,
      burned: 0,
      balance: 0,
      balanceColor: 'gray',
      baseRest: 0,
      baseWithWork: 0,
      activityCal: 0,
      workMultiplier: 1.2,
    };
  }
  
  const eaten = (dayData.foods || []).reduce((s, f) => s + (f.calories || 0), 0);
  const baseRest = calculateBaseMetabolism(profile); // С‡РёСЃС‚С‹Р№ BMR
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
    // Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅС‹Рµ РїРѕР»СЏ РґР»СЏ РґРµС‚Р°Р»РёР·Р°С†РёРё
    baseRest,
    baseWithWork,
    activityCal,
    workMultiplier,
  };
}

/**
 * @param {ProfileFitnessSettings} profile
 * @param {FitnessDayData} dayData
 * @returns {number} multiplier
 */
function getWorkActivityMultiplier(profile, dayData) {
  let base = 1.2; // РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ СЃРёРґСЏС‡РёР№
  if (profile.workProfile === 'mixed') base = 1.4;
  if (profile.workProfile === 'physical') base = 1.6;
  if (profile.workProfile === 'variable' || !profile.workProfile) base = 1.3;

  // РґРЅРµРІРЅР°СЏ РїРѕРїСЂР°РІРєР° (none = Р±РµР· РґРѕРїРѕР»РЅРёС‚РµР»СЊРЅРѕР№ РєРѕСЂСЂРµРєС‚РёСЂРѕРІРєРё)
  if (dayData.workDay === 'none') {
    // Р‘РµР· РёР·РјРµРЅРµРЅРёР№ - С‚РѕР»СЊРєРѕ Р±Р°Р·РѕРІС‹Р№ РјРЅРѕР¶РёС‚РµР»СЊ
  } else if (dayData.workDay === 'low') {
    base -= 0.1;
  } else if (dayData.workDay === 'high') {
    base += 0.1;
  }
  // 'normal' РёР»Рё undefined - С‚РѕР¶Рµ Р±РµР· РёР·РјРµРЅРµРЅРёР№

  if (base < 1.1) base = 1.1;
  if (base > 1.8) base = 1.8;
  return base;
}


// в”Ђв”Ђв”Ђ Pure: list view models (for rendering; React can map over these) в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

/** @param {ActivityEntry} a
 *  @returns {string} */
function getActivityLabel(a) {
  if (!a) return '';
  
  // РЎРёР»РѕРІР°СЏ С‚СЂРµРЅРёСЂРѕРІРєР°
  if (a.kind === 'gym' || a.kind === 'strength') {
    const calories = a.calories ? ` В· ${a.calories} РєРєР°Р»` : '';
    if (a.gymData) {
      return `РЎРёР»РѕРІР°СЏ С‚СЂРµРЅРёСЂРѕРІРєР°${a.durationMinutes ? ` ${a.durationMinutes} РјРёРЅ` : ''}${calories}`;
    }
    return `РЎРёР»РѕРІР°СЏ ${a.durationMinutes} РјРёРЅ${calories}`;
  }
  
  // РљР°СЂРґРёРѕ (Р·Р°Р»)
  if (a.kind === 'cardio' || a.kind === 'cardio_indoor') {
    const calories = a.calories ? ` В· ${a.calories} РєРєР°Р»` : '';
    const typeLabels = {
      'WALKING_TREADMILL': 'РҐРѕРґСЊР±Р° РЅР° РґРѕСЂРѕР¶РєРµ',
      'RUNNING_TREADMILL_SLOW': 'Р‘РµРі РЅР° РґРѕСЂРѕР¶РєРµ',
      'RUNNING_TREADMILL_FAST': 'Р‘РµРі РЅР° РґРѕСЂРѕР¶РєРµ (Р±С‹СЃС‚СЂС‹Р№)',
      'ELLIPTICAL_LIGHT': 'Р­Р»Р»РёРїСЃ',
      'ELLIPTICAL_MODERATE': 'Р­Р»Р»РёРїСЃ',
      'ELLIPTICAL_VIGOROUS': 'Р­Р»Р»РёРїСЃ (РёРЅС‚РµРЅСЃРёРІРЅРѕ)',
      'STATIONARY_BIKE_LIGHT': 'Р’РµР»РѕС‚СЂРµРЅР°Р¶С‘СЂ',
      'STATIONARY_BIKE_MODERATE': 'Р’РµР»РѕС‚СЂРµРЅР°Р¶С‘СЂ',
      'STATIONARY_BIKE_VIGOROUS': 'Р’РµР»РѕС‚СЂРµРЅР°Р¶С‘СЂ (РёРЅС‚РµРЅСЃРёРІРЅРѕ)',
      'ROWING_LIGHT': 'Р“СЂРµР±РЅРѕР№ С‚СЂРµРЅР°Р¶С‘СЂ',
      'ROWING_MODERATE': 'Р“СЂРµР±РЅРѕР№ С‚СЂРµРЅР°Р¶С‘СЂ',
      'ROWING_VIGOROUS': 'Р“СЂРµР±РЅРѕР№ С‚СЂРµРЅР°Р¶С‘СЂ (РёРЅС‚РµРЅСЃРёРІРЅРѕ)',
      'STEPPER': 'РЎС‚РµРїРїРµСЂ',
    };
    const typeLabel = typeLabels[a.cardioType] || 'РљР°СЂРґРёРѕ (Р·Р°Р»)';
    return `${typeLabel} ${a.durationMinutes} РјРёРЅ${calories}`;
  }

  // РљР°СЂРґРёРѕ (СѓР»РёС†Р°)
  if (a.kind === 'cardio_outdoor') {
    const calories = a.calories ? ` В· ${a.calories} РєРєР°Р»` : '';
    const typeLabels = {
      'WALKING_LEISURE': 'РџСЂРѕРіСѓР»РѕС‡РЅР°СЏ С…РѕРґСЊР±Р°',
      'WALKING_BRISK': 'Р‘С‹СЃС‚СЂР°СЏ С…РѕРґСЊР±Р°',
      'WALKING_RACE': 'РЎРїРѕСЂС‚РёРІРЅР°СЏ С…РѕРґСЊР±Р°',
      'RUNNING_SLOW': 'Р‘РµРі (РјРµРґР»РµРЅРЅС‹Р№)',
      'RUNNING_MODERATE': 'Р‘РµРі (СЃСЂРµРґРЅРёР№)',
      'RUNNING_FAST': 'Р‘РµРі (Р±С‹СЃС‚СЂС‹Р№)',
      'RUNNING_SPRINT': 'Р‘РµРі (СЃРїСЂРёРЅС‚)',
      'CYCLING_LEISURE': 'Р’РµР»РѕСЃРёРїРµРґ (РїСЂРѕРіСѓР»РєР°)',
      'CYCLING_MODERATE': 'Р’РµР»РѕСЃРёРїРµРґ',
      'CYCLING_FAST': 'Р’РµР»РѕСЃРёРїРµРґ (Р±С‹СЃС‚СЂС‹Р№)',
      'CYCLING_RACE': 'Р’РµР»РѕСЃРёРїРµРґ (РіРѕРЅРєР°)',
      'SWIMMING_LEISURE': 'РџР»Р°РІР°РЅРёРµ',
      'SWIMMING_MODERATE': 'РџР»Р°РІР°РЅРёРµ',
      'SWIMMING_VIGOROUS': 'РџР»Р°РІР°РЅРёРµ (РёРЅС‚РµРЅСЃРёРІРЅРѕ)',
      'SKIING_CROSS_COUNTRY': 'Р›С‹Р¶Рё РєР»Р°СЃСЃРёРєР°',
      'SKIING_SKATING': 'Р›С‹Р¶Рё РєРѕРЅСЊРєРѕРј',
    };
    const typeLabel = typeLabels[a.cardioType] || 'РљР°СЂРґРёРѕ (СѓР»РёС†Р°)';
    const distance = a.distanceKm ? ` В· ${a.distanceKm} РєРј` : '';
    return `${typeLabel} ${a.durationMinutes} РјРёРЅ${distance}${calories}`;
  }
  
  // Р”РѕРјР°С€РЅРёРµ СѓРїСЂР°Р¶РЅРµРЅРёСЏ
  if (a.kind === 'home' || a.kind === 'home_exercise') {
    const calories = a.calories ? ` В· ${a.calories} РєРєР°Р»` : '';
    const typeLabels = {
      'PUSHUPS_MODERATE': 'РћС‚Р¶РёРјР°РЅРёСЏ',
      'PUSHUPS_VIGOROUS': 'РћС‚Р¶РёРјР°РЅРёСЏ (РёРЅС‚РµРЅСЃРёРІРЅРѕ)',
      'SQUATS_BODYWEIGHT': 'РџСЂРёСЃРµРґР°РЅРёСЏ',
      'SQUATS_WEIGHTED': 'РџСЂРёСЃРµРґР°РЅРёСЏ СЃ РІРµСЃРѕРј',
      'LUNGES': 'Р’С‹РїР°РґС‹',
      'CRUNCHES': 'РЎРєСЂСѓС‡РёРІР°РЅРёСЏ',
      'LEG_RAISES': 'РџРѕРґСЉС‘РјС‹ РЅРѕРі',
      'PLANK': 'РџР»Р°РЅРєР°',
      'BURPEES': 'Р‘С‘СЂРїРё',
      'JUMPING_JACKS': 'Р”Р¶Р°РјРїРёРЅРі РґР¶РµРє',
      'MOUNTAIN_CLIMBERS': 'РђР»СЊРїРёРЅРёСЃС‚',
      'HIGH_KNEES': 'Р‘РµРі СЃ РІС‹СЃРѕРєРёРјРё РєРѕР»РµРЅСЏРјРё',
      'SHADOW_BOXING': 'Р‘РѕРєСЃ СЃ С‚РµРЅСЊСЋ',
      'YOGA_LIGHT': 'Р™РѕРіР°',
      'YOGA_MODERATE': 'Р™РѕРіР°',
      'PILATES': 'РџРёР»Р°С‚РµСЃ',
      'STRETCHING': 'Р Р°СЃС‚СЏР¶РєР°',
    };
    const typeLabel = typeLabels[a.exerciseType] || 'Р”РѕРјР°С€РЅСЏСЏ С‚СЂРµРЅРёСЂРѕРІРєР°';
    const duration = a.durationMinutes ? ` ${a.durationMinutes} РјРёРЅ` : '';
    const reps = a.repetitions ? ` ${a.repetitions} РїРѕРІС‚.` : '';
    return `${typeLabel}${duration}${reps}${calories}`;
  }
  
  // РЁР°РіРё
  if (a.kind === 'steps') {
    const calories = a.calories ? ` В· ${a.calories} РєРєР°Р»` : '';
    return `РЁР°РіРё: ${a.steps?.toLocaleString() || 0}${calories}`;
  }
  
  // РџРѕРІСЃРµРґРЅРµРІРЅР°СЏ Р°РєС‚РёРІРЅРѕСЃС‚СЊ
  if (a.kind === 'daily') {
    return `РђРєС‚РёРІРЅРѕСЃС‚СЊ: ${a.activityType || 'РґСЂСѓРіРѕРµ'} ${a.durationMinutes} РјРёРЅ`;
  }
  
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
    // Build macros text: "Р‘: X Рі, Р–: Y Рі, РЈ: Z Рі"
    const macros = [];
    if (f.protein != null) macros.push(`Р‘: ${f.protein}Рі`);
    if (f.fat != null) macros.push(`Р–: ${f.fat}Рі`);
    if (f.carbs != null) macros.push(`РЈ: ${f.carbs}Рі`);
    const macrosText = macros.length > 0 ? macros.join(', ') : '';
    
    return {
      id: f.id,
      name: f.name,
      amount: f.amount || '',
      caloriesText: f.calories != null ? `${f.calories} РєРєР°Р»` : '',
      macrosText,
      timeText: f.time || '',
      source: f.source || 'manual',
    };
  });
}


/** @param {number} waterMl
 *  @returns {string} e.g. "1.5" */
function formatWaterLiters(waterMl) {
  return ((waterMl || 0) / 1000).toFixed(1);
}

// в”Ђв”Ђв”Ђ Pure: merge/remove (return new arrays for React immutability) в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

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

// в”Ђв”Ђв”Ђ Pure: water tracking helpers в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

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
  if (status === 'low') return 'Hydration is below target.';
  if (status === 'high') return 'Hydration is above target.';
  return 'Hydration is on track.';
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

// в”Ђв”Ђв”Ђ Pure: parse form values в†’ domain objects (React: pass form state here) в”Ђв”Ђ

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

  // Measurements (body measurements)
  const measurements = {};
  if (values.waist != null && values.waist !== '') measurements.waist = Number(values.waist);
  if (values.hips != null && values.hips !== '') measurements.hips = Number(values.hips);
  if (values.chest != null && values.chest !== '') measurements.chest = Number(values.chest);
  if (values.bicep != null && values.bicep !== '') measurements.bicep = Number(values.bicep);
  if (values.thigh != null && values.thigh !== '') measurements.thigh = Number(values.thigh);
  if (Object.keys(measurements).length > 0) {
    profile.measurements = measurements;
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
  
  // РЎРёР»РѕРІР°СЏ С‚СЂРµРЅРёСЂРѕРІРєР° (GYM)
  if (kind === 'gym' || kind === 'strength') {
    const intensity = ['low', 'medium', 'high'].includes(form.intensity) ? form.intensity : 'medium';
    const entry = {
      id,
      kind: 'gym',
      durationMinutes: Number(form.durationMinutes) || 45,
      intensity,
    };
    // Р•СЃР»Рё РµСЃС‚СЊ СЃРІСЏР·СЊ СЃ GYM-РјРѕРґСѓР»РµРј
    if (form.gymData) {
      entry.gymData = form.gymData;
    }
    // Р Р°СЃСЃС‡РёС‚С‹РІР°РµРј РєР°Р»РѕСЂРёРё РµСЃР»Рё РµСЃС‚СЊ ActivityCalories
    if (window.ActivityCalories) {
      if (entry.gymData && entry.gymData.exercises) {
        entry.calories = window.ActivityCalories.calculateStrengthCalories(entry.gymData).calories;
      } else {
        entry.calories = window.ActivityCalories.calculateSimpleStrengthCalories(entry.durationMinutes, intensity);
      }
    }
    return entry;
  }

  // РљР°СЂРґРёРѕ (Р·Р°Р»)
  if (kind === 'cardio' || kind === 'cardio_indoor') {
    const entry = {
      id,
      kind: 'cardio_indoor',
      durationMinutes: Number(form.durationMinutes) || 30,
      cardioType: form.cardioType || 'WALKING_TREADMILL',
    };
    if (form.distanceKm) {
      entry.distanceKm = Number(form.distanceKm);
    }
    if (window.ActivityCalories) {
      const calc = window.ActivityCalories.calculateCardioCalories({
        type: entry.cardioType,
        durationMinutes: entry.durationMinutes,
        distanceKm: entry.distanceKm,
        isOutdoor: false,
      });
      entry.calories = calc.calories;
    }
    return entry;
  }
  
  // РљР°СЂРґРёРѕ (СѓР»РёС†Р°)
  if (kind === 'cardio_outdoor') {
    const entry = {
      id,
      kind: 'cardio_outdoor',
      durationMinutes: Number(form.durationMinutes) || 30,
      cardioType: form.cardioType || 'WALKING_LEISURE',
    };
    if (form.distanceKm) {
      entry.distanceKm = Number(form.distanceKm);
    }
    if (window.ActivityCalories) {
      const calc = window.ActivityCalories.calculateCardioCalories({
        type: entry.cardioType,
        durationMinutes: entry.durationMinutes,
        distanceKm: entry.distanceKm,
        isOutdoor: true,
      });
      entry.calories = calc.calories;
    }
    return entry;
  }
  
  // Р”РѕРјР°С€РЅРёРµ СѓРїСЂР°Р¶РЅРµРЅРёСЏ
  if (kind === 'home' || kind === 'home_exercise') {
    const entry = {
      id,
      kind: 'home_exercise',
      exerciseType: form.exerciseType || 'PUSHUPS_MODERATE',
    };
    if (form.durationMinutes) {
      entry.durationMinutes = Number(form.durationMinutes);
    }
    if (form.repetitions) {
      entry.repetitions = Number(form.repetitions);
    }
    if (window.ActivityCalories) {
      const calc = window.ActivityCalories.calculateHomeExerciseCalories({
        exerciseType: entry.exerciseType,
        durationMinutes: entry.durationMinutes,
        repetitions: entry.repetitions,
      });
      entry.calories = calc.calories;
    }
    return entry;
  }
  
  // РЁР°РіРё
  if (kind === 'steps') {
    const entry = {
      id,
      kind: 'steps',
      steps: Number(form.steps) || 0,
    };
    if (window.ActivityCalories) {
      entry.calories = window.ActivityCalories.calculateStepsCalories(entry.steps).calories;
    }
    return entry;
  }
  
  // РџРѕРІСЃРµРґРЅРµРІРЅР°СЏ Р°РєС‚РёРІРЅРѕСЃС‚СЊ
  if (kind === 'daily') {
    return {
      id,
      kind: 'daily',
      activityType: form.activityType || 'other',
      durationMinutes: Number(form.durationMinutes) || 0,
    };
  }
  
  // Fallback
  return {
    id,
    kind: 'steps',
    steps: 0,
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


// в”Ђв”Ђв”Ђ Public API в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

// в”Ђв”Ђв”Ђ API Ninjas Nutrition integration в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

/** Call backend nutrition API
 * @param {string} inputText - food text like "РіСЂРµС‡РєР° 200Рі РІР°СЂРµРЅР°СЏ"
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
 * @param {string} inputText - user input like "РіСЂРµС‡РєР° 200Рі РІР°СЂРµРЅР°СЏ"
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

// в”Ђв”Ђв”Ђ Weight tracking helpers в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

/** Calculate BMI
 * @param {number} weightKg
 * @param {number} heightCm
 * @returns {number} BMI value
 */
function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

/** Format weight change with trend indicator
 * @param {number} current
 * @param {number} previous
 * @returns {{text: string, trend: 'up'|'down'|'same', diff: number}}
 */
function formatWeightChange(current, previous) {
  if (!previous || previous === 0) return { text: 'вЂ”', trend: 'same', diff: 0 };
  const diff = Number((current - previous).toFixed(1));
  if (Math.abs(diff) < 0.1) return { text: 'в†’ 0.0 РєРі', trend: 'same', diff: 0 };
  if (diff > 0) return { text: `в†— +${diff} РєРі`, trend: 'up', diff };
  return { text: `в† ${diff} РєРі`, trend: 'down', diff };
}

/** Generate SVG polyline points for weight chart
 * @param {{date: string, value: number}[]} chartData
 * @param {number} width
 * @param {number} height
 * @param {number} padding
 * @returns {string} points string for SVG polyline
 */
function generateWeightChartPoints(chartData, width = 100, height = 40, padding = 4) {
  if (!chartData || chartData.length === 0) return '';
  
  const values = chartData.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const valRange = maxVal - minVal || 1;
  
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  return chartData.map((item, index) => {
    const x = padding + (index / (chartData.length - 1 || 1)) * chartWidth;
    const y = padding + chartHeight - ((item.value - minVal) / valRange) * chartHeight;
    return `${x},${y}`;
  }).join(' ');
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
  formatWaterLiters,
  mergeActivity,
  mergeFood,
  removeActivityById,
  removeFoodById,
  // UPDATED: water helpers
  adjustWater,
  getWaterStatus,
  getWaterStatusText,
  clamp,
  parseProfileFromValues,
  buildActivityEntry,
  buildFoodEntry,
  BALANCE_GREEN_MAX,
  BALANCE_RED_THRESHOLD,
  getWorkActivityMultiplier,
  // NEW: API Ninjas integration
  fetchNutritionForInput,
  onFoodSubmit,
  // NEW: Weight tracking helpers
  calculateBMI,
  formatWeightChange,
  generateWeightChartPoints,
  // NEW: Supplements tracking (NEW SYSTEM ONLY)
  loadSupplementsProfile,
  saveSupplementsProfile,
  getAllSupplements,
  getSupplementById,
  getSupplementIntakesForDay,
  toggleSupplementIntakeChecked,
  updateSupplementIntake,
  addSupplementIntake,
  removeSupplementIntake,
  removeAllSupplementIntakesForDay,
  clearAllSupplementsHistory,
  resetAllSupplements,
  createSupplement,
  updateSupplement,
  deleteSupplement,
  getTotalDoseForDay,
  // NEW: Date comparison helpers
  isFutureDate,
  isToday,
  isPastDate,
  // NEW: Daily interval helper
  isDateInDailyInterval,
};


