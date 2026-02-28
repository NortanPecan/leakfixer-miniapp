
  document.getElementById('stepsIntensity')?.addEventListener('change', fitnessUpdateStepsCaloriesPreview);

  fitnessEl.foodAdd?.addEventListener('click', () => fitnessOpenFoodModal(null));

  // РљР»РёРє РЅР° РєР°СЂС‚РѕС‡РєСѓ СЌРЅРµСЂРіРёРё вЂ” РѕС‚РєСЂС‹С‚СЊ РґРµС‚Р°Р»РёР·Р°С†РёСЋ
  document.getElementById('fitnessCaloriesCard')?.addEventListener('click', function(e) {
    // РќРµ РѕС‚РєСЂС‹РІР°С‚СЊ РµСЃР»Рё РєР»РёРє РїРѕ РєРЅРѕРїРєР°Рј РІРЅСѓС‚СЂРё РєР°СЂС‚РѕС‡РєРё
    if (e.target.closest('button')) return;
    fitnessOpenEnergyDetails();
  });

  // Р—Р°РєСЂС‹С‚РёРµ РјРѕРґР°Р»СЊРЅРѕРіРѕ РѕРєРЅР° СЌРЅРµСЂРіРёРё
  document.getElementById('energyDetailsCloseBtn')?.addEventListener('click', function() {
    document.getElementById('energyDetailsModalOverlay')?.classList.add('hidden');
  });
  document.getElementById('energyDetailsModalOverlay')?.addEventListener('click', function(e) {
    if (e.target.id === 'energyDetailsModalOverlay') {
      document.getElementById('energyDetailsModalOverlay')?.classList.add('hidden');
    }
  });

  // UPDATED: Water button handlers - use new fitnessAdjustWater
  document.querySelectorAll('.fitness-water-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const deltaMl = Number(btn.dataset.water) || 0;
      fitnessAdjustWater(deltaMl);
    });
  });

  // NEW: Water manual adjust link handler
  document.querySelectorAll('.fitness-water-adjust').forEach((link) => {
    link.addEventListener('click', () => {
      fitnessOpenWaterAdjustModal();
    });
  });

  // NEW: Water baseline change link handler
  document.querySelectorAll('.fitness-water-baseline').forEach((link) => {
    link.addEventListener('click', () => {
      fitnessOpenWaterBaselineModal();
    });
  });

  document.querySelectorAll('.fitness-workday-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.workday; // 'low' | 'normal' | 'high'
      const k = fitnessGetDateKey();
      const dayData = FS.getDayData(k);
      FS.updateDayData(k, { workDay: value });
      fitnessRenderWorkDay();
      fitnessRenderCalories(); // С‡С‚РѕР±С‹ РїРµСЂРµСЃС‡РёС‚Р°С‚СЊ РєРєР°Р» СЃ СѓС‡С‘С‚РѕРј workDay
    });
  });

  fitnessEl.modalOverlay?.addEventListener('click', (e) => {
    if (e.target === fitnessEl.modalOverlay) fitnessCloseModal();
  });

    // --- Р“Р»РѕР±Р°Р»СЊРЅР°СЏ С€РєР°Р»Р° РЅР°СЃС‚СЂРѕРµРЅРёСЏ (РіР»Р°РІРЅС‹Р№ СЌРєСЂР°РЅ) ---

    function renderGlobalMood(moodValue = 7.3, yesterdayValue = 6.5) {
    const container = document.getElementById('moodScaleContainer');
    const scoreEl = document.getElementById('moodScore');
    const yesterdayEl = document.getElementById('moodYesterday');
    const trendEl = document.getElementById('moodTrend');
    const statusEl = document.getElementById('moodStatus');

    if (!container || !scoreEl || !yesterdayEl || !trendEl || !statusEl) return;

    const segments = container.querySelectorAll('.mood-segment');

    const value = Math.max(0, Math.min(10, Number(moodValue) || 0));
    const yesterday = Math.max(0, Math.min(10, Number(yesterdayValue) || 0));

    const fullSegments = Math.floor(value);

    segments.forEach((segment, index) => {
      const level = 10 - index; // 10 = РІРµСЂС…РЅРёР№
      segment.innerHTML = '';   // РѕС‡РёС‰Р°РµРј РЅР° РІСЃСЏРєРёР№ СЃР»СѓС‡Р°Р№

      // Р±Р°Р·РѕРІС‹Р№ С„РѕРЅ (РЅРµР°РєС‚РёРІРЅС‹Р№)
      segment.style.backgroundColor = 'rgba(15,23,42,0.6)';

      if (level <= fullSegments) {
        // Р°РєС‚РёРІРЅС‹Р№ СЃРµРіРјРµРЅС‚
        const hue = 120 - level * 8; // Р·РµР»С‘РЅС‹Р№ в†’ РєСЂР°СЃРЅС‹Р№
        const color = `hsl(${hue}, 70%, 50%)`;
        segment.style.backgroundColor = color;
      }
    });

    // С‡РёСЃР»Р°
    scoreEl.textContent = value.toFixed(1);
    yesterdayEl.textContent = yesterday.toFixed(1);

    const diff = value - yesterday;
    if (Math.abs(diff) < 0.1) {
      trendEl.textContent = 'в†’ 0.0';
      trendEl.className = 'text-[10px] opacity-70';
    } else if (diff > 0) {
      trendEl.textContent = `в†— +${diff.toFixed(1)}`;
      trendEl.className = 'text-[10px] text-emerald-300';
    } else {
      trendEl.textContent = `в† ${diff.toFixed(1)}`;
      trendEl.className = 'text-[10px] text-red-300';
    }

    // СЃС‚Р°С‚СѓСЃ
    let statusText = '';
    let statusClass = 'text-xs font-medium ';
    if (value >= 8.5) {
      statusText = 'РџРёРє, РёСЃРїРѕР»СЊР·СѓР№ РјРѕРјРµРЅС‚';
      statusClass += 'text-orange-300';
    } else if (value >= 7) {
      statusText = 'РҐРѕСЂРѕС€РёР№ С‚РѕРЅ, РµСЃС‚СЊ СЂРµСЃСѓСЂСЃ';
      statusClass += 'text-emerald-300';
    } else if (value >= 5) {
      statusText = 'РќРѕСЂРјР°, РґРµСЂР¶Рё Р±Р°Р·Сѓ';
      statusClass += 'text-amber-200';
    } else if (value >= 3) {
      statusText = 'РЈСЃС‚Р°Р»РѕСЃС‚СЊ, РЅСѓР¶РµРЅ РѕС‚РґС‹С…';
      statusClass += 'text-red-300';
    } else {
      statusText = 'РљСЂРёР·РёСЃ, РЅСѓР¶РЅР° РїРѕРґРґРµСЂР¶РєР°';
      statusClass += 'text-red-400';
    }
    statusEl.textContent = statusText;
    statusEl.className = statusClass;
  }


  function initGlobalMoodWidget() {
    const btn = document.getElementById('logMoodBtn');
    if (btn) {
      btn.addEventListener('click', async () => {
        const raw = prompt('РўРµРєСѓС‰РµРµ СЃРѕСЃС‚РѕСЏРЅРёРµ (0вЂ“10):', '7');
        if (raw == null) return;
        const num = parseFloat(raw);
        if (Number.isNaN(num)) return;
  
        // РѕР±РЅРѕРІР»СЏРµРј UI
        renderGlobalMood(num, 6.5);
  
        // СЃРѕС…СЂР°РЅСЏРµРј РІ Supabase РєР°Рє daily_state + measurements
        if (window.FitnessSync && window.currentAppUserId) {
          const todayKey = FS.formatDateKey(new Date()); // YYYY-MM-DD
          try {
            await window.FitnessSync.saveMood(todayKey, num);
          } catch (e) {
            console.error('saveMood failed', e);
          }
        }
      });
    }
  
    renderGlobalMood(7.3, 6.5);
  }
  
  


  // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РїСЂРѕС„РёР»СЏ
  initProfileHeader();
  // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РіР»РѕР±Р°Р»СЊРЅРѕР№ С€РєР°Р»С‹ РЅР°СЃС‚СЂРѕРµРЅРёСЏ
  initGlobalMoodWidget();

  // Р—Р°РїСѓСЃРє РїСЂРёР»РѕР¶РµРЅРёСЏ
  if (supabaseEnabled) initFromSupabase();
  else initBrowserMode();

  let gymCurrentDayIndex = 1;


  // --- GYM: РўСЂРµРЅРёСЂРѕРІРєР° РІ Р·Р°Р»Рµ ---------------------------------------------
  const gymEl = {
    // СЌРєСЂР°РЅ СЃРїРёСЃРєР° РїРµСЂРёРѕРґРѕРІ
    periodsScreen: document.getElementById('gymPeriodsScreen'),
    periodsBackBtn: document.getElementById('gymPeriodsBackBtn'),
    noPeriodsState: document.getElementById('gymNoPeriodsState'),
    periodsListWrapper: document.getElementById('gymPeriodsListWrapper'),
    periodsList: document.getElementById('gymPeriodsList'),
    createPeriodBtn: document.getElementById('gymCreatePeriodBtn'),
    createPeriodTopBtn: document.getElementById('gymCreatePeriodTopBtn'),

    // СЌРєСЂР°РЅ РјР°СЃС‚РµСЂР° РїРµСЂРёРѕРґР°
    periodWizardScreen: document.getElementById('gymPeriodWizardScreen'),
    periodWizardBackBtn: document.getElementById('gymPeriodWizardBackBtn'),
    periodStep1: document.getElementById('gymPeriodStep1'),
    periodStep2: document.getElementById('gymPeriodStep2'),
    periodStep1CancelBtn: document.getElementById('gymPeriodStep1CancelBtn'),
    periodStep1NextBtn: document.getElementById('gymPeriodStep1NextBtn'),
    periodDaysContainer: document.getElementById('gymPeriodDaysContainer'),
    periodStep2BackBtn: document.getElementById('gymPeriodStep2BackBtn'),
    periodStep2CreateBtn: document.getElementById('gymPeriodStep2CreateBtn'),

    // СЌРєСЂР°РЅ РєРѕРЅРєСЂРµС‚РЅРѕРіРѕ РїРµСЂРёРѕРґР°
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

  // РґРѕ GYM-Р±Р»РѕРєР°, РїРѕСЃР»Рµ fitnessEl/gymEl
  const fitnessBtn = document.getElementById('fitnessBtn');

  // РїРµСЂРµРѕРїСЂРµРґРµР»СЏРµРј showFitness СЃ СѓС‡С‘С‚РѕРј fitnessEl Рё gymEl
  const _showFitnessBase = showFitness;
  function showFitnessFull() {
    _showFitnessBase();
    if (fitnessEl?.profileSetup) fitnessEl.profileSetup.classList.add('hidden');
    if (fitnessEl?.dashboard) fitnessEl.dashboard.classList.remove('hidden');
    if (gymEl?.periodsScreen) gymEl.periodsScreen.classList.add('hidden');
    if (gymEl?.periodWizardScreen) gymEl.periodWizardScreen.classList.add('hidden');
    if (gymEl?.screen) gymEl.screen.classList.add('hidden');
  }

  // РљРЅРѕРїРєРё РЅР° РіР»Р°РІРЅРѕРј СЌРєСЂР°РЅРµ
  if (el.habitsBtn) {
    el.habitsBtn.addEventListener('click', () => {
      showAlert('Р­РєСЂР°РЅ РїСЂРёРІС‹С‡РµРє Р±СѓРґРµС‚ РїРѕР·Р¶Рµ');
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
 *      в†’ saved immediately to gymState + localStorage on change (low-frequency settings).
 *
 * 2) Cycle card (whole cycle with all days)
 *    - structural / planning changes for the cycle (days, which are active, how active days propagate to future cycles, etc.)
 *      live in memory/runtime while editing.
 *    - "Save cycle" button:
 *      в†’ commits the current cycle structure and plan to gymState + localStorage,
 *      в†’ used for copying active days to future cycles, updating period progress, etc.
 *
 * 3) Day card
 *    - editing a day (adding/removing exercises, toggling "day active", etc.)
 *      updates runtime for that day while editing.
 *    - "Save day" button:
 *      в†’ commits that day's structure/settings to gymState + localStorage.
 *    - "Day completed" checkbox + completion date:
 *      в†’ saved immediately (no extra button) to gymState.completedWorkouts + backend DB,
 *        using "today" if no date is chosen.
 *
 * 4) Exercise card
 *    - Header (right side of exercise name):
 *      - editable working sets: setsCount, repsCount, workWeight.
 *      - when these change:
 *          в†’ update exercise fields in gymState,
 *          в†’ immediately persist to localStorage via gymSaveState,
 *          в†’ immediately send to backend DB (e.g. FitnessSync.saveGymExerciseSets),
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
  const GYM_DEFAULT_GROUPS = ['Р“СЂСѓРґСЊ + РўСЂРёС†РµРїСЃ', 'РЎРїРёРЅР° + Р‘РёС†РµРїСЃ', 'РќРѕРіРё + РРєСЂС‹'];

  // Р¤СѓРЅРєС†РёСЏ С„РѕСЂРјР°С‚РёСЂРѕРІР°РЅРёСЏ РґР°С‚С‹ Р±РµР· РіРѕРґР° РґР»СЏ UI (РґРґ MMM)
  function gymFormatDateNoYear(dateStr) {
    if (!dateStr) return 'вЂ”';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const months = ['СЏРЅРІ', 'С„РµРІ', 'РјР°СЂ', 'Р°РїСЂ', 'РјР°Р№', 'РёСЋРЅ', 'РёСЋР»', 'Р°РІРі', 'СЃРµРЅ', 'РѕРєС‚', 'РЅРѕСЏ', 'РґРµРє'];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    } catch (e) {
      return dateStr;
    }
  }

  // Р¦РµРЅС‚СЂР°Р»РёР·РѕРІР°РЅРЅР°СЏ С„СѓРЅРєС†РёСЏ СЃРѕС…СЂР°РЅРµРЅРёСЏ GYM-СЃРѕСЃС‚РѕСЏРЅРёСЏ
  // Р’СЃРµ Р·Р°РїРёСЃРё РІ storage РґРѕР»Р¶РЅС‹ РїСЂРѕС…РѕРґРёС‚СЊ С‡РµСЂРµР· СЌС‚Сѓ С„СѓРЅРєС†РёСЋ
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

  // Р¦РµРЅС‚СЂР°Р»РёР·РѕРІР°РЅРЅР°СЏ С„СѓРЅРєС†РёСЏ СЂРµРЅРґРµСЂР° РІСЃРµРіРѕ GYM UI
  // Р’С‹Р·С‹РІР°РµС‚ РІСЃРµ РЅРµРѕР±С…РѕРґРёРјС‹Рµ СЂРµРЅРґРµСЂ-С„СѓРЅРєС†РёРё
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
   // РІСЂРµРјРµРЅРЅС‹Р№ Р±СѓС„РµСЂ РґР»СЏ РјР°СЃС‚РµСЂР° РїРµСЂРёРѕРґР°
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
  
      // СЃС‚Р°СЂС‹Р№ С„РѕСЂРјР°С‚: cycles РєР°Рє РјР°СЃСЃРёРІ
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
  
      // РЅРѕРІС‹Р№ С„РѕСЂРјР°С‚: cycles РєР°Рє РѕР±СЉРµРєС‚
      if (data.cycles && !Array.isArray(data.cycles)) {
        Object.entries(data.cycles).forEach(([k, c]) => {
          if (!c || typeof c !== 'object') return;
          cur.cycles[k] = {
            days: c.days || {},
            groups: c.groups || {},
          };
        });
      }
  
      // РіР°СЂР°РЅС‚РёСЂСѓРµРј С…РѕС‚СЏ Р±С‹ С†РёРєР» 1
      if (!Object.keys(cur.cycles).length) {
        cur.cycles[cur.currentCycle] = { days: {}, groups: {} };
      }
  
      migrated[periodId] = cur;
    });
  
    return migrated;
  }
  
  // РїСЂРёРјРµРЅСЏРµРј РјРёРіСЂР°С†РёСЋ
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
  
  // РћР±СЂР°Р±РѕС‚С‡РёРє СЃРѕР·РґР°РЅРёСЏ РЅРѕРІРѕРіРѕ РїРµСЂРёРѕРґР° (РєРЅРѕРїРєР° "РЎРѕР·РґР°С‚СЊ РїРµСЂРёРѕРґ" РІ РјР°СЃС‚РµСЂРµ)
  if (gymEl.periodStep2CreateBtn) {
    gymEl.periodStep2CreateBtn.addEventListener('click', () => {
      if (!gymPeriodWizardDraft) return;
      
      const periodId = gymCreatePeriodId();
      const today = new Date().toISOString().slice(0, 10);
      
      // Debug logging for period creation
      console.log('[GYM] Creating new period:', {
        periodId,
        name: gymPeriodWizardDraft.name,
        startDate: today,
        daysCount: days.length
      });
      
      // РЎРѕР±РёСЂР°РµРј РґРЅРё РёР· DOM (С€Р°Рі 2 РјР°СЃС‚РµСЂР°)
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
      
      // РЎРѕР·РґР°С‘Рј РќРћР’Р«Р™ РїРµСЂРёРѕРґ Р±РµР· РЅР°СЃР»РµРґРѕРІР°РЅРёСЏ РёСЃС‚РѕСЂРёРё РѕС‚ СЃС‚Р°СЂС‹С… РїРµСЂРёРѕРґРѕРІ
      const newPeriod = {
        id: periodId,
        name: gymPeriodWizardDraft.name || 'РџРµСЂРёРѕРґ',
        type: gymPeriodWizardDraft.type || 'strength',
        splitType: gymPeriodWizardDraft.splitType || 'split',
        cycleLengthDays: gymPeriodWizardDraft.cycleLengthDays || 7,
        totalCycles: gymPeriodWizardDraft.totalCycles || 8,
        workoutsPerCycle: gymPeriodWizardDraft.workoutsPerCycle || 3,
        days: days,
        startDate: today, // РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРё СѓСЃС‚Р°РЅР°РІР»РёРІР°РµРј С‚РµРєСѓС‰СѓСЋ РґР°С‚Сѓ РїСЂРё СЃРѕР·РґР°РЅРёРё
        // РќР• РєРѕРїРёСЂСѓРµРј РЅРёРєР°РєРёРµ РґР°РЅРЅС‹Рµ РёР· СЃС‚Р°СЂС‹С… РїРµСЂРёРѕРґРѕРІ:
        // - РЅРµС‚ history
        // - РЅРµС‚ completedWorkouts
        // - РЅРµС‚ previousPeriodData
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
      
      // Р”РѕР±Р°РІР»СЏРµРј РІ state
      if (!gymState.periods) gymState.periods = {};
      gymState.periods[periodId] = newPeriod;
      
      if (!gymState.periodOrder) gymState.periodOrder = [];
      gymState.periodOrder.push(periodId);
      
      // РРЅРёС†РёР°Р»РёР·РёСЂСѓРµРј runtime РґР»СЏ РЅРѕРІРѕРіРѕ РїРµСЂРёРѕРґР° - С‡РёСЃС‚С‹Р№, Р±РµР· РґР°РЅРЅС‹С…
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
      
      // РЎРѕС…СЂР°РЅСЏРµРј Рё СЂРµРЅРґРµСЂРёРј
      gymPersistState();
      
      // Р—Р°РєСЂС‹РІР°РµРј РјР°СЃС‚РµСЂ Рё РѕС‚РєСЂС‹РІР°РµРј РїРµСЂРёРѕРґ
      if (gymEl.periodWizardScreen) gymEl.periodWizardScreen.classList.add('hidden');
      
      // РћС‚РєСЂС‹РІР°РµРј СЃРїРёСЃРѕРє РїРµСЂРёРѕРґРѕРІ - РЅРѕРІС‹Р№ РїРµСЂРёРѕРґ Р±СѓРґРµС‚ РІРёРґРµРЅ
      gymOpenPeriodsScreen();
      
      // РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРё РѕС‚РєСЂС‹РІР°РµРј СЃРѕР·РґР°РЅРЅС‹Р№ РїРµСЂРёРѕРґ
      gymSetActivePeriod(periodId);
      gymOpen();
    });
  }
  
  function gymSaveCurrentCycleDefinition() {
    const period = gymGetActivePeriod();
    if (!period || !gymEl.groupsContainer) return;

    // Р±Р°Р·РѕРІР°СЏ РєР°СЂС‚Р° С‚РѕР»СЊРєРѕ СЃ dayIndex + muscles
    const daysMap = new Map();
    const baseDays = Array.isArray(period.days) ? period.days : [];
    baseDays.forEach((d) => {
      daysMap.set(d.dayIndex, {
        dayIndex: d.dayIndex,
        muscles: Array.isArray(d.muscles) ? d.muscles.slice() : [],
      });
    });
  
    // РїРѕРІРµСЂС… РЅР°РєР°С‚С‹РІР°РµРј С‚Рѕ, С‡С‚Рѕ СЃРµР№С‡Р°СЃ РІ DOM
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
  
    // РјС‹ СѓР¶Рµ РІРЅСѓС‚СЂРё С„РёС‚РЅРµСЃР°, РїСЂСЏС‡РµРј СЃРїРёСЃРѕРє РїРµСЂРёРѕРґРѕРІ Рё СЌРєСЂР°РЅ РєРѕРЅРєСЂРµС‚РЅРѕРіРѕ РїРµСЂРёРѕРґР°
    if (gymEl.periodsScreen) gymEl.periodsScreen.classList.add('hidden');
    if (gymEl.screen) gymEl.screen.classList.add('hidden');
  
    // С„РёС‚РЅРµСЃ-СЌРєСЂР°РЅ РѕСЃС‚Р°С‘С‚СЃСЏ РІРёРґРёРјС‹Рј, РїСЂРѕСЃС‚Рѕ РїРѕРєР°Р·С‹РІР°РµРј РІ РЅС‘Рј РјР°СЃС‚РµСЂ
    if (fitnessEl?.screen) fitnessEl.screen.classList.remove('hidden');
  
    gymEl.periodWizardScreen.classList.remove('hidden');
    if (gymEl.periodStep1) gymEl.periodStep1.classList.remove('hidden');
    if (gymEl.periodStep2) gymEl.periodStep2.classList.add('hidden');
  
    gymPeriodWizardDraft = {
      type: 'strength',
      name: 'РќР° СЃРёР»Сѓ',
      splitType: 'split',
      cycleLengthDays: 7,
      totalCycles: 8,
      workoutsPerCycle: 3,   // РќРћР’РћР•
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
    // РІРѕР·РІСЂР°С‰Р°РµРјСЃСЏ Рє СЃРїРёСЃРєСѓ РїРµСЂРёРѕРґРѕРІ
    gymOpenPeriodsScreen();
  }  

  // РљРЅРѕРїРєР° "Р”РѕР±Р°РІРёС‚СЊ РґРµРЅСЊ РІ С†РёРєР»" РЅР° С€Р°РіРµ 2 РјР°СЃС‚РµСЂР° РїРµСЂРёРѕРґР°
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
          <span class="text-sm font-medium text-white">Р”РµРЅСЊ ${nextIndex}</span>
          <button type="button"
            data-role="deleteDay"
            class="text-11px text-red-300 underline">
            СѓРґР°Р»РёС‚СЊ
          </button>
        </div>

        <label class="flex items-center gap-1 text-11px text-slate-200">
          <input
            type="checkbox"
            data-field="dayEnabled"
            class="accent-emerald-400"
            checked
          >
          <span>Р”РµРЅСЊ Р°РєС‚РёРІРµРЅ</span>
        </label>

        <div class="text-11px text-slate-300 mb-1">Р“СЂСѓРїРїС‹ РјС‹С€С†</div>
        <div data-role="muscleList" class="space-y-1"></div>

        <button
          type="button"
          data-role="addMuscleGroup"
          class="mt-1 text-11px text-emerald-300 underline"
        >
          Р”РѕР±Р°РІРёС‚СЊ РіСЂСѓРїРїСѓ РјС‹С€С†
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
            placeholder="Р“СЂСѓРґСЊ, СЃРїРёРЅР°вЂ¦"
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
              placeholder="Р“СЂСѓРїРїР° РјС‹С€С†"
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
  
    let name = 'РџРµСЂРёРѕРґ';
    if (type === 'strength') name = 'РќР° СЃРёР»Сѓ';
    else if (type === 'endurance') name = 'РќР° РІС‹РЅРѕСЃР»РёРІРѕСЃС‚СЊ';
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
  
    // РїРµСЂРµРєР»СЋС‡Р°РµРј С€Р°РіРё РјР°СЃС‚РµСЂР°
    if (gymEl.periodStep1) gymEl.periodStep1.classList.add('hidden');
    if (gymEl.periodStep2) gymEl.periodStep2.classList.remove('hidden');
  
    // РіРµРЅРµСЂРёРј N С‚СЂРµРЅРёСЂРѕРІРѕС‡РЅС‹С… РґРЅРµР№ РїРѕ workoutsPerCycle
    gymEl.periodDaysContainer.innerHTML = '';
    const wpc = gymPeriodWizardDraft.workoutsPerCycle || 3;
  
    for (let i = 1; i <= wpc; i += 1) {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'bg-white/10 rounded-xl px-3 py-3 space-y-2';
      dayDiv.dataset.dayIndex = String(i);
      dayDiv.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="font-semibold text-white text-sm">Р”РµРЅСЊ ${i}</div>
          <button type="button" data-role="removeDay" class="text-[11px] text-red-300 underline">
            СѓРґР°Р»РёС‚СЊ
          </button>
        </div>
        <label class="flex items-center gap-2 text-xs text-slate-200">
          <input type="checkbox" data-field="dayEnabled" class="accent-emerald-400" checked>
          <span>Р”РµРЅСЊ Р°РєС‚РёРІРµРЅ (РѕСЃРЅРѕРІРЅР°СЏ С‚СЂРµРЅРёСЂРѕРІРєР°)</span>
        </label>
        <input
          type="text"
          data-field="muscles"
          class="w-full bg-white/10 rounded-lg px-2 py-1 text-xs text-white"
          placeholder="Р“СЂСѓРґСЊ, СЃРїРёРЅР°..."
        />
      `;
      gymEl.periodDaysContainer.appendChild(dayDiv);
    }
  
    // РѕР±СЂР°Р±РѕС‚С‡РёРє СѓРґР°Р»РµРЅРёСЏ РґРЅСЏ
    gymEl.periodDaysContainer
      .querySelectorAll('button[data-role="removeDay"]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const dayDiv = btn.closest('[data-day-index]');
          dayDiv?.remove();
        });
      });
  }  

  // СЌРєСЂР°РЅ СЃРїРёСЃРєР° РїРµСЂРёРѕРґРѕРІ
  function gymRenderPeriodsList() {
    if (!gymEl.periodsList || !gymState.periods) return;
  
    const order = Array.isArray(gymState.periodOrder)
      ? gymState.periodOrder
      : Object.keys(gymState.periods);
  
    gymEl.periodsList.innerHTML = '';
  
    if (!order.length) {
      // РЅРµС‚ РїРµСЂРёРѕРґРѕРІ вЂ” РїРѕРєР°Р·С‹РІР°РµРј Р·Р°РіР»СѓС€РєСѓ
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
              ${p.cycleLengthDays} РґРЅ В· ${p.totalCycles} С†РёРєР»РѕРІ
            </div>
          </div>
          <div class="flex flex-col items-end gap-1">
            <button
              class="text-xs px-2 py-1 rounded-full bg-indigo-500 text-white"
              data-open-period="${p.id}"
            >
              РћС‚РєСЂС‹С‚СЊ
            </button>
            <button
              class="text-[11px] text-red-300 underline"
              data-delete-period="${p.id}"
            >
              РЈРґР°Р»РёС‚СЊ
            </button>
          </div>
        </div>
        <div class="mt-2 text-xs text-slate-300">
          <label class="block mb-1">Р”Р°С‚Р° СЃС‚Р°СЂС‚Р° РїРµСЂРёРѕРґР° (РјРѕР¶РЅРѕ РїРµСЂРµРѕРїСЂРµРґРµР»РёС‚СЊ)</label>
          <input type="date" class="w-full bg-white/10 rounded-lg px-2 py-1" data-role="periodStartInput" value="${p.startDate || ''}" />
          <div class="mt-2">
            <div class="text-[11px]">РџР»Р°РЅ: <span data-role="plannedRange">вЂ”</span></div>
            <div class="text-[11px]">Р¤Р°РєС‚РёС‡РµСЃРєРё: <span data-role="actualRange">вЂ”</span></div>
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
            plannedRangeEl.textContent = `${gymFormatDateNoYear(cycleStarts[1])} вЂ” ${gymFormatDateNoYear(lastEndDate.toISOString().slice(0,10))}`;
          } else plannedRangeEl.textContent = 'вЂ”';
        } else {
          plannedRangeEl.textContent = 'вЂ”';
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
            actualRangeEl.textContent = `${gymFormatDateNoYear(earliest)} вЂ” ${gymFormatDateNoYear(lastDates[lastDates.length-1])}`;
          } else {
            actualRangeEl.textContent = `${gymFormatDateNoYear(earliest)} вЂ” вЂ”`;
          }
        } else {
          actualRangeEl.textContent = 'вЂ”';
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
                plannedRangeEl.textContent = `${gymFormatDateNoYear(cycleStarts[1])} вЂ” ${gymFormatDateNoYear(lastEndDate.toISOString().slice(0,10))}`;
              } else plannedRangeEl.textContent = 'вЂ”';
            } else {
              plannedRangeEl.textContent = 'вЂ”';
            }
          }
          // Re-render periods list to reflect changes
          gymRenderPeriodsList();
        });
      }
  
      gymEl.periodsList.appendChild(card);
    });
  
    // РѕС‚РєСЂС‹С‚СЊ РїРµСЂРёРѕРґ
    gymEl.periodsList.querySelectorAll('button[data-open-period]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.openPeriod;
        if (!id) return;
        gymSetActivePeriod(id);
        gymOpen(); // РїРѕРєР°Р·С‹РІР°РµС‚ СЌРєСЂР°РЅ РєРѕРЅРєСЂРµС‚РЅРѕРіРѕ РїРµСЂРёРѕРґР°
      });
    });
  
    // СѓРґР°Р»РёС‚СЊ РїРµСЂРёРѕРґ СЃ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёРµРј
    gymEl.periodsList.querySelectorAll('button[data-delete-period]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.deletePeriod;
        if (!id) return;
        const p = gymState.periods[id];
        const name = p?.name || 'РїРµСЂРёРѕРґ';
        if (!confirm(`РўРѕС‡РЅРѕ СѓРґР°Р»РёС‚СЊ В«${name}В»? Р­С‚Рѕ РґРµР№СЃС‚РІРёРµ РЅРµР»СЊР·СЏ РѕС‚РјРµРЅРёС‚СЊ.`)) {
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
  
    // С„РёС‚РЅРµСЃ-СЌРєСЂР°РЅ РІРєР»СЋС‡С‘РЅ, РЅРѕ СЃР°Рј С„РёС‚РЅРµСЃ-РґР°С€Р±РѕСЂРґ РїСЂСЏС‡РµРј
    if (fitnessEl?.screen) fitnessEl.screen.classList.remove('hidden');
    if (fitnessEl?.profileSetup) fitnessEl.profileSetup.classList.add('hidden');
    if (fitnessEl?.dashboard) fitnessEl.dashboard.classList.add('hidden');
  
    // РїСЂСЏС‡РµРј СЌРєСЂР°РЅ РєРѕРЅРєСЂРµС‚РЅРѕРіРѕ РїРµСЂРёРѕРґР° Рё РјР°СЃС‚РµСЂ
    if (gymEl.screen) gymEl.screen.classList.add('hidden');
    if (gymEl.periodWizardScreen) gymEl.periodWizardScreen.classList.add('hidden');
  
    // РїРѕРєР°Р·С‹РІР°РµРј "РЅРѕРІРѕРµ РѕРєРЅРѕ" вЂ“ СЃРїРёСЃРѕРє РїРµСЂРёРѕРґРѕРІ
    gymRenderPeriodsList();
    gymEl.periodsScreen.classList.remove('hidden');
  }
  
  

  function gymClosePeriodsScreen() {
    if (gymEl.periodsScreen) gymEl.periodsScreen.classList.add('hidden');
  
    // РµСЃР»Рё РµСЃС‚СЊ С„РёС‚РЅРµСЃ-СЌРєСЂР°РЅ вЂ“ РІРѕР·РІСЂР°С‰Р°РµРјСЃСЏ Рє С„РёС‚РЅРµСЃ-РґР°С€Р±РѕСЂРґСѓ
    if (fitnessEl?.screen) {
      fitnessEl.screen.classList.remove('hidden');
  
      if (fitnessEl.profileSetup) fitnessEl.profileSetup.classList.add('hidden');
      if (fitnessEl.dashboard) fitnessEl.dashboard.classList.remove('hidden');
  
      // РЅР° РІСЃСЏРєРёР№ СЃР»СѓС‡Р°Р№ РїСЂСЏС‡РµРј РјР°СЃС‚РµСЂ Рё СЌРєСЂР°РЅ РїРµСЂРёРѕРґР°
      if (gymEl.periodWizardScreen) gymEl.periodWizardScreen.classList.add('hidden');
      if (gymEl.screen) gymEl.screen.classList.add('hidden');
  
      return;
    }
  
    // fallback: РµСЃР»Рё РїРѕ РєР°РєРѕР№-С‚Рѕ РїСЂРёС‡РёРЅРµ fitnessScreen РЅРµС‚ вЂ“ РІРµСЂРЅС‘РјСЃСЏ РЅР° РіР»Р°РІРЅС‹Р№ СЌРєСЂР°РЅ
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
      gymEl.cycleSelect.innerHTML = '<option value="1">Р¦РёРєР» 1</option>';
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
      options += `<option value="${i}">Р¦РёРєР» ${i}</option>`;
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
    gymEl.periodInfo.textContent = period.name || 'РџРµСЂРёРѕРґ';
  
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
  
    // UI-СЃРѕСЃС‚РѕСЏРЅРёРµ СЃРІРѕСЂР°С‡РёРІР°РЅРёСЏ Рё СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёСЏ
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
    
    // --- Р Р•РќР”Р•Р  Р”РќР•Р™ ---
    daysToRender.forEach((day) => {
      const dayIndex = day.dayIndex;
    
      // С‡РёС‚Р°РµРј enabled РёР· runtime, РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ true
      const runtimeDayRaw = runtime && runtime.days ? runtime.days[dayIndex] : null;
      const enabled = runtimeDayRaw ? runtimeDayRaw.enabled !== false : true;
    
      // РµСЃР»Рё РґРµРЅСЊ РІС‹РєР»СЋС‡РµРЅ Рё РЅРµ РІ СЂРµР¶РёРјРµ СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёСЏ вЂ” РїСЂРѕРїСѓСЃРєР°РµРј
      // if (!enabled && !ui.editDays[dayIndex]) return;
    
      if (!runtime.days[dayIndex]) runtime.days[dayIndex] = { groups: {} };
      const dayRuntime = runtime.days[dayIndex];
      if (!dayRuntime.groups) dayRuntime.groups = {};
    
      const isEditing = ui.editDays[dayIndex] === true;
    
      const dayWrapper = document.createElement('div');
      dayWrapper.className = 'bg-white/5 rounded-2xl px-3 py-3 space-y-2';
      dayWrapper.dataset.dayIndex = String(dayIndex);

      // --- РЁРђРџРљРђ Р”РќРЇ ---
      const title = document.createElement('div');
      title.className = 'flex items-center justify-between mb-2';
  
      const left = document.createElement('div');
      left.className = 'flex items-center gap-2 flex-1';
  
      // С‡РµРєР±РѕРєСЃ С‚РѕР»СЊРєРѕ РІ СЂРµР¶РёРјРµ СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёСЏ
      if (isEditing) {
        const checkboxLabel = document.createElement('label');
        checkboxLabel.className = 'flex items-center gap-1 text-xs text-slate-200';
      
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'accent-emerald-400';
        checkbox.dataset.role = 'dayEnabled';
        checkbox.dataset.dayIndex = String(dayIndex);
      
        // С‡РёС‚Р°РµРј СЃРѕСЃС‚РѕСЏРЅРёРµ РёР· runtime С‚РµРєСѓС‰РµРіРѕ С†РёРєР»Р°
        const runtimeDay = runtime.days[dayIndex] || {};
        if (runtimeDay.enabled !== false) {
          checkbox.checked = true;
        } else {
          checkbox.checked = false;
        }
      
        const span = document.createElement('span');
        span.textContent = 'РђРєС‚РёРІРµРЅ';
      
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
      //   <div class="text-sm font-semibold text-white">Р”РµРЅСЊ ${day.dayIndex}</div>
      //   <div class="text-xs text-slate-300" data-role="dayMusclesView">
      //     ${
      //       day.muscles && day.muscles.length
      //         ? day.muscles.join(', ')
      //         : 'РќР°Р¶РјРё "Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ", С‡С‚РѕР±С‹ РІС‹Р±СЂР°С‚СЊ РіСЂСѓРїРїС‹'
      //     }
      //   </div>
      // `;
      const periodId = period.id || 'default';
      const rt = gymState.runtime?.[periodId];
      const currentCycle = rt?.currentCycle || 1;

      titleBtn.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="text-sm font-semibold text-white">Р”РµРЅСЊ ${day.dayIndex}</div>
        </div>
        <div class="text-xs text-slate-300" data-role="dayMusclesView">
          ${
            day.muscles && day.muscles.length
              ? day.muscles.join(', ')
              : 'РќР°Р¶РјРё "Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ", С‡С‚РѕР±С‹ РІС‹Р±СЂР°С‚СЊ РіСЂСѓРїРїС‹'
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
        saveBtn.textContent = 'РЎРѕС…СЂР°РЅРёС‚СЊ';
  
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'text-[11px] text-red-300 underline';
        deleteBtn.dataset.role = 'dayDelete';
        deleteBtn.dataset.dayIndex = String(dayIndex);
        deleteBtn.textContent = 'РЈРґР°Р»РёС‚СЊ РґРµРЅСЊ';
  
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'text-[11px] text-slate-300 underline';
        cancelBtn.dataset.role = 'dayCancel';
        cancelBtn.dataset.dayIndex = String(dayIndex);
        cancelBtn.textContent = 'РќР°Р·Р°Рґ';
  
        right.appendChild(saveBtn);
        right.appendChild(deleteBtn);
        right.appendChild(cancelBtn);
      } else {
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'text-[11px] text-emerald-300 underline';
        editBtn.dataset.role = 'dayEdit';
        editBtn.dataset.dayIndex = String(dayIndex);
        editBtn.textContent = 'Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ';
  
        right.appendChild(editBtn);
      }
  
      title.appendChild(left);
      title.appendChild(right);
      dayWrapper.appendChild(title);
  
      // --- РЎРўР РћРљРђ Р Р•Р”РђРљРўРР РћР’РђРќРРЇ Р“Р РЈРџРџ РњР«РЁР¦ (РўРћР›Р¬РљРћ Р’ Р Р•Р–РРњР• Р Р•Р”РђРљРўРР РћР’РђРќРРЇ) ---
      if (isEditing) {
        const musclesRow = document.createElement('div');
        musclesRow.className = 'mb-2';
  
        musclesRow.innerHTML = `
          <div class="text-[11px] text-slate-300 mb-1">
            Р“СЂСѓРїРїС‹ РјС‹С€С† С‡РµСЂРµР· Р·Р°РїСЏС‚СѓСЋ
          </div>
          <input
            class="w-full bg-white/10 text-white text-xs rounded-lg px-2 py-1"
            placeholder="Р“СЂСѓРґСЊ, РїР»РµС‡Рё, СЃРїРёРЅР°"
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
  
      // --- РўР•Р›Рћ Р”РќРЇ ---
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
  
        // РЅР°Р·РІР°РЅРёРµ РіСЂСѓРїРїС‹
        const groupBtn = document.createElement('button');
        groupBtn.type = 'button';
        groupBtn.className = 'flex-1 text-left text-sm text-slate-100 font-medium';
        groupBtn.dataset.role = 'toggleGroup';
        groupBtn.dataset.group = groupName;
        groupBtn.textContent = groupName;
  
        header.appendChild(groupBtn);
  
        // РєРЅРѕРїРєРё РґР»СЏ РіСЂСѓРїРї вЂ” С‚РѕР»СЊРєРѕ РІ СЂРµР¶РёРјРµ СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёСЏ
        if (isEditing) {
          const groupActions = document.createElement('div');
          groupActions.className = 'flex items-center gap-2';
  
          const addExBtn = document.createElement('button');
          addExBtn.type = 'button';
          addExBtn.className = 'text-xs px-2 py-1 rounded-full bg-emerald-500 text-white';
          addExBtn.dataset.role = 'addExercise';
          addExBtn.dataset.group = groupName;
          addExBtn.textContent = '+ РЈРїСЂР°Р¶РЅРµРЅРёРµ';
  
          const delGroupBtn = document.createElement('button');
          delGroupBtn.type = 'button';
          delGroupBtn.className = 'text-[11px] text-red-300 underline';
          delGroupBtn.dataset.role = 'deleteGroup';
          delGroupBtn.dataset.group = groupName;
          delGroupBtn.textContent = 'СѓРґР°Р»РёС‚СЊ';
  
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
          empty.textContent = 'Р”РѕР±Р°РІСЊ СѓРїСЂР°Р¶РЅРµРЅРёРµ РґР»СЏ СЌС‚РѕР№ РіСЂСѓРїРїС‹.';
          listContainer.appendChild(empty);
        } else {
          exercises.forEach((ex, idx) => {
            const card = document.createElement('div');
            card.className = 'bg-slate-900/80 rounded-xl px-3 py-3 space-y-2';
            card.dataset.index = String(idx);
  
            // --- РЁРђРџРљРђ РЈРџР РђР–РќР•РќРРЇ ---
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
              // Р РµРґР°РєС‚РёСЂСѓРµРјРѕРµ РЅР°Р·РІР°РЅРёРµ
              const nameInput = document.createElement('input');
              nameInput.type = 'text';
              nameInput.className = 'w-full bg-transparent text-left text-slate-100 text-xs font-semibold border-b border-white/10 focus:outline-none';
              nameInput.placeholder = 'РќР°Р·РІР°РЅРёРµ (Р–РёРј РіР°РЅС‚РµР»РµР№)';
              nameInput.value = ex.name || '';
              nameInput.dataset.field = 'name';
              titleWrap.appendChild(nameInput);
            } else {
              // РўРѕР»СЊРєРѕ С‚РµРєСЃС‚ (РєРЅРѕРїРєР° СЃРІРѕСЂР°С‡РёРІР°РЅРёСЏ)
              const nameBtn = document.createElement('button');
              nameBtn.type = 'button';
              nameBtn.className = 'text-left flex-1 text-slate-100';
              nameBtn.dataset.role = 'toggleExercise';
              nameBtn.textContent = ex.name || 'РЈРїСЂР°Р¶РЅРµРЅРёРµ ' + (idx + 1);
              titleWrap.appendChild(nameBtn);
            }

            exHeader.appendChild(titleWrap);

            // РљРЅРѕРїРєР° СѓРґР°Р»РµРЅРёСЏ СѓРїСЂР°Р¶РЅРµРЅРёСЏ вЂ” РўРћР›Р¬РљРћ РІ СЂРµР¶РёРјРµ СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёСЏ РґРЅСЏ
            if (isEditing) {
              const delBtn = document.createElement('button');
              delBtn.type = 'button';
              delBtn.className = 'text-[11px] text-red-300 underline';
              delBtn.dataset.delete = '1';
              delBtn.textContent = 'РЈРґР°Р»РёС‚СЊ';
              exHeader.appendChild(delBtn);
            }

            card.appendChild(exHeader);

  
            // --- РўР•Р›Рћ РЈРџР РђР–РќР•РќРРЇ ---
            const body = document.createElement('div');
            body.className = 'space-y-2 hidden';
            body.dataset.role = 'exerciseBody';
  
            body.innerHTML = `
              <div class="flex gap-4 text-xs text-slate-300 mb-2">
                <div>
                  <span class="text-slate-400">РџРѕРґС…РѕРґС‹:</span> ${ex.setsCount || 'вЂ”'}
                </div>
                <div>
                  <span class="text-slate-400">РџРѕРІС‚РѕСЂРµРЅРёСЏ:</span> ${ex.repsCount || 'вЂ”'}
                </div>
                <div>
                  <span class="text-slate-400">Р’РµСЃ:</span> ${ex.workWeight || 'вЂ”'}
                </div>
              </div>

              <div class="flex gap-2 text-xs">
                <div class="flex-1">
                  <div class="text-slate-400 mb-1">Р Р°Р·РјРёРЅРєР° (РѕРїС†.)</div>
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
                  <div class="text-slate-400 mb-1">RPE 1вЂ“10</div>
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
                  <div class="text-slate-400 mb-1">РџСЂРѕРіСЂРµСЃСЃ Р·Р° РїРµСЂРёРѕРґ</div>
                  <input
                    class="w-full bg-white/10 text-white rounded-lg px-2 py-1"
                    placeholder="+5 РєРі СЃ РЅР°С‡Р°Р»Р°"
                    value="${ex.progressNote || ''}"
                    data-field="progressNote"
                  />
                </div>
                <div class="flex-1">
                  <div class="text-slate-400 mb-1">РџР»Р°РЅ РЅР° СЃР»РµРґ. С†РёРєР»</div>
                  <input
                    class="w-full bg-white/10 text-white rounded-lg px-2 py-1"
                    placeholder="РЎР»РµРґ. С†РёРєР»: 37 РєРі"
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
  
    // --- РљРќРћРџРљРђ/Р¤РћР РњРђ "Р”РћР‘РђР’РРўР¬ Р”Р•РќР¬" (РєР°Рє СЂР°РЅСЊС€Рµ) ---
    const addDayContainer = document.createElement('div');
    addDayContainer.className = 'mt-3 space-y-2 text-xs text-slate-200';
    addDayContainer.innerHTML = `
      <div
        class="bg-white/5 rounded-2xl px-3 py-3 space-y-2 hidden"
        data-role="newDayForm"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="text-sm font-semibold text-white">
            РќРѕРІС‹Р№ РґРµРЅСЊ
          </div>
          <label class="flex items-center gap-1 text-[11px] text-slate-200">
            <input
              type="checkbox"
              class="accent-emerald-400"
              data-role="newDayEnabled"
              checked
            />
            <span>Р”РµРЅСЊ Р°РєС‚РёРІРµРЅ</span>
          </label>
        </div>
  
        <div class="space-y-1">
          <div class="text-[11px] text-slate-300">Р“СЂСѓРїРїС‹ РјС‹С€С† С‡РµСЂРµР· Р·Р°РїСЏС‚СѓСЋ</div>
          <input
            class="w-full bg-white/10 text-white text-xs rounded-lg px-2 py-1"
            placeholder="Р“СЂСѓРґСЊ, РїР»РµС‡Рё, СЃРїРёРЅР°"
            data-role="newDayMuscles"
          />
        </div>
  
        <div class="flex gap-2 mt-3">
          <button
            type="button"
            class="flex-1 bg-emerald-500 hover:bg-emerald-600 py-2 rounded-xl font-semibold text-sm"
            data-role="createDaySubmit"
          >
            РЎРѕС…СЂР°РЅРёС‚СЊ РґРµРЅСЊ
          </button>
          <button
            type="button"
            class="flex-1 bg-white/10 py-2 rounded-xl text-sm"
            data-role="createDayCancel"
          >
            РћС‚РјРµРЅР°
          </button>
        </div>
      </div>
  
      <button
        type="button"
        class="w-full bg-transparent border border-emerald-500/60 py-2 rounded-xl font-semibold text-sm"
        data-role="addDayFromScreen"
      >
        + Р”РѕР±Р°РІРёС‚СЊ РґРµРЅСЊ
      </button>
    `;
    gymEl.groupsContainer.appendChild(addDayContainer);
  
    // ---- РћР‘Р РђР‘РћРўР§РРљР "РќРћР’Р«Р™ Р”Р•РќР¬" ----
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
  
    // ---- РџР•Р Р•РљР›Р®Р§Р•РќРР• Р Р•Р–РРњРђ Р”РќРЇ ----
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
  
    // ---- РЎРћРҐР РђРќРРўР¬ Р”Р•РќР¬ ----
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

  
    // ---- РЈР”РђР›РРўР¬ Р”Р•РќР¬ ----
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
  
    // ---- РЎР’Р•Р РќРЈРўР¬/Р РђР—Р’Р•Р РќРЈРўР¬ Р”Р•РќР¬ ----
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
  
    // ---- РЎР’Р•Р РќРЈРўР¬/Р РђР—Р’Р•Р РќРЈРўР¬ Р“Р РЈРџРџРЈ ----
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
  
    // ---- Р”РћР‘РђР’РРўР¬ РЈРџР РђР–РќР•РќРР• ----
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
  
    // ---- РЈР”РђР›РРўР¬ Р“Р РЈРџРџРЈ ----
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
  
    // ---- РР—РњР•РќР•РќРРЇ Р’ РџРћР›РЇРҐ РЈРџР РђР–РќР•РќРР™ (РІРєР»СЋС‡Р°СЏ name) ----
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

          // UX: "РџР»Р°РЅ РЅР° СЃР»РµРґ С†РёРєР»" - apply only on blur (when user finishes typing)
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
  
    // ---- РЎР’Р•Р РќРЈРўР¬/Р РђР—Р’Р•Р РќРЈРўР¬ РЈРџР РђР–РќР•РќРР• ----
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
  
    // ---- РЈР”РђР›Р•РќРР• РЈРџР РђР–РќР•РќРРЇ ----
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
  
      // РїСЂРёРІСЏР·РєР° РІР°СЂРёР°РЅС‚РѕРІ Рє РёРЅРґРµРєСЃСѓ РґРЅСЏ С†РёРєР»Р°
      const value = gymEl.daySelect.value;
      if (value === 'РЎРµРіРѕРґРЅСЏ') {
        gymCurrentDayIndex = 1; // MVP: РІСЃРµРіРґР° Р”РµРЅСЊ 1, РїРѕР·Р¶Рµ РїСЂРёРІСЏР¶РµРј Рє РєР°Р»РµРЅРґР°СЂСЋ
      } else {
        // РµСЃР»Рё РѕРїС†РёРё Р±СѓРґСѓС‚ РІРёРґР° "Р”РµРЅСЊ 1", "Р”РµРЅСЊ 2" Рё С‚.Рї.
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
      gymCurrentDayIndex = 1; // РІСЃРµРіРґР° РЅР°С‡РёРЅР°РµРј СЃ Р”РЅСЏ 1 С†РёРєР»Р°
    }
  
    gymRenderHeader();
    gymRenderGroups();
  }
  

  function gymClose() {
    if (!gymEl.screen) return;
    gymEl.screen.classList.add('hidden');
    if (gymEl.periodsScreen) gymEl.periodsScreen.classList.remove('hidden');
  }

  // РєРЅРѕРїРєР° "Р¤РёС‚РЅРµСЃ в†’ Р—Р°Р»"
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
      opt.textContent = `${p.name} (${p.cycleLengthDays}d В· ${p.totalCycles} cyc)`;
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
      gymCalendarOutput.textContent = `Р”Р°С‚Р° ${dateVal} в†’ Р¦РёРєР» ${res.cycleIndex}, Р”РµРЅСЊ ${res.dayOfCycle} (РґРЅРµР№ СЃ РЅР°С‡Р°Р»Р°: ${res.daysSince})`;
    });
  }

  // СЃРїРёСЃРѕРє РїРµСЂРёРѕРґРѕРІ: РЅР°Р·Р°Рґ
  if (gymEl.periodsBackBtn) {
    gymEl.periodsBackBtn.addEventListener('click', gymClosePeriodsScreen);
  }

  // РєРЅРѕРїРєРё "РЎРѕР·РґР°С‚СЊ РїРµСЂРёРѕРґ"
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


  // РјР°СЃС‚РµСЂ РїРµСЂРёРѕРґР°: РЅР°РІРёРіР°С†РёСЏ Рё РґРµР№СЃС‚РІРёСЏ
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
      // РЅР°Р·Р°Рґ РЅР° С€Р°Рі 1
      if (gymEl.periodStep2) gymEl.periodStep2.classList.add('hidden');
      if (gymEl.periodStep1) gymEl.periodStep1.classList.remove('hidden');
    });
  }
  if (gymEl.periodStep2CreateBtn) {
    gymEl.periodStep2CreateBtn.addEventListener('click', () => {
      if (!gymPeriodWizardDraft) return;
      if (!gymEl.periodDaysContainer) return;
  
      // РЎРѕР±РёСЂР°РµРј РґРЅРё РёР· UI
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
      
      // РІ РјРѕРґРµР»СЊ РїРµСЂРёРѕРґР° СЃРѕС…СЂР°РЅСЏРµРј С‚РѕР»СЊРєРѕ РІРєР»СЋС‡С‘РЅРЅС‹Рµ РґРЅРё
      const days = rawDays.filter((d) => d.enabled);
      gymPeriodWizardDraft.days = days;
  
      gymPeriodWizardDraft.days = days;
  
      // РЎРѕР·РґР°С‘Рј РїРµСЂРёРѕРґ РІ gymState
      const periodId = gymCreatePeriodId();
      const period = {
        id: periodId,
        name: gymPeriodWizardDraft.name || 'РџРµСЂРёРѕРґ',
        type: gymPeriodWizardDraft.type,
        splitType: gymPeriodWizardDraft.splitType,
        cycleLengthDays: gymPeriodWizardDraft.cycleLengthDays,
        totalCycles: gymPeriodWizardDraft.totalCycles,
        workoutsPerCycle: gymPeriodWizardDraft.workoutsPerCycle || days.length, // РќРћР’РћР•
        days,
        cycles: {}, // РїРѕРєР° С†РёРєР»С‹ С…СЂР°РЅРёРј С‚СѓС‚, РґР°Р»СЊС€Рµ СЂР°СЃС€РёСЂРёРј
        runtime: {}, // РјРѕР¶РЅРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РґР»СЏ per-cycle РґР°РЅРЅС‹С…, РµСЃР»Рё РЅСѓР¶РЅРѕ
      };
  
      gymState.periods[periodId] = period;
      if (!gymState.periodOrder || !Array.isArray(gymState.periodOrder)) gymState.periodOrder = [];
      gymState.periodOrder.push(periodId);
      // Initialize runtime fresh for the new period вЂ” do NOT reuse old runtime data
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
  
      // Р·Р°РєСЂС‹РІР°РµРј РјР°СЃС‚РµСЂ Рё РѕС‚РєСЂС‹РІР°РµРј СЌРєСЂР°РЅ РїРµСЂРёРѕРґР°
      if (gymEl.periodWizardScreen) gymEl.periodWizardScreen.classList.add('hidden');
      // Re-render periods list to include new period, then open the period screen
      gymOpenPeriodsScreen();
      // Automatically open the newly created period
      gymSetActivePeriod(periodId);
      gymOpen();

    });
  }
  

  // СЌРєСЂР°РЅ РєРѕРЅРєСЂРµС‚РЅРѕРіРѕ РїРµСЂРёРѕРґР°
  if (gymEl.backBtn) {
    gymEl.backBtn.addEventListener('click', gymClose);
  }
  // "Save cycle": commit current runtime structure for this cycle to gymState + localStorage.
  // IMPORTANT: Only save current cycle data - do NOT propagate to future cycles
  if (gymEl.saveBtn) {
    gymEl.saveBtn.textContent = 'РЎРѕС…СЂР°РЅРёС‚СЊ С†РёРєР»';
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
      showAlert('РСЃС‚РѕСЂРёСЏ С‚СЂРµРЅРёСЂРѕРІРѕРє РїРѕСЏРІРёС‚СЃСЏ РїРѕР·Р¶Рµ');
    });
  }
  
  // --- Fitness: Р•РґР° - РґРѕР±Р°РІР»РµРЅРёРµ (РѕС‚РєСЂС‹С‚РёРµ РјРѕРґР°Р»РєРё) ---
  const fitnessFoodAddBtn = document.getElementById('fitnessFoodAdd');

  if (fitnessFoodAddBtn) {
    fitnessFoodAddBtn.addEventListener('click', () => {
      fitnessOpenFoodModal(null); // РѕС‚РєСЂС‹РІР°РµРј РЅР°С€Сѓ РѕР±СЉРµРґРёРЅС‘РЅРЅСѓСЋ С„РѕСЂРјСѓ (СЂСѓС‡РЅРѕР№/Р°РІС‚Рѕ)
    });
  }


  // ========== COLLAPSIBLE FITNESS CARDS ==========
  
  // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ СЃРІРѕСЂР°С‡РёРІР°РµРјС‹С… РєР°СЂС‚РѕС‡РµРє
  function fitnessInitCollapsibleCards() {
    const headers = document.querySelectorAll('.fitness-card-header');
    
    headers.forEach(header => {
      // РџСЂРѕРІРµСЂСЏРµРј, РЅРµ РґРѕР±Р°РІР»РµРЅ Р»Рё СѓР¶Рµ РѕР±СЂР°Р±РѕС‚С‡РёРє
      if (header.dataset.collapseInitialized) return;
      header.dataset.collapseInitialized = 'true';
      
      header.addEventListener('click', (e) => {
        // РќРµ СЃРІРѕСЂР°С‡РёРІР°С‚СЊ РїСЂРё РєР»РёРєРµ РЅР° РєРЅРѕРїРєРё РІРЅСѓС‚СЂРё С€Р°РїРєРё
        if (e.target.tagName === 'BUTTON' || e.target.closest('BUTTON')) return;
        
        // РџР Р•Р”РћРўР’Р РђР©Р•РќРР• РљРћРќР¤Р›РРљРўРђ: РѕСЃС‚Р°РЅР°РІР»РёРІР°РµРј РІСЃРїР»С‹С‚РёРµ, С‡С‚РѕР±С‹ РєР»РёРє РїРѕ header
        // РЅРµ РІС‹Р·С‹РІР°Р» РѕР±СЂР°Р±РѕС‚С‡РёРєРё РЅР° СЂРѕРґРёС‚РµР»СЊСЃРєРѕР№ РєР°СЂС‚РѕС‡РєРµ (РЅР°РїСЂРёРјРµСЂ, РѕС‚РєСЂС‹С‚РёРµ РїРѕРїР°РїР° СЌРЅРµСЂРіРёРё)
        e.stopPropagation();
        
        const card = header.closest('[class*="bg-white/"]');
        if (!card) return;
        
        const body = card.querySelector('.fitness-card-body');
        const chevron = header.querySelector('.fitness-card-chevron');
        
        if (body) {
          const isCollapsed = body.classList.contains('collapsed');
          
          if (isCollapsed) {
            // Р Р°Р·РІРѕСЂР°С‡РёРІР°РµРј
            body.classList.remove('collapsed');
            if (chevron) chevron.classList.remove('rotated');
          } else {
            // РЎРІРѕСЂР°С‡РёРІР°РµРј
            body.classList.add('collapsed');
            if (chevron) chevron.classList.add('rotated');
          }
        }
      });
    });
    
    // Р РђР—Р’Р•Р”Р•РќРР• РљР›РРљРћР’: РґР»СЏ РєР°СЂС‚РѕС‡РєРё СЌРЅРµСЂРіРёРё - РѕС‚РєСЂС‹С‚РёРµ РїРѕРїР°РїР° С‚РѕР»СЊРєРѕ РїСЂРё РєР»РёРєРµ РїРѕ body (РЅРµ РїРѕ header)
    const energyCard = document.getElementById('fitnessCaloriesCard');
    if (energyCard && !energyCard.dataset.popupHandlerAdded) {
      energyCard.dataset.popupHandlerAdded = 'true';
      energyCard.addEventListener('click', (e) => {
        // Р•СЃР»Рё РєР»РёРє РїРѕ header - СЌС‚Рѕ РѕР±СЂР°Р±Р°С‚С‹РІР°РµС‚ СЃРІРѕСЂР°С‡РёРІР°РЅРёРµ, РёРіРЅРѕСЂРёСЂСѓРµРј
        if (e.target.closest('.fitness-card-header')) return;
        // РРіРЅРѕСЂРёСЂРѕРІР°С‚СЊ РєР»РёРєРё РїРѕ РєРЅРѕРїРєР°Рј
        if (e.target.closest('button')) return;
        // РћС‚РєСЂС‹РІР°РµРј РїРѕРїР°Рї РґРµС‚Р°Р»РёР·Р°С†РёРё СЌРЅРµСЂРіРёРё
        if (typeof fitnessOpenEnergyDetails === 'function') {
          fitnessOpenEnergyDetails();
        }
      });
    }
    
    // РћР±РЅРѕРІР»СЏРµРј РјРёРЅРё-РґР°РЅРЅС‹Рµ РІ С€Р°РїРєР°С…
    fitnessUpdateCardSummaries();
  }
  
  // РћР±РЅРѕРІР»РµРЅРёРµ РјРёРЅРё-РґР°РЅРЅС‹С… РІ С€Р°РїРєР°С… РєР°СЂС‚РѕС‡РµРє
  function fitnessUpdateCardSummaries() {
    const dateKey = fitnessGetDateKey ? fitnessGetDateKey() : document.getElementById('fitnessDate')?.value;
    if (!dateKey) return;
    
    const dayData = FS.getDayData(dateKey);
    const profile = FS.getFitnessProfile();
    const summary = FS.getCaloriesSummary(profile, dayData);
    
    // 1. Р­РЅРµСЂРіРёСЏ С‚РµР»Р° - РјРёРЅРё-С€РєР°Р»Р° Р±Р°Р»Р°РЅСЃР°
    fitnessUpdateEnergyMiniSummary(dayData, summary);
    
    // 2. РђРєС‚РёРІРЅРѕСЃС‚СЊ - РјРёРЅРё-СЃС‚СЂРѕРєР° Рё РїРѕР»РѕСЃРєРё
    fitnessUpdateActivityMiniSummary(dayData, summary);
    
    // 3. РџРѕРґРґРµСЂР¶РєР° С‚РµР»Р° - РјРёРЅРё-СЃС‚СЂРѕРєР°
    fitnessUpdateSupportMiniSummary(dayData);
  }
  
  // РћР±РЅРѕРІР»РµРЅРёРµ РјРёРЅРё-С€Р°РїРєРё Р­РЅРµСЂРіРёРё
  function fitnessUpdateEnergyMiniSummary(dayData, summary) {
    const energyBalance = summary?.balance || 0;
    const MAX_ABS_BALANCE = 1000;
    const balancePercent = Math.min(100, Math.abs(energyBalance) / MAX_ABS_BALANCE * 100);
    const balanceFill = document.getElementById('energyMiniBalanceFill');
    const balanceText = document.getElementById('energyMiniBalanceText');
    
    if (balanceFill && balanceText) {
      // Р¦РІРµС‚: Р·РµР»С‘РЅС‹Р№ РїСЂРё РґРµС„РёС†РёС‚Рµ (Р±Р°Р»Р°РЅСЃ < 0), РєСЂР°СЃРЅС‹Р№ РїСЂРё РїСЂРѕС„РёС†РёС‚Рµ (Р±Р°Р»Р°РЅСЃ > 0)
      const isDeficit = energyBalance <= 0;
      balanceFill.className = 'fitness-mini-balance-fill ' + (isDeficit ? 'bg-green-400' : 'bg-red-400');
      
      // РџРѕР·РёС†РёРѕРЅРёСЂРѕРІР°РЅРёРµ: РѕС‚ С†РµРЅС‚СЂР° РІР»РµРІРѕ РёР»Рё РІРїСЂР°РІРѕ
      if (energyBalance === 0) {
        balanceFill.style.left = '50%';
        balanceFill.style.width = '0%';
      } else if (isDeficit) {
        // Р”РµС„РёС†РёС‚ - РІР»РµРІРѕ РѕС‚ С†РµРЅС‚СЂР°
        balanceFill.style.left = (50 - balancePercent) + '%';
        balanceFill.style.width = balancePercent + '%';
      } else {
        // РџСЂРѕС„РёС†РёС‚ - РІРїСЂР°РІРѕ РѕС‚ С†РµРЅС‚СЂР°
        balanceFill.style.left = '50%';
        balanceFill.style.width = balancePercent + '%';
      }
      
      // РўРµРєСЃС‚: "-350 РєРєР°Р»" РёР»Рё "+200 РєРєР°Р»"
      const sign = energyBalance > 0 ? '+' : '';
      balanceText.textContent = sign + energyBalance;
      balanceText.className = 'text-[10px] font-medium ' + (isDeficit ? 'text-green-300' : 'text-red-300');
    }
  }
  
  // РћР±РЅРѕРІР»РµРЅРёРµ РјРёРЅРё-С€Р°РїРєРё РђРєС‚РёРІРЅРѕСЃС‚Рё
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
    
    // РњРёРЅРё-СЃС‚СЂРѕРєР° (СЃРѕРєСЂР°С‰С‘РЅРЅРѕ)
    const activitySummary = document.getElementById('activityMiniSummary');
    if (activitySummary) {
      activitySummary.textContent = totals.count + ' Р°РєС‚. В· ' + totalActivityCal + ' РєРєР°Р»';
    }
    
    // РњРёРЅРё-РїРѕР»РѕСЃРєРё (РїСЂРѕРїРѕСЂС†РёРѕРЅР°Р»СЊРЅРѕ РєР°Р»РѕСЂРёСЏРј)
    const maxCal = Math.max(totals.gym, totals.cardio, totals.home, totals.steps, 1);
    const stripWidth = 40; // РјР°РєСЃ С€РёСЂРёРЅР° РІ px
    
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
  
  // РћР±РЅРѕРІР»РµРЅРёРµ РјРёРЅРё-С€Р°РїРєРё РџРѕРґРґРµСЂР¶РєРё С‚РµР»Р°
  function fitnessUpdateSupportMiniSummary(dayData) {
    const dateKey = fitnessGetDateKey ? fitnessGetDateKey() : document.getElementById('fitnessDate')?.value;
    if (!dateKey) return;
    
    // Р•РґР°
    const eaten = (dayData?.foods || []).reduce((sum, f) => sum + (f.calories || 0), 0);
    
    // Р’РѕРґР°
    const waterData = FS.getWaterData(dateKey);
    const waterCurrent = (waterData?.currentMl || 0) / 1000;
    const waterTarget = ((waterData?.targetMl || 2000)) / 1000;
    
    // Р‘РђР”С‹
    const supplements = FS.getAllSupplements();
    let suppTaken = 0, suppTotal = 0;
    
    // РЎС‡РёС‚Р°РµРј Р‘РђР”С‹ РЅР° СЃРµРіРѕРґРЅСЏ
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
      // Р•РґР°
      let text = 'Р•РґР°: ' + eaten + ' РєРєР°Р»';
      
      // Р’РѕРґР° (РїРѕРґСЃРІРµС‡РёРІР°РµРј РµСЃР»Рё РІС‹РїРѕР»РЅРµРЅР°)
      const waterClass = waterCurrent >= waterTarget ? 'text-emerald-300' : '';
      text += ' В· Р’РѕРґР°: <span class="' + waterClass + '">' + waterCurrent.toFixed(1) + ' / ' + waterTarget.toFixed(1) + ' Р»</span>';
      
      // Р‘РђР”С‹
      if (suppTotal > 0) {
        const suppClass = suppTaken >= suppTotal ? 'text-emerald-300' : (suppTaken < suppTotal ? 'text-amber-300' : '');
        text += ' В· Р‘РђР”С‹: <span class="' + suppClass + '">' + suppTaken + ' / ' + suppTotal + '</span>';
      } else {
        text += ' В· Р‘РђР”С‹: 0 / 0';
      }
      
      supportSummary.innerHTML = text;
    }
  }
  
  // Р’С‹Р·РѕРІ РёРЅРёС†РёР°Р»РёР·Р°С†РёРё РїСЂРё Р·Р°РіСЂСѓР·РєРµ Рё РїСЂРё РёР·РјРµРЅРµРЅРёРё РґР°РЅРЅС‹С…
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(fitnessInitCollapsibleCards, 100);
    });
  } else {
    setTimeout(fitnessInitCollapsibleCards, 100);
  }

  // ========== РЎР’РћР РђР§РР’РђРќРР• РџРћ РЈРњРћР›Р§РђРќРР® ==========
  // Р”РѕР±Р°РІР»СЏРµРј РєР»Р°СЃСЃ collapsed РєРѕ РІСЃРµРј РєР°СЂС‚РѕС‡РєР°Рј РїСЂРё РёРЅРёС†РёР°Р»РёР·Р°С†РёРё
  function fitnessCollapseAllCards() {
    document.querySelectorAll('.fitness-card-body').forEach(body => {
      body.classList.add('collapsed');
    });
    document.querySelectorAll('.fitness-card-chevron').forEach(chev => {
      chev.classList.add('rotated');
    });
  }

  // Р’С‹Р·С‹РІР°РµРј СЃСЂР°Р·Сѓ РїРѕСЃР»Рµ РёРЅРёС†РёР°Р»РёР·Р°С†РёРё
  setTimeout(fitnessCollapseAllCards, 150);

  // ========== РљРќРћРџРљРђ "РќРђР—РђР”" Р’РќРЈРўР Р Р”РђРЁР‘РћР Р”Рђ ==========
  const fitnessBackInDashboard = document.getElementById('fitnessBackInDashboard');
  if (fitnessBackInDashboard) {
    fitnessBackInDashboard.addEventListener('click', () => {
      // Р’РѕР·РІСЂР°С‰Р°РµРјСЃСЏ РЅР° РіР»Р°РІРЅС‹Р№ СЌРєСЂР°РЅ С‡РµСЂРµР· showMain()
      if (typeof showMain === 'function') {
        showMain();
      } else {
        // Р¤РѕР»Р»Р±РµРє - СЃРєСЂС‹С‚СЊ С„РёС‚РЅРµСЃ-СЌРєСЂР°РЅ
        const fitnessScreen = document.getElementById('fitnessScreen');
        if (fitnessScreen) fitnessScreen.classList.add('hidden');
      }
    });
  }

  // ========== Р—РђР“Р РЈР—РљРђ Р¤РћРўРћ ==========
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
        showAlert('РџРѕР¶Р°Р»СѓР№СЃС‚Р°, РІС‹Р±РµСЂРёС‚Рµ РёР·РѕР±СЂР°Р¶РµРЅРёРµ');
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
        showAlert('Р¤РѕС‚Рѕ СЃРѕС…СЂР°РЅРµРЅРѕ!');
      } catch (err) {
        console.warn('РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ С„РѕС‚Рѕ:', err);
        fitnessPhotoDebugLog('photo: error/unsupported (localStorage save failed)');
        showAlert('РћС€РёР±РєР° РїСЂРё С‡С‚РµРЅРёРё РёР»Рё СЃРѕС…СЂР°РЅРµРЅРёРё С„Р°Р№Р»Р°');
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
      console.warn('РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ С„РѕС‚Рѕ:', err);
      if (fitnessAvatar) fitnessAvatar.classList.add('hidden');
      if (fitnessAvatarPlaceholder) fitnessAvatarPlaceholder.classList.remove('hidden');
    }
  }

  setTimeout(fitnessLoadSavedPhoto, 200);


  // ========== РљРќРћРџРљРђ "Р¤РРўРќР•РЎ" РќРђ Р“Р›РђР’РќРћРњ Р­РљР РђРќР• ==========
  if (el.fitnessBtn && !el.fitnessBtn.dataset.fitnessOpenBound) {
    if (!el.fitnessBtn.dataset.fitnessLegacyBound) {
      el.fitnessBtn.dataset.fitnessLegacyBound = '1';
      el.fitnessBtn.addEventListener('click', () => {
        showFitness();
      });
    }
  }


  // ========== РљРќРћРџРљРђ "РќРђР—РђР”" Р’РќРР—РЈ РЎРџР РђР’Рђ ==========
  const fitnessBackInDashboardFixed = document.getElementById('fitnessBackInDashboardFixed');
  if (fitnessBackInDashboardFixed) {
    fitnessBackInDashboardFixed.addEventListener('click', () => {
      // Р’РѕР·РІСЂР°С‰Р°РµРјСЃСЏ РЅР° РіР»Р°РІРЅС‹Р№ СЌРєСЂР°РЅ С‡РµСЂРµР· showMain()
      if (typeof showMain === 'function') {
        showMain();
      } else {
        // Р¤РѕР»Р»Р±РµРє - СЃРєСЂС‹С‚СЊ С„РёС‚РЅРµСЃ-СЌРєСЂР°РЅ
        const fitnessScreen = document.getElementById('fitnessScreen');
        if (fitnessScreen) fitnessScreen.classList.add('hidden');
      }
    });
  }


  // ========== РџР•Р Р•РљР›Р®Р§Р•РќРР• РўР•РњР« ==========
  const THEME_STORAGE_KEY = 'fitnessTheme';
  const DEFAULT_THEME = 'dark'; // РџРѕ СѓРјРѕР»С‡Р°РЅРёСЋ С‚С‘РјРЅР°СЏ С‚РµРјР°
  
  // Р¤СѓРЅРєС†РёСЏ РїСЂРёРјРµРЅРµРЅРёСЏ С‚РµРјС‹
  function fitnessApplyTheme(theme) {
    const root = document.documentElement;
    const themeToggle = document.getElementById('fitnessThemeToggle');
    const themeLabel = document.getElementById('fitnessThemeLabel');
    const mainThemeToggle = document.getElementById('mainThemeToggle');
    const mainThemeLabel = document.getElementById('mainThemeLabel');
    
    if (theme === 'dark') {
      // РўС‘РјРЅР°СЏ С‚РµРјР° - РґРѕР±Р°РІР»СЏРµРј Р°С‚СЂРёР±СѓС‚
      root.setAttribute('data-fitness-theme', 'dark');
      if (themeToggle) {
        themeToggle.textContent = 'РўС‘РјРЅР°СЏ';
        themeToggle.classList.remove('bg-white/20');
        themeToggle.classList.add('bg-indigo-500/50');
      }
      if (themeLabel) themeLabel.textContent = 'РўС‘РјРЅР°СЏ';
      if (mainThemeToggle) {
        mainThemeToggle.textContent = 'РўС‘РјРЅР°СЏ';
        mainThemeToggle.classList.remove('bg-white/20');
        mainThemeToggle.classList.add('bg-indigo-500/50');
      }
      if (mainThemeLabel) mainThemeLabel.textContent = 'РўС‘РјРЅР°СЏ';
    } else {
      // РЎРІРµС‚Р»Р°СЏ С‚РµРјР° - СѓР±РёСЂР°РµРј Р°С‚СЂРёР±СѓС‚
      root.removeAttribute('data-fitness-theme');
      if (themeToggle) {
        themeToggle.textContent = 'РЎРІРµС‚Р»Р°СЏ';
        themeToggle.classList.remove('bg-indigo-500/50');
        themeToggle.classList.add('bg-white/20');
      }
      if (themeLabel) themeLabel.textContent = 'РЎРІРµС‚Р»Р°СЏ';
      if (mainThemeToggle) {
        mainThemeToggle.textContent = 'РЎРІРµС‚Р»Р°СЏ';
        mainThemeToggle.classList.remove('bg-indigo-500/50');
        mainThemeToggle.classList.add('bg-white/20');
      }
      if (mainThemeLabel) mainThemeLabel.textContent = 'РЎРІРµС‚Р»Р°СЏ';
    }
  }
  
  // Р¤СѓРЅРєС†РёСЏ РїРµСЂРµРєР»СЋС‡РµРЅРёСЏ С‚РµРјС‹
  function fitnessToggleTheme() {
    const currentTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    fitnessApplyTheme(newTheme);
  }
  
  // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ С‚РµРјС‹ РїСЂРё Р·Р°РіСЂСѓР·РєРµ
  function fitnessInitTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
    fitnessApplyTheme(savedTheme);
  }
  
  // РћР±СЂР°Р±РѕС‚С‡РёРє РєРЅРѕРїРєРё РїРµСЂРµРєР»СЋС‡РµРЅРёСЏ С‚РµРјС‹
  const fitnessThemeToggle = document.getElementById('fitnessThemeToggle');
  if (fitnessThemeToggle) {
    fitnessThemeToggle.addEventListener('click', fitnessToggleTheme);
  }

  const mainThemeToggle = document.getElementById('mainThemeToggle');
  if (mainThemeToggle) {
    mainThemeToggle.addEventListener('click', fitnessToggleTheme);
  }
  
  // РџСЂРёРјРµРЅСЏРµРј С‚РµРјСѓ РїСЂРё Р·Р°РіСЂСѓР·РєРµ
  fitnessInitTheme();


}); // РєРѕРЅРµС† DOMContentLoaded

