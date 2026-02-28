ementById('gymPeriodStep1CancelBtn'),
    periodStep1NextBtn: document.getElementById('gymPeriodStep1NextBtn'),
    periodDaysContainer: document.getElementById('gymPeriodDaysContainer'),
    periodStep2BackBtn: document.getElementById('gymPeriodStep2BackBtn'),
    periodStep2CreateBtn: document.getElementById('gymPeriodStep2CreateBtn'),

    // Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦ Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р В РЎвЂќР РЋР вЂљР В Р’ВµР РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂўР В РЎвЂ“Р В РЎвЂў Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В Р’В°
    screen: document.getElementById('gymScreen'),
    backBtn: document.getElementById('gymBackBtn'),
    fromFitnessBtn: document.getElementById('gymBtn'),
    daySelect: document.getElementById('gymDay'),
    groupsContainer: document.getElementById('gymGroupsContainer'),
    cycleInfo: document.getElementById('gymCycleInfo'),
    periodInfo: document.getElementById('gymPeriodInfo'),
    progressLabel: document.getElementById('gymProgressLabel'),
    progressBar: document.getElementById('gymProgressBar'),
    saveBtn: document.getElementById('gymSaveBtn'),
    historyBtn: document.getElementById('gymHistoryBtn'),
    newCycleBtn: document.getElementById('gymNewCycleBtn'),
    cycleSelect: document.getElementById('gymCycleSelect'),
  };

  // Р В РўвЂР В РЎвЂў GYM-Р В Р’В±Р В Р’В»Р В РЎвЂўР В РЎвЂќР В Р’В°, Р В РЎвЂ”Р В РЎвЂўР РЋР С“Р В Р’В»Р В Р’Вµ fitnessEl/gymEl
  const fitnessBtn = document.getElementById('fitnessBtn');

  // Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В Р’ВµР В РЎвЂўР В РЎвЂ”Р РЋР вЂљР В Р’ВµР В РўвЂР В Р’ВµР В Р’В»Р РЋР РЏР В Р’ВµР В РЎВ showFitness Р РЋР С“ Р РЋРЎвЂњР РЋРІР‚РЋР РЋРІР‚ВР РЋРІР‚С™Р В РЎвЂўР В РЎВ fitnessEl Р В РЎвЂ gymEl
  const _showFitnessBase = showFitness;
  function showFitnessFull() {
    _showFitnessBase();
    if (fitnessEl?.profileSetup) fitnessEl.profileSetup.classList.add('hidden');
    if (fitnessEl?.dashboard) fitnessEl.dashboard.classList.remove('hidden');
    if (gymEl?.periodsScreen) gymEl.periodsScreen.classList.add('hidden');
    if (gymEl?.periodWizardScreen) gymEl.periodWizardScreen.classList.add('hidden');
    if (gymEl?.screen) gymEl.screen.classList.add('hidden');
  }

  // Р В РЎв„ўР В Р вЂ¦Р В РЎвЂўР В РЎвЂ”Р В РЎвЂќР В РЎвЂ Р В Р вЂ¦Р В Р’В° Р В РЎвЂ“Р В Р’В»Р В Р’В°Р В Р вЂ Р В Р вЂ¦Р В РЎвЂўР В РЎВ Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦Р В Р’Вµ
  if (el.habitsBtn) {
    el.habitsBtn.addEventListener('click', () => {
      showAlert('Р В Р’В­Р В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В Р вЂ Р РЋРІР‚в„–Р РЋРІР‚РЋР В Р’ВµР В РЎвЂќ Р В Р’В±Р РЋРЎвЂњР В РўвЂР В Р’ВµР РЋРІР‚С™ Р В РЎвЂ”Р В РЎвЂўР В Р’В·Р В Р’В¶Р В Р’Вµ');
    });
  }

  if (el.buddyBtn) {
    el.buddyBtn.addEventListener('click', () => {
      showBuddy();
    });
  }

  if (fitnessBtn && !fitnessBtn.dataset.fitnessOpenBound) {
    if (!fitnessBtn.dataset.fitnessFullBound) {
      fitnessBtn.dataset.fitnessFullBound = '1';
      fitnessBtn.addEventListener('click', () => {
        showFitnessFull();
      });
    }
  }

  if (fitnessEl?.backBtn) {
    fitnessEl.backBtn.addEventListener('click', () => {
      showMain();
    });
  }
  if (el.backBtn) {
    el.backBtn.addEventListener('click', () => {
      showMain();
    });
  }

/**
 * GYM storage & saving contract (LeakFixer)
 *
 * Terminology:
 * - Period card  = item in the "GYM periods" list (name, type, dates, totalCycles, etc.).
 * - Cycle card   = screen for one period + cycle (header with "Cycle X/Y", list of days, "Save cycle" button).
 * - Day card     = one day inside a cycle (set of exercises, "Day active", "Day completed").
 * - Exercise card= one exercise inside a day (header with name + working sets, expanded details).
 *
 * Saving rules:
 *
 * 1) Period card
 *    - name, type, manual startDate edits:
 *      Р Р†РІР‚В РІР‚в„ў saved immediately to gymState + localStorage on change (low-frequency settings).
 *
 * 2) Cycle card (whole cycle with all days)
 *    - structural / planning changes for the cycle (days, which are active, how active days propagate to future cycles, etc.)
 *      live in memory/runtime while editing.
 *    - "Save cycle" button:
 *      Р Р†РІР‚В РІР‚в„ў commits the current cycle structure and plan to gymState + localStorage,
 *      Р Р†РІР‚В РІР‚в„ў used for copying active days to future cycles, updating period progress, etc.
 *
 * 3) Day card
 *    - editing a day (adding/removing exercises, toggling "day active", etc.)
 *      updates runtime for that day while editing.
 *    - "Save day" button:
 *      Р Р†РІР‚В РІР‚в„ў commits that day's structure/settings to gymState + localStorage.
 *    - "Day completed" checkbox + completion date:
 *      Р Р†РІР‚В РІР‚в„ў saved immediately (no extra button) to gymState.completedWorkouts + backend DB,
 *        using "today" if no date is chosen.
 *
 * 4) Exercise card
 *    - Header (right side of exercise name):
 *      - editable working sets: setsCount, repsCount, workWeight.
 *      - when these change:
 *          Р Р†РІР‚В РІР‚в„ў update exercise fields in gymState,
 *          Р Р†РІР‚В РІР‚в„ў immediately persist to localStorage via gymSaveState,
 *          Р Р†РІР‚В РІР‚в„ў immediately send to backend DB (e.g. FitnessSync.saveGymExerciseSets),
 *            if FitnessSync / currentAppUserId are available.
 *    - Inside expanded exercise body:
 *      - working sets are read-only (display the same setsCount/repsCount/workWeight),
 *        no second editable copy.
 *      - other fields like notes, RPE, nextCyclePlan can be saved immediately on change.
 *
 * Summary:
 * - Period & exercise-level details (settings, notes, working sets) save immediately.
 * - Day-level structure saves on "Save day".
 * - Cycle-level structure & propagation saves on "Save cycle".
 * - Day completion and working sets also sync to backend right away.
 */


  const GYM_STORAGE_KEY = 'leakfixer_gym_data';
  const GYM_DEFAULT_GROUPS = ['Р В РІР‚СљР РЋР вЂљР РЋРЎвЂњР В РўвЂР РЋР Р‰ + Р В РЎС›Р РЋР вЂљР В РЎвЂР РЋРІР‚В Р В Р’ВµР В РЎвЂ”Р РЋР С“', 'Р В Р Р‹Р В РЎвЂ”Р В РЎвЂР В Р вЂ¦Р В Р’В° + Р В РІР‚ВР В РЎвЂР РЋРІР‚В Р В Р’ВµР В РЎвЂ”Р РЋР С“', 'Р В РЎСљР В РЎвЂўР В РЎвЂ“Р В РЎвЂ + Р В Р’ВР В РЎвЂќР РЋР вЂљР РЋРІР‚в„–'];

  // Р В Р’В¤Р РЋРЎвЂњР В Р вЂ¦Р В РЎвЂќР РЋРІР‚В Р В РЎвЂР РЋР РЏ Р РЋРІР‚С›Р В РЎвЂўР РЋР вЂљР В РЎВР В Р’В°Р РЋРІР‚С™Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР РЏ Р В РўвЂР В Р’В°Р РЋРІР‚С™Р РЋРІР‚в„– Р В Р’В±Р В Р’ВµР В Р’В· Р В РЎвЂ“Р В РЎвЂўР В РўвЂР В Р’В° Р В РўвЂР В Р’В»Р РЋР РЏ UI (Р В РўвЂР В РўвЂ MMM)
  function gymFormatDateNoYear(dateStr) {
    if (!dateStr) return 'Р Р†Р вЂљРІР‚Сњ';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const months = ['Р РЋР РЏР В Р вЂ¦Р В Р вЂ ', 'Р РЋРІР‚С›Р В Р’ВµР В Р вЂ ', 'Р В РЎВР В Р’В°Р РЋР вЂљ', 'Р В Р’В°Р В РЎвЂ”Р РЋР вЂљ', 'Р В РЎВР В Р’В°Р В РІвЂћвЂ“', 'Р В РЎвЂР РЋР вЂ№Р В Р вЂ¦', 'Р В РЎвЂР РЋР вЂ№Р В Р’В»', 'Р В Р’В°Р В Р вЂ Р В РЎвЂ“', 'Р РЋР С“Р В Р’ВµР В Р вЂ¦', 'Р В РЎвЂўР В РЎвЂќР РЋРІР‚С™', 'Р В Р вЂ¦Р В РЎвЂўР РЋР РЏ', 'Р В РўвЂР В Р’ВµР В РЎвЂќ'];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    } catch (e) {
      return dateStr;
    }
  }

  // Р В Р’В¦Р В Р’ВµР В Р вЂ¦Р РЋРІР‚С™Р РЋР вЂљР В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р В Р’В°Р РЋР РЏ Р РЋРІР‚С›Р РЋРЎвЂњР В Р вЂ¦Р В РЎвЂќР РЋРІР‚В Р В РЎвЂР РЋР РЏ Р РЋР С“Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ GYM-Р РЋР С“Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂўР РЋР РЏР В Р вЂ¦Р В РЎвЂР РЋР РЏ
  // Р В РІР‚в„ўР РЋР С“Р В Р’Вµ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р В РЎвЂР РЋР С“Р В РЎвЂ Р В Р вЂ  storage Р В РўвЂР В РЎвЂўР В Р’В»Р В Р’В¶Р В Р вЂ¦Р РЋРІР‚в„– Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚В¦Р В РЎвЂўР В РўвЂР В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р РЋРІР‚РЋР В Р’ВµР РЋР вЂљР В Р’ВµР В Р’В· Р РЋР РЉР РЋРІР‚С™Р РЋРЎвЂњ Р РЋРІР‚С›Р РЋРЎвЂњР В Р вЂ¦Р В РЎвЂќР РЋРІР‚В Р В РЎвЂР РЋР вЂ№
  function gymPersistState() {
    // Debug logging for key operations
    if (typeof console !== 'undefined' && console.log) {
      const period = gymGetActivePeriod();
      console.log('[GYM persist]', {
        periodsCount: Object.keys(gymState.periods || {}).length,
        activePeriod: period?.id,
        currentCycle: gymState.runtime?.[period?.id]?.currentCycle,
        completedWorkouts: gymState.completedWorkouts?.length || 0
      });
    }
    // Use existing gymSaveState if available, otherwise fallback
    if (typeof gymSaveState === 'function') {
      gymSaveState(gymState);
    } else if (typeof localStorage !== 'undefined') {
      // Fallback: direct localStorage save
      localStorage.setItem('leakfixer_gym_data', JSON.stringify(gymState));
    }
  }

  // Р В Р’В¦Р В Р’ВµР В Р вЂ¦Р РЋРІР‚С™Р РЋР вЂљР В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р В Р’В°Р РЋР РЏ Р РЋРІР‚С›Р РЋРЎвЂњР В Р вЂ¦Р В РЎвЂќР РЋРІР‚В Р В РЎвЂР РЋР РЏ Р РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РўвЂР В Р’ВµР РЋР вЂљР В Р’В° Р В Р вЂ Р РЋР С“Р В Р’ВµР В РЎвЂ“Р В РЎвЂў GYM UI
  // Р В РІР‚в„ўР РЋРІР‚в„–Р В Р’В·Р РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР РЋРІР‚С™ Р В Р вЂ Р РЋР С“Р В Р’Вµ Р В Р вЂ¦Р В Р’ВµР В РЎвЂўР В Р’В±Р РЋРІР‚В¦Р В РЎвЂўР В РўвЂР В РЎвЂР В РЎВР РЋРІР‚в„–Р В Р’Вµ Р РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РўвЂР В Р’ВµР РЋР вЂљ-Р РЋРІР‚С›Р РЋРЎвЂњР В Р вЂ¦Р В РЎвЂќР РЋРІР‚В Р В РЎвЂР В РЎвЂ
  function gymRenderAll() {
    const period = gymGetActivePeriod();
    
    // Debug logging
    if (typeof console !== 'undefined' && console.log) {
      console.log('[GYM render]', {
        activePeriod: period?.id,
        currentCycle: gymState.runtime?.[period?.id]?.currentCycle,
        hasGroupsContainer: !!gymEl?.groupsContainer
      });
    }
    
    // Always render periods list if visible
    if (gymEl?.periodsScreen && !gymEl.periodsScreen.classList.contains('hidden')) {
      gymRenderPeriodsList();
    }
    
    // Render current period UI if active
    if (period) {
      gymRenderHeader();
      gymRenderGroups();
    }
  }
  
  function gymLoadState() {
    try {
      const raw = localStorage.getItem(GYM_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.periods) return parsed;
      }
    } catch (e) {}
    return {
      periods: {},
      periodOrder: [],
      activePeriodId: null,
    };    
  }
  
  function gymSaveState(state) {
    localStorage.setItem(GYM_STORAGE_KEY, JSON.stringify(state));
  }

  let gymState = gymLoadState();
   // Р В Р вЂ Р РЋР вЂљР В Р’ВµР В РЎВР В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р В Р’В±Р РЋРЎвЂњР РЋРІР‚С›Р В Р’ВµР РЋР вЂљ Р В РўвЂР В Р’В»Р РЋР РЏ Р В РЎВР В Р’В°Р РЋР С“Р РЋРІР‚С™Р В Р’ВµР РЋР вЂљР В Р’В° Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В Р’В°
  let gymPeriodWizardDraft = null;

  window.gymDebug = {
    getState: () => gymState,
  };
  

  function gymMigrateRuntime(oldRuntime) {
    if (!oldRuntime || typeof oldRuntime !== 'object') return {};
  
    const migrated = {};
  
    Object.entries(oldRuntime).forEach(([periodId, data]) => {
      const cur = {
        currentCycle: data.currentCycle || data.currentCycleIndex || 1,
        totalCycles: data.totalCycles || 8,
        periodDone: data.periodDone || 1,
        cycles: {},
      };
  
      // Р РЋР С“Р РЋРІР‚С™Р В Р’В°Р РЋР вЂљР РЋРІР‚в„–Р В РІвЂћвЂ“ Р РЋРІР‚С›Р В РЎвЂўР РЋР вЂљР В РЎВР В Р’В°Р РЋРІР‚С™: cycles Р В РЎвЂќР В Р’В°Р В РЎвЂќ Р В РЎВР В Р’В°Р РЋР С“Р РЋР С“Р В РЎвЂР В Р вЂ 
      if (Array.isArray(data.cycles)) {
        data.cycles.forEach((c, idx) => {
          if (!c || typeof c !== 'object') return;
          const key = c.currentCycle || c.index || (idx + 1);
          cur.cycles[key] = {
            days: c.days || {},
            groups: c.groups || {},
          };
        });
      }
  
      // Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р РЋРІР‚С›Р В РЎвЂўР РЋР вЂљР В РЎВР В Р’В°Р РЋРІР‚С™: cycles Р В РЎвЂќР В Р’В°Р В РЎвЂќ Р В РЎвЂўР В Р’В±Р РЋР вЂ°Р В Р’ВµР В РЎвЂќР РЋРІР‚С™
      if (data.cycles && !Array.isArray(data.cycles)) {
        Object.entries(data.cycles).forEach(([k, c]) => {
          if (!c || typeof c !== 'object') return;
          cur.cycles[k] = {
            days: c.days || {},
            groups: c.groups || {},
          };
        });
      }
  
      // Р В РЎвЂ“Р В Р’В°Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р РЋРІР‚С™Р В РЎвЂР РЋР вЂљР РЋРЎвЂњР В Р’ВµР В РЎВ Р РЋРІР‚В¦Р В РЎвЂўР РЋРІР‚С™Р РЋР РЏ Р В Р’В±Р РЋРІР‚в„– Р РЋРІР‚В Р В РЎвЂР В РЎвЂќР В Р’В» 1
      if (!Object.keys(cur.cycles).length) {
        cur.cycles[cur.currentCycle] = { days: {}, groups: {} };
      }
  
      migrated[periodId] = cur;
    });
  
    return migrated;
  }
  
  // Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В РЎВР В Р’ВµР В Р вЂ¦Р РЋР РЏР В Р’ВµР В РЎВ Р В РЎВР В РЎвЂР В РЎвЂ“Р РЋР вЂљР В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР вЂ№
  if (!gymState.runtime) gymState.runtime = {};
  gymState.runtime = gymMigrateRuntime(gymState.runtime);
  


  function gymCreatePeriodId() {
    const n = (gymState.periodOrder?.length || 0) + 1;
    return 'period_' + n;
  }

  function gymGetActivePeriod() {
    if (!gymState.activePeriodId) return null;
    return gymState.periods[gymState.activePeriodId] || null;
  }

  function gymSetActivePeriod(periodId) {
    gymState.activePeriodId = periodId;
    gymSaveState(gymState);
  }

  function gymCreateNextCycle() {
    const period = gymGetActivePeriod();
    if (!period) return;
  
    if (!gymState.runtime) gymState.runtime = {};
    if (!gymState.runtime[period.id]) {
      gymState.runtime[period.id] = { currentCycle: 1, totalCycles: 8, periodDone: 1, cycles: {} };
    }
  
    const rt = gymState.runtime[period.id];
    const currentCycle = rt.currentCycle || 1;
  
    if (!rt.cycles) rt.cycles = {};
    if (!rt.cycles[currentCycle]) {
      rt.cycles[currentCycle] = { days: {}, groups: {} };
    }
    const currentRuntime = rt.cycles[currentCycle];
  
    const nextCycle = currentCycle + 1;
    // snapshot current cycle into completedCycles storage (only structure, not actual data)
    if (!gymState.completedCycles) gymState.completedCycles = {};
    if (!gymState.completedCycles[period.id]) gymState.completedCycles[period.id] = {};
    try {
      // Only save structure, not actual workout data (weights, reps, completion flags)
      const structureOnly = {
        days: JSON.parse(JSON.stringify(currentRuntime.days || {})),
        groups: {},
      };
      // Clear actual data from groups - keep only exercise names
      Object.keys(structureOnly.days).forEach(dIdx => {
        const day = structureOnly.days[dIdx];
        if (day && day.groups) {
          Object.keys(day.groups).forEach(gName => {
            const arr = day.groups[gName];
            if (Array.isArray(arr)) {
              day.groups[gName] = arr.map(ex => ex ? { name: ex.name || '' } : null);
            }
          });
        }
      });
      gymState.completedCycles[period.id][currentCycle] = {
        savedAt: new Date().toISOString(),
        data: structureOnly,
      };
    } catch (e) {
      // ignore clone errors
    }
    // determine maximum allowed cycles for this period
    const maxCycles = (period && Number(period.totalCycles)) || (rt && Number(rt.totalCycles)) || 8;

    // do not create a next cycle beyond the period's configured totalCycles
    if (nextCycle > maxCycles) {
      return;
    }

    const nextRuntimeDays = {};
    const baseDays = Array.isArray(period.days) ? period.days : [];

    baseDays.forEach((d) => {
      const dayIndex = d.dayIndex;
      const prevDayRuntime = currentRuntime.days?.[dayIndex];

      // Skip extra days - they should stay only in the current cycle
      if (prevDayRuntime && prevDayRuntime.isExtra) return;

      const enabled = prevDayRuntime ? prevDayRuntime.enabled !== false : true;
      if (!enabled) return;

      // Copy only structure: day enabled flag and exercise names
      // Do NOT copy actual data (weights, reps, completion flags)
      nextRuntimeDays[dayIndex] = {
        enabled: true,
        groups: {},
        muscles: prevDayRuntime && prevDayRuntime.muscles ? [...prevDayRuntime.muscles] : [],
      };
    });

    rt.currentCycle = nextCycle;
    if (!rt.cycles[nextCycle]) {
      rt.cycles[nextCycle] = { days: {}, groups: {} };
    }
    rt.cycles[nextCycle].days = nextRuntimeDays;

    // If exercises include a nextCyclePlan, prefill workWeight in the new cycle from that plan
    // Then clear nextCyclePlan for the new cycle
    Object.keys(nextRuntimeDays).forEach((dIdx) => {
      const d = nextRuntimeDays[dIdx];
      if (!d || !d.groups) return;
      Object.keys(d.groups).forEach((gName) => {
        const arr = d.groups[gName] || [];
        if (!Array.isArray(arr)) return;
        arr.forEach((ex) => {
          if (!ex) return;
          // Reset working sets to empty in new cycle
          ex.setsCount = '';
          ex.repsCount = '';
          ex.workWeight = '';
          // Transfer "plan for next cycle" to weight
          if (ex.nextCyclePlan) {
            ex.workWeight = ex.nextCyclePlan;
            ex.nextCyclePlan = ''; // Clear after transfer
          }
        });
      });
    });

    // Set current date for the new cycle (for immediate rendering)
    const today = new Date().toISOString().slice(0, 10);
    if (!gymState.periodStartDates) gymState.periodStartDates = {};
    // Calculate the projected start date for this cycle
    const cycleLen = Number(period.cycleLengthDays) || 7;
    const projectedDate = new Date(new Date(today).getTime() + (nextCycle - 1) * cycleLen * 24 * 60 * 60 * 1000);
    gymState.periodStartDates[period.id + '_cycle' + nextCycle] = projectedDate.toISOString().slice(0, 10);

    // keep runtime.totalCycles in sync but never exceed period.totalCycles
    rt.totalCycles = Math.min(maxCycles, Math.max(Number(rt.totalCycles) || 1, nextCycle));
    rt.periodDone = Math.min(maxCycles, Math.max(Number(rt.periodDone) || 1, nextCycle));
  
    // Debug logging for next cycle creation
    if (typeof console !== 'undefined' && console.log) {
      console.log('[GYM] Created next cycle:', {
        periodId: period.id,
        previousCycle: currentCycle,
        newCycle: nextCycle,
        maxCycles: maxCycles,
        nextCycleDays: Object.keys(nextRuntimeDays)
      });
    }
  
    gymPersistState();
    gymRenderAll();
  }
  
  
  if (gymEl.newCycleBtn) {
    gymEl.newCycleBtn.addEventListener('click', gymCreateNextCycle);
  }
  
  // Р В РЎвЂєР В Р’В±Р РЋР вЂљР В Р’В°Р В Р’В±Р В РЎвЂўР РЋРІР‚С™Р РЋРІР‚РЋР В РЎвЂР В РЎвЂќ Р РЋР С“Р В РЎвЂўР В Р’В·Р В РўвЂР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР РЏ Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В РЎвЂўР В РЎвЂ“Р В РЎвЂў Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В Р’В° (Р В РЎвЂќР В Р вЂ¦Р В РЎвЂўР В РЎвЂ”Р В РЎвЂќР В Р’В° "Р В Р Р‹Р В РЎвЂўР В Р’В·Р В РўвЂР В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂ" Р В Р вЂ  Р В РЎВР В Р’В°Р РЋР С“Р РЋРІР‚С™Р В Р’ВµР РЋР вЂљР В Р’Вµ)
  if (gymEl.periodStep2CreateBtn) {
    gymEl.periodStep2CreateBtn.addEventListener('click', () => {
      if (!gymPeriodWizardDraft) return;
      
      const periodId = gymCreatePeriodId();
      const today = new Date().toISOString().slice(0, 10);
      
      // Р В Р Р‹Р В РЎвЂўР В Р’В±Р В РЎвЂР РЋР вЂљР В Р’В°Р В Р’ВµР В РЎВ Р В РўвЂР В Р вЂ¦Р В РЎвЂ Р В РЎвЂР В Р’В· DOM (Р РЋРІвЂљВ¬Р В Р’В°Р В РЎвЂ“ 2 Р В РЎВР В Р’В°Р РЋР С“Р РЋРІР‚С™Р В Р’ВµР РЋР вЂљР В Р’В°)
      const days = [];
      if (gymEl.periodDaysContainer) {
        const dayDivs = gymEl.periodDaysContainer.querySelectorAll('[data-day-index]');
        dayDivs.forEach(div => {
          const dayIndex = Number(div.dataset.dayIndex);
          const musclesInput = div.querySelector('[data-field="muscles"]');
          const muscles = musclesInput ? (musclesInput.value || '').split(',').map(s => s.trim()).filter(Boolean) : [];
          const enabledCheckbox = div.querySelector('[data-field="dayEnabled"]');
          const enabled = enabledCheckbox ? enabledCheckbox.checked : true;
          
          if (enabled) {
            days.push({ dayIndex, muscles });
          }
        });
      }
      
      // Р В Р Р‹Р В РЎвЂўР В Р’В·Р В РўвЂР В Р’В°Р РЋРІР‚ВР В РЎВ Р В РЎСљР В РЎвЂєР В РІР‚в„ўР В Р’В«Р В РІвЂћСћ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂ Р В Р’В±Р В Р’ВµР В Р’В· Р В Р вЂ¦Р В Р’В°Р РЋР С“Р В Р’В»Р В Р’ВµР В РўвЂР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР РЏ Р В РЎвЂР РЋР С“Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР В РЎвЂР В РЎвЂ Р В РЎвЂўР РЋРІР‚С™ Р РЋР С“Р РЋРІР‚С™Р В Р’В°Р РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚В¦ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В РЎвЂўР В Р вЂ 
      const newPeriod = {
        id: periodId,
        name: gymPeriodWizardDraft.name || 'Р В РЎСџР В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂ',
        type: gymPeriodWizardDraft.type || 'strength',
        splitType: gymPeriodWizardDraft.splitType || 'split',
        cycleLengthDays: gymPeriodWizardDraft.cycleLengthDays || 7,
        totalCycles: gymPeriodWizardDraft.totalCycles || 8,
        workoutsPerCycle: gymPeriodWizardDraft.workoutsPerCycle || 3,
        days: days,
        startDate: today, // Р В Р в‚¬Р РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р вЂ¦Р В Р’В°Р В Р вЂ Р В Р’В»Р В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р РЋРІР‚С™Р В Р’ВµР В РЎвЂќР РЋРЎвЂњР РЋРІР‚В°Р РЋРЎвЂњР РЋР вЂ№ Р В РўвЂР В Р’В°Р РЋРІР‚С™Р РЋРЎвЂњ Р РЋР С“Р РЋР вЂљР В Р’В°Р В Р’В·Р РЋРЎвЂњ
        // Р В РЎСљР В РІР‚Сћ Р В РЎвЂќР В РЎвЂўР В РЎвЂ”Р В РЎвЂР РЋР вЂљР РЋРЎвЂњР В Р’ВµР В РЎВ Р В Р вЂ¦Р В РЎвЂР В РЎвЂќР В Р’В°Р В РЎвЂќР В РЎвЂР В Р’Вµ Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В Р’Вµ Р В РЎвЂР В Р’В· Р РЋР С“Р РЋРІР‚С™Р В Р’В°Р РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚В¦ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В РЎвЂўР В Р вЂ :
        // - Р В Р вЂ¦Р В Р’ВµР РЋРІР‚С™ history
        // - Р В Р вЂ¦Р В Р’ВµР РЋРІР‚С™ completedWorkouts
        // - Р В Р вЂ¦Р В Р’ВµР РЋРІР‚С™ previousPeriodData
      };

      // Debug logging
      if (typeof console !== 'undefined' && console.log) {
        console.log('[GYM] Created new period:', {
          periodId: newPeriod.id,
          name: newPeriod.name,
          startDate: newPeriod.startDate,
          daysCount: days.length
        });
      }
      
      // Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР В РЎВ Р В Р вЂ  state
      if (!gymState.periods) gymState.periods = {};
      gymState.periods[periodId] = newPeriod;
      
      if (!gymState.periodOrder) gymState.periodOrder = [];
      gymState.periodOrder.push(periodId);
      
      // Р В Р’ВР В Р вЂ¦Р В РЎвЂР РЋРІР‚В Р В РЎвЂР В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р В РЎвЂР РЋР вЂљР РЋРЎвЂњР В Р’ВµР В РЎВ runtime Р В РўвЂР В Р’В»Р РЋР РЏ Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В РЎвЂўР В РЎвЂ“Р В РЎвЂў Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В Р’В° - Р РЋРІР‚РЋР В РЎвЂР РЋР С“Р РЋРІР‚С™Р РЋРІР‚в„–Р В РІвЂћвЂ“, Р В Р’В±Р В Р’ВµР В Р’В· Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦
      if (!gymState.runtime) gymState.runtime = {};
      const initialDays = {};
      days.forEach(d => {
        initialDays[d.dayIndex] = { enabled: true, groups: {}, muscles: d.muscles || [] };
      });
      
      gymState.runtime[periodId] = {
        currentCycle: 1,
        totalCycles: newPeriod.totalCycles,
        periodDone: 1,
        cycles: {
          1: { days: initialDays, groups: {} },
        },
      };
      
      // Р В Р Р‹Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р РЋР РЏР В Р’ВµР В РЎВ Р В РЎвЂ Р РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РўвЂР В Р’ВµР РЋР вЂљР В РЎвЂР В РЎВ
      gymPersistState();
      
      // Р В РІР‚вЂќР В Р’В°Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р В РЎВР В Р’В°Р РЋР С“Р РЋРІР‚С™Р В Р’ВµР РЋР вЂљ Р В РЎвЂ Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂ
      if (gymEl.periodWizardScreen) gymEl.periodWizardScreen.classList.add('hidden');
      
      // Р В РЎвЂєР РЋРІР‚С™Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р РЋР С“Р В РЎвЂ”Р В РЎвЂР РЋР С“Р В РЎвЂўР В РЎвЂќ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В РЎвЂўР В Р вЂ  - Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂ Р В Р’В±Р РЋРЎвЂњР В РўвЂР В Р’ВµР РЋРІР‚С™ Р В Р вЂ Р В РЎвЂР В РўвЂР В Р’ВµР В Р вЂ¦
      gymOpenPeriodsScreen();
      
      // Р В РЎвЂ™Р В Р вЂ Р РЋРІР‚С™Р В РЎвЂўР В РЎВР В Р’В°Р РЋРІР‚С™Р В РЎвЂР РЋРІР‚РЋР В Р’ВµР РЋР С“Р В РЎвЂќР В РЎвЂ Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р РЋР С“Р В РЎвЂўР В Р’В·Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂ
      gymSetActivePeriod(periodId);
      gymOpen();
    });
  }
  
  function gymSaveCurrentCycleDefinition() {
    const period = gymGetActivePeriod();
    if (!period || !gymEl.groupsContainer) return;

    // Р В Р’В±Р В Р’В°Р В Р’В·Р В РЎвЂўР В Р вЂ Р В Р’В°Р РЋР РЏ Р В РЎвЂќР В Р’В°Р РЋР вЂљР РЋРІР‚С™Р В Р’В° Р РЋРІР‚С™Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В РЎвЂќР В РЎвЂў Р РЋР С“ dayIndex + muscles
    const daysMap = new Map();
    const baseDays = Array.isArray(period.days) ? period.days : [];
    baseDays.forEach((d) => {
      daysMap.set(d.dayIndex, {
        dayIndex: d.dayIndex,
        muscles: Array.isArray(d.muscles) ? d.muscles.slice() : [],
      });
    });
  
    // Р В РЎвЂ”Р В РЎвЂўР В Р вЂ Р В Р’ВµР РЋР вЂљР РЋРІР‚В¦ Р В Р вЂ¦Р В Р’В°Р В РЎвЂќР В Р’В°Р РЋРІР‚С™Р РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р РЋРІР‚С™Р В РЎвЂў, Р РЋРІР‚РЋР РЋРІР‚С™Р В РЎвЂў Р РЋР С“Р В Р’ВµР В РІвЂћвЂ“Р РЋРІР‚РЋР В Р’В°Р РЋР С“ Р В Р вЂ  DOM
    const wrappers = gymEl.groupsContainer.querySelectorAll('[data-day-index]');
    wrappers.forEach((wrapper) => {
      const dayIndex = Number(wrapper.dataset.dayIndex || '1');
      const musclesInput = wrapper.querySelector(
        `input[data-role="dayMusclesInput"][data-day-index="${dayIndex}"]`
      );
  
      if (!musclesInput) return;
  
      const rawMuscles = musclesInput.value || '';
      const muscles = rawMuscles
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
  
      daysMap.set(dayIndex, {
        dayIndex,
        muscles,
      });
    });
  
    const updatedDays = Array.from(daysMap.values()).sort((a, b) => a.dayIndex - b.dayIndex);
    period.days = updatedDays;
  
    // Persist template update
    gymSaveState(gymState);

    // Now treat this action as 'Save cycle' behavior: propagate current cycle's active days to future cycles
    if (!gymState.runtime) gymState.runtime = {};
    if (!gymState.runtime[period.id]) gymState.runtime[period.id] = { currentCycle: 1, totalCycles: period.totalCycles || 1, periodDone: 1, cycles: {} };
    const rtFull = gymState.runtime[period.id];
    const currentCycleIndex = Number(rtFull.currentCycle) || 1;
    if (!rtFull.cycles) rtFull.cycles = {};
    const currentCycleRuntime = rtFull.cycles[currentCycleIndex] || { days: {}, groups: {} };

    // collect active days from current cycle runtime (enabled !== false) or from template
    const activeDayIndexes = new Set();
    Object.keys(currentCycleRuntime.days || {}).forEach(k => {
      const d = currentCycleRuntime.days[k] || {};
      if (d.enabled !== false) activeDayIndexes.add(Number(k));
    });
    // also include template days (they are by definition active in template)
    (period.days || []).forEach(d => { if (d && d.dayIndex) activeDayIndexes.add(Number(d.dayIndex)); });

    const maxCycles = Number(period.totalCycles) || Number(rtFull.totalCycles) || 1;

    // Ensure period.days includes any newly active runtime-only days
    const templateMap = new Map((period.days || []).map(d => [Number(d.dayIndex), d]));
    activeDayIndexes.forEach((idx) => {
      if (!templateMap.has(idx)) {
        // try to get muscles from runtime if present
        const runtimeDay = currentCycleRuntime.days && currentCycleRuntime.days[idx] ? currentCycleRuntime.days[idx] : {};
        templateMap.set(idx, { dayIndex: idx, muscles: Array.isArray(runtimeDay.muscles) ? runtimeDay.muscles.slice() : [] });
      }
    });

    period.days = Array.from(templateMap.values()).sort((a,b)=>a.dayIndex-b.dayIndex);

    // Propagate the active days structure (muscles + groups/exercises) forward to all future cycles
    // Propagate the active days structure (muscles + exercise NAMES ONLY) forward to all future cycles
    // IMPORTANT: Do NOT copy actual workout data (weights, reps, completion flags) - only structure
    for (let c = currentCycleIndex + 1; c <= maxCycles; c += 1) {
      if (!rtFull.cycles[c]) rtFull.cycles[c] = { days: {}, groups: {} };
      const dest = rtFull.cycles[c];
      activeDayIndexes.forEach((idx) => {
        const srcDay = currentCycleRuntime.days && currentCycleRuntime.days[idx] ? currentCycleRuntime.days[idx] : {};
        
        // Copy only exercise NAMES, not actual workout data (weights, reps, etc.)
        let targetGroups = {};
        if (srcDay.groups && typeof srcDay.groups === 'object') {
          Object.keys(srcDay.groups).forEach(gName => {
            const arr = srcDay.groups[gName];
            if (Array.isArray(arr)) {
              // Keep only exercise names, clear all actual data
              targetGroups[gName] = arr.map(ex => ex ? { name: ex.name || '' } : null);
            }
          });
        }
        
        dest.days[idx] = {
          enabled: true,
          groups: targetGroups,
          muscles: Array.isArray(srcDay.muscles) ? srcDay.muscles.slice() : (templateMap.get(idx)?.muscles || []),
        };
      });
    }

    // keep runtime totals in sync
    rtFull.totalCycles = Math.min(maxCycles, Math.max(Number(rtFull.totalCycles) || 1, rtFull.totalCycles || maxCycles));
    gymSaveState(gymState);
    gymRenderGroups();
  }
  
  

  function gymOpenPeriodWizardStep1() {
    if (!gymEl.periodWizardScreen) return;
  
    // Р В РЎВР РЋРІР‚в„– Р РЋРЎвЂњР В Р’В¶Р В Р’Вµ Р В Р вЂ Р В Р вЂ¦Р РЋРЎвЂњР РЋРІР‚С™Р РЋР вЂљР В РЎвЂ Р РЋРІР‚С›Р В РЎвЂР РЋРІР‚С™Р В Р вЂ¦Р В Р’ВµР РЋР С“Р В Р’В°, Р В РЎвЂ”Р РЋР вЂљР РЋР РЏР РЋРІР‚РЋР В Р’ВµР В РЎВ Р РЋР С“Р В РЎвЂ”Р В РЎвЂР РЋР С“Р В РЎвЂўР В РЎвЂќ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В РЎвЂўР В Р вЂ  Р В РЎвЂ Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦ Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р В РЎвЂќР РЋР вЂљР В Р’ВµР РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂўР В РЎвЂ“Р В РЎвЂў Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В Р’В°
    if (gymEl.periodsScreen) gymEl.periodsScreen.classList.add('hidden');
    if (gymEl.screen) gymEl.screen.classList.add('hidden');
  
    // Р РЋРІР‚С›Р В РЎвЂР РЋРІР‚С™Р В Р вЂ¦Р В Р’ВµР РЋР С“-Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦ Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В Р’В°Р РЋРІР‚ВР РЋРІР‚С™Р РЋР С“Р РЋР РЏ Р В Р вЂ Р В РЎвЂР В РўвЂР В РЎвЂР В РЎВР РЋРІР‚в„–Р В РЎВ, Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂў Р В РЎвЂ”Р В РЎвЂўР В РЎвЂќР В Р’В°Р В Р’В·Р РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р В Р вЂ  Р В Р вЂ¦Р РЋРІР‚ВР В РЎВ Р В РЎВР В Р’В°Р РЋР С“Р РЋРІР‚С™Р В Р’ВµР РЋР вЂљ
    if (fitnessEl?.screen) fitnessEl.screen.classList.remove('hidden');
  
    gymEl.periodWizardScreen.classList.remove('hidden');
    if (gymEl.periodStep1) gymEl.periodStep1.classList.remove('hidden');
    if (gymEl.periodStep2) gymEl.periodStep2.classList.add('hidden');
  
    gymPeriodWizardDraft = {
      type: 'strength',
      name: 'Р В РЎСљР В Р’В° Р РЋР С“Р В РЎвЂР В Р’В»Р РЋРЎвЂњ',
      splitType: 'split',
      cycleLengthDays: 7,
      totalCycles: 8,
      workoutsPerCycle: 3,   // Р В РЎСљР В РЎвЂєР В РІР‚в„ўР В РЎвЂєР В РІР‚Сћ
      days: [],
    };    
  
    const cycleLenInput = document.getElementById('gymPeriodCycleLength');
    const totalCyclesInput = document.getElementById('gymPeriodTotalCycles');
    const customNameInput = document.getElementById('gymPeriodCustomName');
    const wpcInput = document.getElementById('gymPeriodWorkoutsPerCycle');
  
    if (cycleLenInput) cycleLenInput.value = '7';
    if (totalCyclesInput) totalCyclesInput.value = '8';
    if (customNameInput) customNameInput.value = '';
    if (wpcInput) wpcInput.value = String(gymPeriodWizardDraft.workoutsPerCycle || 3);
  }
  

  
  function gymClosePeriodWizard() {
    if (gymEl.periodWizardScreen) gymEl.periodWizardScreen.classList.add('hidden');
    // Р В Р вЂ Р В РЎвЂўР В Р’В·Р В Р вЂ Р РЋР вЂљР В Р’В°Р РЋРІР‚В°Р В Р’В°Р В Р’ВµР В РЎВР РЋР С“Р РЋР РЏ Р В РЎвЂќ Р РЋР С“Р В РЎвЂ”Р В РЎвЂР РЋР С“Р В РЎвЂќР РЋРЎвЂњ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В РЎвЂўР В Р вЂ 
    gymOpenPeriodsScreen();
  }  

  // Р В РЎв„ўР В Р вЂ¦Р В РЎвЂўР В РЎвЂ”Р В РЎвЂќР В Р’В° "Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В РўвЂР В Р’ВµР В Р вЂ¦Р РЋР Р‰ Р В Р вЂ  Р РЋРІР‚В Р В РЎвЂР В РЎвЂќР В Р’В»" Р В Р вЂ¦Р В Р’В° Р РЋРІвЂљВ¬Р В Р’В°Р В РЎвЂ“Р В Р’Вµ 2 Р В РЎВР В Р’В°Р РЋР С“Р РЋРІР‚С™Р В Р’ВµР РЋР вЂљР В Р’В° Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В Р’В°
  const addDayBtn = document.getElementById('gymPeriodAddDayBtn');

  if (addDayBtn && gymEl.periodDaysContainer) {
    addDayBtn.addEventListener('click', () => {
      const existing = gymEl.periodDaysContainer
        .querySelectorAll('[data-day-index]');
      const nextIndex = existing.length + 1;

      const dayDiv = document.createElement('div');
      dayDiv.className = 'bg-white/10 rounded-xl px-3 py-3 space-y-2';
      dayDiv.dataset.dayIndex = String(nextIndex);

      dayDiv.innerHTML = `
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium text-white">Р В РІР‚СњР В Р’ВµР В Р вЂ¦Р РЋР Р‰ ${nextIndex}</span>
          <button type="button"
            data-role="deleteDay"
            class="text-11px text-red-300 underline">
            Р РЋРЎвЂњР В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰
          </button>
        </div>

        <label class="flex items-center gap-1 text-11px text-slate-200">
          <input
            type="checkbox"
            data-field="dayEnabled"
            class="accent-emerald-400"
            checked
          >
          <span>Р В РІР‚СњР В Р’ВµР В Р вЂ¦Р РЋР Р‰ Р В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР В Р вЂ Р В Р’ВµР В Р вЂ¦</span>
        </label>

        <div class="text-11px text-slate-300 mb-1">Р В РІР‚СљР РЋР вЂљР РЋРЎвЂњР В РЎвЂ”Р В РЎвЂ”Р РЋРІР‚в„– Р В РЎВР РЋРІР‚в„–Р РЋРІвЂљВ¬Р РЋРІР‚В </div>
        <div data-role="muscleList" class="space-y-1"></div>

        <button
          type="button"
          data-role="addMuscleGroup"
          class="mt-1 text-11px text-emerald-300 underline"
        >
          Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В РЎвЂ”Р В РЎвЂ”Р РЋРЎвЂњ Р В РЎВР РЋРІР‚в„–Р РЋРІвЂљВ¬Р РЋРІР‚В 
        </button>
      `;

      const muscleList = dayDiv.querySelector('[data-role="muscleList"]');
      if (muscleList) {
        const g = document.createElement('div');
        g.className = 'flex items-center gap-1';
        g.innerHTML = `
          <input
            type="text"
            class="flex-1 bg-white/15 rounded-lg px-2 py-1 text-xs text-white"
            placeholder="Р В РІР‚СљР РЋР вЂљР РЋРЎвЂњР В РўвЂР РЋР Р‰, Р РЋР С“Р В РЎвЂ”Р В РЎвЂР В Р вЂ¦Р В Р’В°Р Р†Р вЂљР’В¦"
            data-field="muscleGroupName"
          >
        `;
        muscleList.appendChild(g);
      }

      dayDiv
        .querySelector('button[data-role="deleteDay"]')
        ?.addEventListener('click', () => dayDiv.remove());

      dayDiv
        .querySelector('button[data-role="addMuscleGroup"]')
        ?.addEventListener('click', (e) => {
          const container = (e.target).closest('[data-day-index]');
          if (!container) return;
          const list = container.querySelector('[data-role="muscleList"]');
          if (!list) return;
          const g2 = document.createElement('div');
          g2.className = 'flex items-center gap-1';
          g2.innerHTML = `
            <input
              type="text"
              class="flex-1 bg-white/15 rounded-lg px-2 py-1 text-xs text-white"
              placeholder="Р В РІР‚СљР РЋР вЂљР РЋРЎвЂњР В РЎвЂ”Р В РЎвЂ”Р В Р’В° Р В РЎВР РЋРІР‚в„–Р РЋРІвЂљВ¬Р РЋРІР‚В "
              data-field="muscleGroupName"
            >
          `;
          list.appendChild(g2);
        });

      gymEl.periodDaysContainer.appendChild(dayDiv);
    });
  }


  function gymPeriodWizardStep1Next() {
    if (!gymPeriodWizardDraft) return;
  
    const typeInput = document.querySelector('input[name="gymPeriodType"]:checked');
    const splitInput = document.querySelector('input[name="gymPeriodSplit"]:checked');
    const customNameInput = document.getElementById('gymPeriodCustomName');
    const cycleLenInput = document.getElementById('gymPeriodCycleLength');
    const totalCyclesInput = document.getElementById('gymPeriodTotalCycles');
    const wpcInput = document.getElementById('gymPeriodWorkoutsPerCycle');
  
    const type = typeInput?.value || 'strength';
    const splitType = splitInput?.value || 'split';
    const cycleLengthDays = Math.max(1, Number(cycleLenInput?.value || 7));
    const totalCycles = Math.max(1, Number(totalCyclesInput?.value || 8));
    const workoutsPerCycle = Math.max(1, Number(wpcInput?.value || 3) || 3);
  
    let name = 'Р В РЎСџР В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂ';
    if (type === 'strength') name = 'Р В РЎСљР В Р’В° Р РЋР С“Р В РЎвЂР В Р’В»Р РЋРЎвЂњ';
    else if (type === 'endurance') name = 'Р В РЎСљР В Р’В° Р В Р вЂ Р РЋРІР‚в„–Р В Р вЂ¦Р В РЎвЂўР РЋР С“Р В Р’В»Р В РЎвЂР В Р вЂ Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р РЋР Р‰';
    if (type === 'custom') {
      const v = (customNameInput?.value || '').trim();
      if (v) name = v;
    }
  
    gymPeriodWizardDraft.type = type;
    gymPeriodWizardDraft.splitType = splitType;
    gymPeriodWizardDraft.cycleLengthDays = cycleLengthDays;
    gymPeriodWizardDraft.totalCycles = totalCycles;
    gymPeriodWizardDraft.workoutsPerCycle = workoutsPerCycle;
    gymPeriodWizardDraft.name = name;
  
    if (!gymEl.periodDaysContainer) return;
  
    // Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В Р’ВµР В РЎвЂќР В Р’В»Р РЋР вЂ№Р РЋРІР‚РЋР В Р’В°Р В Р’ВµР В РЎВ Р РЋРІвЂљВ¬Р В Р’В°Р В РЎвЂ“Р В РЎвЂ Р В РЎВР В Р’В°Р РЋР С“Р РЋРІР‚С™Р В Р’ВµР РЋР вЂљР В Р’В°
    if (gymEl.periodStep1) gymEl.periodStep1.classList.add('hidden');
    if (gymEl.periodStep2) gymEl.periodStep2.classList.remove('hidden');
  
    // Р В РЎвЂ“Р В Р’ВµР В Р вЂ¦Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎВ N Р РЋРІР‚С™Р РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В РЎвЂўР РЋРІР‚РЋР В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В РўвЂР В Р вЂ¦Р В Р’ВµР В РІвЂћвЂ“ Р В РЎвЂ”Р В РЎвЂў workoutsPerCycle
    gymEl.periodDaysContainer.innerHTML = '';
    const wpc = gymPeriodWizardDraft.workoutsPerCycle || 3;
  
    for (let i = 1; i <= wpc; i += 1) {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'bg-white/10 rounded-xl px-3 py-3 space-y-2';
      dayDiv.dataset.dayIndex = String(i);
      dayDiv.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="font-semibold text-white text-sm">Р В РІР‚СњР В Р’ВµР В Р вЂ¦Р РЋР Р‰ ${i}</div>
          <button type="button" data-role="removeDay" class="text-[11px] text-red-300 underline">
            Р РЋРЎвЂњР В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰
          </button>
        </div>
        <label class="flex items-center gap-2 text-xs text-slate-200">
          <input type="checkbox" data-field="dayEnabled" class="accent-emerald-400" checked>
          <span>Р В РІР‚СњР В Р’ВµР В Р вЂ¦Р РЋР Р‰ Р В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР В Р вЂ Р В Р’ВµР В Р вЂ¦ (Р В РЎвЂўР РЋР С“Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р вЂ¦Р В Р’В°Р РЋР РЏ Р РЋРІР‚С™Р РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В РЎвЂќР В Р’В°)</span>
        </label>
        <input
          type="text"
          data-field="muscles"
          class="w-full bg-white/10 rounded-lg px-2 py-1 text-xs text-white"
          placeholder="Р В РІР‚СљР РЋР вЂљР РЋРЎвЂњР В РўвЂР РЋР Р‰, Р РЋР С“Р В РЎвЂ”Р В РЎвЂР В Р вЂ¦Р В Р’В°..."
        />
      `;
      gymEl.periodDaysContainer.appendChild(dayDiv);
    }
  
    // Р В РЎвЂўР В Р’В±Р РЋР вЂљР В Р’В°Р В Р’В±Р В РЎвЂўР РЋРІР‚С™Р РЋРІР‚РЋР В РЎвЂР В РЎвЂќ Р РЋРЎвЂњР В РўвЂР В Р’В°Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ Р В РўвЂР В Р вЂ¦Р РЋР РЏ
    gymEl.periodDaysContainer
      .querySelectorAll('button[data-role="removeDay"]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const dayDiv = btn.closest('[data-day-index]');
          dayDiv?.remove();
        });
      });
  }  

  // Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦ Р РЋР С“Р В РЎвЂ”Р В РЎвЂР РЋР С“Р В РЎвЂќР В Р’В° Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В РЎвЂўР В Р вЂ 
  function gymRenderPeriodsList() {
    if (!gymEl.periodsList || !gymState.periods) return;
  
    const order = Array.isArray(gymState.periodOrder)
      ? gymState.periodOrder
      : Object.keys(gymState.periods);
  
    gymEl.periodsList.innerHTML = '';
  
    if (!order.length) {
      // Р В Р вЂ¦Р В Р’ВµР РЋРІР‚С™ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В РЎвЂўР В Р вЂ  Р Р†Р вЂљРІР‚Сњ Р В РЎвЂ”Р В РЎвЂўР В РЎвЂќР В Р’В°Р В Р’В·Р РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р В Р’В·Р В Р’В°Р В РЎвЂ“Р В Р’В»Р РЋРЎвЂњР РЋРІвЂљВ¬Р В РЎвЂќР РЋРЎвЂњ
      if (gymEl.noPeriodsState) gymEl.noPeriodsState.classList.remove('hidden');
      if (gymEl.periodsListWrapper) gymEl.periodsListWrapper.classList.add('hidden');
      return;
    }
  
    if (gymEl.noPeriodsState) gymEl.noPeriodsState.classList.add('hidden');
    if (gymEl.periodsListWrapper) gymEl.periodsListWrapper.classList.remove('hidden');
  
    order.forEach(id => {
      const p = gymState.periods[id];
      if (!p) return;
  
      const card = document.createElement('div');
      card.className = 'bg-white/10 rounded-xl px-3 py-3 text-sm text-slate-100';
  
      card.innerHTML = `
        <div class="flex items-center justify-between mb-1">
          <div>
            <div class="text-sm font-semibold text-white">${p.name}</div>
            <div class="text-xs text-slate-300">
              ${p.cycleLengthDays} Р В РўвЂР В Р вЂ¦ Р вЂ™Р’В· ${p.totalCycles} Р РЋРІР‚В Р В РЎвЂР В РЎвЂќР В Р’В»Р В РЎвЂўР В Р вЂ 
            </div>
          </div>
          <div class="flex flex-col items-end gap-1">
            <button
              class="text-xs px-2 py-1 rounded-full bg-indigo-500 text-white"
              data-open-period="${p.id}"
            >
              Р В РЎвЂєР РЋРІР‚С™Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р РЋР Р‰
            </button>
            <button
              class="text-[11px] text-red-300 underline"
              data-delete-period="${p.id}"
            >
              Р В Р в‚¬Р В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰
            </button>
          </div>
        </div>
        <div class="mt-2 text-xs text-slate-300">
          <label class="block mb-1">Р В РІР‚СњР В Р’В°Р РЋРІР‚С™Р В Р’В° Р РЋР С“Р РЋРІР‚С™Р В Р’В°Р РЋР вЂљР РЋРІР‚С™Р В Р’В° Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В Р’В° (Р В РЎВР В РЎвЂўР В Р’В¶Р В Р вЂ¦Р В РЎвЂў Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В Р’ВµР В РЎвЂўР В РЎвЂ”Р РЋР вЂљР В Р’ВµР В РўвЂР В Р’ВµР В Р’В»Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰)</label>
          <input type="date" class="w-full bg-white/10 rounded-lg px-2 py-1" data-role="periodStartInput" value="${p.startDate || ''}" />
          <div class="mt-2">
            <div class="text-[11px]">Р В РЎСџР В Р’В»Р В Р’В°Р В Р вЂ¦: <span data-role="plannedRange">Р Р†Р вЂљРІР‚Сњ</span></div>
            <div class="text-[11px]">Р В Р’В¤Р В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР РЋРІР‚РЋР В Р’ВµР РЋР С“Р В РЎвЂќР В РЎвЂ: <span data-role="actualRange">Р Р†Р вЂљРІР‚Сњ</span></div>
          </div>
        </div>
      `;

      const cw = Array.isArray(gymState.completedWorkouts) ? gymState.completedWorkouts.filter(e => e.periodId === p.id) : [];

      // fill planned and actual ranges
      const plannedRangeEl = card.querySelector('[data-role="plannedRange"]');
      const actualRangeEl = card.querySelector('[data-role="actualRange"]');
      // Planned range: compute cycle start dates using completed-workout starts where available,
      // otherwise project future cycle starts by adding cycleLengthDays.
      const totalCycles = Number(p.totalCycles) || 1;
      const cycleLen = Number(p.cycleLengthDays) || 1;
      const cycleStarts = {};
      // use completed workouts' earliest date per cycle if present
      cw.forEach(r => {
        const ci = Number(r.cycleIndex) || 1;
        if (!cycleStarts[ci]) cycleStarts[ci] = r.dateCompleted;
        else if (r.dateCompleted && r.dateCompleted < cycleStarts[ci]) cycleStarts[ci] = r.dateCompleted;
      });
      // seed cycle 1 from explicit period.startDate if missing
      if (!cycleStarts[1] && p.startDate) cycleStarts[1] = p.startDate;
      // propagate projected starts
      for (let i = 1; i <= totalCycles; i++) {
        if (!cycleStarts[i]) {
          const prev = i - 1;
          if (cycleStarts[prev]) {
            const prevDate = new Date(cycleStarts[prev] + 'T00:00:00');
            const projected = new Date(prevDate.getTime() + cycleLen * 24 * 60 * 60 * 1000);
            cycleStarts[i] = projected.toISOString().slice(0,10);
          }
        }
      }

      if (plannedRangeEl) {
        if (cycleStarts[1]) {
          const lastStart = cycleStarts[totalCycles] || cycleStarts[Object.keys(cycleStarts).map(Number).sort((a,b)=>a-b).pop()];
          if (lastStart) {
            const lastStartDate = new Date(lastStart + 'T00:00:00');
            const lastEndDate = new Date(lastStartDate.getTime() + (cycleLen - 1) * 24 * 60 * 60 * 1000);
            plannedRangeEl.textContent = `${gymFormatDateNoYear(cycleStarts[1])} Р Р†Р вЂљРІР‚Сњ ${gymFormatDateNoYear(lastEndDate.toISOString().slice(0,10))}`;
          } else plannedRangeEl.textContent = 'Р Р†Р вЂљРІР‚Сњ';
        } else {
          plannedRangeEl.textContent = 'Р Р†Р вЂљРІР‚Сњ';
        }
      }

      // Actual range: start = earliest completed date; end = only set when last cycle fully completed
      if (actualRangeEl) {
        if (cw.length) {
          const sorted = cw.map(x => x.dateCompleted).filter(Boolean).sort();
          const earliest = sorted[0];
          // check completion of last cycle
          const lastCycle = Number(p.totalCycles) || 1;
          const rtFull = gymState.runtime && gymState.runtime[p.id] ? gymState.runtime[p.id] : null;
          let expectedCount = 0;
          if (rtFull && rtFull.cycles && rtFull.cycles[lastCycle] && rtFull.cycles[lastCycle].days) {
            expectedCount = Object.keys(rtFull.cycles[lastCycle].days).filter(k => (rtFull.cycles[lastCycle].days[k].enabled !== false)).length;
          }
          const completedInLast = cw.filter(e => Number(e.cycleIndex) === lastCycle);
          if (expectedCount > 0 && completedInLast.length >= expectedCount) {
            const lastDates = completedInLast.map(x => x.dateCompleted).filter(Boolean).sort();
            actualRangeEl.textContent = `${gymFormatDateNoYear(earliest)} Р Р†Р вЂљРІР‚Сњ ${gymFormatDateNoYear(lastDates[lastDates.length-1])}`;
          } else {
            actualRangeEl.textContent = `${gymFormatDateNoYear(earliest)} Р Р†Р вЂљРІР‚Сњ Р Р†Р вЂљРІР‚Сњ`;
          }
        } else {
          actualRangeEl.textContent = 'Р Р†Р вЂљРІР‚Сњ';
        }
      }

      // attach listener to start date input
      const startInput = card.querySelector('[data-role="periodStartInput"]');
      if (startInput) {
        startInput.addEventListener('change', () => {
          const v = startInput.value || null;
          gymState.periods[id].startDate = v;
          gymSaveState(gymState);
          // Recompute planned range using same logic as initial render (with completedWorkouts)
          if (plannedRangeEl) {
            const cw = Array.isArray(gymState.completedWorkouts) ? gymState.completedWorkouts.filter(e => e.periodId === p.id) : [];
            const totalCycles = Number(p.totalCycles) || 1;
            const cycleLen = Number(p.cycleLengthDays) || 1;
            const cycleStarts = {};
            // use completed workouts' earliest date per cycle if present
            cw.forEach(r => {
              const ci = Number(r.cycleIndex) || 1;
              if (!cycleStarts[ci]) cycleStarts[ci] = r.dateCompleted;
              else if (r.dateCompleted && r.dateCompleted < cycleStarts[ci]) cycleStarts[ci] = r.dateCompleted;
            });
            // seed cycle 1 from explicit period.startDate if missing
            if (!cycleStarts[1] && v) cycleStarts[1] = v;
            // propagate projected starts
            for (let i = 1; i <= totalCycles; i++) {
              if (!cycleStarts[i]) {
                const prev = i - 1;
                if (cycleStarts[prev]) {
                  const prevDate = new Date(cycleStarts[prev] + 'T00:00:00');
                  const projected = new Date(prevDate.getTime() + cycleLen * 24 * 60 * 60 * 1000);
                  cycleStarts[i] = projected.toISOString().slice(0,10);
                }
              }
            }
            if (cycleStarts[1]) {
              const lastStart = cycleStarts[totalCycles] || cycleStarts[Object.keys(cycleStarts).map(Number).sort((a,b)=>a-b).pop()];
              if (lastStart) {
                const lastStartDate = new Date(lastStart + 'T00:00:00');
                const lastEndDate = new Date(lastStartDate.getTime() + (cycleLen - 1) * 24 * 60 * 60 * 1000);
                plannedRangeEl.textContent = `${gymFormatDateNoYear(cycleStarts[1])} Р Р†Р вЂљРІР‚Сњ ${gymFormatDateNoYear(lastEndDate.toISOString().slice(0,10))}`;
              } else plannedRangeEl.textContent = 'Р Р†Р вЂљРІР‚Сњ';
            } else {
              plannedRangeEl.textContent = 'Р Р†Р вЂљРІР‚Сњ';
            }
          }
          // Re-render periods list to reflect changes
          gymRenderPeriodsList();
        });
      }
  
      gymEl.periodsList.appendChild(card);
    });
  
    // Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂ
    gymEl.periodsList.querySelectorAll('button[data-open-period]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.openPeriod;
        if (!id) return;
        gymSetActivePeriod(id);
        gymOpen(); // Р В РЎвЂ”Р В РЎвЂўР В РЎвЂќР В Р’В°Р В Р’В·Р РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР РЋРІР‚С™ Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦ Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р В РЎвЂќР РЋР вЂљР В Р’ВµР РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂўР В РЎвЂ“Р В РЎвЂў Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В Р’В°
      });
    });
  
    // Р РЋРЎвЂњР В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂ Р РЋР С“ Р В РЎвЂ”Р В РЎвЂўР В РўвЂР РЋРІР‚С™Р В Р вЂ Р В Р’ВµР РЋР вЂљР В Р’В¶Р В РўвЂР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’ВµР В РЎВ
    gymEl.periodsList.querySelectorAll('button[data-delete-period]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.deletePeriod;
        if (!id) return;
        const p = gymState.periods[id];
        const name = p?.name || 'Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂ';
        if (!confirm(`Р В РЎС›Р В РЎвЂўР РЋРІР‚РЋР В Р вЂ¦Р В РЎвЂў Р РЋРЎвЂњР В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р вЂ™Р’В«${name}Р вЂ™Р’В»? Р В Р’В­Р РЋРІР‚С™Р В РЎвЂў Р В РўвЂР В Р’ВµР В РІвЂћвЂ“Р РЋР С“Р РЋРІР‚С™Р В Р вЂ Р В РЎвЂР В Р’Вµ Р В Р вЂ¦Р В Р’ВµР В Р’В»Р РЋР Р‰Р В Р’В·Р РЋР РЏ Р В РЎвЂўР РЋРІР‚С™Р В РЎВР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰.`)) {
          return;
        }
  
        if (gymState.periods) {
          delete gymState.periods[id];
        }
        if (Array.isArray(gymState.periodOrder)) {
          gymState.periodOrder = gymState.periodOrder.filter(pid => pid !== id);
        }
        if (gymState.activePeriodId === id) {
          gymState.activePeriodId = gymState.periodOrder[0] || null;
        }
  
        gymSaveState(gymState);
        gymRenderPeriodsList();
      });
    });
  }
  

  function gymOpenPeriodsScreen() {
    if (!gymEl.periodsScreen) return;
  
    // Р РЋРІР‚С›Р В РЎвЂР РЋРІР‚С™Р В Р вЂ¦Р В Р’ВµР РЋР С“-Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦ Р В Р вЂ Р В РЎвЂќР В Р’В»Р РЋР вЂ№Р РЋРІР‚РЋР РЋРІР‚ВР В Р вЂ¦, Р В Р вЂ¦Р В РЎвЂў Р РЋР С“Р В Р’В°Р В РЎВ Р РЋРІР‚С›Р В РЎвЂР РЋРІР‚С™Р В Р вЂ¦Р В Р’ВµР РЋР С“-Р В РўвЂР В Р’В°Р РЋРІвЂљВ¬Р В Р’В±Р В РЎвЂўР РЋР вЂљР В РўвЂ Р В РЎвЂ”Р РЋР вЂљР РЋР РЏР РЋРІР‚РЋР В Р’ВµР В РЎВ
    if (fitnessEl?.screen) fitnessEl.screen.classList.remove('hidden');
    if (fitnessEl?.profileSetup) fitnessEl.profileSetup.classList.add('hidden');
    if (fitnessEl?.dashboard) fitnessEl.dashboard.classList.add('hidden');
  
    // Р В РЎвЂ”Р РЋР вЂљР РЋР РЏР РЋРІР‚РЋР В Р’ВµР В РЎВ Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦ Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р В РЎвЂќР РЋР вЂљР В Р’ВµР РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂўР В РЎвЂ“Р В РЎвЂў Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В Р’В° Р В РЎвЂ Р В РЎВР В Р’В°Р РЋР С“Р РЋРІР‚С™Р В Р’ВµР РЋР вЂљ
    if (gymEl.screen) gymEl.screen.classList.add('hidden');
    if (gymEl.periodWizardScreen) gymEl.periodWizardScreen.classList.add('hidden');
  
    // Р В РЎвЂ”Р В РЎвЂўР В РЎвЂќР В Р’В°Р В Р’В·Р РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ "Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В РЎвЂўР В Р’Вµ Р В РЎвЂўР В РЎвЂќР В Р вЂ¦Р В РЎвЂў" Р Р†Р вЂљРІР‚Сљ Р РЋР С“Р В РЎвЂ”Р В РЎвЂР РЋР С“Р В РЎвЂўР В РЎвЂќ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В РЎвЂўР В Р вЂ 
    gymRenderPeriodsList();
    gymEl.periodsScreen.classList.remove('hidden');
  }
  
  

  function gymClosePeriodsScreen() {
    if (gymEl.periodsScreen) gymEl.periodsScreen.classList.add('hidden');
  
    // Р В Р’ВµР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р РЋР Р‰ Р РЋРІР‚С›Р В РЎвЂР РЋРІР‚С™Р В Р вЂ¦Р В Р’ВµР РЋР С“-Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦ Р Р†Р вЂљРІР‚Сљ Р В Р вЂ Р В РЎвЂўР В Р’В·Р В Р вЂ Р РЋР вЂљР В Р’В°Р РЋРІР‚В°Р В Р’В°Р В Р’ВµР В РЎВР РЋР С“Р РЋР РЏ Р В РЎвЂќ Р РЋРІР‚С›Р В РЎвЂР РЋРІР‚С™Р В Р вЂ¦Р В Р’ВµР РЋР С“-Р В РўвЂР В Р’В°Р РЋРІвЂљВ¬Р В Р’В±Р В РЎвЂўР РЋР вЂљР В РўвЂР РЋРЎвЂњ
    if (fitnessEl?.screen) {
      fitnessEl.screen.classList.remove('hidden');
  
      if (fitnessEl.profileSetup) fitnessEl.profileSetup.classList.add('hidden');
      if (fitnessEl.dashboard) fitnessEl.dashboard.classList.remove('hidden');
  
      // Р В Р вЂ¦Р В Р’В° Р В Р вЂ Р РЋР С“Р РЋР РЏР В РЎвЂќР В РЎвЂР В РІвЂћвЂ“ Р РЋР С“Р В Р’В»Р РЋРЎвЂњР РЋРІР‚РЋР В Р’В°Р В РІвЂћвЂ“ Р В РЎвЂ”Р РЋР вЂљР РЋР РЏР РЋРІР‚РЋР В Р’ВµР В РЎВ Р В РЎВР В Р’В°Р РЋР С“Р РЋРІР‚С™Р В Р’ВµР РЋР вЂљ Р В РЎвЂ Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В Р’В°
      if (gymEl.periodWizardScreen) gymEl.periodWizardScreen.classList.add('hidden');
      if (gymEl.screen) gymEl.screen.classList.add('hidden');
  
      return;
    }
  
    // fallback: Р В Р’ВµР РЋР С“Р В Р’В»Р В РЎвЂ Р В РЎвЂ”Р В РЎвЂў Р В РЎвЂќР В Р’В°Р В РЎвЂќР В РЎвЂўР В РІвЂћвЂ“-Р РЋРІР‚С™Р В РЎвЂў Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР РЋРІР‚РЋР В РЎвЂР В Р вЂ¦Р В Р’Вµ fitnessScreen Р В Р вЂ¦Р В Р’ВµР РЋРІР‚С™ Р Р†Р вЂљРІР‚Сљ Р В Р вЂ Р В Р’ВµР РЋР вЂљР В Р вЂ¦Р РЋРІР‚ВР В РЎВР РЋР С“Р РЋР РЏ Р В Р вЂ¦Р В Р’В° Р В РЎвЂ“Р В Р’В»Р В Р’В°Р В Р вЂ Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦
    const main = document.getElementById('main');
    if (main) main.classList.remove('hidden');
  }
  
  function gymGetCurrentCycle() {
    const period = gymGetActivePeriod();
    if (!period) return null;

    if (!gymState.runtime) gymState.runtime = {};
    if (!gymState.runtime[period.id]) {
      gymState.runtime[period.id] = { currentCycle: 1, totalCycles: 8, periodDone: 1, cycles: {} };
    }
  
    const rt = gymState.runtime[period.id];
    const idx = rt.currentCycle || 1;
  
    if (!rt.cycles) rt.cycles = {};
    if (!rt.cycles[idx]) {
      rt.cycles[idx] = { days: {}, groups: {} };
    }
  
    return rt.cycles[idx];
  }
  
  function gymSetCurrentCycle(cycleIndex) {
    const period = gymGetActivePeriod();
    if (!period) return;
  
    if (!gymState.runtime) gymState.runtime = {};
    if (!gymState.runtime[period.id]) {
      gymState.runtime[period.id] = { currentCycle: 1, totalCycles: 8, periodDone: 1, cycles: {} };
    }
  
    const rt = gymState.runtime[period.id];
  
    if (!rt.cycles) rt.cycles = {};
    if (!rt.cycles[cycleIndex]) {
      rt.cycles[cycleIndex] = { days: {}, groups: {} };
    }
  
    rt.currentCycle = cycleIndex;
  
    gymSaveState(gymState);
    gymRenderHeader();
    gymRenderGroups();
  }
  
  
  function gymRenderCycleSelect() {
    if (!gymEl.cycleSelect) return;
  
    const period = gymGetActivePeriod();
    if (!period) {
      gymEl.cycleSelect.innerHTML = '<option value="1">Р В Р’В¦Р В РЎвЂР В РЎвЂќР В Р’В» 1</option>';
      gymEl.cycleSelect.value = '1';
      return;
    }
  
    if (!gymState.runtime) gymState.runtime = {};
    if (!gymState.runtime[period.id]) {
      gymState.runtime[period.id] = { currentCycle: 1, totalCycles: period.totalCycles || 1, cycles: {} };
    }

    const rt = gymState.runtime[period.id];
    const current = rt.currentCycle || 1;

    const maxCycle = Number(period.totalCycles) || Number(rt.totalCycles) || 1;

    let options = '';
    for (let i = 1; i <= maxCycle; i += 1) {
      options += `<option value="${i}">Р В Р’В¦Р В РЎвЂР В РЎвЂќР В Р’В» ${i}</option>`;
    }

    gymEl.cycleSelect.innerHTML = options;
    gymEl.cycleSelect.value = String(current);
  }
  
  function gymRenderHeader() {
    if (!gymEl.cycleInfo || !gymEl.periodInfo || !gymEl.progressBar || !gymEl.progressLabel) return;
    const period = gymGetActivePeriod();
    if (!period) return;
  
    // read runtime object for the period (not the per-cycle data)
    if (!gymState.runtime) gymState.runtime = {};
    if (!gymState.runtime[period.id]) gymState.runtime[period.id] = { currentCycle: 1, totalCycles: period.totalCycles || 1, periodDone: 1, cycles: {} };

    const rt = gymState.runtime[period.id];
    const currentCycle = Number(rt.currentCycle) || 1;
    const totalCycles = Number(period.totalCycles) || Number(rt.totalCycles) || 1;
    const periodDone = Number(rt.periodDone) || currentCycle;
  
    
  
    gymEl.cycleInfo.textContent = `${currentCycle}/${totalCycles}`;
    gymEl.periodInfo.textContent = period.name || 'Р В РЎСџР В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂ';
  
    const pct = Math.max(0, Math.min(100, (periodDone / totalCycles) * 100));
    gymEl.progressBar.style.width = `${pct}%`;
    gymEl.progressLabel.textContent = `${periodDone}/${totalCycles}`;

    gymRenderCycleSelect();
  }
  
  

  function gymRenderGroups() {
    if (!gymEl.groupsContainer) return;
  
    const period = gymGetActivePeriod();
    if (!period) return;
  
    const runtime = gymGetCurrentCycle();
    if (!runtime) return;
  
    if (!runtime.groups) runtime.groups = {};
    if (!runtime.days) runtime.days = {};
  
    // UI-Р РЋР С“Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂўР РЋР РЏР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р РЋР С“Р В Р вЂ Р В РЎвЂўР РЋР вЂљР В Р’В°Р РЋРІР‚РЋР В РЎвЂР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР РЏ Р В РЎвЂ Р РЋР вЂљР В Р’ВµР В РўвЂР В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР РЏ
    if (!gymState.uiCollapse) gymState.uiCollapse = {};
    const uiKey = `period-${period.id || 'default'}`;
    if (!gymState.uiCollapse[uiKey]) {
      gymState.uiCollapse[uiKey] = { days: {}, groups: {}, editDays: {} };
    }
    const ui = gymState.uiCollapse[uiKey];
    if (!ui.editDays) ui.editDays = {};
  
    gymEl.groupsContainer.innerHTML = '';
  
    // Build days to render: merge period template days with any runtime-only days for current cycle
    const templateDays = Array.isArray(period.days) ? period.days.slice() : [];
    const runtimeDays = runtime && runtime.days ? runtime.days : {};

    const daysMap = new Map();
    templateDays.forEach(d => daysMap.set(Number(d.dayIndex), { dayIndex: Number(d.dayIndex), muscles: Array.isArray(d.muscles) ? d.muscles.slice() : [] }));
    Object.keys(runtimeDays).forEach(k => {
      const idx = Number(k);
      if (!daysMap.has(idx)) {
        const r = runtimeDays[k] || {};
        daysMap.set(idx, { dayIndex: idx, muscles: Array.isArray(r.muscles) ? r.muscles.slice() : [] });
      }
    });

    const daysToRender = Array.from(daysMap.values()).sort((a,b)=>a.dayIndex-b.dayIndex);
    
    // --- Р В Р’В Р В РІР‚СћР В РЎСљР В РІР‚СњР В РІР‚СћР В Р’В  Р В РІР‚СњР В РЎСљР В РІР‚СћР В РІвЂћСћ ---
    daysToRender.forEach((day) => {
      const dayIndex = day.dayIndex;
    
      // Р РЋРІР‚РЋР В РЎвЂР РЋРІР‚С™Р В Р’В°Р В Р’ВµР В РЎВ enabled Р В РЎвЂР В Р’В· runtime, Р В РЎвЂ”Р В РЎвЂў Р РЋРЎвЂњР В РЎВР В РЎвЂўР В Р’В»Р РЋРІР‚РЋР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР вЂ№ true
      const runtimeDayRaw = runtime && runtime.days ? runtime.days[dayIndex] : null;
      const enabled = runtimeDayRaw ? runtimeDayRaw.enabled !== false : true;
    
      // Р В Р’ВµР РЋР С“Р В Р’В»Р В РЎвЂ Р В РўвЂР В Р’ВµР В Р вЂ¦Р РЋР Р‰ Р В Р вЂ Р РЋРІР‚в„–Р В РЎвЂќР В Р’В»Р РЋР вЂ№Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦ Р В РЎвЂ Р В Р вЂ¦Р В Р’Вµ Р В Р вЂ  Р РЋР вЂљР В Р’ВµР В Р’В¶Р В РЎвЂР В РЎВР В Р’Вµ Р РЋР вЂљР В Р’ВµР В РўвЂР В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР РЏ Р Р†Р вЂљРІР‚Сњ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В РЎвЂ”Р РЋРЎвЂњР РЋР С“Р В РЎвЂќР В Р’В°Р В Р’ВµР В РЎВ
      // if (!enabled && !ui.editDays[dayIndex]) return;
    
      if (!runtime.days[dayIndex]) runtime.days[dayIndex] = { groups: {} };
      const dayRuntime = runtime.days[dayIndex];
      if (!dayRuntime.groups) dayRuntime.groups = {};
    
      const isEditing = ui.editDays[dayIndex] === true;
    
      const dayWrapper = document.createElement('div');
      dayWrapper.className = 'bg-white/5 rounded-2xl px-3 py-3 space-y-2';
      dayWrapper.dataset.dayIndex = String(dayIndex);

      // --- Р В Р РѓР В РЎвЂ™Р В РЎСџР В РЎв„ўР В РЎвЂ™ Р В РІР‚СњР В РЎСљР В Р вЂЎ ---
      const title = document.createElement('div');
      title.className = 'flex items-center justify-between mb-2';
  
      const left = document.createElement('div');
      left.className = 'flex items-center gap-2 flex-1';
  
      // Р РЋРІР‚РЋР В Р’ВµР В РЎвЂќР В Р’В±Р В РЎвЂўР В РЎвЂќР РЋР С“ Р РЋРІР‚С™Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В РЎвЂќР В РЎвЂў Р В Р вЂ  Р РЋР вЂљР В Р’ВµР В Р’В¶Р В РЎвЂР В РЎВР В Р’Вµ Р РЋР вЂљР В Р’ВµР В РўвЂР В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР РЏ
      if (isEditing) {
        const checkboxLabel = document.createElement('label');
        checkboxLabel.className = 'flex items-center gap-1 text-xs text-slate-200';
      
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'accent-emerald-400';
        checkbox.dataset.role = 'dayEnabled';
        checkbox.dataset.dayIndex = String(dayIndex);
      
        // Р РЋРІР‚РЋР В РЎвЂР РЋРІР‚С™Р В Р’В°Р В Р’ВµР В РЎВ Р РЋР С“Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂўР РЋР РЏР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂР В Р’В· runtime Р РЋРІР‚С™Р В Р’ВµР В РЎвЂќР РЋРЎвЂњР РЋРІР‚В°Р В Р’ВµР В РЎвЂ“Р В РЎвЂў Р РЋРІР‚В Р В РЎвЂР В РЎвЂќР В Р’В»Р В Р’В°
        const runtimeDay = runtime.days[dayIndex] || {};
        if (runtimeDay.enabled !== false) {
          checkbox.checked = true;
        } else {
          checkbox.checked = false;
        }
      
        const span = document.createElement('span');
        span.textContent = 'Р В РЎвЂ™Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР В Р вЂ Р В Р’ВµР В Р вЂ¦';
      
        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(span);
      
        left.appendChild(checkboxLabel);
      }
      
  
      const titleBtn = document.createElement('button');
      titleBtn.type = 'button';
      titleBtn.className = 'text-left flex-1';
      titleBtn.dataset.role = 'toggleDay';
      titleBtn.dataset.dayIndex = String(dayIndex);
      // titleBtn.innerHTML = `
      //   <div class="text-sm font-semibold text-white">Р В РІР‚СњР В Р’ВµР В Р вЂ¦Р РЋР Р‰ ${day.dayIndex}</div>
      //   <div class="text-xs text-slate-300" data-role="dayMusclesView">
      //     ${
      //       day.muscles && day.muscles.length
      //         ? day.muscles.join(', ')
      //         : 'Р В РЎСљР В Р’В°Р В Р’В¶Р В РЎВР В РЎвЂ "Р В Р’В Р В Р’ВµР В РўвЂР В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰", Р РЋРІР‚РЋР РЋРІР‚С™Р В РЎвЂўР В Р’В±Р РЋРІР‚в„– Р В Р вЂ Р РЋРІР‚в„–Р В Р’В±Р РЋР вЂљР В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В РЎвЂ”Р В РЎвЂ”Р РЋРІР‚в„–'
      //     }
      //   </div>
      // `;
      const periodId = period.id || 'default';
      const rt = gymState.runtime?.[periodId];
      const currentCycle = rt?.currentCycle || 1;

      titleBtn.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="text-sm font-semibold text-white">Р В РІР‚СњР В Р’ВµР В Р вЂ¦Р РЋР Р‰ ${day.dayIndex}</div>
        </div>
        <div class="text-xs text-slate-300" data-role="dayMusclesView">
          ${
            day.muscles && day.muscles.length
              ? day.muscles.join(', ')
              : 'Р В РЎСљР В Р’В°Р В Р’В¶Р В РЎВР В РЎвЂ "Р В Р’В Р В Р’ВµР В РўвЂР В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰", Р РЋРІР‚РЋР РЋРІР‚С™Р В РЎвЂўР В Р’В±Р РЋРІР‚в„– Р В Р вЂ Р РЋРІР‚в„–Р В Р’В±Р РЋР вЂљР В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В РЎвЂ”Р В РЎвЂ”Р РЋРІР‚в„–'
          }
        </div>
      `;

      left.appendChild(titleBtn);
      // --- COMPLETION CONTROLS ---
      const rtFullForCompletion = gymState.runtime?.[period.id] || { currentCycle: 1 };
      const currentCycleIndexForCompletion = Number(rtFullForCompletion.currentCycle) || 1;

      if (!gymState.completedWorkouts) gymState.completedWorkouts = [];
      const existingCompletion = (gymState.completedWorkouts || []).find(e => e.periodId === period.id && Number(e.cycleIndex) === Number(currentCycleIndexForCompletion) && Number(e.dayIndex) === Number(dayIndex));

      const completionWrap = document.createElement('div');
      completionWrap.className = 'flex items-center gap-2 text-xs ml-2';

      const completedCheckbox = document.createElement('input');
      completedCheckbox.type = 'checkbox';
      completedCheckbox.dataset.role = 'dayCompleted';
      completedCheckbox.dataset.dayIndex = String(dayIndex);
      completedCheckbox.checked = !!existingCompletion;

      const completedDate = document.createElement('input');
      completedDate.type = 'date';
      completedDate.dataset.role = 'dayCompletedDate';
      completedDate.dataset.dayIndex = String(dayIndex);
      const todayStr = new Date().toISOString().slice(0,10);
      completedDate.value = existingCompletion ? (existingCompletion.dateCompleted || todayStr) : todayStr;

      completionWrap.appendChild(completedCheckbox);
      completionWrap.appendChild(completedDate);

      left.appendChild(completionWrap);

      // handlers
      completedCheckbox.addEventListener('change', () => {
        const checked = completedCheckbox.checked;
        const dateVal = completedDate.value || todayStr;
        if (checked) {
          const beforeCount = (gymState.completedWorkouts || []).filter(e => e.periodId === period.id).length;
          gymState.completedWorkouts.push({ periodId: period.id, cycleIndex: currentCycleIndexForCompletion, dayIndex: dayIndex, dateCompleted: dateVal });
          // if this is the very first completed workout for the period and startDate is empty, set it
          if (beforeCount === 0 && (!gymState.periods[period.id].startDate || gymState.periods[period.id].startDate === '')) {
            gymState.periods[period.id].startDate = dateVal;
          }
        } else {
          gymState.completedWorkouts = (gymState.completedWorkouts || []).filter(e => !(e.periodId === period.id && Number(e.cycleIndex) === Number(currentCycleIndexForCompletion) && Number(e.dayIndex) === Number(dayIndex)));
        }
        gymSaveState(gymState);
        gymRenderGroups();
      });

      completedDate.addEventListener('change', () => {
        const dateVal = completedDate.value || todayStr;
        const idx = (gymState.completedWorkouts || []).findIndex(e => e.periodId === period.id && Number(e.cycleIndex) === Number(currentCycleIndexForCompletion) && Number(e.dayIndex) === Number(dayIndex));
        if (idx >= 0) {
          gymState.completedWorkouts[idx].dateCompleted = dateVal;
          gymSaveState(gymState);
        }
      });
  
      const right = document.createElement('div');
      right.className = 'flex items-center gap-2 ml-2';
  
      if (isEditing) {
        const saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.className = 'text-[11px] text-emerald-300 underline';
        saveBtn.dataset.role = 'daySave';
        saveBtn.dataset.dayIndex = String(dayIndex);
        saveBtn.textContent = 'Р В Р Р‹Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰';
  
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'text-[11px] text-red-300 underline';
        deleteBtn.dataset.role = 'dayDelete';
        deleteBtn.dataset.dayIndex = String(dayIndex);
        deleteBtn.textContent = 'Р В Р в‚¬Р В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В РўвЂР В Р’ВµР В Р вЂ¦Р РЋР Р‰';
  
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'text-[11px] text-slate-300 underline';
        cancelBtn.dataset.role = 'dayCancel';
        cancelBtn.dataset.dayIndex = String(dayIndex);
        cancelBtn.textContent = 'Р В РЎСљР В Р’В°Р В Р’В·Р В Р’В°Р В РўвЂ';
  
        right.appendChild(saveBtn);
        right.appendChild(deleteBtn);
        right.appendChild(cancelBtn);
      } else {
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'text-[11px] text-emerald-300 underline';
        editBtn.dataset.role = 'dayEdit';
        editBtn.dataset.dayIndex = String(dayIndex);
        editBtn.textContent = 'Р В Р’В Р В Р’ВµР В РўвЂР В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰';
  
        right.appendChild(editBtn);
      }
  
      title.appendChild(left);
      title.appendChild(right);
      dayWrapper.appendChild(title);
  
      // --- Р В Р Р‹Р В РЎС›Р В Р’В Р В РЎвЂєР В РЎв„ўР В РЎвЂ™ Р В Р’В Р В РІР‚СћР В РІР‚СњР В РЎвЂ™Р В РЎв„ўР В РЎС›Р В Р’ВР В Р’В Р В РЎвЂєР В РІР‚в„ўР В РЎвЂ™Р В РЎСљР В Р’ВР В Р вЂЎ Р В РІР‚СљР В Р’В Р В Р в‚¬Р В РЎСџР В РЎСџ Р В РЎС™Р В Р’В«Р В Р РѓР В Р’В¦ (Р В РЎС›Р В РЎвЂєР В РІР‚С”Р В Р’В¬Р В РЎв„ўР В РЎвЂє Р В РІР‚в„ў Р В Р’В Р В РІР‚СћР В РІР‚вЂњР В Р’ВР В РЎС™Р В РІР‚Сћ Р В Р’В Р В РІР‚СћР В РІР‚СњР В РЎвЂ™Р В РЎв„ўР В РЎС›Р В Р’ВР В Р’В Р В РЎвЂєР В РІР‚в„ўР В РЎвЂ™Р В РЎСљР В Р’ВР В Р вЂЎ) ---
      if (isEditing) {
        const musclesRow = document.createElement('div');
        musclesRow.className = 'mb-2';
  
        musclesRow.innerHTML = `
          <div class="text-[11px] text-slate-300 mb-1">
            Р В РІР‚СљР РЋР вЂљР РЋРЎвЂњР В РЎвЂ”Р В РЎвЂ”Р РЋРІР‚в„– Р В РЎВР РЋРІР‚в„–Р РЋРІвЂљВ¬Р РЋРІР‚В  Р РЋРІР‚РЋР В Р’ВµР РЋР вЂљР В Р’ВµР В Р’В· Р В Р’В·Р В Р’В°Р В РЎвЂ”Р РЋР РЏР РЋРІР‚С™Р РЋРЎвЂњР РЋР вЂ№
          </div>
          <input
            class="w-full bg-white/10 text-white text-xs rounded-lg px-2 py-1"
            placeholder="Р В РІР‚СљР РЋР вЂљР РЋРЎвЂњР В РўвЂР РЋР Р‰, Р В РЎвЂ”Р В Р’В»Р В Р’ВµР РЋРІР‚РЋР В РЎвЂ, Р РЋР С“Р В РЎвЂ”Р В РЎвЂР В Р вЂ¦Р В Р’В°"
            data-role="dayMusclesInput"
            data-day-index="${dayIndex}"
            value="${
              day.muscles && day.muscles.length
                ? day.muscles.join(', ')
                : ''
            }"
          />
        `;
  
        dayWrapper.appendChild(musclesRow);
      }
  
      // --- Р В РЎС›Р В РІР‚СћР В РІР‚С”Р В РЎвЂє Р В РІР‚СњР В РЎСљР В Р вЂЎ ---
      const dayBody = document.createElement('div');
      const dayExpanded = ui.days[dayIndex] === true;
      dayBody.className = 'space-y-2' + (dayExpanded ? '' : ' hidden');
      dayBody.dataset.role = 'dayBody';
      dayBody.dataset.dayIndex = String(dayIndex);
  
      const muscleGroups =
        day.muscles && day.muscles.length ? day.muscles : [];
  
      muscleGroups.forEach((groupName) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'bg-slate-900/60 rounded-xl px-3 py-3 space-y-2';
  
        const header = document.createElement('div');
        header.className = 'flex items-center justify-between mb-1';
  
        // Р В Р вЂ¦Р В Р’В°Р В Р’В·Р В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В РЎвЂ”Р В РЎвЂ”Р РЋРІР‚в„–
        const groupBtn = document.createElement('button');
        groupBtn.type = 'button';
        groupBtn.className = 'flex-1 text-left text-sm text-slate-100 font-medium';
        groupBtn.dataset.role = 'toggleGroup';
        groupBtn.dataset.group = groupName;
        groupBtn.textContent = groupName;
  
        header.appendChild(groupBtn);
  
        // Р В РЎвЂќР В Р вЂ¦Р В РЎвЂўР В РЎвЂ”Р В РЎвЂќР В РЎвЂ Р В РўвЂР В Р’В»Р РЋР РЏ Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В РЎвЂ”Р В РЎвЂ” Р Р†Р вЂљРІР‚Сњ Р РЋРІР‚С™Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В РЎвЂќР В РЎвЂў Р В Р вЂ  Р РЋР вЂљР В Р’ВµР В Р’В¶Р В РЎвЂР В РЎВР В Р’Вµ Р РЋР вЂљР В Р’ВµР В РўвЂР В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР РЏ
        if (isEditing) {
          const groupActions = document.createElement('div');
          groupActions.className = 'flex items-center gap-2';
  
          const addExBtn = document.createElement('button');
          addExBtn.type = 'button';
          addExBtn.className = 'text-xs px-2 py-1 rounded-full bg-emerald-500 text-white';
          addExBtn.dataset.role = 'addExercise';
          addExBtn.dataset.group = groupName;
          addExBtn.textContent = '+ Р В Р в‚¬Р В РЎвЂ”Р РЋР вЂљР В Р’В°Р В Р’В¶Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ';
  
          const delGroupBtn = document.createElement('button');
          delGroupBtn.type = 'button';
          delGroupBtn.className = 'text-[11px] text-red-300 underline';
          delGroupBtn.dataset.role = 'deleteGroup';
          delGroupBtn.dataset.group = groupName;
          delGroupBtn.textContent = 'Р РЋРЎвЂњР В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰';
  
          groupActions.appendChild(addExBtn);
          groupActions.appendChild(delGroupBtn);
          header.appendChild(groupActions);
        }
  
        wrapper.appendChild(header);
  
        const listContainer = document.createElement('div');
        const groupKey = `${dayIndex}::${groupName}`;
        const groupExpanded = ui.groups[groupKey] === true;
        listContainer.className = 'space-y-2' + (groupExpanded ? '' : ' hidden');
        listContainer.dataset.group = groupName;
        listContainer.dataset.groupContainer = groupName;
        listContainer.dataset.role = 'groupBody';
  
        const exercises = dayRuntime.groups[groupName] || [];
        if (!exercises.length) {
          const empty = document.createElement('div');
          empty.className = 'text-xs text-slate-400';
          empty.textContent = 'Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р РЋР Р‰ Р РЋРЎвЂњР В РЎвЂ”Р РЋР вЂљР В Р’В°Р В Р’В¶Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РўвЂР В Р’В»Р РЋР РЏ Р РЋР РЉР РЋРІР‚С™Р В РЎвЂўР В РІвЂћвЂ“ Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В РЎвЂ”Р В РЎвЂ”Р РЋРІР‚в„–.';
          listContainer.appendChild(empty);
        } else {
          exercises.forEach((ex, idx) => {
            const card = document.createElement('div');
            card.className = 'bg-slate-900/80 rounded-xl px-3 py-3 space-y-2';
            card.dataset.index = String(idx);
  
            // --- Р В Р РѓР В РЎвЂ™Р В РЎСџР В РЎв„ўР В РЎвЂ™ Р В Р в‚¬Р В РЎСџР В Р’В Р В РЎвЂ™Р В РІР‚вЂњР В РЎСљР В РІР‚СћР В РЎСљР В Р’ВР В Р вЂЎ ---
            const exHeader = document.createElement('div');
            exHeader.className = 'flex items-center justify-between text-xs mb-1';

            const titleWrap = document.createElement('div');
            titleWrap.className = 'flex-1';

            // compact working-set inputs in header (setsCount, repsCount, workWeight)
            const setsInput = document.createElement('input');
            setsInput.type = 'number';
            setsInput.min = '0';
            setsInput.placeholder = '';
            setsInput.dataset.field = 'setsCount';
            setsInput.className = 'bg-white/5 text-xs text-white rounded px-1 mr-1';
            setsInput.style.width = '2.2em';

            const repsInput = document.createElement('input');
            repsInput.type = 'number';
            repsInput.min = '0';
            repsInput.placeholder = '';
            repsInput.dataset.field = 'repsCount';
            repsInput.className = 'bg-white/5 text-xs text-white rounded px-1 mr-1';
            repsInput.style.width = '3.2em';

            const weightInput = document.createElement('input');
            weightInput.type = 'number';
            weightInput.min = '0';
            weightInput.placeholder = '';
            weightInput.dataset.field = 'workWeight';
            weightInput.className = 'bg-white/5 text-xs text-white rounded px-1 mr-1';
            weightInput.style.width = '4.2em';

            // prefill from ex object
            if (ex.setsCount !== undefined) setsInput.value = ex.setsCount;
            if (ex.repsCount !== undefined) repsInput.value = ex.repsCount;
            if (ex.workWeight !== undefined) weightInput.value = ex.workWeight;

            setsInput.setAttribute('data-field','setsCount');
            repsInput.setAttribute('data-field','repsCount');
            weightInput.setAttribute('data-field','workWeight');
            titleWrap.appendChild(setsInput);
            titleWrap.appendChild(repsInput);
            titleWrap.appendChild(weightInput);


            if (isEditing) {
              // Р В Р’В Р В Р’ВµР В РўвЂР В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР РЋР вЂљР РЋРЎвЂњР В Р’ВµР В РЎВР В РЎвЂўР В Р’Вµ Р В Р вЂ¦Р В Р’В°Р В Р’В·Р В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ
              const nameInput = document.createElement('input');
              nameInput.type = 'text';
              nameInput.className = 'w-full bg-transparent text-left text-slate-100 text-xs font-semibold border-b border-white/10 focus:outline-none';
              nameInput.placeholder = 'Р В РЎСљР В Р’В°Р В Р’В·Р В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ (Р В РІР‚вЂњР В РЎвЂР В РЎВ Р В РЎвЂ“Р В Р’В°Р В Р вЂ¦Р РЋРІР‚С™Р В Р’ВµР В Р’В»Р В Р’ВµР В РІвЂћвЂ“)';
              nameInput.value = ex.name || '';
              nameInput.dataset.field = 'name';
              titleWrap.appendChild(nameInput);
            } else {
              // Р В РЎС›Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В РЎвЂќР В РЎвЂў Р РЋРІР‚С™Р В Р’ВµР В РЎвЂќР РЋР С“Р РЋРІР‚С™ (Р В РЎвЂќР В Р вЂ¦Р В РЎвЂўР В РЎвЂ”Р В РЎвЂќР В Р’В° Р РЋР С“Р В Р вЂ Р В РЎвЂўР РЋР вЂљР В Р’В°Р РЋРІР‚РЋР В РЎвЂР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР РЏ)
              const nameBtn = document.createElement('button');
              nameBtn.type = 'button';
              nameBtn.className = 'text-left flex-1 text-slate-100';
              nameBtn.dataset.role = 'toggleExercise';
              nameBtn.textContent = ex.name || 'Р В Р в‚¬Р В РЎвЂ”Р РЋР вЂљР В Р’В°Р В Р’В¶Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ ' + (idx + 1);
              titleWrap.appendChild(nameBtn);
            }

            exHeader.appendChild(titleWrap);

            // Р В РЎв„ўР В Р вЂ¦Р В РЎвЂўР В РЎвЂ”Р В РЎвЂќР В Р’В° Р РЋРЎвЂњР В РўвЂР В Р’В°Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ Р РЋРЎвЂњР В РЎвЂ”Р РЋР вЂљР В Р’В°Р В Р’В¶Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ Р Р†Р вЂљРІР‚Сњ Р В РЎС›Р В РЎвЂєР В РІР‚С”Р В Р’В¬Р В РЎв„ўР В РЎвЂє Р В Р вЂ  Р РЋР вЂљР В Р’ВµР В Р’В¶Р В РЎвЂР В РЎВР В Р’Вµ Р РЋР вЂљР В Р’ВµР В РўвЂР В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР РЏ Р В РўвЂР В Р вЂ¦Р РЋР РЏ
            if (isEditing) {
              const delBtn = document.createElement('button');
              delBtn.type = 'button';
              delBtn.className = 'text-[11px] text-red-300 underline';
              delBtn.dataset.delete = '1';
              delBtn.textContent = 'Р В Р в‚¬Р В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰';
              exHeader.appendChild(delBtn);
            }

            card.appendChild(exHeader);

  
            // --- Р В РЎС›Р В РІР‚СћР В РІР‚С”Р В РЎвЂє Р В Р в‚¬Р В РЎСџР В Р’В Р В РЎвЂ™Р В РІР‚вЂњР В РЎСљР В РІР‚СћР В РЎСљР В Р’ВР В Р вЂЎ ---
            const body = document.createElement('div');
            body.className = 'space-y-2 hidden';
            body.dataset.role = 'exerciseBody';
  
            body.innerHTML = `
              <div class="flex gap-4 text-xs text-slate-300 mb-2">
                <div>
                  <span class="text-slate-400">Р В РЎСџР В РЎвЂўР В РўвЂР РЋРІР‚В¦Р В РЎвЂўР В РўвЂР РЋРІР‚в„–:</span> ${ex.setsCount || 'Р Р†Р вЂљРІР‚Сњ'}
                </div>
                <div>
                  <span class="text-slate-400">Р В РЎСџР В РЎвЂўР В Р вЂ Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ:</span> ${ex.repsCount || 'Р Р†Р вЂљРІР‚Сњ'}
                </div>
                <div>
                  <span class="text-slate-400">Р В РІР‚в„ўР В Р’ВµР РЋР С“:</span> ${ex.workWeight || 'Р Р†Р вЂљРІР‚Сњ'}
                </div>
              </div>

              <div class="flex gap-2 text-xs">
                <div class="flex-1">
                  <div class="text-slate-400 mb-1">Р В Р’В Р В Р’В°Р В Р’В·Р В РЎВР В РЎвЂР В Р вЂ¦Р В РЎвЂќР В Р’В° (Р В РЎвЂўР В РЎвЂ”Р РЋРІР‚В .)</div>
                  <input
                    class="w-full bg-white/10 text-white rounded-lg px-2 py-1"
                    placeholder="2x15"
                    value="${ex.warmup || ''}"
                    data-field="warmup"
                  />
                </div>
              </div>

              <div class="flex items-center justify-between text-xs">
                <div class="flex-1 mr-2">
                  <div class="text-slate-400 mb-1">RPE 1Р Р†Р вЂљРІР‚Сљ10</div>
                  <div class="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value="${ex.rpe || 7}"
                      data-field="rpe"
                      class="flex-1"
                    >
                    <span
                      class="text-slate-100 text-xs"
                      data-rpe-label
                    >
                      ${ex.rpe || 7}/10
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex gap-2 text-xs">
                <div class="flex-1">
                  <div class="text-slate-400 mb-1">Р В РЎСџР РЋР вЂљР В РЎвЂўР В РЎвЂ“Р РЋР вЂљР В Р’ВµР РЋР С“Р РЋР С“ Р В Р’В·Р В Р’В° Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂ</div>
                  <input
                    class="w-full bg-white/10 text-white rounded-lg px-2 py-1"
                    placeholder="+5 Р В РЎвЂќР В РЎвЂ“ Р РЋР С“ Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’В°Р В Р’В»Р В Р’В°"
                    value="${ex.progressNote || ''}"
                    data-field="progressNote"
                  />
                </div>
                <div class="flex-1">
                  <div class="text-slate-400 mb-1">Р В РЎСџР В Р’В»Р В Р’В°Р В Р вЂ¦ Р В Р вЂ¦Р В Р’В° Р РЋР С“Р В Р’В»Р В Р’ВµР В РўвЂ. Р РЋРІР‚В Р В РЎвЂР В РЎвЂќР В Р’В»</div>
                  <input
                    class="w-full bg-white/10 text-white rounded-lg px-2 py-1"
                    placeholder="Р В Р Р‹Р В Р’В»Р В Р’ВµР В РўвЂ. Р РЋРІР‚В Р В РЎвЂР В РЎвЂќР В Р’В»: 37 Р В РЎвЂќР В РЎвЂ“"
                    value="${ex.nextCyclePlan || ''}"
                    data-field="nextCyclePlan"
                  />
                </div>
              </div>
            `;
  
            card.appendChild(body);
            listContainer.appendChild(card);
          });
        }
  
        wrapper.appendChild(listContainer);
        dayBody.appendChild(wrapper);
      });
  
      dayWrapper.appendChild(dayBody);
      gymEl.groupsContainer.appendChild(dayWrapper);
    });
  
    // --- Р В РЎв„ўР В РЎСљР В РЎвЂєР В РЎСџР В РЎв„ўР В РЎвЂ™/Р В Р’В¤Р В РЎвЂєР В Р’В Р В РЎС™Р В РЎвЂ™ "Р В РІР‚СњР В РЎвЂєР В РІР‚ВР В РЎвЂ™Р В РІР‚в„ўР В Р’ВР В РЎС›Р В Р’В¬ Р В РІР‚СњР В РІР‚СћР В РЎСљР В Р’В¬" (Р В РЎвЂќР В Р’В°Р В РЎвЂќ Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р РЋР Р‰Р РЋРІвЂљВ¬Р В Р’Вµ) ---
    const addDayContainer = document.createElement('div');
    addDayContainer.className = 'mt-3 space-y-2 text-xs text-slate-200';
    addDayContainer.innerHTML = `
      <div
        class="bg-white/5 rounded-2xl px-3 py-3 space-y-2 hidden"
        data-role="newDayForm"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="text-sm font-semibold text-white">
            Р В РЎСљР В РЎвЂўР В Р вЂ Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р В РўвЂР В Р’ВµР В Р вЂ¦Р РЋР Р‰
          </div>
          <label class="flex items-center gap-1 text-[11px] text-slate-200">
            <input
              type="checkbox"
              class="accent-emerald-400"
              data-role="newDayEnabled"
              checked
            />
            <span>Р В РІР‚СњР В Р’ВµР В Р вЂ¦Р РЋР Р‰ Р В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР В Р вЂ Р В Р’ВµР В Р вЂ¦</span>
          </label>
        </div>
  
        <div class="space-y-1">
          <div class="text-[11px] text-slate-300">Р В РІР‚СљР РЋР вЂљР РЋРЎвЂњР В РЎвЂ”Р В РЎвЂ”Р РЋРІР‚в„– Р В РЎВР РЋРІР‚в„–Р РЋРІвЂљВ¬Р РЋРІР‚В  Р РЋРІР‚РЋР В Р’ВµР РЋР вЂљР В Р’ВµР В Р’В· Р В Р’В·Р В Р’В°Р В РЎвЂ”Р РЋР РЏР РЋРІР‚С™Р РЋРЎвЂњР РЋР вЂ№</div>
          <input
            class="w-full bg-white/10 text-white text-xs rounded-lg px-2 py-1"
            placeholder="Р В РІР‚СљР РЋР вЂљР РЋРЎвЂњР В РўвЂР РЋР Р‰, Р В РЎвЂ”Р В Р’В»Р В Р’ВµР РЋРІР‚РЋР В РЎвЂ, Р РЋР С“Р В РЎвЂ”Р В РЎвЂР В Р вЂ¦Р В Р’В°"
            data-role="newDayMuscles"
          />
        </div>
  
        <div class="flex gap-2 mt-3">
          <button
            type="button"
            class="flex-1 bg-emerald-500 hover:bg-emerald-600 py-2 rounded-xl font-semibold text-sm"
            data-role="createDaySubmit"
          >
            Р В Р Р‹Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В РўвЂР В Р’ВµР В Р вЂ¦Р РЋР Р‰
          </button>
          <button
            type="button"
            class="flex-1 bg-white/10 py-2 rounded-xl text-sm"
            data-role="createDayCancel"
          >
            Р В РЎвЂєР РЋРІР‚С™Р В РЎВР В Р’ВµР В Р вЂ¦Р В Р’В°
          </button>
        </div>
      </div>
  
      <button
        type="button"
        class="w-full bg-transparent border border-emerald-500/60 py-2 rounded-xl font-semibold text-sm"
        data-role="addDayFromScreen"
      >
        + Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В РўвЂР В Р’ВµР В Р вЂ¦Р РЋР Р‰
      </button>
    `;
    gymEl.groupsContainer.appendChild(addDayContainer);
  
    // ---- Р В РЎвЂєР В РІР‚ВР В Р’В Р В РЎвЂ™Р В РІР‚ВР В РЎвЂєР В РЎС›Р В Р’В§Р В Р’ВР В РЎв„ўР В Р’В "Р В РЎСљР В РЎвЂєР В РІР‚в„ўР В Р’В«Р В РІвЂћСћ Р В РІР‚СњР В РІР‚СћР В РЎСљР В Р’В¬" ----
    {
      const addBtn = addDayContainer.querySelector('[data-role="addDayFromScreen"]');
      const form = addDayContainer.querySelector('[data-role="newDayForm"]');
      const cancelBtn = addDayContainer.querySelector('[data-role="createDayCancel"]');
      const submitBtn = addDayContainer.querySelector('[data-role="createDaySubmit"]');
  
      if (form && addBtn && cancelBtn && submitBtn) {
        addBtn.addEventListener('click', () => {
          form.classList.remove('hidden');
        });
  
        cancelBtn.addEventListener('click', () => {
          form.classList.add('hidden');
        });
  
        submitBtn.addEventListener('click', () => {
          const period = gymGetActivePeriod();
          if (!period) return;
        
          const enabledInput = form.querySelector('[data-role="newDayEnabled"]');
          const musclesInput = form.querySelector('[data-role="newDayMuscles"]');
        
          const enabled = enabledInput ? !!enabledInput.checked : true;
          const rawMuscles = musclesInput?.value || '';
          const muscles = rawMuscles
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        
          const musclesFinal = muscles.length ? muscles : [];
        
          // Create a runtime-only day for the current cycle. Do NOT modify period.days here.
          const rt = gymGetCurrentCycle();
          if (!rt) return;

          // compute next available dayIndex across template and current runtime
          const templateDays = Array.isArray(period.days) ? period.days.map(d => Number(d.dayIndex || 0)) : [];
          const runtimeDayIndexes = rt.days ? Object.keys(rt.days).map(k => Number(k)) : [];
          const used = templateDays.concat(runtimeDayIndexes).filter(n => !Number.isNaN(n) && n > 0);
          const nextIndex = used.length ? Math.max(...used) + 1 : 1;

          if (!rt.days) rt.days = {};
          // Mark as extra day - these should not be copied to next cycle
          rt.days[nextIndex] = { groups: {}, enabled: enabled, muscles: musclesFinal, isExtra: true };

          // Debug logging for extra day creation
          if (typeof console !== 'undefined' && console.log) {
            console.log('[GYM] Added extra day:', {
              periodId: period.id,
              cycleIndex: currentCycle,
              dayIndex: nextIndex,
              isExtra: true
            });
          }

          gymPersistState();
          gymRenderAll();
          gymRenderGroups();
        });            
      }
    }
  
    // ---- Р В РЎСџР В РІР‚СћР В Р’В Р В РІР‚СћР В РЎв„ўР В РІР‚С”Р В Р’В®Р В Р’В§Р В РІР‚СћР В РЎСљР В Р’ВР В РІР‚Сћ Р В Р’В Р В РІР‚СћР В РІР‚вЂњР В Р’ВР В РЎС™Р В РЎвЂ™ Р В РІР‚СњР В РЎСљР В Р вЂЎ ----
    gymEl.groupsContainer
      .querySelectorAll('button[data-role="dayEdit"]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const dayIndex = Number(btn.dataset.dayIndex || '1');
          ui.editDays[dayIndex] = true;
          gymSaveState(gymState);
          gymRenderGroups();
        });
      });
  
    gymEl.groupsContainer
      .querySelectorAll('button[data-role="dayCancel"]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const dayIndex = Number(btn.dataset.dayIndex || '1');
          ui.editDays[dayIndex] = false;
          gymSaveState(gymState);
          gymRenderGroups();
        });
      });
  
    // ---- Р В Р Р‹Р В РЎвЂєР В РўС’Р В Р’В Р В РЎвЂ™Р В РЎСљР В Р’ВР В РЎС›Р В Р’В¬ Р В РІР‚СњР В РІР‚СћР В РЎСљР В Р’В¬ ----
    // "Save day": commit this day's structure/settings to gymState + localStorage.

    gymEl.groupsContainer
      .querySelectorAll('button[data-role="daySave"]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const dayIndex = Number(btn.dataset.dayIndex || '1');
          const period = gymGetActivePeriod();
          if (!period) return;

          const days = Array.isArray(period.days) ? period.days : [];
          let day = days.find((d) => d.dayIndex === dayIndex);
          if (!day) {
            day = { dayIndex, muscles: [] };
            days.push(day);
          }

          const runtime = gymGetCurrentCycle();
          if (!runtime) return;
          if (!runtime.days) runtime.days = {};
          if (!runtime.days[dayIndex]) runtime.days[dayIndex] = { groups: {} };
          const dayRuntime = runtime.days[dayIndex];

          const checkbox = gymEl.groupsContainer.querySelector(
            `input[data-role="dayEnabled"][data-day-index="${dayIndex}"]`
          );
          dayRuntime.enabled = checkbox ? !!checkbox.checked : true;

          const musclesInput = gymEl.groupsContainer.querySelector(
            `input[data-role="dayMusclesInput"][data-day-index="${dayIndex}"]`
          );
          const raw = musclesInput?.value || '';
          const muscles = raw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          day.muscles = muscles.length ? muscles : [];

          period.days = days;

          if (!dayRuntime.groups) dayRuntime.groups = {};
          const allowed = new Set(day.muscles);
          Object.keys(dayRuntime.groups).forEach((groupName) => {
            if (!allowed.has(groupName)) {
              delete dayRuntime.groups[groupName];
            }
          });

          ui.editDays[dayIndex] = false;
          gymSaveState(gymState);
          gymRenderGroups();
        });
      });

  
    // ---- Р В Р в‚¬Р В РІР‚СњР В РЎвЂ™Р В РІР‚С”Р В Р’ВР В РЎС›Р В Р’В¬ Р В РІР‚СњР В РІР‚СћР В РЎСљР В Р’В¬ ----
    gymEl.groupsContainer
      .querySelectorAll('button[data-role="dayDelete"]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const dayIndex = Number(btn.dataset.dayIndex || '1');
          const period = gymGetActivePeriod();
          if (!period) return;
  
          const days = Array.isArray(period.days) ? period.days : [];
          period.days = days.filter((d) => d.dayIndex !== dayIndex);
  
          const runtime = gymGetCurrentCycle();
          if (runtime && runtime.days && runtime.days[dayIndex]) {
            delete runtime.days[dayIndex];
          }
  
          delete ui.editDays[dayIndex];
          gymSaveState(gymState);
          gymRenderGroups();
        });
      });
  
    // ---- Р В Р Р‹Р В РІР‚в„ўР В РІР‚СћР В Р’В Р В РЎСљР В Р в‚¬Р В РЎС›Р В Р’В¬/Р В Р’В Р В РЎвЂ™Р В РІР‚вЂќР В РІР‚в„ўР В РІР‚СћР В Р’В Р В РЎСљР В Р в‚¬Р В РЎС›Р В Р’В¬ Р В РІР‚СњР В РІР‚СћР В РЎСљР В Р’В¬ ----
    gymEl.groupsContainer
      .querySelectorAll('[data-role="toggleDay"]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const dayIndex = btn.dataset.dayIndex;
          if (!dayIndex) return;
  
          const body = gymEl.groupsContainer.querySelector(
            `[data-role="dayBody"][data-day-index="${dayIndex}"]`
          );
          if (!body) return;
  
          const nowHidden = body.classList.toggle('hidden');
          ui.days[Number(dayIndex)] = !nowHidden;
          gymSaveState(gymState);
        });
      });
  
    // ---- Р В Р Р‹Р В РІР‚в„ўР В РІР‚СћР В Р’В Р В РЎСљР В Р в‚¬Р В РЎС›Р В Р’В¬/Р В Р’В Р В РЎвЂ™Р В РІР‚вЂќР В РІР‚в„ўР В РІР‚СћР В Р’В Р В РЎСљР В Р в‚¬Р В РЎС›Р В Р’В¬ Р В РІР‚СљР В Р’В Р В Р в‚¬Р В РЎСџР В РЎСџР В Р в‚¬ ----
    gymEl.groupsContainer
      .querySelectorAll('button[data-role="toggleGroup"]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const groupName = btn.dataset.group;
          if (!groupName) return;
          const dayWrapper = btn.closest('[data-day-index]');
          if (!dayWrapper) return;
          const list = dayWrapper.querySelector(
            `[data-group-container="${groupName}"][data-role="groupBody"]`
          );
          if (!list) return;
  
          const dayIndex = Number(dayWrapper.dataset.dayIndex || '1');
          const key = `${dayIndex}::${groupName}`;
  
          const nowHidden = list.classList.toggle('hidden');
          ui.groups[key] = !nowHidden;
          gymSaveState(gymState);
        });
      });
  
    // ---- Р В РІР‚СњР В РЎвЂєР В РІР‚ВР В РЎвЂ™Р В РІР‚в„ўР В Р’ВР В РЎС›Р В Р’В¬ Р В Р в‚¬Р В РЎСџР В Р’В Р В РЎвЂ™Р В РІР‚вЂњР В РЎСљР В РІР‚СћР В РЎСљР В Р’ВР В РІР‚Сћ ----
    gymEl.groupsContainer
      .querySelectorAll('button[data-role="addExercise"]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const groupName = btn.dataset.group;
          const dayWrapper = btn.closest('[data-day-index]');
          const dayIndexAttr = dayWrapper?.dataset.dayIndex;
          const dayIndex = Number(dayIndexAttr || '1');
  
          const runtime = gymGetCurrentCycle();
          if (!runtime.days[dayIndex]) runtime.days[dayIndex] = { groups: {} };
          const dayRuntime = runtime.days[dayIndex];
          if (!dayRuntime.groups[groupName]) dayRuntime.groups[groupName] = [];
  
          dayRuntime.groups[groupName].push({
            name: '',
            setsCount: '',
            repsCount: '',
            workWeight: '',
            warmup: '',
            rpe: 7,
            progressNote: '',
            nextCyclePlan: '',
          });
  
          gymSaveState(gymState);
          gymRenderGroups();
        });
      });
  
    // ---- Р В Р в‚¬Р В РІР‚СњР В РЎвЂ™Р В РІР‚С”Р В Р’ВР В РЎС›Р В Р’В¬ Р В РІР‚СљР В Р’В Р В Р в‚¬Р В РЎСџР В РЎСџР В Р в‚¬ ----
    gymEl.groupsContainer
      .querySelectorAll('button[data-role="deleteGroup"]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const groupName = btn.dataset.group;
          if (!groupName) return;
          const dayWrapper = btn.closest('[data-day-index]');
          const dayIndex = Number(dayWrapper?.dataset.dayIndex || '1');
  
          const runtime = gymGetCurrentCycle();
          if (!runtime.days[dayIndex]) runtime.days[dayIndex] = { groups: {} };
          const dayRuntime = runtime.days[dayIndex];
          if (!dayRuntime.groups[groupName]) return;
  
          delete dayRuntime.groups[groupName];
  
          const key = `${dayIndex}::${groupName}`;
          delete ui.groups[key];
  
          gymSaveState(gymState);
          gymRenderGroups();
        });
      });
  
    // ---- Р В Р’ВР В РІР‚вЂќР В РЎС™Р В РІР‚СћР В РЎСљР В РІР‚СћР В РЎСљР В Р’ВР В Р вЂЎ Р В РІР‚в„ў Р В РЎСџР В РЎвЂєР В РІР‚С”Р В Р вЂЎР В РўС’ Р В Р в‚¬Р В РЎСџР В Р’В Р В РЎвЂ™Р В РІР‚вЂњР В РЎСљР В РІР‚СћР В РЎСљР В Р’ВР В РІвЂћСћ (Р В Р вЂ Р В РЎвЂќР В Р’В»Р РЋР вЂ№Р РЋРІР‚РЋР В Р’В°Р РЋР РЏ name) ----
    gymEl.groupsContainer
      .querySelectorAll('[data-field]')
      .forEach((input) => {
        input.addEventListener('input', () => {
          const card = input.closest('[data-index]');
          const list = input.closest('[data-group]');
          const dayWrapper = input.closest('[data-day-index]');
          if (!card || !list || !dayWrapper) return;
  
          const idx = Number(card.dataset.index || '0');
          const groupName = list.dataset.group;
          const dayIndex = Number(dayWrapper.dataset.dayIndex || '1');
  
          const runtime = gymGetCurrentCycle();
          if (!runtime.days[dayIndex]) runtime.days[dayIndex] = { groups: {} };
          const dayRuntime = runtime.days[dayIndex];
          if (!dayRuntime.groups[groupName]) dayRuntime.groups[groupName] = [];
          const arr = dayRuntime.groups[groupName];
  
          if (!arr[idx]) return;
          const field = input.dataset.field;
          if (field === 'rpe') {
            const val = Number(input.value) || 1;
            arr[idx][field] = val;
            const label = card.querySelector('[data-rpe-label]');
            if (label) label.textContent = `${val}/10`;
          } else {
            arr[idx][field] = input.value;
          }
  
          gymSaveState(gymState);

          // Sync working sets to backend immediately (per storage contract)
          const workingSetFields = ['setsCount', 'repsCount', 'workWeight'];
          if (workingSetFields.includes(field)) {
            const period = gymGetActivePeriod();
            if (period && typeof FitnessSync !== 'undefined' && FitnessSync.saveGymExerciseSets) {
              const rtFull = gymState.runtime?.[period.id];
              const currentCycle = rtFull?.currentCycle || 1;
              FitnessSync.saveGymExerciseSets(
                period.id,
                currentCycle,
                dayIndex,
                groupName,
                idx,
                {
                  setsCount: arr[idx].setsCount,
                  repsCount: arr[idx].repsCount,
                  workWeight: arr[idx].workWeight,
                }
              );
            }
          }

          // UX: "Р В РЎСџР В Р’В»Р В Р’В°Р В Р вЂ¦ Р В Р вЂ¦Р В Р’В° Р РЋР С“Р В Р’В»Р В Р’ВµР В РўвЂ Р РЋРІР‚В Р В РЎвЂР В РЎвЂќР В Р’В»" - apply only on blur (when user finishes typing)
          // Using 'change' event instead of 'input' - triggers when user leaves the field
          if (field === 'nextCyclePlan') {
            // The actual sync to next cycle will happen on 'change' event, handled separately below
          }
        });

        // Separate handler for nextCyclePlan 'change' event (when user finishes typing)
        if (input.dataset.field === 'nextCyclePlan') {
          input.addEventListener('change', () => {
            const card = input.closest('[data-index]');
            const list = input.closest('[data-group]');
            const dayWrapper = input.closest('[data-day-index]');
            if (!card || !list || !dayWrapper) return;

            const idx = Number(card.dataset.index || '0');
            const groupName = list.dataset.group;
            const dayIndex = Number(dayWrapper.dataset.dayIndex || '1');

            const runtime = gymGetCurrentCycle();
            if (!runtime.days[dayIndex]) runtime.days[dayIndex] = { groups: {} };
            const dayRuntime = runtime.days[dayIndex];
            if (!dayRuntime.groups[groupName]) dayRuntime.groups[groupName] = [];
            const arr = dayRuntime.groups[groupName];

            if (!arr[idx]) return;

            // Update the value
            arr[idx].nextCyclePlan = input.value;

            // Apply to next cycle if it exists
            const period = gymGetActivePeriod();
            if (period) {
              const rtFull = gymState.runtime?.[period.id];
              const currentCycle = rtFull?.currentCycle || 1;
              const nextCycle = currentCycle + 1;

              if (rtFull?.cycles?.[nextCycle]) {
                const nextCycleRuntime = rtFull.cycles[nextCycle];
                if (nextCycleRuntime?.days?.[dayIndex]?.groups?.[groupName]) {
                  const nextArr = nextCycleRuntime.days[dayIndex].groups[groupName];
                  if (nextArr[idx]) {
                    nextArr[idx].workWeight = arr[idx].nextCyclePlan || '';
                    
                    if (typeof console !== 'undefined' && console.log) {
                      console.log('[GYM] nextCyclePlan applied to next cycle:', {
                        periodId: period.id,
                        currentCycle,
                        nextCycle,
                        nextCyclePlan: arr[idx].nextCyclePlan,
                        workWeight: nextArr[idx].workWeight
                      });
                    }
                  }
                }
              }
            }

            gymPersistState();
            gymRenderAll();
          });
        }
      });
  
    // ---- Р В Р Р‹Р В РІР‚в„ўР В РІР‚СћР В Р’В Р В РЎСљР В Р в‚¬Р В РЎС›Р В Р’В¬/Р В Р’В Р В РЎвЂ™Р В РІР‚вЂќР В РІР‚в„ўР В РІР‚СћР В Р’В Р В РЎСљР В Р в‚¬Р В РЎС›Р В Р’В¬ Р В Р в‚¬Р В РЎСџР В Р’В Р В РЎвЂ™Р В РІР‚вЂњР В РЎСљР В РІР‚СћР В РЎСљР В Р’ВР В РІР‚Сћ ----
    gymEl.groupsContainer
      .querySelectorAll('button[data-role="toggleExercise"]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const card = btn.closest('[data-index]');
          if (!card) return;
          const body = card.querySelector('[data-role="exerciseBody"]');
          if (!body) return;
          body.classList.toggle('hidden');
        });
      });
  
    // ---- Р В Р в‚¬Р В РІР‚СњР В РЎвЂ™Р В РІР‚С”Р В РІР‚СћР В РЎСљР В Р’ВР В РІР‚Сћ Р В Р в‚¬Р В РЎСџР В Р’В Р В РЎвЂ™Р В РІР‚вЂњР В РЎСљР В РІР‚СћР В РЎСљР В Р’ВР В Р вЂЎ ----
    gymEl.groupsContainer
      .querySelectorAll('button[data-delete]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const card = btn.closest('[data-index]');
          const list = btn.closest('[data-group]');
          const dayWrapper = btn.closest('[data-day-index]');
          if (!card || !list || !dayWrapper) return;
  
          const idx = Number(card.dataset.index || '0');
          const groupName = list.dataset.group;
          const dayIndex = Number(dayWrapper.dataset.dayIndex || '1');
  
          const runtime = gymGetCurrentCycle();
          if (!runtime.days[dayIndex]) runtime.days[dayIndex] = { groups: {} };
          const dayRuntime = runtime.days[dayIndex];
          const arr = dayRuntime.groups[groupName] || [];
  
          arr.splice(idx, 1);
          dayRuntime.groups[groupName] = arr;
  
          gymSaveState(gymState);
          gymRenderGroups();
        });
      });
  }


  
  
  if (gymEl.cycleSelect) {
    gymEl.cycleSelect.addEventListener('change', (e) => {
      const value = Number(e.target.value || '1');
      const idx = Number.isNaN(value) ? 1 : value;
      gymSetCurrentCycle(idx);
    });
  }
  
  if (gymEl.daySelect) {
    gymEl.daySelect.addEventListener('change', () => {
      const period = gymGetActivePeriod();
      if (!period) return;
  
      // Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В Р вЂ Р РЋР РЏР В Р’В·Р В РЎвЂќР В Р’В° Р В Р вЂ Р В Р’В°Р РЋР вЂљР В РЎвЂР В Р’В°Р В Р вЂ¦Р РЋРІР‚С™Р В РЎвЂўР В Р вЂ  Р В РЎвЂќ Р В РЎвЂР В Р вЂ¦Р В РўвЂР В Р’ВµР В РЎвЂќР РЋР С“Р РЋРЎвЂњ Р В РўвЂР В Р вЂ¦Р РЋР РЏ Р РЋРІР‚В Р В РЎвЂР В РЎвЂќР В Р’В»Р В Р’В°
      const value = gymEl.daySelect.value;
      if (value === 'Р В Р Р‹Р В Р’ВµР В РЎвЂ“Р В РЎвЂўР В РўвЂР В Р вЂ¦Р РЋР РЏ') {
        gymCurrentDayIndex = 1; // MVP: Р В Р вЂ Р РЋР С“Р В Р’ВµР В РЎвЂ“Р В РўвЂР В Р’В° Р В РІР‚СњР В Р’ВµР В Р вЂ¦Р РЋР Р‰ 1, Р В РЎвЂ”Р В РЎвЂўР В Р’В·Р В Р’В¶Р В Р’Вµ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В Р вЂ Р РЋР РЏР В Р’В¶Р В Р’ВµР В РЎВ Р В РЎвЂќ Р В РЎвЂќР В Р’В°Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РўвЂР В Р’В°Р РЋР вЂљР РЋР вЂ№
      } else {
        // Р В Р’ВµР РЋР С“Р В Р’В»Р В РЎвЂ Р В РЎвЂўР В РЎвЂ”Р РЋРІР‚В Р В РЎвЂР В РЎвЂ Р В Р’В±Р РЋРЎвЂњР В РўвЂР РЋРЎвЂњР РЋРІР‚С™ Р В Р вЂ Р В РЎвЂР В РўвЂР В Р’В° "Р В РІР‚СњР В Р’ВµР В Р вЂ¦Р РЋР Р‰ 1", "Р В РІР‚СњР В Р’ВµР В Р вЂ¦Р РЋР Р‰ 2" Р В РЎвЂ Р РЋРІР‚С™.Р В РЎвЂ”.
        const match = value.match(/\d+/);
        gymCurrentDayIndex = match ? Number(match[0]) : 1;
      }
  
      gymRenderGroups();
    });
  }
  
  function gymOpen() {
    if (!gymEl.screen) return;
    if (gymEl.periodsScreen) gymEl.periodsScreen.classList.add('hidden');
    gymEl.screen.classList.remove('hidden');
  
    const period = gymGetActivePeriod();
    if (period) {
      gymCurrentDayIndex = 1; // Р В Р вЂ Р РЋР С“Р В Р’ВµР В РЎвЂ“Р В РўвЂР В Р’В° Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В РЎвЂР В Р вЂ¦Р В Р’В°Р В Р’ВµР В РЎВ Р РЋР С“ Р В РІР‚СњР В Р вЂ¦Р РЋР РЏ 1 Р РЋРІР‚В Р В РЎвЂР В РЎвЂќР В Р’В»Р В Р’В°
    }
  
    gymRenderHeader();
    gymRenderGroups();
  }
  

  function gymClose() {
    if (!gymEl.screen) return;
    gymEl.screen.classList.add('hidden');
    if (gymEl.periodsScreen) gymEl.periodsScreen.classList.remove('hidden');
  }

  // Р В РЎвЂќР В Р вЂ¦Р В РЎвЂўР В РЎвЂ”Р В РЎвЂќР В Р’В° "Р В Р’В¤Р В РЎвЂР РЋРІР‚С™Р В Р вЂ¦Р В Р’ВµР РЋР С“ Р Р†РІР‚В РІР‚в„ў Р В РІР‚вЂќР В Р’В°Р В Р’В»"
  if (gymEl.fromFitnessBtn) {
    gymEl.fromFitnessBtn.addEventListener('click', gymOpenPeriodsScreen);
  }

  // --- Calendar skeleton handlers ---
  const gymCalendarScreen = document.getElementById('gymCalendarScreen');
  const gymCalendarOpenBtn = document.getElementById('gymCalendarOpenBtn');
  const gymCalendarCloseBtn = document.getElementById('gymCalendarCloseBtn');
  const gymCalendarPeriodSelect = document.getElementById('gymCalendarPeriodSelect');
  const gymCalendarPeriodStart = document.getElementById('gymCalendarPeriodStart');
  const gymCalendarSetStartBtn = document.getElementById('gymCalendarSetStartBtn');
  const gymCalendarMapDateBtn = document.getElementById('gymCalendarMapDateBtn');
  const gymCalendarDate = document.getElementById('gymCalendarDate');
  const gymCalendarOutput = document.getElementById('gymCalendarOutput');

  function populateCalendarPeriodSelect() {
    if (!gymCalendarPeriodSelect) return;
    gymCalendarPeriodSelect.innerHTML = '';
    const order = Array.isArray(gymState.periodOrder) ? gymState.periodOrder : Object.keys(gymState.periods || {});
    order.forEach(id => {
      const p = gymState.periods[id];
      if (!p) return;
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = `${p.name} (${p.cycleLengthDays}d Р вЂ™Р’В· ${p.totalCycles} cyc)`;
      gymCalendarPeriodSelect.appendChild(opt);
    });
  }

  function gymOpenCalendar() {
    if (!gymCalendarScreen) return;
    populateCalendarPeriodSelect();
    gymCalendarScreen.classList.remove('hidden');
  }

  function gymCloseCalendar() {
    if (!gymCalendarScreen) return;
    gymCalendarScreen.classList.add('hidden');
  }

  if (gymCalendarOpenBtn) gymCalendarOpenBtn.addEventListener('click', gymOpenCalendar);
  if (gymCalendarCloseBtn) gymCalendarCloseBtn.addEventListener('click', gymCloseCalendar);

  function mapDateToPeriodCycleDay(periodId, dateStr) {
    if (!periodId || !dateStr) return null;
    const p = gymState.periods[periodId];
    if (!p) return { error: 'Period not found' };

    const d = new Date(dateStr + 'T00:00:00');

    // Prefer mapping by completed workouts (actual boundaries)
    const cw = Array.isArray(gymState.completedWorkouts) ? gymState.completedWorkouts.filter(e => e.periodId === periodId) : [];
    if (cw.length) {
      // group by cycleIndex and compute min/max dates per cycle
      const cycles = {};
      cw.forEach((r) => {
        const ci = Number(r.cycleIndex) || 1;
        if (!cycles[ci]) cycles[ci] = { min: null, max: null, dates: [] };
        cycles[ci].dates.push(r.dateCompleted);
        const dt = new Date(r.dateCompleted + 'T00:00:00');
        if (!cycles[ci].min || dt < new Date(cycles[ci].min + 'T00:00:00')) cycles[ci].min = r.dateCompleted;
        if (!cycles[ci].max || dt > new Date(cycles[ci].max + 'T00:00:00')) cycles[ci].max = r.dateCompleted;
      });

      const sortedCycleIndexes = Object.keys(cycles).map(Number).sort((a,b)=>a-b);
      if (!sortedCycleIndexes.length) return { error: 'No completed cycles' };

      // find cycle containing date; if date falls between cycles, assign to previous cycle
      for (let i = 0; i < sortedCycleIndexes.length; i++) {
        const ci = sortedCycleIndexes[i];
        const info = cycles[ci];
        const minD = new Date(info.min + 'T00:00:00');
        const maxD = new Date(info.max + 'T00:00:00');
        if (d >= minD && d <= maxD) {
          const dayOfCycle = Math.floor((d - minD) / (24*60*60*1000)) + 1;
          return { cycleIndex: ci, dayOfCycle, cycleStart: info.min, cycleEnd: info.max };
        }
        if (d < minD) {
          // assign to previous cycle if exists, otherwise this one
          const prev = i > 0 ? sortedCycleIndexes[i-1] : ci;
          const prevInfo = cycles[prev];
          const prevStart = prevInfo.min;
          const dayOfCycle = Math.floor((d - new Date(prevStart + 'T00:00:00')) / (24*60*60*1000)) + 1;
          return { cycleIndex: prev, dayOfCycle, cycleStart: prevInfo.min, cycleEnd: prevInfo.max };
        }
      }

      // date after last cycle -> map to last cycle
      const last = sortedCycleIndexes[sortedCycleIndexes.length-1];
      const lastInfo = cycles[last];
      const dayOfCycle = Math.floor((d - new Date(lastInfo.min + 'T00:00:00')) / (24*60*60*1000)) + 1;
      return { cycleIndex: last, dayOfCycle, cycleStart: lastInfo.min, cycleEnd: lastInfo.max };
    }

    // fallback: use planned start (period.startDate or saved periodStartDates)
    const start = (p && p.startDate) || (gymState.periodStartDates && gymState.periodStartDates[periodId]);
    if (!start) return { error: 'No start date set for this period. Set a start date first.' };
    const startDate = new Date(start + 'T00:00:00');
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysSince = Math.floor((d - startDate) / msPerDay);
    if (daysSince < 0) return { error: 'Date is before period start' };
    const cycleIndex = Math.floor(daysSince / (p.cycleLengthDays || 1)) + 1;
    const dayOfCycle = (daysSince % (p.cycleLengthDays || 1)) + 1;
    return { cycleIndex, dayOfCycle, daysSince };
  }

  if (gymCalendarSetStartBtn) {
    gymCalendarSetStartBtn.addEventListener('click', () => {
      const pid = gymCalendarPeriodSelect?.value;
      const v = gymCalendarPeriodStart?.value;
      if (!pid || !v) return;
      if (!gymState.periodStartDates) gymState.periodStartDates = {};
      gymState.periodStartDates[pid] = v;
      gymSaveState(gymState);
      if (gymCalendarOutput) gymCalendarOutput.textContent = 'Start date saved.';
    });
  }

  if (gymCalendarMapDateBtn) {
    gymCalendarMapDateBtn.addEventListener('click', () => {
      const pid = gymCalendarPeriodSelect?.value;
      const dateVal = gymCalendarDate?.value;
      if (!pid || !dateVal) {
        if (gymCalendarOutput) gymCalendarOutput.textContent = 'Choose period and date.';
        return;
      }
      const res = mapDateToPeriodCycleDay(pid, dateVal);
      if (!res) {
        gymCalendarOutput.textContent = 'No mapping available.';
        return;
      }
      if (res.error) {
        gymCalendarOutput.textContent = res.error;
        return;
      }
      gymCalendarOutput.textContent = `Р В РІР‚СњР В Р’В°Р РЋРІР‚С™Р В Р’В° ${dateVal} Р Р†РІР‚В РІР‚в„ў Р В Р’В¦Р В РЎвЂР В РЎвЂќР В Р’В» ${res.cycleIndex}, Р В РІР‚СњР В Р’ВµР В Р вЂ¦Р РЋР Р‰ ${res.dayOfCycle} (Р В РўвЂР В Р вЂ¦Р В Р’ВµР В РІвЂћвЂ“ Р РЋР С“ Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’В°Р В Р’В»Р В Р’В°: ${res.daysSince})`;
    });
  }

  // Р РЋР С“Р В РЎвЂ”Р В РЎвЂР РЋР С“Р В РЎвЂўР В РЎвЂќ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В РЎвЂўР В Р вЂ : Р В Р вЂ¦Р В Р’В°Р В Р’В·Р В Р’В°Р В РўвЂ
  if (gymEl.periodsBackBtn) {
    gymEl.periodsBackBtn.addEventListener('click', gymClosePeriodsScreen);
  }

  // Р В РЎвЂќР В Р вЂ¦Р В РЎвЂўР В РЎвЂ”Р В РЎвЂќР В РЎвЂ "Р В Р Р‹Р В РЎвЂўР В Р’В·Р В РўвЂР В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂ"
  if (gymEl.createPeriodBtn) {
    gymEl.createPeriodBtn.addEventListener('click', () => {
      gymOpenPeriodWizardStep1();
    });
  }
  if (gymEl.createPeriodTopBtn) {
    gymEl.createPeriodTopBtn.addEventListener('click', () => {
      gymOpenPeriodWizardStep1();
    });
  }


  // Р В РЎВР В Р’В°Р РЋР С“Р РЋРІР‚С™Р В Р’ВµР РЋР вЂљ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В Р’В°: Р В Р вЂ¦Р В Р’В°Р В Р вЂ Р В РЎвЂР В РЎвЂ“Р В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ Р В РЎвЂ Р В РўвЂР В Р’ВµР В РІвЂћвЂ“Р РЋР С“Р РЋРІР‚С™Р В Р вЂ Р В РЎвЂР РЋР РЏ
  if (gymEl.periodWizardBackBtn) {
    gymEl.periodWizardBackBtn.addEventListener('click', () => {
      gymClosePeriodWizard();
    });
  }
  if (gymEl.periodStep1CancelBtn) {
    gymEl.periodStep1CancelBtn.addEventListener('click', () => {
      gymClosePeriodWizard();
    });
  }
  if (gymEl.periodStep1NextBtn) {
    gymEl.periodStep1NextBtn.addEventListener('click', () => {
      gymPeriodWizardStep1Next();
    });
  }
  if (gymEl.periodStep2BackBtn) {
    gymEl.periodStep2BackBtn.addEventListener('click', () => {
      // Р В Р вЂ¦Р В Р’В°Р В Р’В·Р В Р’В°Р В РўвЂ Р В Р вЂ¦Р В Р’В° Р РЋРІвЂљВ¬Р В Р’В°Р В РЎвЂ“ 1
      if (gymEl.periodStep2) gymEl.periodStep2.classList.add('hidden');
      if (gymEl.periodStep1) gymEl.periodStep1.classList.remove('hidden');
    });
  }
  if (gymEl.periodStep2CreateBtn) {
    gymEl.periodStep2CreateBtn.addEventListener('click', () => {
      if (!gymPeriodWizardDraft) return;
      if (!gymEl.periodDaysContainer) return;
  
      // Р В Р Р‹Р В РЎвЂўР В Р’В±Р В РЎвЂР РЋР вЂљР В Р’В°Р В Р’ВµР В РЎВ Р В РўвЂР В Р вЂ¦Р В РЎвЂ Р В РЎвЂР В Р’В· UI
      const dayDivs = gymEl.periodDaysContainer.querySelectorAll('[data-day-index]');
      const rawDays = [];
      dayDivs.forEach((div) => {
        const dayIndex = Number(div.dataset.dayIndex || '1');
        const enabledInput = div.querySelector('input[data-field="dayEnabled"]');
        const musclesInput = div.querySelector('input[data-field="muscles"]');
      
        const enabled = enabledInput ? !!enabledInput.checked : true;
        const rawMuscles = musclesInput?.value || '';
        const muscles = rawMuscles
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      
        rawDays.push({ dayIndex, enabled, muscles });
      });
      
      // Р В Р вЂ  Р В РЎВР В РЎвЂўР В РўвЂР В Р’ВµР В Р’В»Р РЋР Р‰ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В Р’В° Р РЋР С“Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р РЋР РЏР В Р’ВµР В РЎВ Р РЋРІР‚С™Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В РЎвЂќР В РЎвЂў Р В Р вЂ Р В РЎвЂќР В Р’В»Р РЋР вЂ№Р РЋРІР‚РЋР РЋРІР‚ВР В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В Р’Вµ Р В РўвЂР В Р вЂ¦Р В РЎвЂ
      const days = rawDays.filter((d) => d.enabled);
      gymPeriodWizardDraft.days = days;
  
      gymPeriodWizardDraft.days = days;
  
      // Р В Р Р‹Р В РЎвЂўР В Р’В·Р В РўвЂР В Р’В°Р РЋРІР‚ВР В РЎВ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂ Р В Р вЂ  gymState
      const periodId = gymCreatePeriodId();
      const period = {
        id: periodId,
        name: gymPeriodWizardDraft.name || 'Р В РЎСџР В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂ',
        type: gymPeriodWizardDraft.type,
        splitType: gymPeriodWizardDraft.splitType,
        cycleLengthDays: gymPeriodWizardDraft.cycleLengthDays,
        totalCycles: gymPeriodWizardDraft.totalCycles,
        workoutsPerCycle: gymPeriodWizardDraft.workoutsPerCycle || days.length, // Р В РЎСљР В РЎвЂєР В РІР‚в„ўР В РЎвЂєР В РІР‚Сћ
        days,
        cycles: {}, // Р В РЎвЂ”Р В РЎвЂўР В РЎвЂќР В Р’В° Р РЋРІР‚В Р В РЎвЂР В РЎвЂќР В Р’В»Р РЋРІР‚в„– Р РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В РЎвЂР В РЎВ Р РЋРІР‚С™Р РЋРЎвЂњР РЋРІР‚С™, Р В РўвЂР В Р’В°Р В Р’В»Р РЋР Р‰Р РЋРІвЂљВ¬Р В Р’Вµ Р РЋР вЂљР В Р’В°Р РЋР С“Р РЋРІвЂљВ¬Р В РЎвЂР РЋР вЂљР В РЎвЂР В РЎВ
        runtime: {}, // Р В РЎВР В РЎвЂўР В Р’В¶Р В Р вЂ¦Р В РЎвЂў Р В РЎвЂР РЋР С“Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В Р’В·Р В РЎвЂўР В Р вЂ Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р В РўвЂР В Р’В»Р РЋР РЏ per-cycle Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦, Р В Р’ВµР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р вЂ¦Р РЋРЎвЂњР В Р’В¶Р В Р вЂ¦Р В РЎвЂў
      };
  
      gymState.periods[periodId] = period;
      if (!gymState.periodOrder || !Array.isArray(gymState.periodOrder)) gymState.periodOrder = [];
      gymState.periodOrder.push(periodId);
      // Initialize runtime fresh for the new period Р Р†Р вЂљРІР‚Сњ do NOT reuse old runtime data
      // Also reset any history/status/progress from old period
      if (!gymState.runtime) gymState.runtime = {};
      // initialize runtime cycles[1] with template days enabled
      const initialDays = {};
      (period.days || []).forEach(d => {
        const idx = Number(d.dayIndex);
        if (!Number.isNaN(idx) && idx > 0) {
          // New period: reset all history fields, no inheritance from old periods
          initialDays[idx] = { enabled: true, groups: {}, muscles: Array.isArray(d.muscles) ? d.muscles.slice() : [] };
        }
      });

      // Set start date to today for immediate rendering
      const today = new Date().toISOString().slice(0, 10);
      period.startDate = today;

      gymState.runtime[periodId] = {
        currentCycle: 1,
        totalCycles: Number(period.totalCycles) || 1,
        periodDone: 1,
        cycles: {
          1: { days: initialDays, groups: {} },
        },
      };

      // Debug logging for new period creation
      if (typeof console !== 'undefined' && console.log) {
        console.log('[GYM] Created new period:', {
          periodId: period.id,
          name: period.name,
          startDate: period.startDate,
          daysCount: days.length,
          runtimeCycles: Object.keys(gymState.runtime[periodId].cycles)
        });
      }

      gymSetActivePeriod(periodId);
  
      gymPersistState();
  
      // Р В Р’В·Р В Р’В°Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р В РЎВР В Р’В°Р РЋР С“Р РЋРІР‚С™Р В Р’ВµР РЋР вЂљ Р В РЎвЂ Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В Р’В°
      if (gymEl.periodWizardScreen) gymEl.periodWizardScreen.classList.add('hidden');
      // Re-render periods list to include new period, then open the period screen
      gymOpenPeriodsScreen();
      // Automatically open the newly created period
      gymSetActivePeriod(periodId);
      gymOpen();

    });
  }
  

  // Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦ Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р В РЎвЂќР РЋР вЂљР В Р’ВµР РЋРІР‚С™Р В Р вЂ¦Р В РЎвЂўР В РЎвЂ“Р В РЎвЂў Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В Р’В°
  if (gymEl.backBtn) {
    gymEl.backBtn.addEventListener('click', gymClose);
  }
  // "Save cycle": commit current runtime structure for this cycle to gymState + localStorage.
  // IMPORTANT: Only save current cycle data - do NOT propagate to future cycles
  if (gymEl.saveBtn) {
    gymEl.saveBtn.textContent = 'Р В Р Р‹Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р РЋРІР‚В Р В РЎвЂР В РЎвЂќР В Р’В»';
    gymEl.saveBtn.addEventListener('click', () => {
      const period = gymGetActivePeriod();
      if (!period) return;
      
      // Debug logging
      if (typeof console !== 'undefined' && console.log) {
        console.log('[GYM] Save cycle:', {
          periodId: period.id,
          currentCycle: gymState.runtime?.[period.id]?.currentCycle,
          savedAt: new Date().toISOString()
        });
      }
      
      // Only save current cycle - no propagation to future cycles
      gymPersistState();
      gymRenderAll();
    });
  }
  
  if (gymEl.historyBtn) {
    gymEl.historyBtn.addEventListener('click', () => {
      showAlert('Р В Р’ВР РЋР С“Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР В РЎвЂР РЋР РЏ Р РЋРІР‚С™Р РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В РЎвЂўР В РЎвЂќ Р В РЎвЂ”Р В РЎвЂўР РЋР РЏР В Р вЂ Р В РЎвЂР РЋРІР‚С™Р РЋР С“Р РЋР РЏ Р В РЎвЂ”Р В РЎвЂўР В Р’В·Р В Р’В¶Р В Р’Вµ');
    });
  }
  
  // --- Fitness: Р В РІР‚СћР В РўвЂР В Р’В° - Р В РўвЂР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ (Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р В РЎвЂР В Р’Вµ Р В РЎВР В РЎвЂўР В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂќР В РЎвЂ) ---
  const fitnessFoodAddBtn = document.getElementById('fitnessFoodAdd');

  if (fitnessFoodAddBtn) {
    fitnessFoodAddBtn.addEventListener('click', () => {
      fitnessOpenFoodModal(null); // Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р В Р вЂ¦Р В Р’В°Р РЋРІвЂљВ¬Р РЋРЎвЂњ Р В РЎвЂўР В Р’В±Р РЋР вЂ°Р В Р’ВµР В РўвЂР В РЎвЂР В Р вЂ¦Р РЋРІР‚ВР В Р вЂ¦Р В Р вЂ¦Р РЋРЎвЂњР РЋР вЂ№ Р РЋРІР‚С›Р В РЎвЂўР РЋР вЂљР В РЎВР РЋРЎвЂњ (Р РЋР вЂљР РЋРЎвЂњР РЋРІР‚РЋР В Р вЂ¦Р В РЎвЂўР В РІвЂћвЂ“/Р В Р’В°Р В Р вЂ Р РЋРІР‚С™Р В РЎвЂў)
    });
  }


  // ========== COLLAPSIBLE FITNESS CARDS ==========
  
  // Р В Р’ВР В Р вЂ¦Р В РЎвЂР РЋРІР‚В Р В РЎвЂР В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ Р РЋР С“Р В Р вЂ Р В РЎвЂўР РЋР вЂљР В Р’В°Р РЋРІР‚РЋР В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВР РЋРІР‚в„–Р РЋРІР‚В¦ Р В РЎвЂќР В Р’В°Р РЋР вЂљР РЋРІР‚С™Р В РЎвЂўР РЋРІР‚РЋР В Р’ВµР В РЎвЂќ
  function fitnessInitCollapsibleCards() {
    const headers = document.querySelectorAll('.fitness-card-header');
    
    headers.forEach(header => {
      // Р В РЎСџР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’ВµР РЋР вЂљР РЋР РЏР В Р’ВµР В РЎВ, Р В Р вЂ¦Р В Р’Вµ Р В РўвЂР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦ Р В Р’В»Р В РЎвЂ Р РЋРЎвЂњР В Р’В¶Р В Р’Вµ Р В РЎвЂўР В Р’В±Р РЋР вЂљР В Р’В°Р В Р’В±Р В РЎвЂўР РЋРІР‚С™Р РЋРІР‚РЋР В РЎвЂР В РЎвЂќ
      if (header.dataset.collapseInitialized) return;
      header.dataset.collapseInitialized = 'true';
      
      header.addEventListener('click', (e) => {
        // Р В РЎСљР В Р’Вµ Р РЋР С“Р В Р вЂ Р В РЎвЂўР РЋР вЂљР В Р’В°Р РЋРІР‚РЋР В РЎвЂР В Р вЂ Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂ Р В РЎвЂќР В Р’В»Р В РЎвЂР В РЎвЂќР В Р’Вµ Р В Р вЂ¦Р В Р’В° Р В РЎвЂќР В Р вЂ¦Р В РЎвЂўР В РЎвЂ”Р В РЎвЂќР В РЎвЂ Р В Р вЂ Р В Р вЂ¦Р РЋРЎвЂњР РЋРІР‚С™Р РЋР вЂљР В РЎвЂ Р РЋРІвЂљВ¬Р В Р’В°Р В РЎвЂ”Р В РЎвЂќР В РЎвЂ
        if (e.target.tagName === 'BUTTON' || e.target.closest('BUTTON')) return;
        
        // Р В РЎСџР В Р’В Р В РІР‚СћР В РІР‚СњР В РЎвЂєР В РЎС›Р В РІР‚в„ўР В Р’В Р В РЎвЂ™Р В Р’В©Р В РІР‚СћР В РЎСљР В Р’ВР В РІР‚Сћ Р В РЎв„ўР В РЎвЂєР В РЎСљР В Р’В¤Р В РІР‚С”Р В Р’ВР В РЎв„ўР В РЎС›Р В РЎвЂ™: Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р вЂ¦Р В Р’В°Р В Р вЂ Р В Р’В»Р В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р В Р вЂ Р РЋР С“Р В РЎвЂ”Р В Р’В»Р РЋРІР‚в„–Р РЋРІР‚С™Р В РЎвЂР В Р’Вµ, Р РЋРІР‚РЋР РЋРІР‚С™Р В РЎвЂўР В Р’В±Р РЋРІР‚в„– Р В РЎвЂќР В Р’В»Р В РЎвЂР В РЎвЂќ Р В РЎвЂ”Р В РЎвЂў header
        // Р В Р вЂ¦Р В Р’Вµ Р В Р вЂ Р РЋРІР‚в„–Р В Р’В·Р РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’В» Р В РЎвЂўР В Р’В±Р РЋР вЂљР В Р’В°Р В Р’В±Р В РЎвЂўР РЋРІР‚С™Р РЋРІР‚РЋР В РЎвЂР В РЎвЂќР В РЎвЂ Р В Р вЂ¦Р В Р’В° Р РЋР вЂљР В РЎвЂўР В РўвЂР В РЎвЂР РЋРІР‚С™Р В Р’ВµР В Р’В»Р РЋР Р‰Р РЋР С“Р В РЎвЂќР В РЎвЂўР В РІвЂћвЂ“ Р В РЎвЂќР В Р’В°Р РЋР вЂљР РЋРІР‚С™Р В РЎвЂўР РЋРІР‚РЋР В РЎвЂќР В Р’Вµ (Р В Р вЂ¦Р В Р’В°Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В РЎВР В Р’ВµР РЋР вЂљ, Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р В РЎвЂР В Р’Вµ Р В РЎвЂ”Р В РЎвЂўР В РЎвЂ”Р В Р’В°Р В РЎвЂ”Р В Р’В° Р РЋР РЉР В Р вЂ¦Р В Р’ВµР РЋР вЂљР В РЎвЂ“Р В РЎвЂР В РЎвЂ)
        e.stopPropagation();
        
        const card = header.closest('[class*="bg-white/"]');
        if (!card) return;
        
        const body = card.querySelector('.fitness-card-body');
        const chevron = header.querySelector('.fitness-card-chevron');
        
        if (body) {
          const isCollapsed = body.classList.contains('collapsed');
          
          if (isCollapsed) {
            // Р В Р’В Р В Р’В°Р В Р’В·Р В Р вЂ Р В РЎвЂўР РЋР вЂљР В Р’В°Р РЋРІР‚РЋР В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ
            body.classList.remove('collapsed');
            if (chevron) chevron.classList.remove('rotated');
          } else {
            // Р В Р Р‹Р В Р вЂ Р В РЎвЂўР РЋР вЂљР В Р’В°Р РЋРІР‚РЋР В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ
            body.classList.add('collapsed');
            if (chevron) chevron.classList.add('rotated');
          }
        }
      });
    });
    
    // Р В Р’В Р В РЎвЂ™Р В РІР‚вЂќР В РІР‚в„ўР В РІР‚СћР В РІР‚СњР В РІР‚СћР В РЎСљР В Р’ВР В РІР‚Сћ Р В РЎв„ўР В РІР‚С”Р В Р’ВР В РЎв„ўР В РЎвЂєР В РІР‚в„ў: Р В РўвЂР В Р’В»Р РЋР РЏ Р В РЎвЂќР В Р’В°Р РЋР вЂљР РЋРІР‚С™Р В РЎвЂўР РЋРІР‚РЋР В РЎвЂќР В РЎвЂ Р РЋР РЉР В Р вЂ¦Р В Р’ВµР РЋР вЂљР В РЎвЂ“Р В РЎвЂР В РЎвЂ - Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р В РЎвЂР В Р’Вµ Р В РЎвЂ”Р В РЎвЂўР В РЎвЂ”Р В Р’В°Р В РЎвЂ”Р В Р’В° Р РЋРІР‚С™Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В РЎвЂќР В РЎвЂў Р В РЎвЂ”Р РЋР вЂљР В РЎвЂ Р В РЎвЂќР В Р’В»Р В РЎвЂР В РЎвЂќР В Р’Вµ Р В РЎвЂ”Р В РЎвЂў body (Р В Р вЂ¦Р В Р’Вµ Р В РЎвЂ”Р В РЎвЂў header)
    const energyCard = document.getElementById('fitnessCaloriesCard');
    if (energyCard && !energyCard.dataset.popupHandlerAdded) {
      energyCard.dataset.popupHandlerAdded = 'true';
      energyCard.addEventListener('click', (e) => {
        // Р В РІР‚СћР РЋР С“Р В Р’В»Р В РЎвЂ Р В РЎвЂќР В Р’В»Р В РЎвЂР В РЎвЂќ Р В РЎвЂ”Р В РЎвЂў header - Р РЋР РЉР РЋРІР‚С™Р В РЎвЂў Р В РЎвЂўР В Р’В±Р РЋР вЂљР В Р’В°Р В Р’В±Р В Р’В°Р РЋРІР‚С™Р РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР РЋРІР‚С™ Р РЋР С“Р В Р вЂ Р В РЎвЂўР РЋР вЂљР В Р’В°Р РЋРІР‚РЋР В РЎвЂР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ, Р В РЎвЂР В РЎвЂ“Р В Р вЂ¦Р В РЎвЂўР РЋР вЂљР В РЎвЂР РЋР вЂљР РЋРЎвЂњР В Р’ВµР В РЎВ
        if (e.target.closest('.fitness-card-header')) return;
        // Р В Р’ВР В РЎвЂ“Р В Р вЂ¦Р В РЎвЂўР РЋР вЂљР В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂќР В Р’В»Р В РЎвЂР В РЎвЂќР В РЎвЂ Р В РЎвЂ”Р В РЎвЂў Р В РЎвЂќР В Р вЂ¦Р В РЎвЂўР В РЎвЂ”Р В РЎвЂќР В Р’В°Р В РЎВ
        if (e.target.closest('button')) return;
        // Р В РЎвЂєР РЋРІР‚С™Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р В РЎвЂ”Р В РЎвЂўР В РЎвЂ”Р В Р’В°Р В РЎвЂ” Р В РўвЂР В Р’ВµР РЋРІР‚С™Р В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР В РЎвЂ Р РЋР РЉР В Р вЂ¦Р В Р’ВµР РЋР вЂљР В РЎвЂ“Р В РЎвЂР В РЎвЂ
        if (typeof fitnessOpenEnergyDetails === 'function') {
          fitnessOpenEnergyDetails();
        }
      });
    }
    
    // Р В РЎвЂєР В Р’В±Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР В РЎВ Р В РЎВР В РЎвЂР В Р вЂ¦Р В РЎвЂ-Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В Р’Вµ Р В Р вЂ  Р РЋРІвЂљВ¬Р В Р’В°Р В РЎвЂ”Р В РЎвЂќР В Р’В°Р РЋРІР‚В¦
    fitnessUpdateCardSummaries();
  }
  
  // Р В РЎвЂєР В Р’В±Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎВР В РЎвЂР В Р вЂ¦Р В РЎвЂ-Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В Р вЂ  Р РЋРІвЂљВ¬Р В Р’В°Р В РЎвЂ”Р В РЎвЂќР В Р’В°Р РЋРІР‚В¦ Р В РЎвЂќР В Р’В°Р РЋР вЂљР РЋРІР‚С™Р В РЎвЂўР РЋРІР‚РЋР В Р’ВµР В РЎвЂќ
  function fitnessUpdateCardSummaries() {
    const dateKey = fitnessGetDateKey ? fitnessGetDateKey() : document.getElementById('fitnessDate')?.value;
    if (!dateKey) return;
    
    const dayData = FS.getDayData(dateKey);
    const profile = FS.getFitnessProfile();
    const summary = FS.getCaloriesSummary(profile, dayData);
    
    // 1. Р В Р’В­Р В Р вЂ¦Р В Р’ВµР РЋР вЂљР В РЎвЂ“Р В РЎвЂР РЋР РЏ Р РЋРІР‚С™Р В Р’ВµР В Р’В»Р В Р’В° - Р В РЎВР В РЎвЂР В Р вЂ¦Р В РЎвЂ-Р РЋРІвЂљВ¬Р В РЎвЂќР В Р’В°Р В Р’В»Р В Р’В° Р В Р’В±Р В Р’В°Р В Р’В»Р В Р’В°Р В Р вЂ¦Р РЋР С“Р В Р’В°
    fitnessUpdateEnergyMiniSummary(dayData, summary);
    
    // 2. Р В РЎвЂ™Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР В Р вЂ Р В Р вЂ¦Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р РЋР Р‰ - Р В РЎВР В РЎвЂР В Р вЂ¦Р В РЎвЂ-Р РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В РЎвЂќР В Р’В° Р В РЎвЂ Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В РЎвЂўР РЋР С“Р В РЎвЂќР В РЎвЂ
    fitnessUpdateActivityMiniSummary(dayData, summary);
    
    // 3. Р В РЎСџР В РЎвЂўР В РўвЂР В РўвЂР В Р’ВµР РЋР вЂљР В Р’В¶Р В РЎвЂќР В Р’В° Р РЋРІР‚С™Р В Р’ВµР В Р’В»Р В Р’В° - Р В РЎВР В РЎвЂР В Р вЂ¦Р В РЎвЂ-Р РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В РЎвЂќР В Р’В°
    fitnessUpdateSupportMiniSummary(dayData);
  }
  
  // Р В РЎвЂєР В Р’В±Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎВР В РЎвЂР В Р вЂ¦Р В РЎвЂ-Р РЋРІвЂљВ¬Р В Р’В°Р В РЎвЂ”Р В РЎвЂќР В РЎвЂ Р В Р’В­Р В Р вЂ¦Р В Р’ВµР РЋР вЂљР В РЎвЂ“Р В РЎвЂР В РЎвЂ
  function fitnessUpdateEnergyMiniSummary(dayData, summary) {
    const energyBalance = summary?.balance || 0;
    const MAX_ABS_BALANCE = 1000;
    const balancePercent = Math.min(100, Math.abs(energyBalance) / MAX_ABS_BALANCE * 100);
    const balanceFill = document.getElementById('energyMiniBalanceFill');
    const balanceText = document.getElementById('energyMiniBalanceText');
    
    if (balanceFill && balanceText) {
      // Р В Р’В¦Р В Р вЂ Р В Р’ВµР РЋРІР‚С™: Р В Р’В·Р В Р’ВµР В Р’В»Р РЋРІР‚ВР В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂ Р В РўвЂР В Р’ВµР РЋРІР‚С›Р В РЎвЂР РЋРІР‚В Р В РЎвЂР РЋРІР‚С™Р В Р’Вµ (Р В Р’В±Р В Р’В°Р В Р’В»Р В Р’В°Р В Р вЂ¦Р РЋР С“ < 0), Р В РЎвЂќР РЋР вЂљР В Р’В°Р РЋР С“Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚С›Р В РЎвЂР РЋРІР‚В Р В РЎвЂР РЋРІР‚С™Р В Р’Вµ (Р В Р’В±Р В Р’В°Р В Р’В»Р В Р’В°Р В Р вЂ¦Р РЋР С“ > 0)
      const isDeficit = energyBalance <= 0;
      balanceFill.className = 'fitness-mini-balance-fill ' + (isDeficit ? 'bg-green-400' : 'bg-red-400');
      
      // Р В РЎСџР В РЎвЂўР В Р’В·Р В РЎвЂР РЋРІР‚В Р В РЎвЂР В РЎвЂўР В Р вЂ¦Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ: Р В РЎвЂўР РЋРІР‚С™ Р РЋРІР‚В Р В Р’ВµР В Р вЂ¦Р РЋРІР‚С™Р РЋР вЂљР В Р’В° Р В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ Р В РЎвЂў Р В РЎвЂР В Р’В»Р В РЎвЂ Р В Р вЂ Р В РЎвЂ”Р РЋР вЂљР В Р’В°Р В Р вЂ Р В РЎвЂў
      if (energyBalance === 0) {
        balanceFill.style.left = '50%';
        balanceFill.style.width = '0%';
      } else if (isDeficit) {
        // Р В РІР‚СњР В Р’ВµР РЋРІР‚С›Р В РЎвЂР РЋРІР‚В Р В РЎвЂР РЋРІР‚С™ - Р В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ Р В РЎвЂў Р В РЎвЂўР РЋРІР‚С™ Р РЋРІР‚В Р В Р’ВµР В Р вЂ¦Р РЋРІР‚С™Р РЋР вЂљР В Р’В°
        balanceFill.style.left = (50 - balancePercent) + '%';
        balanceFill.style.width = balancePercent + '%';
      } else {
        // Р В РЎСџР РЋР вЂљР В РЎвЂўР РЋРІР‚С›Р В РЎвЂР РЋРІР‚В Р В РЎвЂР РЋРІР‚С™ - Р В Р вЂ Р В РЎвЂ”Р РЋР вЂљР В Р’В°Р В Р вЂ Р В РЎвЂў Р В РЎвЂўР РЋРІР‚С™ Р РЋРІР‚В Р В Р’ВµР В Р вЂ¦Р РЋРІР‚С™Р РЋР вЂљР В Р’В°
        balanceFill.style.left = '50%';
        balanceFill.style.width = balancePercent + '%';
      }
      
      // Р В РЎС›Р В Р’ВµР В РЎвЂќР РЋР С“Р РЋРІР‚С™: "-350 Р В РЎвЂќР В РЎвЂќР В Р’В°Р В Р’В»" Р В РЎвЂР В Р’В»Р В РЎвЂ "+200 Р В РЎвЂќР В РЎвЂќР В Р’В°Р В Р’В»"
      const sign = energyBalance > 0 ? '+' : '';
      balanceText.textContent = sign + energyBalance;
      balanceText.className = 'text-[10px] font-medium ' + (isDeficit ? 'text-green-300' : 'text-red-300');
    }
  }
  
  // Р В РЎвЂєР В Р’В±Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎВР В РЎвЂР В Р вЂ¦Р В РЎвЂ-Р РЋРІвЂљВ¬Р В Р’В°Р В РЎвЂ”Р В РЎвЂќР В РЎвЂ Р В РЎвЂ™Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР В Р вЂ Р В Р вЂ¦Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂ
  function fitnessUpdateActivityMiniSummary(dayData, summary) {
    const activities = dayData?.activities || [];
    const totals = { gym: 0, cardio: 0, home: 0, steps: 0, count: 0 };
    
    activities.forEach(a => {
      if (a.kind === 'gym' || a.kind === 'strength') {
        totals.gym += a.calories || 0;
        totals.count++;
      } else if (a.kind === 'cardio_indoor' || a.kind === 'cardio_outdoor' || a.kind === 'cardio') {
        totals.cardio += a.calories || 0;
        totals.count++;
      } else if (a.kind === 'home' || a.kind === 'home_exercise') {
        totals.home += a.calories || 0;
        totals.count++;
      } else if (a.kind === 'steps') {
        totals.steps += a.calories || 0;
        totals.count++;
      }
    });
    
    const totalActivityCal = totals.gym + totals.cardio + totals.home + totals.steps;
    
    // Р В РЎС™Р В РЎвЂР В Р вЂ¦Р В РЎвЂ-Р РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В РЎвЂќР В Р’В° (Р РЋР С“Р В РЎвЂўР В РЎвЂќР РЋР вЂљР В Р’В°Р РЋРІР‚В°Р РЋРІР‚ВР В Р вЂ¦Р В Р вЂ¦Р В РЎвЂў)
    const activitySummary = document.getElementById('activityMiniSummary');
    if (activitySummary) {
      activitySummary.textContent = totals.count + ' Р В Р’В°Р В РЎвЂќР РЋРІР‚С™. Р вЂ™Р’В· ' + totalActivityCal + ' Р В РЎвЂќР В РЎвЂќР В Р’В°Р В Р’В»';
    }
    
    // Р В РЎС™Р В РЎвЂР В Р вЂ¦Р В РЎвЂ-Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В РЎвЂўР РЋР С“Р В РЎвЂќР В РЎвЂ (Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В РЎвЂ”Р В РЎвЂўР РЋР вЂљР РЋРІР‚В Р В РЎвЂР В РЎвЂўР В Р вЂ¦Р В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂў Р В РЎвЂќР В Р’В°Р В Р’В»Р В РЎвЂўР РЋР вЂљР В РЎвЂР РЋР РЏР В РЎВ)
    const maxCal = Math.max(totals.gym, totals.cardio, totals.home, totals.steps, 1);
    const stripWidth = 40; // Р В РЎВР В Р’В°Р В РЎвЂќР РЋР С“ Р РЋРІвЂљВ¬Р В РЎвЂР РЋР вЂљР В РЎвЂР В Р вЂ¦Р В Р’В° Р В Р вЂ  px
    
    const updateStrip = (id, cal) => {
      const el = document.getElementById(id);
      if (el && cal > 0) {
        el.style.width = (cal / maxCal * stripWidth) + 'px';
      } else if (el) {
        el.style.width = '0px';
      }
    };
    
    updateStrip('miniStripGym', totals.gym);
    updateStrip('miniStripCardio', totals.cardio);
    updateStrip('miniStripHome', totals.home);
    updateStrip('miniStripSteps', totals.steps);
  }
  
  // Р В РЎвЂєР В Р’В±Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎВР В РЎвЂР В Р вЂ¦Р В РЎвЂ-Р РЋРІвЂљВ¬Р В Р’В°Р В РЎвЂ”Р В РЎвЂќР В РЎвЂ Р В РЎСџР В РЎвЂўР В РўвЂР В РўвЂР В Р’ВµР РЋР вЂљР В Р’В¶Р В РЎвЂќР В РЎвЂ Р РЋРІР‚С™Р В Р’ВµР В Р’В»Р В Р’В°
  function fitnessUpdateSupportMiniSummary(dayData) {
    const dateKey = fitnessGetDateKey ? fitnessGetDateKey() : document.getElementById('fitnessDate')?.value;
    if (!dateKey) return;
    
    // Р В РІР‚СћР В РўвЂР В Р’В°
    const eaten = (dayData?.foods || []).reduce((sum, f) => sum + (f.calories || 0), 0);
    
    // Р В РІР‚в„ўР В РЎвЂўР В РўвЂР В Р’В°
    const waterData = FS.getWaterData(dateKey);
    const waterCurrent = (waterData?.currentMl || 0) / 1000;
    const waterTarget = ((waterData?.targetMl || 2000)) / 1000;
    
    // Р В РІР‚ВР В РЎвЂ™Р В РІР‚СњР РЋРІР‚в„–
    const supplements = FS.getAllSupplements();
    let suppTaken = 0, suppTotal = 0;
    
    // Р В Р Р‹Р РЋРІР‚РЋР В РЎвЂР РЋРІР‚С™Р В Р’В°Р В Р’ВµР В РЎВ Р В РІР‚ВР В РЎвЂ™Р В РІР‚СњР РЋРІР‚в„– Р В Р вЂ¦Р В Р’В° Р РЋР С“Р В Р’ВµР В РЎвЂ“Р В РЎвЂўР В РўвЂР В Р вЂ¦Р РЋР РЏ
    supplements.forEach(s => {
      if (s.daily) {
        const inInterval = FS.isDateInDailyInterval(s, dateKey);
        if (inInterval) {
          suppTotal++;
          const intakes = FS.getSupplementIntakesForDay(s.id, dateKey);
          if (intakes && intakes.some(i => i.checked)) suppTaken++;
        }
      }
    });
    
    const supportSummary = document.getElementById('supportMiniSummary');
    if (supportSummary) {
      // Р В РІР‚СћР В РўвЂР В Р’В°
      let text = 'Р В РІР‚СћР В РўвЂР В Р’В°: ' + eaten + ' Р В РЎвЂќР В РЎвЂќР В Р’В°Р В Р’В»';
      
      // Р В РІР‚в„ўР В РЎвЂўР В РўвЂР В Р’В° (Р В РЎвЂ”Р В РЎвЂўР В РўвЂР РЋР С“Р В Р вЂ Р В Р’ВµР РЋРІР‚РЋР В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р В Р’ВµР РЋР С“Р В Р’В»Р В РЎвЂ Р В Р вЂ Р РЋРІР‚в„–Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В Р’В°)
      const waterClass = waterCurrent >= waterTarget ? 'text-emerald-300' : '';
      text += ' Р вЂ™Р’В· Р В РІР‚в„ўР В РЎвЂўР В РўвЂР В Р’В°: <span class="' + waterClass + '">' + waterCurrent.toFixed(1) + ' / ' + waterTarget.toFixed(1) + ' Р В Р’В»</span>';
      
      // Р В РІР‚ВР В РЎвЂ™Р В РІР‚СњР РЋРІР‚в„–
      if (suppTotal > 0) {
        const suppClass = suppTaken >= suppTotal ? 'text-emerald-300' : (suppTaken < suppTotal ? 'text-amber-300' : '');
        text += ' Р вЂ™Р’В· Р В РІР‚ВР В РЎвЂ™Р В РІР‚СњР РЋРІР‚в„–: <span class="' + suppClass + '">' + suppTaken + ' / ' + suppTotal + '</span>';
      } else {
        text += ' Р вЂ™Р’В· Р В РІР‚ВР В РЎвЂ™Р В РІР‚СњР РЋРІР‚в„–: 0 / 0';
      }
      
      supportSummary.innerHTML = text;
    }
  }
  
  // Р В РІР‚в„ўР РЋРІР‚в„–Р В Р’В·Р В РЎвЂўР В Р вЂ  Р В РЎвЂР В Р вЂ¦Р В РЎвЂР РЋРІР‚В Р В РЎвЂР В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР В РЎвЂ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂ Р В Р’В·Р В Р’В°Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В Р’В·Р В РЎвЂќР В Р’Вµ Р В РЎвЂ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂ Р В РЎвЂР В Р’В·Р В РЎВР В Р’ВµР В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В РЎвЂ Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(fitnessInitCollapsibleCards, 100);
    });
  } else {
    setTimeout(fitnessInitCollapsibleCards, 100);
  }

  // ========== Р В Р Р‹Р В РІР‚в„ўР В РЎвЂєР В Р’В Р В РЎвЂ™Р В Р’В§Р В Р’ВР В РІР‚в„ўР В РЎвЂ™Р В РЎСљР В Р’ВР В РІР‚Сћ Р В РЎСџР В РЎвЂє Р В Р в‚¬Р В РЎС™Р В РЎвЂєР В РІР‚С”Р В Р’В§Р В РЎвЂ™Р В РЎСљР В Р’ВР В Р’В® ==========
  // Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР В РЎВ Р В РЎвЂќР В Р’В»Р В Р’В°Р РЋР С“Р РЋР С“ collapsed Р В РЎвЂќР В РЎвЂў Р В Р вЂ Р РЋР С“Р В Р’ВµР В РЎВ Р В РЎвЂќР В Р’В°Р РЋР вЂљР РЋРІР‚С™Р В РЎвЂўР РЋРІР‚РЋР В РЎвЂќР В Р’В°Р В РЎВ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂ Р В РЎвЂР В Р вЂ¦Р В РЎвЂР РЋРІР‚В Р В РЎвЂР В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР В РЎвЂ
  function fitnessCollapseAllCards() {
    document.querySelectorAll('.fitness-card-body').forEach(body => {
      body.classList.add('collapsed');
    });
    document.querySelectorAll('.fitness-card-chevron').forEach(chev => {
      chev.classList.add('rotated');
    });
  }

  // Р В РІР‚в„ўР РЋРІР‚в„–Р В Р’В·Р РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р РЋР С“Р РЋР вЂљР В Р’В°Р В Р’В·Р РЋРЎвЂњ Р В РЎвЂ”Р В РЎвЂўР РЋР С“Р В Р’В»Р В Р’Вµ Р В РЎвЂР В Р вЂ¦Р В РЎвЂР РЋРІР‚В Р В РЎвЂР В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР В РЎвЂ
  setTimeout(fitnessCollapseAllCards, 150);

  // ========== Р В РЎв„ўР В РЎСљР В РЎвЂєР В РЎСџР В РЎв„ўР В РЎвЂ™ "Р В РЎСљР В РЎвЂ™Р В РІР‚вЂќР В РЎвЂ™Р В РІР‚Сњ" Р В РІР‚в„ўР В РЎСљР В Р в‚¬Р В РЎС›Р В Р’В Р В Р’В Р В РІР‚СњР В РЎвЂ™Р В Р РѓР В РІР‚ВР В РЎвЂєР В Р’В Р В РІР‚СњР В РЎвЂ™ ==========
  const fitnessBackInDashboard = document.getElementById('fitnessBackInDashboard');
  if (fitnessBackInDashboard) {
    fitnessBackInDashboard.addEventListener('click', () => {
      // Р В РІР‚в„ўР В РЎвЂўР В Р’В·Р В Р вЂ Р РЋР вЂљР В Р’В°Р РЋРІР‚В°Р В Р’В°Р В Р’ВµР В РЎВР РЋР С“Р РЋР РЏ Р В Р вЂ¦Р В Р’В° Р В РЎвЂ“Р В Р’В»Р В Р’В°Р В Р вЂ Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦ Р РЋРІР‚РЋР В Р’ВµР РЋР вЂљР В Р’ВµР В Р’В· showMain()
      if (typeof showMain === 'function') {
        showMain();
      } else {
        // Р В Р’В¤Р В РЎвЂўР В Р’В»Р В Р’В»Р В Р’В±Р В Р’ВµР В РЎвЂќ - Р РЋР С“Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р РЋР Р‰ Р РЋРІР‚С›Р В РЎвЂР РЋРІР‚С™Р В Р вЂ¦Р В Р’ВµР РЋР С“-Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦
        const fitnessScreen = document.getElementById('fitnessScreen');
        if (fitnessScreen) fitnessScreen.classList.add('hidden');
      }
    });
  }

  // ========== Р В РІР‚вЂќР В РЎвЂ™Р В РІР‚СљР В Р’В Р В Р в‚¬Р В РІР‚вЂќР В РЎв„ўР В РЎвЂ™ Р В Р’В¤Р В РЎвЂєР В РЎС›Р В РЎвЂє ==========
  const PHOTO_DEBUG_MODE = true;
  const PHOTO_CURRENT_KEY = 'fitness_photo_current';
  const fitnessPhotoUpload = document.getElementById('fitnessPhotoUpload');
  const fitnessPhotoBtn = document.getElementById('fitnessPhotoBtn');
  const fitnessPhotoDebug = document.getElementById('fitnessPhotoDebug');
  const fitnessAvatar = document.getElementById('fitnessAvatar');
  const fitnessAvatarPlaceholder = document.getElementById('fitnessAvatarPlaceholder');

  function fitnessPhotoDebugLog(text) {
    if (!PHOTO_DEBUG_MODE || !fitnessPhotoDebug) return;
    fitnessPhotoDebug.classList.remove('hidden');
    const timestamp = new Date().toTimeString().slice(0, 8);
    const line = `[${timestamp}] ${text}`;
    fitnessPhotoDebug.textContent = line + '\n' + (fitnessPhotoDebug.textContent || '');
  }

  function fitnessOpenPhotoPicker() {
    if (!fitnessPhotoUpload) {
      fitnessPhotoDebugLog('photo: error/unsupported (input missing)');
      return;
    }
    if (fitnessPhotoUpload.disabled) {
      fitnessPhotoDebugLog('photo: error/unsupported (input disabled)');
      return;
    }

    try {
      fitnessPhotoDebugLog('photo: button click ok');
      if (typeof fitnessPhotoUpload.showPicker === 'function') {
        fitnessPhotoUpload.showPicker();
        fitnessPhotoDebugLog('photo: input click ok (showPicker)');
      } else {
        fitnessPhotoUpload.click();
        fitnessPhotoDebugLog('photo: input click ok (click)');
      }
    } catch (err) {
      fitnessPhotoDebugLog('photo: error/unsupported (' + (err?.message || 'picker failed') + ')');
    }
  }

  function fitnessReadDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(String(event.target?.result || ''));
      reader.onerror = () => reject(new Error('read error'));
      reader.readAsDataURL(file);
    });
  }

  function fitnessCompressImageDataUrl(dataUrl, maxSide = 1280, quality = 0.82) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, maxSide / Math.max(img.width || 1, img.height || 1));
        const width = Math.max(1, Math.round((img.width || 1) * ratio));
        const height = Math.max(1, Math.round((img.height || 1) * ratio));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  fitnessPhotoBtn?.addEventListener('click', () => {
    fitnessOpenPhotoPicker();
  });

  if (fitnessPhotoUpload) {
    fitnessPhotoUpload.addEventListener('change', async (e) => {
      fitnessPhotoDebugLog('photo: change event');
      const file = e.target.files[0];
      if (!file) {
        fitnessPhotoDebugLog('photo: change event, no file selected');
        return;
      }

      if (!file.type.startsWith('image/')) {
        fitnessPhotoDebugLog('photo: error/unsupported (not image)');
        showAlert('Р В РЎСџР В РЎвЂўР В Р’В¶Р В Р’В°Р В Р’В»Р РЋРЎвЂњР В РІвЂћвЂ“Р РЋР С“Р РЋРІР‚С™Р В Р’В°, Р В Р вЂ Р РЋРІР‚в„–Р В Р’В±Р В Р’ВµР РЋР вЂљР В РЎвЂР РЋРІР‚С™Р В Р’Вµ Р В РЎвЂР В Р’В·Р В РЎвЂўР В Р’В±Р РЋР вЂљР В Р’В°Р В Р’В¶Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ');
        return;
      }

      fitnessPhotoDebugLog('photo: change event, file selected (' + file.type + ', ' + file.size + 'b)');

      try {
        const rawDataUrl = await fitnessReadDataUrl(file);
        const dataUrl = await fitnessCompressImageDataUrl(rawDataUrl);
        localStorage.setItem(PHOTO_CURRENT_KEY, dataUrl);
        fitnessPhotoDebugLog('photo: save ok');

        if (fitnessAvatar) {
          fitnessAvatar.src = dataUrl;
          fitnessAvatar.classList.remove('hidden');
        }
        if (fitnessAvatarPlaceholder) {
          fitnessAvatarPlaceholder.classList.add('hidden');
        }

        fitnessPhotoDebugLog('photo: file read ok, preview shown');
        showAlert('Р В Р’В¤Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂў Р РЋР С“Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂў!');
      } catch (err) {
        console.warn('Р В РЎСљР В Р’Вµ Р РЋРЎвЂњР В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂўР РЋР С“Р РЋР Р‰ Р РЋР С“Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р РЋРІР‚С›Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂў:', err);
        fitnessPhotoDebugLog('photo: error/unsupported (localStorage save failed)');
        showAlert('Р В РЎвЂєР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В° Р В РЎвЂ”Р РЋР вЂљР В РЎвЂ Р РЋРІР‚РЋР РЋРІР‚С™Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В РЎвЂ Р В РЎвЂР В Р’В»Р В РЎвЂ Р РЋР С“Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В РЎвЂ Р РЋРІР‚С›Р В Р’В°Р В РІвЂћвЂ“Р В Р’В»Р В Р’В°');
      }
    });
  }

  function fitnessLoadSavedPhoto() {
    try {
      const savedPhoto = localStorage.getItem(PHOTO_CURRENT_KEY);

      if (savedPhoto && fitnessAvatar) {
        fitnessAvatar.src = savedPhoto;
        fitnessAvatar.classList.remove('hidden');
        if (fitnessAvatarPlaceholder) {
          fitnessAvatarPlaceholder.classList.add('hidden');
        }
      } else {
        if (fitnessAvatar) fitnessAvatar.classList.add('hidden');
        if (fitnessAvatarPlaceholder) fitnessAvatarPlaceholder.classList.remove('hidden');
      }
    } catch (err) {
      console.warn('Р В РЎСљР В Р’Вµ Р РЋРЎвЂњР В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂўР РЋР С“Р РЋР Р‰ Р В Р’В·Р В Р’В°Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В Р’В·Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р РЋРІР‚С›Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂў:', err);
      if (fitnessAvatar) fitnessAvatar.classList.add('hidden');
      if (fitnessAvatarPlaceholder) fitnessAvatarPlaceholder.classList.remove('hidden');
    }
  }

  setTimeout(fitnessLoadSavedPhoto, 200);


  // ========== Р В РЎв„ўР В РЎСљР В РЎвЂєР В РЎСџР В РЎв„ўР В РЎвЂ™ "Р В Р’В¤Р В Р’ВР В РЎС›Р В РЎСљР В РІР‚СћР В Р Р‹" Р В РЎСљР В РЎвЂ™ Р В РІР‚СљР В РІР‚С”Р В РЎвЂ™Р В РІР‚в„ўР В РЎСљР В РЎвЂєР В РЎС™ Р В Р’В­Р В РЎв„ўР В Р’В Р В РЎвЂ™Р В РЎСљР В РІР‚Сћ ==========
  if (el.fitnessBtn && !el.fitnessBtn.dataset.fitnessOpenBound) {
    if (!el.fitnessBtn.dataset.fitnessLegacyBound) {
      el.fitnessBtn.dataset.fitnessLegacyBound = '1';
      el.fitnessBtn.addEventListener('click', () => {
        showFitness();
      });
    }
  }


  // ========== Р В РЎв„ўР В РЎСљР В РЎвЂєР В РЎСџР В РЎв„ўР В РЎвЂ™ "Р В РЎСљР В РЎвЂ™Р В РІР‚вЂќР В РЎвЂ™Р В РІР‚Сњ" Р В РІР‚в„ўР В РЎСљР В Р’ВР В РІР‚вЂќР В Р в‚¬ Р В Р Р‹Р В РЎСџР В Р’В Р В РЎвЂ™Р В РІР‚в„ўР В РЎвЂ™ ==========
  const fitnessBackInDashboardFixed = document.getElementById('fitnessBackInDashboardFixed');
  if (fitnessBackInDashboardFixed) {
    fitnessBackInDashboardFixed.addEventListener('click', () => {
      // Р В РІР‚в„ўР В РЎвЂўР В Р’В·Р В Р вЂ Р РЋР вЂљР В Р’В°Р РЋРІР‚В°Р В Р’В°Р В Р’ВµР В РЎВР РЋР С“Р РЋР РЏ Р В Р вЂ¦Р В Р’В° Р В РЎвЂ“Р В Р’В»Р В Р’В°Р В Р вЂ Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦ Р РЋРІР‚РЋР В Р’ВµР РЋР вЂљР В Р’ВµР В Р’В· showMain()
      if (typeof showMain === 'function') {
        showMain();
      } else {
        // Р В Р’В¤Р В РЎвЂўР В Р’В»Р В Р’В»Р В Р’В±Р В Р’ВµР В РЎвЂќ - Р РЋР С“Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р РЋР Р‰ Р РЋРІР‚С›Р В РЎвЂР РЋРІР‚С™Р В Р вЂ¦Р В Р’ВµР РЋР С“-Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦
        const fitnessScreen = document.getElementById('fitnessScreen');
        if (fitnessScreen) fitnessScreen.classList.add('hidden');
      }
    });
  }


  // ========== Р В РЎСџР В РІР‚СћР В Р’В Р В РІР‚СћР В РЎв„ўР В РІР‚С”Р В Р’В®Р В Р’В§Р В РІР‚СћР В РЎСљР В Р’ВР В РІР‚Сћ Р В РЎС›Р В РІР‚СћР В РЎС™Р В Р’В« ==========
  const THEME_STORAGE_KEY = 'fitnessTheme';
  const DEFAULT_THEME = 'dark'; // Р В РЎСџР В РЎвЂў Р РЋРЎвЂњР В РЎВР В РЎвЂўР В Р’В»Р РЋРІР‚РЋР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР вЂ№ Р РЋРІР‚С™Р РЋРІР‚ВР В РЎВР В Р вЂ¦Р В Р’В°Р РЋР РЏ Р РЋРІР‚С™Р В Р’ВµР В РЎВР В Р’В°
  
  // Р В Р’В¤Р РЋРЎвЂњР В Р вЂ¦Р В РЎвЂќР РЋРІР‚В Р В РЎвЂР РЋР РЏ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В РЎВР В Р’ВµР В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ Р РЋРІР‚С™Р В Р’ВµР В РЎВР РЋРІР‚в„–
  function fitnessApplyTheme(theme) {
    const root = document.documentElement;
    const themeToggle = document.getElementById('fitnessThemeToggle');
    const themeLabel = document.getElementById('fitnessThemeLabel');
    const mainThemeToggle = document.getElementById('mainThemeToggle');
    const mainThemeLabel = document.getElementById('mainThemeLabel');
    
    if (theme === 'dark') {
      // Р В РЎС›Р РЋРІР‚ВР В РЎВР В Р вЂ¦Р В Р’В°Р РЋР РЏ Р РЋРІР‚С™Р В Р’ВµР В РЎВР В Р’В° - Р В РўвЂР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР В РЎВ Р В Р’В°Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂР В Р’В±Р РЋРЎвЂњР РЋРІР‚С™
      root.setAttribute('data-fitness-theme', 'dark');
      if (themeToggle) {
        themeToggle.textContent = 'Р В РЎС›Р РЋРІР‚ВР В РЎВР В Р вЂ¦Р В Р’В°Р РЋР РЏ';
        themeToggle.classList.remove('bg-white/20');
        themeToggle.classList.add('bg-indigo-500/50');
      }
      if (themeLabel) themeLabel.textContent = 'Р В РЎС›Р РЋРІР‚ВР В РЎВР В Р вЂ¦Р В Р’В°Р РЋР РЏ';
      if (mainThemeToggle) {
        mainThemeToggle.textContent = 'Р В РЎС›Р РЋРІР‚ВР В РЎВР В Р вЂ¦Р В Р’В°Р РЋР РЏ';
        mainThemeToggle.classList.remove('bg-white/20');
        mainThemeToggle.classList.add('bg-indigo-500/50');
      }
      if (mainThemeLabel) mainThemeLabel.textContent = 'Р В РЎС›Р РЋРІР‚ВР В РЎВР В Р вЂ¦Р В Р’В°Р РЋР РЏ';
    } else {
      // Р В Р Р‹Р В Р вЂ Р В Р’ВµР РЋРІР‚С™Р В Р’В»Р В Р’В°Р РЋР РЏ Р РЋРІР‚С™Р В Р’ВµР В РЎВР В Р’В° - Р РЋРЎвЂњР В Р’В±Р В РЎвЂР РЋР вЂљР В Р’В°Р В Р’ВµР В РЎВ Р В Р’В°Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂР В Р’В±Р РЋРЎвЂњР РЋРІР‚С™
      root.removeAttribute('data-fitness-theme');
      if (themeToggle) {
        themeToggle.textContent = 'Р В Р Р‹Р В Р вЂ Р В Р’ВµР РЋРІР‚С™Р В Р’В»Р В Р’В°Р РЋР РЏ';
        themeToggle.classList.remove('bg-indigo-500/50');
        themeToggle.classList.add('bg-white/20');
      }
      if (themeLabel) themeLabel.textContent = 'Р В Р Р‹Р В Р вЂ Р В Р’ВµР РЋРІР‚С™Р В Р’В»Р В Р’В°Р РЋР РЏ';
      if (mainThemeToggle) {
        mainThemeToggle.textContent = 'Р В Р Р‹Р В Р вЂ Р В Р’ВµР РЋРІР‚С™Р В Р’В»Р В Р’В°Р РЋР РЏ';
        mainThemeToggle.classList.remove('bg-indigo-500/50');
        mainThemeToggle.classList.add('bg-white/20');
      }
      if (mainThemeLabel) mainThemeLabel.textContent = 'Р В Р Р‹Р В Р вЂ Р В Р’ВµР РЋРІР‚С™Р В Р’В»Р В Р’В°Р РЋР РЏ';
    }
  }
  
  // Р В Р’В¤Р РЋРЎвЂњР В Р вЂ¦Р В РЎвЂќР РЋРІР‚В Р В РЎвЂР РЋР РЏ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В Р’ВµР В РЎвЂќР В Р’В»Р РЋР вЂ№Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ Р РЋРІР‚С™Р В Р’ВµР В РЎВР РЋРІР‚в„–
  function fitnessToggleTheme() {
    const currentTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    fitnessApplyTheme(newTheme);
  }
  
  // Р В Р’ВР В Р вЂ¦Р В РЎвЂР РЋРІР‚В Р В РЎвЂР В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ Р РЋРІР‚С™Р В Р’ВµР В РЎВР РЋРІР‚в„– Р В РЎвЂ”Р РЋР вЂљР В РЎвЂ Р В Р’В·Р В Р’В°Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В Р’В·Р В РЎвЂќР В Р’Вµ
  function fitnessInitTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
    fitnessApplyTheme(savedTheme);
  }
  
  // Р В РЎвЂєР В Р’В±Р РЋР вЂљР В Р’В°Р В Р’В±Р В РЎвЂўР РЋРІР‚С™Р РЋРІР‚РЋР В РЎвЂР В РЎвЂќ Р В РЎвЂќР В Р вЂ¦Р В РЎвЂўР В РЎвЂ”Р В РЎвЂќР В РЎвЂ Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В Р’ВµР В РЎвЂќР В Р’В»Р РЋР вЂ№Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ Р РЋРІР‚С™Р В Р’ВµР В РЎВР РЋРІР‚в„–
  const fitnessThemeToggle = document.getElementById('fitnessThemeToggle');
  if (fitnessThemeToggle) {
    fitnessThemeToggle.addEventListener('click', fitnessToggleTheme);
  }

  const mainThemeToggle = document.getElementById('mainThemeToggle');
  if (mainThemeToggle) {
    mainThemeToggle.addEventListener('click', fitnessToggleTheme);
  }
  
  // Р В РЎСџР РЋР вЂљР В РЎвЂР В РЎВР В Р’ВµР В Р вЂ¦Р РЋР РЏР В Р’ВµР В РЎВ Р РЋРІР‚С™Р В Р’ВµР В РЎВР РЋРЎвЂњ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂ Р В Р’В·Р В Р’В°Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В Р’В·Р В РЎвЂќР В Р’Вµ
  fitnessInitTheme();


}); // Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р В Р’ВµР РЋРІР‚В  DOMContentLoaded






