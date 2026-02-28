document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;
  const isTelegram = Boolean(tg && typeof tg === 'object');
  
  if (isTelegram) {
    tg?.ready();
  }
  
  const tgUser = tg?.initDataUnsafe?.user ?? null;
  const isDemoUser = !(tgUser && tgUser.id);
  const user = !isDemoUser ? tgUser : { id: 123, username: 'demo_user', first_name: 'Demo User' };
  const supabaseEnabled = Boolean(isTelegram && !isDemoUser && user?.id);
  const fitnessModalOverlay = document.getElementById('fitnessModalOverlay');
  const fitnessModalContent = document.getElementById('fitnessModalContent');
  const cycleSelect = document.getElementById('gymCycleSelect');


  const showAlert = (message) => {
    if (isTelegram && typeof tg?.showAlert === 'function') {
      try {
        tg.showAlert(message);
      } catch (e) {
        window.alert(message);
      }
    } else {
      window.alert(message);
    }
  };

  if (isTelegram) {
    try {
      if (typeof tg.expand === 'function') tg.expand();
    } catch (e) {}
  }

  const SUPABASE_URL = 'https://zhpwehjbonzffpxdrbyl.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpocHdlaGpib256ZmZweGRyYnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzM3MjAsImV4cCI6MjA4Njk0OTcyMH0.em0tBA_YArxA2QQO-r5CWCFnyiknre88Mn6wsrX2ARs';
  window.currentAppUserId = null; // РґР»СЏ fitness СЃРёРЅС…СЂРѕРЅРёР·Р°С†РёРё

  let currentUser = null;
  let currentDay = 1;
  let currentAppUserId = null; // РµРґРёРЅС‹Р№ ID РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РІ РЅР°С€РµРј РїСЂРёР»РѕР¶РµРЅРёРё

  const el = {
    main: document.getElementById('main'),
    buddyScreen: document.getElementById('buddyScreen'),
    completeBtn: document.getElementById('completeBtn'),
    habitsBtn: document.getElementById('habitsBtn'),
    buddyBtn: document.getElementById('buddyBtn'),
    backBtn: document.getElementById('backBtn'),
    fitnessBtn: document.getElementById('fitnessBtn'),
    lessonTitle: document.getElementById('lessonTitle'),
    lessonDesc: document.getElementById('lessonDesc'),
    video: document.getElementById('video'),
    currentDay: document.getElementById('currentDay'),
    streak: document.getElementById('streak'),
    points: document.getElementById('points'),
  };

  // РєРѕСЂРЅРµРІС‹Рµ СЌРєСЂР°РЅС‹
  const rootScreens = {
    main: document.getElementById('main'),
    fitness: document.getElementById('fitnessScreen'),
    buddy: document.getElementById('buddyScreen'),
  };

  function setFitnessScreenActive(active) {
    document.body.classList.toggle('fitness-screen-active', Boolean(active));
  }

  function showMain() {
    setFitnessScreenActive(false);
    if (rootScreens.main) rootScreens.main.classList.remove('hidden');
    if (rootScreens.fitness) rootScreens.fitness.classList.add('hidden');
    if (rootScreens.buddy) rootScreens.buddy.classList.add('hidden');
  }

  function showBuddy() {
    setFitnessScreenActive(false);
    if (rootScreens.main) rootScreens.main.classList.add('hidden');
    if (rootScreens.fitness) rootScreens.fitness.classList.add('hidden');
    if (rootScreens.buddy) rootScreens.buddy.classList.remove('hidden');
  }

  function showFitness() {
    setFitnessScreenActive(true);
    if (rootScreens.main) rootScreens.main.classList.add('hidden');
    if (rootScreens.buddy) rootScreens.buddy.classList.add('hidden');
    if (rootScreens.fitness) {
      rootScreens.fitness.classList.remove('hidden');
      rootScreens.fitness.scrollTop = 0;
    }
    // Р’РќРЈРўР Р•РќРќР®Р® РѕС‡РёСЃС‚РєСѓ С„РёС‚РЅРµСЃР° РґРѕР±Р°РІРёРј РїРѕР·Р¶Рµ, РєРѕРіРґР° fitnessEl Р±СѓРґРµС‚ РѕР±СЉСЏРІР»РµРЅ
  }

  function showBuddy() {
    if (rootScreens.main) rootScreens.main.classList.add('hidden');
    if (rootScreens.fitness) rootScreens.fitness.classList.add('hidden');
    if (rootScreens.buddy) rootScreens.buddy.classList.remove('hidden');
  }


  function setCompleteButtonState({ completed }) {
    if (!el.completeBtn) return;
    if (completed) {
      el.completeBtn.textContent = 'вњ… Р’С‹РїРѕР»РЅРµРЅРѕ!';
      el.completeBtn.disabled = true;
      el.completeBtn.className = 'w-full bg-green-400 py-3 rounded-xl font-semibold text-lg cursor-not-allowed';
    } else {
      el.completeBtn.textContent = 'вњ… Р’С‹РїРѕР»РЅРµРЅРѕ';
      el.completeBtn.disabled = false;
      el.completeBtn.className = 'w-full bg-green-500 hover:bg-green-600 py-3 rounded-xl font-semibold text-lg';
    }
  }

  function updateUI() {
    if (!currentUser) return;
    if (el.currentDay) el.currentDay.textContent = `Р”РµРЅСЊ ${currentDay}/30`;
    if (el.streak) el.streak.textContent = String(currentUser.streak ?? 0);
    if (el.points) el.points.textContent = String(currentUser.points ?? 0);
  }

  function initProfileHeader() {
    const photoEl = document.getElementById('profilePhoto');
    const nameEl = document.getElementById('profileName');
    const usernameEl = document.getElementById('profileUsername');

    if (!photoEl || !nameEl || !usernameEl) return;

    nameEl.textContent = user.first_name || 'LeakFixer User';
    usernameEl.textContent = user.username || 'demo';

    // РџРѕРєР° РїСЂРѕСЃС‚Рѕ Р·Р°РіР»СѓС€РєР°-Р°РІР°С‚Р°СЂ, РїРѕР·Р¶Рµ РїРѕРґС‚СЏРЅРµРј СЂРµР°Р»СЊРЅРѕРµ С„РѕС‚Рѕ С‡РµСЂРµР· Bot API
    photoEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || 'LF')}&background=4f46e5&color=ffffff`;
    loadTelegramProfilePhoto(photoEl);
  }

  async function loadTelegramProfilePhoto(photoEl) {
    if (!photoEl) return;
    if (!isTelegram || isDemoUser) return;
    if (!tg?.initData) return;

    const cacheKey = `tg_avatar_url:${user.id}`;
    const cached = window.localStorage?.getItem(cacheKey);
    if (cached) {
      photoEl.src = cached;
      return;
    }

    try {
      const res = await fetch(`/api/telegram-avatar?user_id=${encodeURIComponent(String(user.id))}`, {
        headers: {
          'x-telegram-init-data': tg.initData,
        },
      });
      if (!res.ok) return;

      const data = await res.json();
      if (data?.photo_url) {
        photoEl.src = data.photo_url;
        window.localStorage?.setItem(cacheKey, data.photo_url);
      }
    } catch (e) {}
  }

  async function loadProfileHabits() {
    const container = document.getElementById('profileHabits');
    if (!container) return;

    if (!supabaseEnabled) {
      container.innerHTML = '';
      return;
    }

    try {
      // 1. РџРѕР»СѓС‡Р°РµРј СЃРїРёСЃРѕРє РїСЂРёРІС‹С‡РµРє
      const habitsRes = await fetch(`${SUPABASE_URL}/rest/v1/habits?select=*`, {
        headers: { apikey: SUPABASE_KEY }
      });
      const habits = await habitsRes.json();

      if (!Array.isArray(habits) || habits.length === 0) {
        container.innerHTML = '<div class="col-span-2 text-sm opacity-70 text-center">РџСЂРёРІС‹С‡РєРё РїРѕРєР° РЅРµ РґРѕР±Р°РІР»РµРЅС‹</div>';
        return;
      }

      // 2. РџРѕР»СѓС‡Р°РµРј Р»РѕРіРё РІС‹РїРѕР»РЅРµРЅРёСЏ РїРѕ С‚РµРєСѓС‰РµРјСѓ РїРѕР»СЊР·РѕРІР°С‚РµР»СЋ
      const logsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/habit_logs?app_user_id=eq.${currentAppUserId}&completed=eq.true&select=habit_id,day`,
        { headers: { apikey: SUPABASE_KEY } }
      );
      const logs = await logsRes.json();
      
      const counts = {};
      if (Array.isArray(logs)) {
        for (const log of logs) {
          if (!counts[log.habit_id]) counts[log.habit_id] = new Set();
          counts[log.habit_id].add(log.day);
        }
      }

      container.innerHTML = '';
      habits.forEach(habit => {
        const doneDays = counts[habit.id]?.size || 0;
        const el = document.createElement('div');
        el.className = 'bg-white/15 rounded-xl p-3 text-sm';

        el.innerHTML = `
          <div class="font-semibold mb-1">${habit.title || 'РџСЂРёРІС‹С‡РєР°'}</div>
          <div class="text-xs opacity-80">${doneDays} / 30</div>
        `;

        container.appendChild(el);
      });
    } catch (e) {
      container.innerHTML = '<div class="col-span-2 text-sm opacity-70 text-center">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё РїСЂРёРІС‹С‡РµРє</div>';
    }
  }

  async function initFromSupabase() {
    try {
      // 1. РС‰РµРј/СЃРѕР·РґР°РµРј app_user РїРѕ telegram_id
      const usersRes = await fetch(
        `${SUPABASE_URL}/rest/v1/app_users?telegram_id=eq.${user.id}`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );
      const appUsers = await usersRes.json();
      let appUser = Array.isArray(appUsers) ? appUsers[0] : null;

      if (!appUser) {
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/app_users`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            telegram_id: user.id,
            username: user.username,
          }),
        });
        const inserted = await insertRes.json();
        appUser = Array.isArray(inserted) ? inserted[0] : null;
      }

      if (!appUser) {
        throw new Error('app_user not resolved');
      }

      currentAppUserId = appUser.id;
      window.currentAppUserId = currentAppUserId;
      if (typeof initFitnessSync === 'function') {
        initFitnessSync(currentAppUserId);
      }
      // 2. РЎС‚Р°СЂСѓСЋ С‚Р°Р±Р»РёС†Сѓ users РјРѕР¶РЅРѕ РІСЂРµРјРµРЅРЅРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РєР°Рє В«РїСЂРѕС„РёР»СЊ РїСЂРѕРіСЂРµСЃСЃР°В»
      const legacyUsers = await fetch(
        `${SUPABASE_URL}/rest/v1/users?app_user_id=eq.${currentAppUserId}`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      ).then(r => r.json());
      
      const existing = Array.isArray(legacyUsers) ? legacyUsers[0] : null;
      
      if (!existing) {
        const createRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            telegram_id: user.id,
            username: user.username,
            app_user_id: currentAppUserId,
            day: 1,
            streak: 0,
            points: 0,
          }),
        });
        const createdArr = await createRes.json();
        const created = Array.isArray(createdArr) ? createdArr[0] : null;
      
        currentUser = created || {
          telegram_id: user.id,
          username: user.username,
          day: 1,
          streak: 0,
          points: 0,
          app_user_id: currentAppUserId,
        };
        currentDay = 1;
      } else {
        currentUser = existing;
        currentDay = Number(existing.day ?? 1);
      }
      

      await loadDayFromSupabase();
      updateUI();
      await loadProfileHabits();
    } catch (e) {
      showAlert('РћС€РёР±РєР° РёРЅРёС†РёР°Р»РёР·Р°С†РёРё (Supabase).');
      initBrowserMode();
    }
  }


  function initBrowserMode() {
    currentUser = { telegram_id: null, username: 'browser', day: 1, streak: 0, points: 0 };
    currentDay = 1;

    if (el.lessonTitle) el.lessonTitle.textContent = 'Р”РµРјРѕ-СЂРµР¶РёРј';
    if (el.lessonDesc) el.lessonDesc.textContent = 'РћС‚РєСЂС‹С‚Рѕ РІ Р±СЂР°СѓР·РµСЂРµ. Telegram-РґР°РЅРЅС‹Рµ РЅРµРґРѕСЃС‚СѓРїРЅС‹.';
    if (el.video) el.video.style.display = 'none';
    setCompleteButtonState({ completed: false });
    updateUI();
    loadProfileHabits();
  }

  async function loadDayFromSupabase() {
    const lessons = await fetch(`${SUPABASE_URL}/rest/v1/lessons?day=eq.${currentDay}`, {
      headers: { apikey: SUPABASE_KEY },
    }).then((r) => r.json());

    const lesson = Array.isArray(lessons) ? lessons[0] : null;
    if (!lesson) {
      if (el.lessonTitle) el.lessonTitle.textContent = `Р”РµРЅСЊ ${currentDay}`;
      if (el.lessonDesc) el.lessonDesc.textContent = 'РЈСЂРѕРє РЅРµ РЅР°Р№РґРµРЅ.';
      if (el.video) el.video.style.display = 'none';
      setCompleteButtonState({ completed: false });
      return;
    }

    if (el.lessonTitle) el.lessonTitle.textContent = lesson.title ?? '';
    if (el.lessonDesc) el.lessonDesc.textContent = lesson.description ?? '';
    if (el.video) {
      if (lesson.video_url) {
        el.video.src = lesson.video_url;
        el.video.style.display = 'block';
      } else {
        el.video.style.display = 'none';
        el.video.removeAttribute('src');
      }
    }

    const logs = await fetch(
      `${SUPABASE_URL}/rest/v1/daily_logs?app_user_id=eq.${currentAppUserId}&day=eq.${currentDay}`,
      {
        headers: { apikey: SUPABASE_KEY },
      }
    ).then((r) => r.json());
    

    const completed = Boolean(Array.isArray(logs) && logs[0]?.completed);
    setCompleteButtonState({ completed });
  }

  function nextDay() {
    currentDay++;
    if (currentUser) currentUser.day = currentDay;

    if (supabaseEnabled) loadDayFromSupabase().catch(() => initBrowserMode());
    else initBrowserMode();

    updateUI();
  }

  if (el.completeBtn) {
    el.completeBtn.addEventListener('click', async () => {
      if (!supabaseEnabled) {
        setCompleteButtonState({ completed: true });
        nextDay();
        return;
      }

      try {
        await fetch(`${SUPABASE_URL}/rest/v1/daily_logs`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            app_user_id: currentAppUserId,
            day: currentDay,
            completed: true,
          }),
        });

        setCompleteButtonState({ completed: true });
        showAlert('вњ… Р”РµРЅСЊ РІС‹РїРѕР»РЅРµРЅ! +10 Р±Р°Р»Р»РѕРІ');

        if (isTelegram && tg?.MainButton) {
          try {
            tg.MainButton.setText('РЎР»РµРґСѓСЋС‰РёР№ РґРµРЅСЊ в†’').show();
            tg.MainButton.onClick(nextDay);
          } catch (e) {
            nextDay();
          }
        } else {
          nextDay();
        }
      } catch (e) {
        showAlert('РћС€РёР±РєР° РїСЂРё СЃРѕС…СЂР°РЅРµРЅРёРё.');
      }
    });
  }

  // --- Fitness tab (glue only: DOM refs, events, render; logic in fitness.js) ---
  const FITNESS_SETUP_DONE_KEY = 'leakfixer_fitness_setup_done';
  let fitnessSelectedDate = new Date();
  const FS = window.FitnessState;
  const FITNESS_SETTINGS_PANEL_ID = 'fitnessSettingsPanelDynamic';

  const fitnessEl = {
    screen: document.getElementById('fitnessScreen'),
    backBtn: document.getElementById('fitnessBackBtn'),
    profileSetup: document.getElementById('fitnessProfileSetup'),
    dashboard: document.getElementById('fitnessDashboard'),
    weight: document.getElementById('fitnessWeight'),
    height: document.getElementById('fitnessHeight'),
    age: document.getElementById('fitnessAge'),
    targetWeight: document.getElementById('fitnessTargetWeight'),
    profileSkip: document.getElementById('fitnessProfileSkip'),
    profileSave: document.getElementById('fitnessProfileSave'),
    avatar: document.getElementById('fitnessAvatar'),
    calEaten: document.getElementById('fitnessCalEaten'),
    calBurned: document.getElementById('fitnessCalBurned'),
    balance: document.getElementById('fitnessBalance'),
    datePrev: document.getElementById('fitnessDatePrev'),
    dateNext: document.getElementById('fitnessDateNext'),
    dateLabel: document.getElementById('fitnessDateLabel'),
    activityList: document.getElementById('fitnessActivityList'),
    foodList: document.getElementById('fitnessFoodList'),
    foodAdd: document.getElementById('fitnessFoodAdd'),
    waterTotal: document.getElementById('fitnessWaterTotal'),
    // NEW: Supplements tracking container
    supplementsTracking: document.getElementById('fitnessSupplementsTracking'),
    modalOverlay: document.getElementById('fitnessModalOverlay'),
    modalContent: document.getElementById('fitnessModalContent'),
    workDayLabel: document.getElementById('fitnessWorkDayLabel'),
    profileEdit: document.getElementById('fitnessProfileEdit'),
    weightDate: document.getElementById('fitnessWeightDate'),
    weightValue: document.getElementById('fitnessWeightValue'),
    weightSave: document.getElementById('fitnessWeightSave'),
    weightStatus: document.getElementById('fitnessWeightStatus'),
  };

  function ensureFitnessSettingsPanel() {
    if (document.getElementById(FITNESS_SETTINGS_PANEL_ID)) return;
    const settingsMini = document.getElementById('settingsMiniSummary');
    const settingsContainer = settingsMini?.closest('.bg-white\\/15');
    if (!settingsMini || !settingsContainer) return;

    const panel = document.createElement('div');
    panel.id = FITNESS_SETTINGS_PANEL_ID;
    panel.className = 'bg-white/10 rounded-xl p-3 mt-3';
    panel.innerHTML = `
      <div class="text-[11px] uppercase tracking-wide opacity-70 mb-1">Fitness Settings</div>
      <div class="text-xs opacity-80 mb-2" id="fitnessSettingsSummary">Water baseline: 2000 ml В· Work profile: variable В· Target weight: not set</div>
      <button type="button" id="fitnessSettingsOpen" class="w-full py-2 rounded-xl bg-cyan-500/30 hover:bg-cyan-500/45 text-sm">Open Fitness Settings</button>
    `;
    settingsContainer.appendChild(panel);
    fitnessEl.settingsOpen = document.getElementById('fitnessSettingsOpen');
    fitnessEl.settingsSummary = document.getElementById('fitnessSettingsSummary');
    fitnessEl.settingsOpen?.addEventListener('click', () => fitnessOpenWaterBaselineModal());
  }

  function fitnessApplyEnglishTexts() {
    document.querySelectorAll('.supp-edit-norm').forEach((elNode) => { elNode.textContent = 'norm'; });
    document.querySelectorAll('.supp-history').forEach((elNode) => { elNode.textContent = 'history'; });
    document.querySelectorAll('.supp-add-intake').forEach((elNode) => { elNode.textContent = '+ Add intake'; });
    document.getElementById('addFirstSupplement')?.replaceChildren(document.createTextNode('+ Add first supplement'));
    document.getElementById('addNewSupplement')?.replaceChildren(document.createTextNode('+ Add supplement'));
    document.getElementById('clearSupplementsHistory')?.replaceChildren(document.createTextNode('Clear supplements history'));
    document.getElementById('resetAllSupplements')?.remove();
    document.getElementById('fitnessSupplementsDebug')?.remove();
  }

  function fitnessUpdateSettingsSummary() {
    const summaryEl = document.getElementById('fitnessSettingsSummary');
    if (!summaryEl) return;
    const profile = FS.getFitnessProfile();
    const water = profile.waterBaselineMl || 2000;
    const targetWeight = profile.targetWeight ? `${profile.targetWeight} kg` : 'not set';
    const workProfile = profile.workProfile || 'variable';
    summaryEl.textContent = `Water baseline: ${water} ml В· Work profile: ${workProfile} В· Target weight: ${targetWeight}`;
  }
  

  function isFitnessSetupDone() {
    return localStorage.getItem(FITNESS_SETUP_DONE_KEY) === '1';
  }
  function setFitnessSetupDone() {
    localStorage.setItem(FITNESS_SETUP_DONE_KEY, '1');
  }

  function fitnessGetDateKey() {
    return FS.formatDateKey(fitnessSelectedDate);
  }

  function fitnessRenderCalories() {
    if (!fitnessEl.calEaten || !fitnessEl.calBurned || !fitnessEl.balance) return;
    const profile = FS.getFitnessProfile();
    const dayData = FS.getDayData(fitnessGetDateKey());
    const summary = FS.getCaloriesSummary(profile, dayData);
    fitnessEl.calEaten.textContent = summary.eaten || 0;
    fitnessEl.calBurned.textContent = summary.burned || 0;
    fitnessEl.balance.textContent = summary.balance || 0;
    fitnessEl.balance.className = 'font-semibold ' + (summary.balanceColor === 'green' ? 'text-green-300' : summary.balanceColor === 'red' ? 'text-red-300' : '');
    
    // РћР±РЅРѕРІР»РµРЅРёРµ Р±Р°СЂР° Р±Р°Р»Р°РЅСЃР° (РїРѕРґ РіСЂР°С„РёРєРѕРј РІРµСЃР°)
    const balanceBarFill = document.getElementById('fitnessCalorieBalanceFill');
    if (balanceBarFill) {
      const MAX_ABS_BALANCE = 700;
      const balance = summary.balance || 0;
      const ratio = Math.min(Math.abs(balance) / MAX_ABS_BALANCE, 1);
      
      let leftPercent, widthPercent;
      
      if (balance === 0) {
        leftPercent = 50;
        widthPercent = 0;
      } else if (balance < 0) {
        leftPercent = 50 - (ratio * 50);
        widthPercent = ratio * 50;
      } else {
        leftPercent = 50;
        widthPercent = ratio * 50;
      }
      
      balanceBarFill.style.left = leftPercent + '%';
      balanceBarFill.style.width = widthPercent + '%';
      
      if (balance < 0) {
        balanceBarFill.className = 'calorie-balance-bar-fill absolute top-0 bottom-0 bg-green-400 transition-all duration-300';
      } else if (balance > 0) {
        balanceBarFill.className = 'calorie-balance-bar-fill absolute top-0 bottom-0 bg-red-400 transition-all duration-300';
      } else {
        balanceBarFill.className = 'calorie-balance-bar-fill absolute top-0 bottom-0 bg-white/50 transition-all duration-300';
      }
    }
    
    // РђР’РўРћРЎРћРҐР РђРќР•РќРР• РІ Supabase
    if (window.FitnessSync && window.currentAppUserId) {
        const dateKey = fitnessGetDateKey();
        const dayData = FS.getDayData(dateKey);
        window.FitnessSync.saveDay(dateKey, {
          water_ml: dayData.waterMl || 0,
          work_day: dayData.workDay || 'normal'
        }).catch(console.error);
      }
  }

  function fitnessRenderWorkDay() {
    if (!fitnessEl.workDayLabel) return;
    const dayData = FS.getDayData(fitnessGetDateKey());
    const v = dayData.workDay;
    let text = 'РљР°Рє РѕР±С‹С‡РЅРѕ';
    if (v === 'low') text = 'Р‘РѕР»СЊС€Рµ СЃРёРґРµР»';
    if (v === 'normal') text = 'РћР±С‹С‡РЅС‹Р№ РґРµРЅСЊ';
    if (v === 'high') text = 'РћС‡РµРЅСЊ Р°РєС‚РёРІРЅС‹Р№ РґРµРЅСЊ';
    fitnessEl.workDayLabel.textContent = text;
  }

  // РћС‚РєСЂС‹С‚СЊ РґРµС‚Р°Р»РёР·Р°С†РёСЋ СЌРЅРµСЂРіРёРё
  function fitnessOpenEnergyDetails() {
    const profile = FS.getFitnessProfile();
    const dayData = FS.getDayData(fitnessGetDateKey());
    const summary = FS.getCaloriesSummary(profile, dayData);
    
    // Р—Р°С‰РёС‚Р° РѕС‚ undefined - РёСЃРїРѕР»СЊР·СѓРµРј Р·РЅР°С‡РµРЅРёСЏ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
    const eaten = summary.eaten || 0;
    const burned = summary.burned || 0;
    const balance = summary.balance || 0;
    const baseRest = summary.baseRest || 0;
    const baseWithWork = summary.baseWithWork || 0;
    const activityCal = summary.activityCal || 0;
    const workMultiplier = summary.workMultiplier || 1.2;
    
    // Р Р°СЃС‡С‘С‚ РєР°Р»РѕСЂРёР№ СЂР°Р±РѕС‚С‹ (СЃ Р·Р°С‰РёС‚РѕР№ РѕС‚ NaN)
    const workKcal = Math.max(0, baseWithWork - baseRest);
    
    // Р—Р°РїРѕР»РЅСЏРµРј РјРѕРґР°Р»СЊРЅРѕРµ РѕРєРЅРѕ
    document.getElementById('energyDetailsEatenTotal').textContent = eaten + ' РєРєР°Р»';
    document.getElementById('energyDetailsBurnedTotal').textContent = burned + ' РєРєР°Р»';
    document.getElementById('energyDetailsBalance').textContent = balance + ' РєРєР°Р»';
    document.getElementById('energyDetailsBaseRest').textContent = baseRest + ' РєРєР°Р»';
    document.getElementById('energyDetailsWork').textContent = workKcal + ' РєРєР°Р»';
    document.getElementById('energyDetailsActivity').textContent = activityCal + ' РєРєР°Р»';
    
    // РўРёРї СЂР°Р±РѕС‚С‹ Рё РґРЅСЏ
    const workProfileLabels = { sedentary: 'РЎРёРґСЏС‡Р°СЏ', mixed: 'РќР° РЅРѕРіР°С…', physical: 'Р¤РёР·РёС‡РµСЃРєР°СЏ', variable: 'РњРµРЅСЏРµС‚СЃСЏ' };
    const workDayLabels = { none: 'РќРµ СЂР°Р±РѕС‚Р°Р»', low: 'Р‘РѕР»СЊС€Рµ СЃРёРґРµР»', normal: 'РћР±С‹С‡РЅС‹Р№', high: 'РћС‡РµРЅСЊ Р°РєС‚РёРІРЅС‹Р№' };
    document.getElementById('energyDetailsWorkProfile').textContent = workProfileLabels[profile.workProfile] || 'вЂ”';
    document.getElementById('energyDetailsWorkDay').textContent = workDayLabels[dayData.workDay] || 'РћР±С‹С‡РЅС‹Р№';
    
    // РЎРїРёСЃРѕРє РµРґС‹
    const eatenList = document.getElementById('energyDetailsEatenList');
    if (dayData.foods && dayData.foods.length > 0) {
      eatenList.innerHTML = dayData.foods.map(function(f) { 
        return '<div class="flex justify-between bg-white/5 rounded px-2 py-1"><span>' + (f.name || 'Р•РґР°') + '</span><span>' + (f.calories || 0) + ' РєРєР°Р»</span></div>';
      }).join('');
    } else {
      eatenList.innerHTML = '<div class="opacity-50 text-center py-2">РќРµС‚ Р·Р°РїРёСЃРµР№ Рѕ РїСЂРёС‘РјР°С… РїРёС‰Рё</div>';
    }
    
    // РўРµРєСЃС‚ Р±Р°Р»Р°РЅСЃР°
    const balanceText = document.getElementById('energyDetailsBalanceText');
    if (balance > 0) {
      balanceText.textContent = 'РџСЂРѕС„РёС†РёС‚ вЂ” РІРѕР·РјРѕР¶РµРЅ РЅР°Р±РѕСЂ РІРµСЃР°';
      balanceText.className = 'text-xs text-red-300 mt-1 text-center';
    } else if (balance < 0) {
      balanceText.textContent = 'Р”РµС„РёС†РёС‚ вЂ” РІРѕР·РјРѕР¶РЅР° РїРѕС‚РµСЂСЏ РІРµСЃР°';
      balanceText.className = 'text-xs text-green-300 mt-1 text-center';
    } else {
      balanceText.textContent = 'РќРµР№С‚СЂР°Р»СЊРЅС‹Р№ Р±Р°Р»Р°РЅСЃ';
      balanceText.className = 'text-xs opacity-70 mt-1 text-center';
    }
    
    // РџРѕРєР°Р·С‹РІР°РµРј РјРѕРґР°Р»СЊРЅРѕРµ РѕРєРЅРѕ
    document.getElementById('energyDetailsModalOverlay').classList.remove('hidden');
  }

  function fitnessRenderDate() {
    if (fitnessEl.dateLabel) fitnessEl.dateLabel.textContent = FS.formatDateLocal(fitnessSelectedDate);
  }

  function fitnessRenderActivityList() {
    if (!fitnessEl.activityList) return;
    const dayData = FS.getDayData(fitnessGetDateKey());
    const items = FS.getActivityListViewModel(dayData.activities);
    const empty = '<li class="opacity-70 text-sm">РќРµС‚ Р·Р°РїРёСЃРµР№</li>';
    fitnessEl.activityList.innerHTML = items.length
      ? items.map((item) => `<li class="flex items-center justify-between py-2 border-b border-white/10">
        <span>${item.label}</span>
        <span>
          <button type="button" class="fitness-activity-edit mr-2 text-xs opacity-80" data-id="${item.id}">РёР·Рј</button>
          <button type="button" class="fitness-activity-delete text-xs opacity-80 text-red-300" data-id="${item.id}">СѓРґР»</button>
        </span>
      </li>`).join('')
      : empty;
    fitnessEl.activityList.querySelectorAll('.fitness-activity-edit').forEach((btn) => {
      btn.addEventListener('click', () => fitnessOpenActivityModal(btn.dataset.id));
    });
    fitnessEl.activityList.querySelectorAll('.fitness-activity-delete').forEach((btn) => {
      btn.addEventListener('click', () => {
        const k = fitnessGetDateKey();
        const dayData = FS.getDayData(k);
        const next = FS.removeActivityById(dayData.activities, btn.dataset.id);
        FS.updateDayData(k, { activities: next });
        fitnessRenderActivityList();
        fitnessRenderCalories();
        fitnessRenderActivityBlock();
      });
    });
  }
  
  function fitnessRenderFoodList() {
    if (!fitnessEl.foodList) return;
    const dayData = FS.getDayData(fitnessGetDateKey());
    const items = FS.getFoodListViewModel(dayData.foods);
    const empty = '<li class="opacity-70 text-sm">РќРµС‚ Р·Р°РїРёСЃРµР№</li>';
    fitnessEl.foodList.innerHTML = items.length
      ? items.map((item) => `<li class="flex items-center justify-between py-2 border-b border-white/10">
            <span>
              ${item.timeText ? `<span class="opacity-70 mr-1">${item.timeText}</span>` : ''}
              ${item.name} ${item.amount ? item.amount + ' ' : ''}${item.caloriesText ? 'вЂў ' + item.caloriesText : ''}
              ${item.macrosText ? `<span class="text-xs opacity-70 ml-1">(${item.macrosText})</span>` : ''}
            </span>
            <span>
              <button type="button" class="fitness-food-edit mr-2 text-xs opacity-80" data-id="${item.id}">РёР·Рј</button>
              <button type="button" class="fitness-food-delete text-xs opacity-80 text-red-300" data-id="${item.id}">СѓРґР»</button>
            </span>
          </li>`).join('')
      : empty;    
    fitnessEl.foodList.querySelectorAll('.fitness-food-edit').forEach((btn) => {
      btn.addEventListener('click', () => fitnessOpenFoodModal(btn.dataset.id));
    });
    fitnessEl.foodList.querySelectorAll('.fitness-food-delete').forEach((btn) => {
      btn.addEventListener('click', () => {
        const k = fitnessGetDateKey();
        const dayData = FS.getDayData(k);
        const next = FS.removeFoodById(dayData.foods, btn.dataset.id);
        FS.updateDayData(k, { foods: next });
        fitnessRenderFoodList();
        fitnessRenderCalories();
      });
    });
  }
    
  // UPDATED: New water tracking with status
  function fitnessRenderWater() {
    if (!fitnessEl.waterTotal) return;
    
    const dateKey = fitnessGetDateKey();
    const profile = FS.getFitnessProfile();
    const baseline = profile.waterBaselineMl || 2000;
    const waterData = FS.getWaterData(dateKey);
    
    const currentLiters = FS.formatWaterLiters(waterData.currentMl);
    const targetLiters = FS.formatWaterLiters(waterData.targetMl);
    
    // Update main display
    fitnessEl.waterTotal.textContent = `${currentLiters} / ${targetLiters} Р»`;
    
    // Calculate and display status
    const status = FS.getWaterStatus(waterData.currentMl, waterData.targetMl);
    const statusText = FS.getWaterStatusText(status);
    
    // Update or create status element
    let statusEl = fitnessEl.waterTotal.parentElement?.querySelector('.water-status');
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.className = 'water-status text-xs mt-1';
      fitnessEl.waterTotal.parentElement?.appendChild(statusEl);
    }
    statusEl.textContent = statusText;
    
    // Set color based on status
    if (status === 'low') {
      statusEl.className = 'water-status text-xs mt-1 text-blue-300';
    } else if (status === 'high') {
      statusEl.className = 'water-status text-xs mt-1 text-cyan-300';
    } else {
      statusEl.className = 'water-status text-xs mt-1 text-green-300';
    }
    
    // Auto-save to backend
    if (window.FitnessSync && window.currentAppUserId) {
      window.FitnessSync.saveDay(dateKey, {
        water_ml: waterData.currentMl
      }).catch(console.error);
    }
  }

  // NEW: Adjust water by delta ml
  function fitnessAdjustWater(deltaMl) {
    const dateKey = fitnessGetDateKey();
    FS.adjustWater(dateKey, deltaMl);
    fitnessRenderWater();
  }

  // NEW: Open modal to manually adjust water
  function fitnessOpenWaterAdjustModal() {
    let html = '<h3 class="font-semibold mb-4">РР·РјРµРЅРёС‚СЊ РІРѕРґСѓ</h3>';
    html += '<div class="space-y-3">';
    html += '<label class="block text-sm">РР·РјРµРЅРµРЅРёРµ РІ РјР» (РјРѕР¶РЅРѕ РѕС‚СЂРёС†Р°С‚РµР»СЊРЅРѕРµ)</label>';
    html += '<input type="number" id="fmWaterDelta" class="w-full p-3 bg-white/30 rounded-xl text-white" placeholder="РќР°РїСЂРёРјРµСЂ: -200 РёР»Рё +500">';
    html += '<p class="text-xs opacity-70">Р’РІРµРґРёС‚Рµ РїРѕР»РѕР¶РёС‚РµР»СЊРЅРѕРµ С‡РёСЃР»Рѕ РґР»СЏ РґРѕР±Р°РІР»РµРЅРёСЏ, РѕС‚СЂРёС†Р°С‚РµР»СЊРЅРѕРµ вЂ” РґР»СЏ СѓРјРµРЅСЊС€РµРЅРёСЏ</p>';
    html += '</div>';
    html += '<div class="flex gap-3 mt-4"><button type="button" id="fmWaterAdjustCancel" class="flex-1 py-3 rounded-xl bg-white/20">РћС‚РјРµРЅР°</button><button type="button" id="fmWaterAdjustSave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">РЎРѕС…СЂР°РЅРёС‚СЊ</button></div>';
    
    fitnessOpenModal(html, () => {
      fitnessEl.modalOverlay.querySelector('#fmWaterAdjustCancel')?.addEventListener('click', fitnessCloseModal);
      fitnessEl.modalOverlay.querySelector('#fmWaterAdjustSave')?.addEventListener('click', () => {
        const deltaInput = document.getElementById('fmWaterDelta')?.value;
        const delta = Number(deltaInput);
        if (!Number.isNaN(delta)) {
          fitnessAdjustWater(delta);
        }
        fitnessCloseModal();
        fitnessRenderWater();
        fitnessUpdateSettingsSummary();
      });
    });
  }

  // NEW: Open modal to change water baseline
  function fitnessOpenWaterBaselineModal() {
    const profile = FS.getFitnessProfile();
    const currentBaseline = profile.waterBaselineMl || 2000;
    
    let html = '<h3 class="font-semibold mb-4">РР·РјРµРЅРёС‚СЊ РЅРѕСЂРјСѓ РІРѕРґС‹</h3>';
    html += '<div class="space-y-3">';
    html += '<label class="block text-sm">Р”РЅРµРІРЅР°СЏ РЅРѕСЂРјР° РІ РјР»</label>';
    html += '<input type="number" id="fmWaterBaseline" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + currentBaseline + '" placeholder="2000">';
    html += '<p class="text-xs opacity-70">РџСЂРёРјРµСЂС‹: 1800, 2000, 2500 РјР»</p>';
    html += '</div>';
    html += '<div class="flex gap-3 mt-4"><button type="button" id="fmWaterBaselineCancel" class="flex-1 py-3 rounded-xl bg-white/20">РћС‚РјРµРЅР°</button><button type="button" id="fmWaterBaselineSave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">РЎРѕС…СЂР°РЅРёС‚СЊ</button></div>';
    
    fitnessOpenModal(html, () => {
      fitnessEl.modalOverlay.querySelector('#fmWaterBaselineCancel')?.addEventListener('click', fitnessCloseModal);
      fitnessEl.modalOverlay.querySelector('#fmWaterBaselineSave')?.addEventListener('click', () => {
        const baselineInput = document.getElementById('fmWaterBaseline')?.value;
        const newBaseline = Number(baselineInput);
        
        if (!Number.isNaN(newBaseline) && newBaseline > 0) {
          // Update profile
          profile.waterBaselineMl = newBaseline;
          FS.setFitnessProfile(profile);
          
          // Update today's target if water exists, or initialize it
          const dateKey = fitnessGetDateKey();
          const dayData = FS.getDayData(dateKey);
          if (dayData.water) {
            // Update target for today
            FS.updateDayData(dateKey, { 
              water: { 
                targetMl: newBaseline, 
                currentMl: dayData.water.currentMl 
              } 
            });
          }
        }
        
        fitnessCloseModal();
        fitnessRenderWater();
      });
    });
  }

  // Cache for weight chart data
  let weightChartDataCache = null;
  let weightChartDataTimestamp = 0;

  async function fitnessRenderWeightChart() {
    const chartContainer = document.getElementById('fitnessWeightChart');
    if (!chartContainer) return;
    
    // Check cache (30 seconds)
    const now = Date.now();
    if (weightChartDataCache && (now - weightChartDataTimestamp < 30000)) {
      renderWeightChartSVG(weightChartDataCache);
      return;
    }

    // Show loading state
    chartContainer.innerHTML = '<div class="flex items-center justify-center h-full text-xs opacity-50">Р—Р°РіСЂСѓР·РєР°...</div>';
    
    if (!window.FitnessSync || !window.currentAppUserId) {
      chartContainer.innerHTML = '<div class="flex items-center justify-center h-full text-xs opacity-50">РќРµС‚ РґР°РЅРЅС‹С…</div>';
      return;
    }
  
    try {
      const chartData = await window.FitnessSync.getWeightChartData(30);
      weightChartDataCache = chartData;
      weightChartDataTimestamp = now;
      
      if (!chartData || chartData.length === 0) {
        // Show "Add weight" button when no data exists
        chartContainer.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full">
            <span class="text-xs opacity-70 mb-2">рџ“Љ РџРѕРєР° РЅРµС‚ РґР°РЅРЅС‹С… РїРѕ РІРµСЃСѓ</span>
            <button type="button" id="weightChartAddBtn" class="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-sm font-medium">
              + Р”РѕР±Р°РІРёС‚СЊ РІРµСЃ
            </button>
          </div>
        `;
        // Attach click handler to the button
        document.getElementById('weightChartAddBtn')?.addEventListener('click', () => {
          fitnessOpenAddWeightModal();
        });
        return;
      }
      
      renderWeightChartSVG(chartData);
    } catch (e) {
      console.error('Error loading weight chart:', e);
      chartContainer.innerHTML = '<div class="flex items-center justify-center h-full text-xs opacity-50">РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё</div>';
    }
  }
  
  function renderWeightChartSVG(chartData) {
    const chartContainer = document.getElementById('fitnessWeightChart');
    if (!chartContainer) return;
    
    const points = FS.generateWeightChartPoints(chartData, 100, 40, 4);
    const currentWeight = chartData[chartData.length - 1]?.value || 0;
    const previousWeight = chartData[chartData.length - 2]?.value || currentWeight;
    const change = FS.formatWeightChange(currentWeight, previousWeight);
    
    chartContainer.innerHTML = `
      <svg viewBox="0 0 100 40" class="w-full h-full" style="cursor: pointer;" onclick="fitnessOpenWeightDetailScreen()">
        <defs>
          <linearGradient id="weightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:rgba(74,222,128,0.3)"/>
            <stop offset="100%" style="stop-color:rgba(74,222,128,0)"/>
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="#4ade80"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          points="${points}"
        />
        ${chartData.map((item, i) => {
          const x = 4 + (i / (chartData.length - 1 || 1)) * 92;
          const minVal = Math.min(...chartData.map(d => d.value));
          const maxVal = Math.max(...chartData.map(d => d.value));
          const y = 4 + 32 - ((item.value - minVal) / (maxVal - minVal || 1)) * 32;
          return `<circle cx="${x}" cy="${y}" r="1.5" fill="white" opacity="0.8"/>`;
        }).join('')}
      </svg>
      <div class="absolute bottom-1 right-2 text-[10px] font-medium ${change.trend === 'down' ? 'text-green-400' : change.trend === 'up' ? 'text-red-400' : 'text-white'}">
        ${change.text}
      </div>
      <div class="absolute top-1 left-2 text-[10px] opacity-70">
        ${currentWeight > 0 ? currentWeight.toFixed(1) + ' РєРі' : 'вЂ”'}
      </div>
    `;
    chartContainer.style.position = 'relative';
  }

  function fitnessRenderDashboard() {
    ensureFitnessSettingsPanel();
    fitnessUpdateSettingsSummary();
    const photoEl = document.getElementById('profilePhoto');
    if (fitnessEl.avatar && photoEl?.src) fitnessEl.avatar.src = photoEl.src;
  
    const profile = FS.getFitnessProfile();
    if (fitnessEl.weightValue && typeof profile.weight === 'number') {
      fitnessEl.weightValue.value = String(profile.weight);
    }
    if (fitnessEl.weightDate && !fitnessEl.weightDate.value) {
      fitnessEl.weightDate.value = FS.formatDateKey(new Date());
    }
  
    fitnessRenderDate();
    fitnessRenderCalories();
    fitnessRenderActivityList();
    fitnessRenderActivityBlock();
    fitnessRenderFoodList();
    fitnessRenderWater();
    fitnessRenderWeightChart();
    fitnessRenderSupplementsTracking();
    fitnessApplyEnglishTexts();
    fitnessRenderWorkDay();
    
    // Р—Р°РіСЂСѓР·РєР° СЃРѕС…СЂР°РЅС‘РЅРЅРѕРіРѕ С„РѕС‚Рѕ РґР»СЏ С‚РµРєСѓС‰РµР№ РґР°С‚С‹
    if (typeof fitnessLoadSavedPhoto === 'function') {
      fitnessLoadSavedPhoto();
    }
    
    // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ СЃРІРѕСЂР°С‡РёРІР°РµРјС‹С… РєР°СЂС‚РѕС‡РµРє
    fitnessInitCollapsibleCards();
    // РћР±РЅРѕРІР»РµРЅРёРµ РјРёРЅРё-РґР°РЅРЅС‹С… РІ С€Р°РїРєР°С…
    fitnessUpdateCardSummaries();
    // РЎРІРѕСЂР°С‡РёРІР°РµРј РІСЃРµ РєР°СЂС‚РѕС‡РєРё РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ (РїРµСЂРІС‹Р№ Р·Р°РїСѓСЃРє)
    if (!window.fitnessCardsInitiallyCollapsed) {
      window.fitnessCardsInitiallyCollapsed = true;
      fitnessCollapseAllCards();
    }
  }

  // ========== РЎР’РћР РђР§РР’РђР•РњР«Р• РљРђР РўРћР§РљР ==========
  
  // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РѕР±СЂР°Р±РѕС‚С‡РёРєРѕРІ РєР»РёРєРѕРІ РґР»СЏ СЃРІРѕСЂР°С‡РёРІР°РµРјС‹С… РєР°СЂС‚РѕС‡РµРє
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
        fitnessOpenEnergyDetails();
      });
    }
  }
  
  // РћР±РЅРѕРІР»РµРЅРёРµ РјРёРЅРё-РґР°РЅРЅС‹С… РІ С€Р°РїРєР°С… РІСЃРµС… РєР°СЂС‚РѕС‡РµРє
  function fitnessUpdateCardSummaries() {
    fitnessUpdateEnergyMiniSummary();
    fitnessUpdateActivityMiniSummary();
    fitnessUpdateSupportMiniSummary();
  }
  
  // РњРёРЅРё-С€РєР°Р»Р° Р±Р°Р»Р°РЅСЃР° РІ С€Р°РїРєРµ "Р­РЅРµСЂРіРёСЏ С‚РµР»Р°"
  function fitnessUpdateEnergyMiniSummary() {
    const dateKey = fitnessGetDateKey();
    const dayData = FS.getDayData(dateKey);
    const profile = FS.getFitnessProfile();
    const summary = FS.getCaloriesSummary(profile, dayData);
    
    const miniFill = document.getElementById('energyMiniBalanceFill');
    const miniText = document.getElementById('energyMiniBalanceText');
    
    if (miniFill && miniText) {
      const balance = summary.balance || 0;
      const MAX_ABS_BALANCE = 1000; // РњР°РєСЃРёРјР°Р»СЊРЅС‹Р№ РѕС‚РѕР±СЂР°Р¶Р°РµРјС‹Р№ Р±Р°Р»Р°РЅСЃ
      
      // РќРѕСЂРјР°Р»РёР·СѓРµРј: 0 = С†РµРЅС‚СЂ, -1000 = Р»РµРІС‹Р№ РєСЂР°Р№, +1000 = РїСЂР°РІС‹Р№ РєСЂР°Р№
      const normalizedBalance = Math.max(-MAX_ABS_BALANCE, Math.min(MAX_ABS_BALANCE, balance));
      const percentFromCenter = (normalizedBalance / MAX_ABS_BALANCE) * 50; // 0-50%
      
      if (balance <= 0) {
        // Р”РµС„РёС†РёС‚ - Р·Р°РїРѕР»РЅРµРЅРёРµ РІР»РµРІРѕ РѕС‚ С†РµРЅС‚СЂР°
        miniFill.style.left = (50 - percentFromCenter) + '%';
        miniFill.style.width = percentFromCenter + '%';
        miniFill.className = 'fitness-mini-balance-fill bg-green-400';
      } else {
        // РџСЂРѕС„РёС†РёС‚ - Р·Р°РїРѕР»РЅРµРЅРёРµ РІРїСЂР°РІРѕ РѕС‚ С†РµРЅС‚СЂР°
        miniFill.style.left = '50%';
        miniFill.style.width = percentFromCenter + '%';
        miniFill.className = 'fitness-mini-balance-fill bg-red-400';
      }
      
      // РўРµРєСЃС‚
      const sign = balance >= 0 ? '+' : '';
      miniText.textContent = sign + balance;
      miniText.className = 'text-[10px] font-medium ' + (balance >= 0 ? 'text-red-300' : 'text-green-300');
    }
  }
  
  // РњРёРЅРё-СЃС‚СЂРѕРєР° Рё РїРѕР»РѕСЃРєРё РІ С€Р°РїРєРµ "РђРєС‚РёРІРЅРѕСЃС‚СЊ"
  function fitnessUpdateActivityMiniSummary() {
    const dateKey = fitnessGetDateKey();
    const dayData = FS.getDayData(dateKey);
    const activities = dayData.activities || [];
    
    // РџРѕРґСЃС‡С‘С‚ РїРѕ С‚РёРїР°Рј
    const totals = {
      gym: { calories: 0 },
      cardio: { calories: 0 },
      home: { calories: 0 },
      steps: { calories: 0 }
    };
    
    activities.forEach(a => {
      if (a.kind === 'gym' || a.kind === 'strength') {
        totals.gym.calories += a.calories || 0;
      } else if (a.kind === 'cardio_indoor' || a.kind === 'cardio_outdoor' || a.kind === 'cardio') {
        totals.cardio.calories += a.calories || 0;
      } else if (a.kind === 'home' || a.kind === 'home_exercise') {
        totals.home.calories += a.calories || 0;
      } else if (a.kind === 'steps') {
        totals.steps.calories += a.calories || 0;
      }
    });
    
    // РћР±С‰РµРµ РєРѕР»РёС‡РµСЃС‚РІРѕ
    const totalCalories = totals.gym.calories + totals.cardio.calories + totals.home.calories + totals.steps.calories;
    const totalSessions = activities.length;
    
    // РћР±РЅРѕРІР»СЏРµРј С‚РµРєСЃС‚
    const summaryEl = document.getElementById('activityMiniSummary');
    if (summaryEl) {
      summaryEl.textContent = `${totalSessions} Р°РєС‚РёРІРЅРѕСЃС‚РµР№ В· ${totalCalories} РєРєР°Р»`;
    }
    
    // РћР±РЅРѕРІР»СЏРµРј РјРёРЅРё-РїРѕР»РѕСЃРєРё
    const maxCalories = Math.max(totalCalories, 1); // РёР·Р±РµРіР°РµРј РґРµР»РµРЅРёСЏ РЅР° 0
    
    const stripGym = document.getElementById('miniStripGym');
    const stripCardio = document.getElementById('miniStripCardio');
    const stripHome = document.getElementById('miniStripHome');
    const stripSteps = document.getElementById('miniStripSteps');
    
    if (stripGym) stripGym.style.width = (totals.gym.calories / maxCalories * 60) + 'px';
    if (stripCardio) stripCardio.style.width = (totals.cardio.calories / maxCalories * 60) + 'px';
    if (stripHome) stripHome.style.width = (totals.home.calories / maxCalories * 60) + 'px';
    if (stripSteps) stripSteps.style.width = (totals.steps.calories / maxCalories * 60) + 'px';
  }
  
  // РњРёРЅРё-СЃС‚СЂРѕРєР° РІ С€Р°РїРєРµ "РџРѕРґРґРµСЂР¶РєР° С‚РµР»Р°"
  function fitnessUpdateSupportMiniSummary() {
    const dateKey = fitnessGetDateKey();
    const dayData = FS.getDayData(dateKey);
    const profile = FS.getFitnessProfile();
    
    // Р•РґР°
    const foods = dayData.foods || [];
    const totalEaten = foods.reduce((sum, f) => sum + (f.calories || 0), 0);
    
    // Р’РѕРґР°
    const waterData = FS.getWaterData(dateKey);
    const waterCurrent = (waterData.currentMl || 0) / 1000;
    const waterTarget = (waterData.targetMl || profile.waterBaselineMl || 2000) / 1000;
    
    // Р‘РђР”С‹
    const supplements = FS.getAllSupplements();
    let suppTaken = 0;
    let suppPlanned = 0;
    
    supplements.forEach(supp => {
      if (supp.daily && FS.isDateInDailyInterval(supp, dateKey)) {
        suppPlanned++;
        const intakes = FS.getSupplementIntakesForDay(supp.id, dateKey);
        const checkedCount = intakes.filter(i => i.checked).length;
        if (checkedCount > 0) suppTaken++;
      }
    });
    
    // РћР±РЅРѕРІР»СЏРµРј С‚РµРєСЃС‚
    const summaryEl = document.getElementById('supportMiniSummary');
    if (summaryEl) {
      const waterClass = waterCurrent >= waterTarget ? 'text-emerald-300' : 'text-white';
      const suppClass = suppTaken >= suppPlanned && suppPlanned > 0 ? 'text-emerald-300' : (suppTaken < suppPlanned ? 'text-amber-300' : 'text-white');
      
      summaryEl.innerHTML = `Р•РґР°: ${totalEaten} РєРєР°Р» В· <span class="${waterClass}">Р’РѕРґР°: ${waterCurrent.toFixed(1)} / ${waterTarget.toFixed(1)} Р»</span> В· <span class="${suppClass}">Р‘РђР”С‹: ${suppTaken} / ${suppPlanned}</span>`;
    }
  }

  // ========== WEIGHT DETAIL SCREEN ==========
  
  window.fitnessOpenWeightDetailScreen = async function() {
    let html = '<div class="space-y-4">';
    html += '<div class="flex items-center justify-between">';
    html += '<h3 class="font-semibold text-lg">Р’РµСЃ</h3>';
    html += '<button type="button" id="weightDetailClose" class="text-xs px-3 py-1 rounded-full bg-white/20">Р—Р°РєСЂС‹С‚СЊ</button>';
    html += '</div>';
    
    // Period selector
    html += '<div class="flex gap-2 text-xs">';
    html += '<button type="button" class="weight-period-btn flex-1 py-2 rounded-lg bg-white/10" data-days="7">7 РґРЅРµР№</button>';
    html += '<button type="button" class="weight-period-btn flex-1 py-2 rounded-lg bg-green-500/50" data-days="30">30 РґРЅРµР№</button>';
    html += '<button type="button" class="weight-period-btn flex-1 py-2 rounded-lg bg-white/10" data-days="90">90 РґРЅ</button>';
    html += '<button type="button" class="weight-period-btn flex-1 py-2 rounded-lg bg-white/10" data-days="365">Р’СЃС‘</button>';
    html += '</div>';
    
    // Stats section
    html += '<div class="bg-white/10 rounded-xl p-3">';
    html += '<div class="grid grid-cols-3 gap-2 text-center text-xs">';
    html += '<div><div class="opacity-70">РўРµРєСѓС‰РёР№</div><div id="weightCurrent" class="text-lg font-semibold mt-1">вЂ”</div></div>';
    html += '<div><div class="opacity-70">Р¦РµР»СЊ</div><div id="weightGoal" class="text-lg font-semibold mt-1">вЂ”</div></div>';
    html += '<div><div class="opacity-70">РўСЂРµРЅРґ</div><div id="weightTrend" class="text-lg font-semibold mt-1">вЂ”</div></div>';
    html += '</div>';
    html += '</div>';
    
    // Chart
    html += '<div id="weightDetailChart" class="h-40 bg-white/5 rounded-xl relative overflow-hidden">';
    html += '<div class="flex items-center justify-center h-full text-xs opacity-50">Р—Р°РіСЂСѓР·РєР°...</div>';
    html += '</div>';

    // Add button
    html += '<button type="button" id="weightAddBtn" class="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 font-semibold text-sm">+ Р”РѕР±Р°РІРёС‚СЊ РІРµСЃ</button>';
    
    // History list
    html += '<div class="bg-white/10 rounded-xl p-3">';
    html += '<h4 class="text-sm font-semibold mb-2">РСЃС‚РѕСЂРёСЏ</h4>';
    html += '<div id="weightHistoryList" class="space-y-2 max-h-64 overflow-y-auto">';
    html += '<div class="text-xs opacity-50 text-center py-4">Р—Р°РіСЂСѓР·РєР°...</div>';
    html += '</div>';
    html += '</div>';
    
    html += '</div>';
    
    fitnessOpenModal(html, () => {
      document.getElementById('weightDetailClose')?.addEventListener('click', fitnessCloseModal);
      document.getElementById('weightAddBtn')?.addEventListener('click', () => fitnessOpenAddWeightModal());
      
      // Period buttons
      document.querySelectorAll('.weight-period-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          document.querySelectorAll('.weight-period-btn').forEach(b => {
            b.classList.remove('bg-green-500/50');
            b.classList.add('bg-white/10');
          });
          btn.classList.remove('bg-white/10');
          btn.classList.add('bg-green-500/50');
          await loadWeightDetailData(parseInt(btn.dataset.days));
        });
      });
      
      // Load initial data (30 days)
      loadWeightDetailData(30);
    });
  };

  async function loadWeightDetailData(days) {
    if (!window.FitnessSync || !window.currentAppUserId) return;
    
    try {
      // Get chart data
      const chartData = await window.FitnessSync.getWeightChartData(days);
      const history = await window.FitnessSync.getWeightHistory(days);
      const profile = FS.getFitnessProfile();
      
      // Update stats
      const currentWeight = history.length > 0 ? history[0].value : null;
      const firstWeight = history.length > 1 ? history[history.length - 1].value : currentWeight;
      const goalWeight = profile.targetWeight;
      
      document.getElementById('weightCurrent').textContent = currentWeight ? currentWeight.toFixed(1) + ' РєРі' : 'вЂ”';
      document.getElementById('weightGoal').textContent = goalWeight ? goalWeight.toFixed(1) + ' РєРі' : 'вЂ”';
      
      if (currentWeight && firstWeight) {
        const totalDiff = currentWeight - firstWeight;
        const trendText = totalDiff < -0.1 ? 'в†“ ' + Math.abs(totalDiff).toFixed(1) + ' РєРі' : 
                         totalDiff > 0.1 ? 'в†‘ +' + totalDiff.toFixed(1) + ' РєРі' : 'в†’ 0.0 РєРі';
        const trendEl = document.getElementById('weightTrend');
        trendEl.textContent = trendText;
        trendEl.className = 'text-lg font-semibold mt-1 ' + 
          (totalDiff < -0.1 ? 'text-green-400' : totalDiff > 0.1 ? 'text-red-400' : 'text-white');
      } else {
        document.getElementById('weightTrend').textContent = 'вЂ”';
      }
  
      // Render chart
      const chartContainer = document.getElementById('weightDetailChart');
      if (chartData.length === 0) {
        chartContainer.innerHTML = '<div class="flex items-center justify-center h-full text-xs opacity-50">РќРµС‚ РґР°РЅРЅС‹С…</div>';
      } else {
        const points = FS.generateWeightChartPoints(chartData, 100, 40, 4);
        chartContainer.innerHTML = `
          <svg viewBox="0 0 100 40" class="w-full h-full">
            <polyline
              fill="none"
              stroke="#4ade80"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              points="${points}"
            />
          </svg>
        `;
      }
  
      // Render history list
      const listContainer = document.getElementById('weightHistoryList');
      if (history.length === 0) {
        listContainer.innerHTML = '<div class="text-xs opacity-50 text-center py-4">РќРµС‚ Р·Р°РїРёСЃРµР№</div>';
      } else {
        listContainer.innerHTML = history.slice(0, 50).map(item => {
          const date = new Date(item.measured_at);
          const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
          const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
          return `
            <div class="flex items-center justify-between py-2 border-b border-white/10 last:border-0 cursor-pointer hover:bg-white/5 rounded px-2" onclick="fitnessOpenEditWeightModal('${item.id}', ${item.value}, '${item.measured_at}')">
              <div class="flex items-center gap-3">
                <span class="text-xs opacity-70">${dateStr}</span>
                <span class="text-xs opacity-50">${timeStr}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-medium">${item.value.toFixed(1)} РєРі</span>
                <span class="text-xs opacity-50">вњЏ</span>
              </div>
            </div>
          `;
        }).join('');
      }
    } catch (e) {
      console.error('Error loading weight detail data:', e);
    }
  }
  
  function fitnessSyncProfileWeight(weightValue) {
    if (!Number.isFinite(weightValue) || weightValue <= 0) return;
    const profile = FS.getFitnessProfile();
    profile.weight = weightValue;
    FS.setFitnessProfile(profile);
  }

  window.fitnessOpenAddWeightModal = function() {
    const now = new Date();
    const today = FS.formatDateKey(now);
    const currentTime = FS.formatTimeHM(now);
    const profile = FS.getFitnessProfile();
    
    let html = '<h3 class="font-semibold mb-4">Р”РѕР±Р°РІРёС‚СЊ РІРµСЃ</h3>';
    html += '<div class="space-y-3">';
    html += '<label class="block text-sm">Р’РµСЃ (РєРі)</label>';
    html += '<input type="number" step="0.1" id="addWeightValue" class="w-full p-3 bg-white/30 rounded-xl text-white" placeholder="78.5" value="' + (profile.weight || '') + '">';
    html += '<label class="block text-sm">Р”Р°С‚Р°</label>';
    html += '<input type="date" id="addWeightDate" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + today + '">';
    html += '<label class="block text-sm">Р’СЂРµРјСЏ</label>';
    html += '<input type="time" id="addWeightTime" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + currentTime + '">';
    html += '</div>';
    html += '<div class="flex gap-3 mt-4">';
    html += '<button type="button" id="addWeightCancel" class="flex-1 py-3 rounded-xl bg-white/20">РћС‚РјРµРЅР°</button>';
    html += '<button type="button" id="addWeightSave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">РЎРѕС…СЂР°РЅРёС‚СЊ</button>';
    html += '</div>';
    
    fitnessOpenModal(html, () => {
      document.getElementById('addWeightCancel')?.addEventListener('click', fitnessCloseModal);
      document.getElementById('addWeightSave')?.addEventListener('click', async () => {
        const weight = parseFloat(document.getElementById('addWeightValue')?.value);
        const date = document.getElementById('addWeightDate')?.value;
        const time = document.getElementById('addWeightTime')?.value;
        
        if (!weight || weight <= 0) {
          alert('Р’РІРµРґРёС‚Рµ РєРѕСЂСЂРµРєС‚РЅС‹Р№ РІРµСЃ');
          return;
        }
        
        if (!window.FitnessSync || !window.currentAppUserId) {
          alert('РќРµС‚ СЃРІСЏР·Рё СЃ СЃРµСЂРІРµСЂРѕРј');
          return;
        }
        
        try {
          await window.FitnessSync.saveWeightMeasurement(date, weight, time);
          fitnessSyncProfileWeight(weight);
          
          // Clear chart cache
          weightChartDataCache = null;
          
          fitnessCloseModal();
          fitnessRenderDashboard();
          
          // Reopen detail screen with fresh data
          setTimeout(() => window.fitnessOpenWeightDetailScreen(), 100);
        } catch (e) {
          console.error('Error saving weight:', e);
          alert('РћС€РёР±РєР° СЃРѕС…СЂР°РЅРµРЅРёСЏ');
        }
      });
    });
  };
  
  window.fitnessOpenEditWeightModal = function(measurementId, currentWeight, measuredAt) {
    const date = new Date(measuredAt);
    const dateKey = FS.formatDateKey(date);
    const timeStr = date.toTimeString().slice(0, 5);
    
    let html = '<h3 class="font-semibold mb-4">РР·РјРµРЅРёС‚СЊ РёР·РјРµСЂРµРЅРёРµ</h3>';
    html += '<div class="space-y-3">';
    html += '<label class="block text-sm">Р’РµСЃ (РєРі)</label>';
    html += '<input type="number" step="0.1" id="editWeightValue" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + currentWeight + '">';
    html += '<label class="block text-sm">Р”Р°С‚Р°</label>';
    html += '<input type="date" id="editWeightDate" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + dateKey + '">';
    html += '<label class="block text-sm">Р’СЂРµРјСЏ</label>';
    html += '<input type="time" id="editWeightTime" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + timeStr + '">';
    html += '</div>';
    html += '<div class="flex gap-3 mt-4">';
    html += '<button type="button" id="editWeightDelete" class="flex-1 py-3 rounded-xl bg-red-500/30 text-red-300">РЈРґР°Р»РёС‚СЊ</button>';
    html += '<button type="button" id="editWeightCancel" class="flex-1 py-3 rounded-xl bg-white/20">РћС‚РјРµРЅР°</button>';
    html += '<button type="button" id="editWeightSave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">РЎРѕС…СЂР°РЅРёС‚СЊ</button>';
    html += '</div>';
    
    fitnessOpenModal(html, () => {
      document.getElementById('editWeightCancel')?.addEventListener('click', fitnessCloseModal);
      document.getElementById('editWeightDelete')?.addEventListener('click', async () => {
        if (!confirm('РЈРґР°Р»РёС‚СЊ СЌС‚Рѕ РёР·РјРµСЂРµРЅРёРµ?')) return;
        
        try {
          await window.FitnessSync.deleteWeightMeasurement(measurementId);
          weightChartDataCache = null;
          
          fitnessCloseModal();
          fitnessRenderDashboard();
          setTimeout(() => window.fitnessOpenWeightDetailScreen(), 100);
        } catch (e) {
          alert('РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ');
        }
      });
      document.getElementById('editWeightSave')?.addEventListener('click', async () => {
        const weight = parseFloat(document.getElementById('editWeightValue')?.value);
        const date = document.getElementById('editWeightDate')?.value;
        const time = document.getElementById('editWeightTime')?.value;
        
        if (!weight || weight <= 0) {
          alert('Р’РІРµРґРёС‚Рµ РєРѕСЂСЂРµРєС‚РЅС‹Р№ РІРµСЃ');
          return;
        }
        
        try {
          await window.FitnessSync.updateWeightMeasurement(measurementId, weight, date, time);
          fitnessSyncProfileWeight(weight);
          weightChartDataCache = null;
          
          fitnessCloseModal();
          fitnessRenderDashboard();
          setTimeout(() => window.fitnessOpenWeightDetailScreen(), 100);
        } catch (e) {
          alert('РћС€РёР±РєР° СЃРѕС…СЂР°РЅРµРЅРёСЏ');
        }
      });
    });
  };
  

  function fitnessCloseModal() {
    if (fitnessEl.modalOverlay) fitnessEl.modalOverlay.classList.add('hidden');
  }

  function fitnessOpenModal(html, onMount) {
    if (!fitnessEl.modalContent || !fitnessEl.modalOverlay) return;
    fitnessEl.modalContent.innerHTML = html;
    fitnessEl.modalOverlay.classList.remove('hidden');
    if (onMount) onMount();
  }

  function fitnessReadActivityForm(kind) {
    const g = (id) => document.getElementById(id)?.value;
    if (kind === 'gym') return { durationMinutes: g('fmGymMinutes'), intensity: g('fmGymIntensity') };
    if (kind === 'cardio') return { durationMinutes: g('fmCardioMinutes'), type: g('fmCardioType') };
    return { steps: g('fmSteps') };
  }

  // ========== NEW ACTIVITY SYSTEM ==========
  
  // Open specialized modal based on activity kind
  function fitnessOpenActivityModal(editId, forceKind) {
    const dayData = FS.getDayData(fitnessGetDateKey());
    const existing = editId ? (dayData.activities || []).find((a) => a.id === editId) : null;
    const kind = forceKind || existing?.kind || 'gym';
    
    // For 'gym' kind, check if we should open GYM screen or simple form
    if (kind === 'gym' || kind === 'strength') {
      if (!editId) {
        // New gym activity - offer choice between GYM module or simple form
        fitnessOpenGymChoiceModal(editId);
      } else {
        // Edit existing - use simple form
        fitnessOpenGymActivityModal(editId, existing);
      }
    } else if (kind === 'cardio_indoor' || (kind === 'cardio' && !existing?.isOutdoor)) {
      fitnessOpenCardioModal(editId, existing, false);
    } else if (kind === 'cardio_outdoor' || (kind === 'cardio' && existing?.isOutdoor)) {
      fitnessOpenCardioModal(editId, existing, true);
    } else if (kind === 'home' || kind === 'home_exercise') {
      fitnessOpenHomeModal(editId, existing);
    } else if (kind === 'steps') {
      fitnessOpenStepsModal(editId, existing);
    } else {
      // Fallback to old modal
      fitnessOpenLegacyActivityModal(editId, forceKind);
    }
  }
  
  // Choice modal for gym: use GYM module or simple form
  function fitnessOpenGymChoiceModal(editId) {
    let html = '<h3 class="font-semibold mb-4">Р”РѕР±Р°РІРёС‚СЊ СЃРёР»РѕРІСѓСЋ С‚СЂРµРЅРёСЂРѕРІРєСѓ</h3>';
    html += '<div class="space-y-3">';
    html += '<button type="button" id="gymChoiceModule" class="w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-semibold">рџЏ‹пёЏ РћС‚РєСЂС‹С‚СЊ GYM (РїР»Р°РЅ С‚СЂРµРЅРёСЂРѕРІРѕРє)</button>';
    html += '<button type="button" id="gymChoiceSimple" class="w-full py-4 rounded-xl bg-white/15 hover:bg-white/25">вЏ±пёЏ Р‘С‹СЃС‚СЂР°СЏ Р·Р°РїРёСЃСЊ (С‚РѕР»СЊРєРѕ РІСЂРµРјСЏ)</button>';
    html += '</div>';
    html += '<div class="mt-4"><button type="button" id="gymChoiceCancel" class="w-full py-3 rounded-xl bg-white/10">РћС‚РјРµРЅР°</button></div>';
    
    fitnessOpenModal(html, () => {
      fitnessEl.modalOverlay.querySelector('#gymChoiceCancel')?.addEventListener('click', fitnessCloseModal);
      fitnessEl.modalOverlay.querySelector('#gymChoiceModule')?.addEventListener('click', () => {
        fitnessCloseModal();
        gymOpenPeriodsScreen();
      });
      fitnessEl.modalOverlay.querySelector('#gymChoiceSimple')?.addEventListener('click', () => {
        fitnessCloseModal();
        fitnessOpenGymActivityModal(editId, null);
      });
    });
  }
  
  // Simple gym activity modal
  function fitnessOpenGymActivityModal(editId, existing) {
    const modal = document.getElementById('gymActivityModalOverlay');
    if (!modal) {
      // Fallback to legacy if modal not found
      fitnessOpenLegacyActivityModal(editId, 'gym');
      return;
    }

    document.getElementById('gymActivityEditId').value = editId || '';
    document.getElementById('gymActivityDuration').value = existing?.durationMinutes || 45;
    document.getElementById('gymActivityIntensity').value = existing?.intensity || 'moderate';
    
    // Calculate initial calories
    fitnessUpdateGymCaloriesPreview();
    
    modal.classList.remove('hidden');
  }

  // Cardio modal (indoor/outdoor)
  function fitnessOpenCardioModal(editId, existing, isOutdoor) {
    const modal = document.getElementById('cardioModalOverlay');
    if (!modal) {
      fitnessOpenLegacyActivityModal(editId, isOutdoor ? 'cardio' : 'cardio');
      return;
    }

    const title = document.getElementById('cardioModalTitle');
    const typeSelect = document.getElementById('cardioTypeSelect');
    
    title.textContent = isOutdoor ? 'РђСЌСЂРѕР±РЅР°СЏ РЅР° СѓР»РёС†Рµ' : 'РљР°СЂРґРёРѕ РІ Р·Р°Р»Рµ';
    document.getElementById('cardioEditId').value = editId || '';
    document.getElementById('cardioIsOutdoor').value = isOutdoor ? 'true' : 'false';
    document.getElementById('cardioDuration').value = existing?.durationMinutes || 30;
    document.getElementById('cardioDistance').value = existing?.distanceKm || '';
    
    // Fill type options
    if (window.ActivityCalories) {
      const types = window.ActivityCalories.getCardioTypes(isOutdoor);
      typeSelect.innerHTML = types.map(t => 
        `<option value="${t.key}" ${existing?.cardioType === t.key ? 'selected' : ''}>${t.label} (MET: ${t.met})</option>`
      ).join('');
    }
    
    fitnessUpdateCardioCaloriesPreview();
    modal.classList.remove('hidden');
  }
  
  // Home exercise modal
  function fitnessOpenHomeModal(editId, existing) {
    const modal = document.getElementById('homeModalOverlay');
    if (!modal) {
      fitnessOpenLegacyActivityModal(editId, 'home');
      return;
    }
  
    document.getElementById('homeEditId').value = editId || '';
    document.getElementById('homeDuration').value = existing?.durationMinutes || 15;
    document.getElementById('homeRepetitions').value = existing?.repetitions || 20;
    
    // Fill exercise options
    if (window.ActivityCalories) {
      const types = window.ActivityCalories.getHomeExerciseTypes();
      const select = document.getElementById('homeExerciseTypeSelect');
      select.innerHTML = types.map(t => 
        `<option value="${t.key}" ${existing?.exerciseType === t.key ? 'selected' : ''}>${t.label}</option>`
      ).join('');
      
      // Handle input type toggle
      select.onchange = () => {
        const selected = types.find(t => t.key === select.value);
        const useReps = document.getElementById('homeUseReps');
        const durationField = document.getElementById('homeDurationField');
        const repsField = document.getElementById('homeRepsField');
        
        if (selected?.inputType === 'time') {
          useReps.checked = false;
          useReps.disabled = true;
          durationField.classList.remove('hidden');
          repsField.classList.add('hidden');
        } else if (selected?.inputType === 'reps') {
          useReps.checked = true;
          useReps.disabled = true;
          durationField.classList.add('hidden');
          repsField.classList.remove('hidden');
        } else {
          useReps.disabled = false;
        }
        fitnessUpdateHomeCaloriesPreview();
      };
      select.onchange();
    }
  
    fitnessUpdateHomeCaloriesPreview();
    modal.classList.remove('hidden');
  }
  
  // Steps modal
  function fitnessOpenStepsModal(editId, existing) {
    const modal = document.getElementById('stepsModalOverlay');
    if (!modal) {
      fitnessOpenLegacyActivityModal(editId, 'steps');
      return;
    }
    
    document.getElementById('stepsEditId').value = editId || '';
    document.getElementById('stepsCount').value = existing?.steps || 5000;
    document.getElementById('stepsIntensity').value = existing?.intensity || 'normal';
    
    fitnessUpdateStepsCaloriesPreview();
    modal.classList.remove('hidden');
  }
  
  // Legacy modal for fallback
  function fitnessOpenLegacyActivityModal(editId, forceKind) {
    const dayData = FS.getDayData(fitnessGetDateKey());
    const existing = editId ? (dayData.activities || []).find((a) => a.id === editId) : null;
    const kind = forceKind || existing?.kind || 'gym';
    let html = '<h3 class="font-semibold mb-4">Р”РѕР±Р°РІРёС‚СЊ Р°РєС‚РёРІРЅРѕСЃС‚СЊ</h3>';
    html += '<input type="hidden" id="fmActivityKind" value="' + kind + '">';
    html += '<input type="hidden" id="fmActivityEditId" value="' + (editId || '') + '">';
    if (kind === 'gym') {
      html += '<div class="space-y-3"><label class="block">РњРёРЅСѓС‚С‹</label><input type="number" id="fmGymMinutes" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.durationMinutes ?? '') + '">';
      html += '<label class="block">РРЅС‚РµРЅСЃРёРІРЅРѕСЃС‚СЊ</label><select id="fmGymIntensity" class="w-full p-3 bg-white/30 rounded-xl text-white">';
      ['low','medium','high'].forEach((v) => { html += '<option value="' + v + '"' + (existing?.intensity === v ? ' selected' : '') + '>' + (v === 'low' ? 'РќРёР·РєР°СЏ' : v === 'medium' ? 'РЎСЂРµРґРЅСЏСЏ' : 'Р’С‹СЃРѕРєР°СЏ') + '</option>'; });
      html += '</select></div>';
    } else if (kind === 'cardio') {
      html += '<div class="space-y-3"><label class="block">РњРёРЅСѓС‚С‹</label><input type="number" id="fmCardioMinutes" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.durationMinutes ?? '') + '">';
      html += '<label class="block">РўРёРї</label><select id="fmCardioType" class="w-full p-3 bg-white/30 rounded-xl text-white">';
      ['run','walk','bike','other'].forEach((v) => { html += '<option value="' + v + '"' + (existing?.type === v ? ' selected' : '') + '>' + (v === 'run' ? 'Р‘РµРі' : v === 'walk' ? 'РҐРѕРґСЊР±Р°' : v === 'bike' ? 'Р’РµР»РѕСЃРёРїРµРґ' : 'Р”СЂСѓРіРѕРµ') + '</option>'; });
      html += '</select></div>';
    } else {
      html += '<div class="space-y-3"><label class="block">РЁР°РіРё</label><input type="number" id="fmSteps" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.steps ?? '') + '"></div>';
    }
    html += '<div class="flex gap-3 mt-4"><button type="button" id="fmActivityCancel" class="flex-1 py-3 rounded-xl bg-white/20">РћС‚РјРµРЅР°</button><button type="button" id="fmActivitySave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">РЎРѕС…СЂР°РЅРёС‚СЊ</button></div>';
    fitnessOpenModal(html, () => {
      fitnessEl.modalOverlay.querySelector('#fmActivityCancel')?.addEventListener('click', fitnessCloseModal);
      fitnessEl.modalOverlay.querySelector('#fmActivitySave')?.addEventListener('click', () => {
        const k = fitnessGetDateKey();
        const dayData = FS.getDayData(k);
        const formKind = document.getElementById('fmActivityKind')?.value || 'gym';
        const formValues = fitnessReadActivityForm(formKind);
        const entry = FS.buildActivityEntry(formKind, formValues, editId);
        const next = FS.mergeActivity(dayData.activities, entry, editId);
        FS.updateDayData(k, { activities: next });
        fitnessCloseModal();
        fitnessRenderActivityList();
        fitnessRenderCalories();
      });
    });
  }
  
  // Preview calculators
  function fitnessUpdateGymCaloriesPreview() {
    if (!window.ActivityCalories) return;
    const duration = parseInt(document.getElementById('gymActivityDuration')?.value) || 45;
    const intensity = document.getElementById('gymActivityIntensity')?.value || 'moderate';
    const calories = window.ActivityCalories.calculateSimpleStrengthCalories(duration, intensity);
    document.getElementById('gymActivityCaloriesEstimate').textContent = calories;
  }
  
  function fitnessUpdateCardioCaloriesPreview() {
    if (!window.ActivityCalories) return;
    const type = document.getElementById('cardioTypeSelect')?.value || 'WALKING_TREADMILL';
    const duration = parseInt(document.getElementById('cardioDuration')?.value) || 30;
    const distance = parseFloat(document.getElementById('cardioDistance')?.value) || null;
    const isOutdoor = document.getElementById('cardioIsOutdoor')?.value === 'true';
    const result = window.ActivityCalories.calculateCardioCalories({ type, durationMinutes: duration, distanceKm: distance, isOutdoor });
    document.getElementById('cardioCaloriesEstimate').textContent = result.calories;
  }
  
  function fitnessUpdateHomeCaloriesPreview() {
    if (!window.ActivityCalories) return;
    const type = document.getElementById('homeExerciseTypeSelect')?.value || 'PUSHUPS_MODERATE';
    const duration = parseInt(document.getElementById('homeDuration')?.value) || null;
    const reps = parseInt(document.getElementById('homeRepetitions')?.value) || null;
    const useReps = document.getElementById('homeUseReps')?.checked;
    
    const result = window.ActivityCalories.calculateHomeExerciseCalories({
      exerciseType: type,
      durationMinutes: useReps ? null : duration,
      repetitions: useReps ? reps : null
    });
    document.getElementById('homeCaloriesEstimate').textContent = result.calories;
  }
  
  function fitnessUpdateStepsCaloriesPreview() {
    if (!window.ActivityCalories) return;
    const steps = parseInt(document.getElementById('stepsCount')?.value) || 0;
    const intensity = document.getElementById('stepsIntensity')?.value || 'normal';
    const result = window.ActivityCalories.calculateStepsCalories(steps, intensity);
    document.getElementById('stepsCaloriesEstimate').textContent = result.calories;
  }
  
  // Activity Block Rendering with real progress bars
  function fitnessRenderActivityBlock() {
    const dateKey = fitnessGetDateKey();
    const dayData = FS.getDayData(dateKey);
    const activities = dayData.activities || [];
    
    // Calculate totals by type
    const totals = {
      gym: { duration: 0, calories: 0, count: 0 },
      cardio_indoor: { duration: 0, calories: 0, count: 0 },
      cardio_outdoor: { duration: 0, calories: 0, count: 0 },
      home: { duration: 0, calories: 0, count: 0 },
      steps: { steps: 0, calories: 0, count: 0 }
    };
    
    activities.forEach(a => {
      if (a.kind === 'gym' || a.kind === 'strength') {
        totals.gym.duration += a.durationMinutes || 0;
        totals.gym.calories += a.calories || 0;
        totals.gym.count++;
      } else if (a.kind === 'cardio_indoor') {
        totals.cardio_indoor.duration += a.durationMinutes || 0;
        totals.cardio_indoor.calories += a.calories || 0;
        totals.cardio_indoor.count++;
      } else if (a.kind === 'cardio_outdoor' || (a.kind === 'cardio' && a.isOutdoor)) {
        totals.cardio_outdoor.duration += a.durationMinutes || 0;
        totals.cardio_outdoor.calories += a.calories || 0;
        totals.cardio_outdoor.count++;
      } else if (a.kind === 'home' || a.kind === 'home_exercise') {
        totals.home.duration += a.durationMinutes || 0;
        totals.home.calories += a.calories || 0;
        totals.home.count++;
      } else if (a.kind === 'steps') {
        totals.steps.steps += a.steps || 0;
        totals.steps.calories += a.calories || 0;
        totals.steps.count++;
      }
    });
    
    // Check GYM connection
    if (window.ActivityCalories) {
      const gymWorkouts = window.ActivityCalories.getGymWorkoutsForDate(dateKey);
      if (gymWorkouts.length > 0) {
        document.getElementById('activityGymLinked')?.classList.remove('hidden');
        // Add GYM workout data to totals
        gymWorkouts.forEach(w => {
          totals.gym.duration += w.durationMinutes || 45;
          totals.gym.count++;
        });
      } else {
        document.getElementById('activityGymLinked')?.classList.add('hidden');
      }
    }
    
    // Update stats and progress bars
    const goals = window.ActivityCalories?.ACTIVITY_GOALS || {
      GYM_MINUTES: 45, CARDIO_MINUTES: 30, STEPS: 8000, HOME_MINUTES: 20
    };
    
    // Gym
    document.getElementById('activityGymStats').textContent = 
      `${totals.gym.duration} РјРёРЅ В· ${totals.gym.calories} РєРєР°Р»`;
    const gymPercent = Math.min(100, Math.round((totals.gym.duration / goals.GYM_MINUTES) * 100));
    document.getElementById('activityGymBar').style.width = `${gymPercent}%`;
    
    // Cardio Indoor
    document.getElementById('activityCardioIndoorStats').textContent = 
      `${totals.cardio_indoor.duration} РјРёРЅ В· ${totals.cardio_indoor.calories} РєРєР°Р»`;
    const cardioInPercent = Math.min(100, Math.round((totals.cardio_indoor.duration / goals.CARDIO_MINUTES) * 100));
    document.getElementById('activityCardioIndoorBar').style.width = `${cardioInPercent}%`;
    
    // Cardio Outdoor
    document.getElementById('activityCardioOutdoorStats').textContent = 
      `${totals.cardio_outdoor.duration} РјРёРЅ В· ${totals.cardio_outdoor.calories} РєРєР°Р»`;
    const cardioOutPercent = Math.min(100, Math.round((totals.cardio_outdoor.duration / goals.CARDIO_MINUTES) * 100));
    document.getElementById('activityCardioOutdoorBar').style.width = `${cardioOutPercent}%`;
    
    // Home
    document.getElementById('activityHomeStats').textContent = 
      `${totals.home.duration} РјРёРЅ В· ${totals.home.calories} РєРєР°Р»`;
    const homePercent = Math.min(100, Math.round((totals.home.duration / goals.HOME_MINUTES) * 100));
    document.getElementById('activityHomeBar').style.width = `${homePercent}%`;
    
    // Steps
    document.getElementById('activityStepsStats').textContent = 
      `${totals.steps.steps.toLocaleString()} / ${goals.STEPS.toLocaleString()} С€Р°РіРѕРІ`;
    const stepsPercent = Math.min(100, Math.round((totals.steps.steps / goals.STEPS) * 100));
    document.getElementById('activityStepsBar').style.width = `${stepsPercent}%`;
    
    // Update summary
    const totalCalories = totals.gym.calories + totals.cardio_indoor.calories + 
                         totals.cardio_outdoor.calories + totals.home.calories + totals.steps.calories;
    const totalSessions = totals.gym.count + totals.cardio_indoor.count + 
                         totals.cardio_outdoor.count + totals.home.count + totals.steps.count;
    
    document.getElementById('fitnessActivityBurnedTotal').textContent = totalCalories;
    document.getElementById('fitnessActivitySessions').textContent = totalSessions;
  }
  
  // Quick activity buttons
  function fitnessAddQuickActivity(kind, duration) {
    const k = fitnessGetDateKey();
    const formValues = { durationMinutes: duration };
    
    if (kind === 'cardio') {
      formValues.cardioType = 'RUNNING_TREADMILL_SLOW';
      formValues.isOutdoor = false;
    } else if (kind === 'home') {
      formValues.exerciseType = 'PUSHUPS_MODERATE';
    } else {
      formValues.intensity = 'moderate';
    }
    
    const entry = FS.buildActivityEntry(kind, formValues, null);
    const dayData = FS.getDayData(k);
    const next = FS.mergeActivity(dayData.activities, entry, null);
    FS.updateDayData(k, { activities: next });
    
    fitnessRenderActivityList();
    fitnessRenderCalories();
    fitnessRenderActivityBlock();
    
    // Open edit modal for fine-tuning
    fitnessOpenActivityModal(entry.id, entry.kind);
  }

  function fitnessOpenFoodModal(editId) {
    const dayData = FS.getDayData(fitnessGetDateKey());
    const existing = editId ? (dayData.foods || []).find((f) => f.id === editId) : null;
    const defaultTime = existing?.time || FS.formatTimeHM(new Date());
    
    // For editing, only show Manual mode with pre-filled values
    const isEditMode = !!editId;
    
    let html = '<h3 class="font-semibold mb-4">' + (isEditMode ? 'Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ РїСЂРёС‘Рј РїРёС‰Рё' : 'Р”РѕР±Р°РІРёС‚СЊ РїСЂРёС‘Рј РїРёС‰Рё') + '</h3>';
    
    // Mode toggle (only for new entries)
    if (!isEditMode) {
      html += '<div class="flex gap-2 mb-4">';
      html += '<button type="button" id="fmModeManual" class="flex-1 py-2 px-3 rounded-lg bg-green-500/50 text-sm font-medium">Р СѓС‡РЅРѕР№ РІРІРѕРґ</button>';
      html += '<button type="button" id="fmModeAuto" class="flex-1 py-2 px-3 rounded-lg bg-white/10 text-sm font-medium opacity-70">РђРІС‚Рѕ (С‚РµРєСЃС‚)</button>';
      html += '</div>';
    }
    
    // Manual mode content
    html += '<div id="fmManualContent" class="space-y-3">';
    html += '<label class="block text-sm">РќР°Р·РІР°РЅРёРµ</label><input type="text" id="fmFoodName" class="w-full p-3 bg-white/30 rounded-xl text-white placeholder-white/70" value="' + (existing?.name ?? '') + '" placeholder="Р§С‚Рѕ СЃСЉРµР»Рё">';
    html += '<label class="block text-sm">РљРѕР»РёС‡РµСЃС‚РІРѕ</label><input type="text" id="fmFoodAmount" class="w-full p-3 bg-white/30 rounded-xl text-white placeholder-white/70" value="' + (existing?.amount ?? '') + '" placeholder="200 Рі, 1 РїРѕСЂС†РёСЏ">';
    html += '<label class="block text-sm">РљР°Р»РѕСЂРёРё (РѕРїС†РёРѕРЅР°Р»СЊРЅРѕ)</label><input type="number" id="fmFoodCalories" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.calories ?? '') + '">';
    html += '<div class="flex gap-2">';
    html += '<div class="flex-1"><label class="block text-sm">Р‘ (РѕРїС†.)</label><input type="number" id="fmFoodProtein" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.protein ?? '') + '" placeholder="0"></div>';
    html += '<div class="flex-1"><label class="block text-sm">Р– (РѕРїС†.)</label><input type="number" id="fmFoodFat" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.fat ?? '') + '" placeholder="0"></div>';
    html += '<div class="flex-1"><label class="block text-sm">РЈ (РѕРїС†.)</label><input type="number" id="fmFoodCarbs" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.carbs ?? '') + '" placeholder="0"></div>';
    html += '</div>';
    html += '<label class="block text-sm">Р’СЂРµРјСЏ (РїСЂРёРјРµСЂРЅРѕ)</label><input type="time" id="fmFoodTime" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + defaultTime + '">';
    html += '</div>';
    
    // Auto mode content (hidden by default, only for new entries)
    if (!isEditMode) {
      html += '<div id="fmAutoContent" class="space-y-3 hidden">';
      html += '<label class="block text-sm">РўРµРєСЃС‚ (Р»СѓС‡С€Рµ РїРѕвЂ‘Р°РЅРіР»РёР№СЃРєРё)</label><input type="text" id="fmFoodQuery" class="w-full p-3 bg-white/30 rounded-xl text-white placeholder-white/70" placeholder="buckwheat 200 g РёР»Рё РіСЂРµС‡РєР° 200 Рі">';
      html += '<p class="text-xs opacity-70">РђРІС‚РѕвЂ‘СЂРµР¶РёРј СЃС‡РёС‚Р°РµС‚ РєР°Р»РѕСЂРёРё Рё Р‘Р–РЈ РїРѕ С‚РµРєСЃС‚Сѓ. Р›СѓС‡С€Рµ РІРІРѕРґРёС‚СЊ РЅР° Р°РЅРіР»РёР№СЃРєРѕРј (buckwheat 200 g). Р СѓСЃСЃРєРёР№ С‚РѕР¶Рµ СЂР°Р±РѕС‚Р°РµС‚: РіСЂРµС‡РєР° 200 Рі, С‚РІРѕСЂРѕРі 150 Рі.</p>';
      html += '<label class="block text-sm">Р’СЂРµРјСЏ (РїСЂРёРјРµСЂРЅРѕ)</label><input type="time" id="fmFoodTimeAuto" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + defaultTime + '">';
      html += '<div id="fmAutoError" class="text-red-300 text-sm hidden"></div>';
      html += '</div>';
    }
    
    html += '<div class="flex gap-3 mt-4"><button type="button" id="fmFoodCancel" class="flex-1 py-3 rounded-xl bg-white/20">РћС‚РјРµРЅР°</button><button type="button" id="fmFoodSave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">' + (isEditMode ? 'РЎРѕС…СЂР°РЅРёС‚СЊ' : 'Р”РѕР±Р°РІРёС‚СЊ') + '</button></div>';
    
    fitnessOpenModal(html, () => {
      // Mode toggle handlers (only for new entries)
      if (!isEditMode) {
        const modeManual = fitnessEl.modalOverlay.querySelector('#fmModeManual');
        const modeAuto = fitnessEl.modalOverlay.querySelector('#fmModeAuto');
        const manualContent = fitnessEl.modalOverlay.querySelector('#fmManualContent');
        const autoContent = fitnessEl.modalOverlay.querySelector('#fmAutoContent');
        
        modeManual?.addEventListener('click', () => {
          modeManual.classList.add('bg-green-500/50');
          modeManual.classList.remove('bg-white/10', 'opacity-70');
          modeAuto.classList.remove('bg-green-500/50');
          modeAuto.classList.add('bg-white/10', 'opacity-70');
          manualContent?.classList.remove('hidden');
          autoContent?.classList.add('hidden');
        });
        
        modeAuto?.addEventListener('click', () => {
          modeAuto.classList.add('bg-green-500/50');
          modeAuto.classList.remove('bg-white/10', 'opacity-70');
          modeManual.classList.remove('bg-green-500/50');
          modeManual.classList.add('bg-white/10', 'opacity-70');
          autoContent?.classList.remove('hidden');
          manualContent?.classList.add('hidden');
        });
      }
      
      // Cancel button
      fitnessEl.modalOverlay.querySelector('#fmFoodCancel')?.addEventListener('click', fitnessCloseModal);
      
      // Save button - handles both Manual and Auto modes
      fitnessEl.modalOverlay.querySelector('#fmFoodSave')?.addEventListener('click', async () => {
        const k = fitnessGetDateKey();
        const dayData = FS.getDayData(k);
        
        // Determine which mode is active (for new entries)
        let isAutoMode = false;
        if (!isEditMode) {
          const autoContent = fitnessEl.modalOverlay.querySelector('#fmAutoContent');
          isAutoMode = !autoContent?.classList.contains('hidden');
        }
        
        if (isAutoMode) {
          // Auto mode: fetch nutrition data
          const queryText = document.getElementById('fmFoodQuery')?.value?.trim();
          const time = document.getElementById('fmFoodTimeAuto')?.value;
          const saveBtn = fitnessEl.modalOverlay.querySelector('#fmFoodSave');
          const errorEl = fitnessEl.modalOverlay.querySelector('#fmAutoError');
          
          if (!queryText) {
            if (errorEl) {
              errorEl.textContent = 'Р’РІРµРґРёС‚Рµ С‚РµРєСЃС‚ (РЅР°РїСЂРёРјРµСЂ: buckwheat 200 g)';
              errorEl.classList.remove('hidden');
            }
            return;
          }
          
          // Show loading state
          if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'РЎС‡РёС‚Р°РµРј...';
          }
          if (errorEl) {
            errorEl.classList.add('hidden');
          }
          
          try {
            const res = await fetch('/api/nutrition?query=' + encodeURIComponent(queryText));
            const data = await res.json();
            
            if (res.ok && data.kcal) {
              // Build entry from API response
              const entry = FS.buildFoodEntry({
                name: queryText,
                amount: null,
                calories: data.kcal,
                protein: data.b,
                fat: data.zh,
                carbs: data.u,
                time: time,
                source: 'auto',
              }, editId);
              
              const next = FS.mergeFood(dayData.foods, entry, editId);
              FS.updateDayData(k, { foods: next });
              fitnessCloseModal();
              fitnessRenderFoodList();
              fitnessRenderCalories();
            } else {
              // Show error
              if (errorEl) {
                errorEl.textContent = 'РќРµ СѓРґР°Р»РѕСЃСЊ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё РїРѕСЃС‡РёС‚Р°С‚СЊ. РџРѕРїСЂРѕР±СѓР№С‚Рµ РІРІРµСЃС‚Рё РїРѕвЂ‘Р°РЅРіР»РёР№СЃРєРё (buckwheat 200 g) РёР»Рё РёСЃРїРѕР»СЊР·СѓР№С‚Рµ СЂСѓС‡РЅРѕР№ РІРІРѕРґ.';
                errorEl.classList.remove('hidden');
              }
              if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Р”РѕР±Р°РІРёС‚СЊ';
              }
            }
          } catch (err) {
            console.error('Auto mode error:', err);
            if (errorEl) {
              errorEl.textContent = 'РћС€РёР±РєР° СЃРѕРµРґРёРЅРµРЅРёСЏ. РџРѕРїСЂРѕР±СѓР№С‚Рµ РµС‰С‘ СЂР°Р· РёР»Рё РёСЃРїРѕР»СЊР·СѓР№С‚Рµ СЂСѓС‡РЅРѕР№ РІРІРѕРґ.';
              errorEl.classList.remove('hidden');
            }
            if (saveBtn) {
              saveBtn.disabled = false;
              saveBtn.textContent = 'Р”РѕР±Р°РІРёС‚СЊ';
            }
          }
        } else {
          // Manual mode
          const formValues = {
            name: document.getElementById('fmFoodName')?.value,
            amount: document.getElementById('fmFoodAmount')?.value,
            calories: document.getElementById('fmFoodCalories')?.value,
            protein: document.getElementById('fmFoodProtein')?.value,
            fat: document.getElementById('fmFoodFat')?.value,
            carbs: document.getElementById('fmFoodCarbs')?.value,
            time: document.getElementById('fmFoodTime')?.value,
            source: 'manual',
          };
    
          const entry = FS.buildFoodEntry(formValues, editId);
          const next = FS.mergeFood(dayData.foods, entry, editId);
          FS.updateDayData(k, { foods: next });
          fitnessCloseModal();
          fitnessRenderFoodList();
          fitnessRenderCalories();
        }
      });
    });
  }

  // ===================== NEW SUPPLEMENTS TRACKING UI =====================

  // NEW: Render new supplements tracking (today's plan + intakes)
  function fitnessRenderSupplementsTracking() {
    if (!fitnessEl.supplementsTracking) return;
    
    // CRITICAL: Hard reset - clear DOM completely before rendering
    fitnessEl.supplementsTracking.innerHTML = '';

    const dateKey = fitnessGetDateKey();
    const supplements = FS.getAllSupplements();
    
    // DEBUG: Log render start
    console.log('[Supplements] render for dateKey:', dateKey, 'supplements count:', supplements.length);
    console.log('[Supplements] supplements data:', supplements.map(s => ({
      id: s.id,
      name: s.name,
      daily: s.daily,
      dailyStartDate: s.dailyStartDate,
      dailyEndDate: s.dailyEndDate,
      historyDates: s.history?.map(h => h.date) || []
    })));
    
    if (supplements.length === 0) {
      fitnessEl.supplementsTracking.innerHTML = `
        <div id="fitnessSupplementsDebug" class="text-[11px] leading-4 bg-black/25 border border-white/10 rounded-lg px-2 py-1 mb-2 hidden"></div>
        <div class="text-center py-4 opacity-70">
          <p class="text-sm mb-2">РќРµС‚ РґРѕР±Р°РІР»РµРЅРЅС‹С… Р‘РђР”РѕРІ</p>
          <button type="button" id="addFirstSupplement" class="text-green-400 text-sm hover:underline">+ Р”РѕР±Р°РІРёС‚СЊ РїРµСЂРІС‹Р№ Р‘РђР”</button>
        </div>
      `;
      fitnessBindSupplementsTrackingHandlers();
      return;
    }
  
    let html = '<div id="fitnessSupplementsDebug" class="text-[11px] leading-4 bg-black/25 border border-white/10 rounded-lg px-2 py-1 mb-2 hidden"></div>';
    
    let visibleCount = 0;

    for (const supp of supplements) {
      const intakes = FS.getSupplementIntakesForDay(supp.id, dateKey);
      const totalDose = FS.getTotalDoseForDay(intakes);
      const unitLabel = supp.unit === 'С‚Р°Р±Р»' ? 'С‚Р°Р±Р»' : supp.unit;
      
      // CRITICAL FIX: Filter supplements based on daily flag and date interval
      const isPast = FS.isPastDate(dateKey);
      const isToday = FS.isToday(dateKey);

      // Check if supplement should be shown for this date
      let shouldShow = false;

      if (supp.daily) {
        // Daily supplements: check if date is within interval
        const inInterval = FS.isDateInDailyInterval(supp, dateKey);
        if (inInterval) {
          // Within interval: show (plan will be generated if needed)
          shouldShow = true;
        } else {
          // Outside interval: only show if there are actual intakes (manual entries)
          shouldShow = intakes.length > 0;
        }
      } else {
        // Non-daily supplements: only show if there are intakes for this specific date
        shouldShow = intakes.length > 0;
      }

      // DEBUG: Log render decision
      console.log('[Supplements] checking:', supp.name,
        'daily:', supp.daily,
        'dailyStartDate:', supp.dailyStartDate,
        'dailyEndDate:', supp.dailyEndDate,
        'inInterval:', supp.daily ? FS.isDateInDailyInterval(supp, dateKey) : 'N/A',
        'intakes.length:', intakes.length,
        'shouldShow:', shouldShow
      );
  
      if (!shouldShow) {
        continue; // Skip this supplement for this date
      }

      visibleCount++;
      console.log('[Supplements] WILL RENDER card for:', supp.name, 'dateKey:', dateKey, 'intakes:', intakes);

      html += '<div class="bg-white/5 rounded-xl p-3 mb-3">';
      html += '<div class="flex items-center justify-between mb-2">';
      html += '<h4 class="font-semibold text-sm">' + supp.name + '</h4>';
      html += '<div class="flex gap-1">';
      html += '<button type="button" class="supp-edit-norm text-xs opacity-70" data-id="' + supp.id + '">РЅРѕСЂРјР°</button>';
      html += '<button type="button" class="supp-history text-xs opacity-70" data-id="' + supp.id + '">РёСЃС‚РѕСЂРёСЏ</button>';
      // NEW: Button to remove supplement from this specific day
      html += '<button type="button" class="supp-remove-from-day text-xs opacity-70 text-red-300" data-id="' + supp.id + '" title="РЈР±СЂР°С‚СЊ РёР· СЌС‚РѕРіРѕ РґРЅСЏ">Г—</button>';
      html += '</div></div>';
      
      html += '<p class="text-xs opacity-70 mb-2">' + supp.standardDailyDose + ' ' + unitLabel + '/РґРµРЅСЊ' + (supp.daily ? ' (РµР¶РµРґРЅРµРІРЅРѕ)' : '') + '</p>';
      
      // Show intakes
      for (const intake of intakes) {
        const doseClass = intake.edited ? 'text-yellow-300' : '';
        const checkedClass = intake.checked ? 'opacity-100' : 'opacity-50';
        
        // CRITICAL: Determine if checkbox should be disabled (future dates)
        const isFuture = FS.isFutureDate(dateKey);
        const checkboxDisabled = isFuture ? ' disabled' : '';
        const checkboxTitle = isFuture ? ' title="РќРµР»СЊР·СЏ РѕС‚РјРµС‚РёС‚СЊ РїСЂРёС‘Рј РІ Р±СѓРґСѓС‰РµРј"' : '';

        html += '<div class="flex items-center gap-2 py-1 border-b border-white/5 last:border-0">';
        // CRITICAL: Checkbox disabled for future dates - planning only, no actual taking
        html += '<input type="checkbox" class="supp-intake-check rounded' + (isFuture ? ' opacity-50 cursor-not-allowed' : '') + '" data-supp-id="' + supp.id + '" data-intake-id="' + intake.id + '"' + (intake.checked ? ' checked' : '') + checkboxDisabled + checkboxTitle + '>';

        // Show time if set (from checkbox click), otherwise show placeholder
        if (intake.time) {
          html += '<span class="text-xs opacity-70 w-12">' + intake.time + '</span>';
        } else {
          html += '<span class="text-xs opacity-30 w-12">--:--</span>';
        }
        
        html += '<span class="flex-1 text-sm ' + doseClass + '">' + intake.dose + ' ' + unitLabel + '</span>';
        
        html += '<button type="button" class="supp-edit-intake text-xs opacity-70" data-supp-id="' + supp.id + '" data-intake-id="' + intake.id + '">вњЏ</button>';
        html += '</div>';
      }

      // Total for today
      html += '<div class="text-xs mt-2 pt-2 border-t border-white/10">';
      html += 'РЎРµРіРѕРґРЅСЏ: ' + totalDose + ' ' + unitLabel + ' / ' + supp.standardDailyDose + ' ' + unitLabel;
      html += '</div>';
      
      // Add intake button
      html += '<button type="button" class="supp-add-intake w-full mt-2 py-1 text-xs bg-white/10 rounded" data-supp-id="' + supp.id + '">+ Р”РѕР±Р°РІРёС‚СЊ РїСЂРёС‘Рј</button>';
      
      html += '</div>';
    }
    
    // DEBUG: Log final count
    console.log('[Supplements] visibleCount:', visibleCount, 'dateKey:', dateKey);

    // CRITICAL: If no supplements to show for this date, display placeholder
    if (html === '' || visibleCount === 0) {
      console.log('[Supplements] showing EMPTY placeholder for dateKey:', dateKey);
      html += '<div class="text-center py-6 opacity-70">';
      html += '<p class="text-sm mb-3">РќРµС‚ Р‘РђР”РѕРІ РґР»СЏ СЌС‚РѕР№ РґР°С‚С‹</p>';
      html += '<button type="button" id="addFirstSupplement" class="text-green-400 text-sm hover:underline">+ Р”РѕР±Р°РІРёС‚СЊ Р‘РђР”</button>';
      html += '</div>';
    }
      
    // Add new supplement button
    html += '<button type="button" id="addNewSupplement" class="w-full py-2 rounded-xl bg-green-500/30 text-sm">+ Р”РѕР±Р°РІРёС‚СЊ Р‘РђР”</button>';
    
    // DEV/DEBUG: Clear history button (hidden in production, shown for debugging)
    html += '<button type="button" id="clearSupplementsHistory" class="w-full py-1 mt-2 rounded-xl bg-red-500/20 text-xs text-red-300 opacity-50 hover:opacity-100">рџ—‘ РћС‡РёСЃС‚РёС‚СЊ РІСЃСЋ РёСЃС‚РѕСЂРёСЋ Р‘РђР”РѕРІ</button>';
    // DEV/DEBUG: COMPLETE RESET button - deletes ALL supplements
    html += '<button type="button" id="resetAllSupplements" class="w-full py-1 mt-1 rounded-xl bg-red-900/40 text-xs text-red-400 opacity-50 hover:opacity-100">вљ пёЏ РЈР”РђР›РРўР¬ Р’РЎР• Р‘РђР”Р«</button>';

    fitnessEl.supplementsTracking.innerHTML = html;
    fitnessBindSupplementsTrackingHandlers();
  }

  function fitnessBindSupplementsTrackingHandlers() {
    if (!fitnessEl.supplementsTracking || fitnessEl.supplementsTracking.dataset.bound === '1') return;
    fitnessEl.supplementsTracking.dataset.bound = '1';

    const logSuppDebug = (message) => {
      let debugEl = document.getElementById('fitnessSupplementsDebug');
      if (!debugEl) {
        debugEl = document.createElement('div');
        debugEl.id = 'fitnessSupplementsDebug';
        debugEl.className = 'text-[11px] leading-4 bg-black/25 border border-white/10 rounded-lg px-2 py-1 mb-2';
        fitnessEl.supplementsTracking.prepend(debugEl);
      }
      const ts = new Date().toTimeString().slice(0, 8);
      debugEl.textContent = `[${ts}] ${message}\n` + (debugEl.textContent || '');
    };

    fitnessEl.supplementsTracking.addEventListener('click', (e) => {
      const dateKey = fitnessGetDateKey();
      const cb = e.target.closest('.supp-intake-check');

      if (cb) {
        e.preventDefault();
        const suppId = cb.dataset.suppId;
        const intakeId = cb.dataset.intakeId;

        if (!suppId || !intakeId) {
          logSuppDebug('supp: click ignored (missing ids)');
          return;
        }

        logSuppDebug('supp: click captured, date=' + dateKey);

        if (FS.isFutureDate(dateKey)) {
          logSuppDebug('supp: blocked by future-date guard');
          alert('РќРµР»СЊР·СЏ РѕС‚РјРµС‚РёС‚СЊ РїСЂРёС‘Рј Р‘РђР”Р° РІ Р±СѓРґСѓС‰РµРј РґРЅРµ. РњРѕР¶РЅРѕ С‚РѕР»СЊРєРѕ РїР»Р°РЅРёСЂРѕРІР°С‚СЊ (РјРµРЅСЏС‚СЊ РґРѕР·Сѓ/РІСЂРµРјСЏ).');
          return;
        }

        const result = FS.toggleSupplementIntakeChecked(suppId, dateKey, intakeId);
        if (result === null) {
          logSuppDebug('supp: blocked in state layer');
        } else {
          logSuppDebug('supp: toggled, checked=' + String(Boolean(result.checked)));
        }

        fitnessRenderSupplementsTracking();
        return;
      }

      if (e.target.closest('#addNewSupplement') || e.target.closest('#addFirstSupplement')) {
        fitnessOpenSupplementProfileModal();
        return;
      }

      if (e.target.closest('#clearSupplementsHistory')) {
        if (confirm('РћС‡РёСЃС‚РёС‚СЊ РІСЃСЋ РёСЃС‚РѕСЂРёСЋ Р‘РђР”РѕРІ? РЎР°РјРё Р‘РђР”С‹ РѕСЃС‚Р°РЅСѓС‚СЃСЏ.')) {
          const success = FS.clearAllSupplementsHistory();
          if (success) {
            alert('РСЃС‚РѕСЂРёСЏ Р‘РђР”РѕРІ РѕС‡РёС‰РµРЅР°.');
            fitnessRenderSupplementsTracking();
          } else {
            alert('РћС€РёР±РєР° РїСЂРё РѕС‡РёСЃС‚РєРµ РёСЃС‚РѕСЂРёРё.');
          }
        }
        return;
      }

      if (e.target.closest('#resetAllSupplements')) {
        if (confirm('РЈРґР°Р»РёС‚СЊ РІСЃРµ Р‘РђР”С‹ Рё РёС… РёСЃС‚РѕСЂРёСЋ Р±РµР·РІРѕР·РІСЂР°С‚РЅРѕ?') &&
            confirm('РџРѕРґС‚РІРµСЂРґРёС‚Рµ СѓРґР°Р»РµРЅРёРµ РІСЃРµС… Р‘РђР”РѕРІ.')) {
          FS.resetAllSupplements();
          alert('Р’СЃРµ Р‘РђР”С‹ СѓРґР°Р»РµРЅС‹.');
          fitnessRenderSupplementsTracking();
        }
        return;
      }

      const editIntakeBtn = e.target.closest('.supp-edit-intake');
      if (editIntakeBtn) {
        fitnessOpenIntakeEditModal(editIntakeBtn.dataset.suppId, dateKey, editIntakeBtn.dataset.intakeId);
        return;
      }

      const addIntakeBtn = e.target.closest('.supp-add-intake');
      if (addIntakeBtn) {
        fitnessOpenIntakeAddModal(addIntakeBtn.dataset.suppId, dateKey);
        return;
      }

      const editNormBtn = e.target.closest('.supp-edit-norm');
      if (editNormBtn) {
        fitnessOpenSupplementProfileModal(editNormBtn.dataset.id);
        return;
      }

      const historyBtn = e.target.closest('.supp-history');
      if (historyBtn) {
        fitnessOpenSupplementHistoryModal(historyBtn.dataset.id);
        return;
      }

      const removeFromDayBtn = e.target.closest('.supp-remove-from-day');
      if (removeFromDayBtn) {
        const suppId = removeFromDayBtn.dataset.id;
        const supp = FS.getSupplementById(suppId);
        if (!supp) return;
        if (confirm('РЈР±СЂР°С‚СЊ \"' + supp.name + '\" РёР· СЌС‚РѕРіРѕ РґРЅСЏ?')) {
          FS.removeAllSupplementIntakesForDay(suppId, dateKey);
          fitnessRenderSupplementsTracking();
        }
      }
    });
  }

  // NEW: Open modal to add/edit supplement profile
  function fitnessOpenSupplementProfileModal(editId) {
    const existing = editId ? FS.getSupplementById(editId) : null;
    const todayKey = FS.formatDateKey(new Date());
    
    let html = '<h3 class="font-semibold mb-4">' + (existing ? 'Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ Р‘РђР”' : 'Р”РѕР±Р°РІРёС‚СЊ Р‘РђР”') + '</h3>';
    html += '<div class="space-y-3">';
    html += '<label class="block text-sm">РќР°Р·РІР°РЅРёРµ</label>';
    html += '<input type="text" id="suppProfileName" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.name ?? '') + '" placeholder="РљСЂРµР°С‚РёРЅ, РљР»РµРЅР±СѓС‚РµСЂРѕР»...">';
    
    html += '<label class="block text-sm">Р•РґРёРЅРёС†Р° РёР·РјРµСЂРµРЅРёСЏ</label>';
    html += '<select id="suppProfileUnit" class="w-full p-3 bg-white/30 rounded-xl text-white">';
    html += '<option value="РјРі"' + (existing?.unit === 'РјРі' ? ' selected' : '') + '>РјРі</option>';
    html += '<option value="Рі"' + (existing?.unit === 'Рі' ? ' selected' : '') + '>Рі</option>';
    html += '<option value="С‚Р°Р±Р»"' + (existing?.unit === 'С‚Р°Р±Р»' ? ' selected' : '') + '>С‚Р°Р±Р»РµС‚РєРё</option>';
    html += '</select>';
    
    // CRITICAL: Daily checkbox with date interval controls
    html += '<div class="bg-white/5 rounded-lg p-3 mt-2">';
    html += '<label class="flex items-center gap-2">';
    html += '<input type="checkbox" id="suppProfileDaily" class="rounded"' + (existing?.daily ? ' checked' : '') + '>';
    html += '<span class="text-sm font-medium">РџСЂРёРЅРёРјР°С‚СЊ РµР¶РµРґРЅРµРІРЅРѕ</span></label>';

    // Daily interval controls (shown only when daily is checked)
    html += '<div id="dailyIntervalControls" class="mt-3 space-y-2' + (existing?.daily ? '' : ' hidden') + '">';
    html += '<label class="block text-xs opacity-70">РќР°С‡Р°С‚СЊ СЃ РґР°С‚С‹</label>';
    html += '<input type="date" id="suppProfileDailyStart" class="w-full p-2 bg-white/30 rounded-xl text-white text-sm" value="' + (existing?.dailyStartDate ?? todayKey) + '">';

    html += '<label class="block text-xs opacity-70 mt-2">Р—Р°РєРѕРЅС‡РёС‚СЊ (РЅРµРѕР±СЏР·Р°С‚РµР»СЊРЅРѕ)</label>';
    html += '<input type="date" id="suppProfileDailyEnd" class="w-full p-2 bg-white/30 rounded-xl text-white text-sm" value="' + (existing?.dailyEndDate ?? '') + '">';
    html += '<label class="flex items-center gap-2 mt-1">';
    html += '<input type="checkbox" id="suppProfileDailyNoEnd" class="rounded"' + (!existing?.dailyEndDate ? ' checked' : '') + '>';
    html += '<span class="text-xs opacity-70">Р‘РµР· РѕРєРѕРЅС‡Р°РЅРёСЏ (Р±РµСЃРєРѕРЅРµС‡РЅРѕ)</span></label>';
    html += '</div>';
    html += '</div>';
    
    html += '<label class="block text-sm mt-2">Р”РЅРµРІРЅР°СЏ РЅРѕСЂРјР°</label>';
    html += '<input type="number" id="suppProfileDailyDose" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.standardDailyDose ?? '1') + '" placeholder="10">';

    html += '<label class="block text-sm mt-2">РљРѕР»РёС‡РµСЃС‚РІРѕ РїСЂРёС‘РјРѕРІ РІ РґРµРЅСЊ</label>';
    html += '<input type="number" id="suppProfileIntakesCount" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.templateIntakes?.length ?? 1) + '" min="1" max="5">';

    html += '<label class="block text-sm mt-2">Р”РѕР·Р° РЅР° РїСЂРёС‘Рј (Р±Р°Р·РѕРІР°СЏ)</label>';
    html += '<input type="number" id="suppProfileDefaultDose" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.templateIntakes?.[0]?.defaultDose ?? '1') + '">';

    if (existing) {
      html += '<button type="button" id="suppProfileDelete" class="w-full py-2 mt-2 rounded-xl bg-red-500/30 text-sm text-red-300">РЈРґР°Р»РёС‚СЊ Р‘РђР”</button>';
    }
    html += '</div>';

    html += '<div class="flex gap-3 mt-4">';
    html += '<button type="button" id="suppProfileCancel" class="flex-1 py-3 rounded-xl bg-white/20">РћС‚РјРµРЅР°</button>';
    html += '<button type="button" id="suppProfileSave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">РЎРѕС…СЂР°РЅРёС‚СЊ</button>';
    html += '</div>';
    
    fitnessOpenModal(html, () => {
      // Toggle daily interval controls visibility
      const dailyCheckbox = document.getElementById('suppProfileDaily');
      const intervalControls = document.getElementById('dailyIntervalControls');
      const noEndCheckbox = document.getElementById('suppProfileDailyNoEnd');
      const endDateInput = document.getElementById('suppProfileDailyEnd');

      dailyCheckbox?.addEventListener('change', () => {
        if (dailyCheckbox.checked) {
          intervalControls?.classList.remove('hidden');
        } else {
          intervalControls?.classList.add('hidden');
        }
      });
      
      noEndCheckbox?.addEventListener('change', () => {
        if (noEndCheckbox.checked) {
          endDateInput.value = '';
          endDateInput.disabled = true;
        } else {
          endDateInput.disabled = false;
        }
      });

      document.getElementById('suppProfileCancel')?.addEventListener('click', fitnessCloseModal);
      document.getElementById('suppProfileSave')?.addEventListener('click', () => {
        const name = document.getElementById('suppProfileName')?.value?.trim();
        const unit = document.getElementById('suppProfileUnit')?.value;
        const daily = document.getElementById('suppProfileDaily')?.checked;
        const standardDailyDose = Number(document.getElementById('suppProfileDailyDose')?.value) || 1;
        const intakesCount = Number(document.getElementById('suppProfileIntakesCount')?.value) || 1;
        const defaultDose = Number(document.getElementById('suppProfileDefaultDose')?.value) || 1;

        // CRITICAL: Get daily interval dates
        let dailyStartDate = null;
        let dailyEndDate = null;
        if (daily) {
          dailyStartDate = document.getElementById('suppProfileDailyStart')?.value || todayKey;
          const noEnd = document.getElementById('suppProfileDailyNoEnd')?.checked;
          if (!noEnd) {
            dailyEndDate = document.getElementById('suppProfileDailyEnd')?.value || null;
          }
        }

        if (!name) {
          alert('Р’РІРµРґРёС‚Рµ РЅР°Р·РІР°РЅРёРµ Р‘РђР”Р°');
          return;

        }
  
        // Generate template intakes
        const templateIntakes = [];
        for (let i = 0; i < intakesCount; i++) {
          templateIntakes.push({ defaultDose: defaultDose });
        }

        if (editId) {
          FS.updateSupplement(editId, { name, unit, daily, dailyStartDate, dailyEndDate, standardDailyDose, templateIntakes });
        } else {
          FS.createSupplement({ name, unit, daily, dailyStartDate, dailyEndDate, standardDailyDose, templateIntakes });
        }
      
        fitnessCloseModal();
        fitnessRenderSupplementsTracking();
      });

      document.getElementById('suppProfileDelete')?.addEventListener('click', () => {
        if (confirm('РЈРґР°Р»РёС‚СЊ СЌС‚РѕС‚ Р‘РђР”? РСЃС‚РѕСЂРёСЏ РїСЂРёС‘РјРѕРІ Р±СѓРґРµС‚ РїРѕС‚РµСЂСЏРЅР°.')) {
          FS.deleteSupplement(editId);
          fitnessCloseModal();
          fitnessRenderSupplementsTracking();
        }
      });
    });
  }

  // NEW: Open modal to edit single intake (dose)
  function fitnessOpenIntakeEditModal(suppId, dateKey, intakeId) {
    const intakes = FS.getSupplementIntakesForDay(suppId, dateKey);
    const intake = intakes.find(i => i.id === intakeId);
    if (!intake) return;
    
    const supp = FS.getSupplementById(suppId);
    const unit = supp?.unit || 'С‚Р°Р±Р»';
    
    let html = '<h3 class="font-semibold mb-4">РР·РјРµРЅРёС‚СЊ РїСЂРёС‘Рј</h3>';
    html += '<div class="space-y-3">';
    html += '<label class="block text-sm">Р”РѕР·Р° (' + unit + ')</label>';
    html += '<input type="number" id="intakeEditDose" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + intake.dose + '">';
    html += '<div class="flex gap-2">';
    html += '<button type="button" id="intakeEditMinus1" class="flex-1 py-2 rounded-xl bg-white/20 text-sm">в€’1</button>';
    html += '<button type="button" id="intakeEditPlus1" class="flex-1 py-2 rounded-xl bg-white/20 text-sm">+1</button>';
    html += '<button type="button" id="intakeEditX2" class="flex-1 py-2 rounded-xl bg-white/20 text-sm">Г—2</button>';
    html += '</div>';
    html += '<label class="block text-sm mt-2">Р’СЂРµРјСЏ (HH:MM)</label>';
    html += '<input type="time" id="intakeEditTime" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (intake.time || '') + '">';
    html += '</div>';
    html += '<div class="flex gap-3 mt-4">';
    html += '<button type="button" id="intakeEditDelete" class="flex-1 py-3 rounded-xl bg-red-500/30 text-red-300">РЈРґР°Р»РёС‚СЊ</button>';
    html += '<button type="button" id="intakeEditCancel" class="flex-1 py-3 rounded-xl bg-white/20">РћС‚РјРµРЅР°</button>';
    html += '<button type="button" id="intakeEditSave" class="flex-1 py-3 rounded-xl bg-green-500">РЎРѕС…СЂР°РЅРёС‚СЊ</button>';
    html += '</div>';
    
    fitnessOpenModal(html, () => {
      const doseInput = document.getElementById('intakeEditDose');
      
      document.getElementById('intakeEditMinus1')?.addEventListener('click', () => {
        doseInput.value = Math.max(0, Number(doseInput.value) - 1);
      });
      document.getElementById('intakeEditPlus1')?.addEventListener('click', () => {
        doseInput.value = Number(doseInput.value) + 1;
      });
      document.getElementById('intakeEditX2')?.addEventListener('click', () => {
        doseInput.value = Number(doseInput.value) * 2;
      });
      
      document.getElementById('intakeEditCancel')?.addEventListener('click', fitnessCloseModal);
      document.getElementById('intakeEditDelete')?.addEventListener('click', () => {
        FS.removeSupplementIntake(suppId, dateKey, intakeId);
        fitnessCloseModal();
        fitnessRenderSupplementsTracking();
      });
      document.getElementById('intakeEditSave')?.addEventListener('click', () => {
        const dose = Number(doseInput.value);
        const time = document.getElementById('intakeEditTime')?.value;
        
        // CRITICAL: If dose is 0, delete the intake instead of updating
        if (dose === 0) {
          if (confirm('Р”РѕР·Р° = 0. РЈРґР°Р»РёС‚СЊ СЌС‚РѕС‚ РїСЂРёС‘Рј?')) {
            FS.removeSupplementIntake(suppId, dateKey, intakeId);
            fitnessCloseModal();
            fitnessRenderSupplementsTracking();
          }
          return;
        }
  
        if (!isNaN(dose) && dose > 0) {
          const result = FS.updateSupplementIntake(suppId, dateKey, intakeId, { dose, time });
          // If result is null, intake was deleted (shouldn't happen with dose > 0, but handle anyway)
          fitnessCloseModal();
          fitnessRenderSupplementsTracking();
        }
      });
    });
  }

  // NEW: Open modal to add new intake
  function fitnessOpenIntakeAddModal(suppId, dateKey) {
    const supp = FS.getSupplementById(suppId);
    const unit = supp?.unit || 'С‚Р°Р±Р»';
    const defaultDose = supp?.templateIntakes?.[0]?.defaultDose || 1;
    const currentTime = FS.formatTimeHM(new Date());
    
    let html = '<h3 class="font-semibold mb-4">Р”РѕР±Р°РІРёС‚СЊ РїСЂРёС‘Рј</h3>';
    html += '<div class="space-y-3">';
    html += '<label class="block text-sm">Р”РѕР·Р° (' + unit + ')</label>';
    html += '<input type="number" id="intakeAddDose" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + defaultDose + '">';
    html += '<label class="block text-sm mt-2">Р’СЂРµРјСЏ (HH:MM)</label>';
    html += '<input type="time" id="intakeAddTime" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + currentTime + '">';
    html += '</div>';
    html += '<div class="flex gap-3 mt-4">';
    html += '<button type="button" id="intakeAddCancel" class="flex-1 py-3 rounded-xl bg-white/20">РћС‚РјРµРЅР°</button>';
    html += '<button type="button" id="intakeAddSave" class="flex-1 py-3 rounded-xl bg-green-500">Р”РѕР±Р°РІРёС‚СЊ</button>';
    html += '</div>';
    
    fitnessOpenModal(html, () => {
      document.getElementById('intakeAddCancel')?.addEventListener('click', fitnessCloseModal);
      document.getElementById('intakeAddSave')?.addEventListener('click', () => {
        const dose = Number(document.getElementById('intakeAddDose')?.value);
        const time = document.getElementById('intakeAddTime')?.value;
        
        if (!isNaN(dose) && dose >= 0 && time) {
          FS.addSupplementIntake(suppId, dateKey, dose, time);
          fitnessCloseModal();
          fitnessRenderSupplementsTracking();
        }
      });
    });
  }

  // NEW: Open modal to view/edit supplement history
  function fitnessOpenSupplementHistoryModal(suppId) {
    const supp = FS.getSupplementById(suppId);
    if (!supp) return;
    
    const unit = supp.unit || 'С‚Р°Р±Р»';
    const history = supp.history || [];
    
    // Get last 14 days with data
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(FS.formatDateKey(d));
    }
    
    let html = '<h3 class="font-semibold mb-4">РСЃС‚РѕСЂРёСЏ: ' + supp.name + '</h3>';
    html += '<div class="space-y-3 max-h-96 overflow-y-auto">';
    
    for (const dateKey of dates) {
      const dayIntakes = history.find(h => h.date === dateKey);
      const intakes = dayIntakes?.intakes || [];
      const totalDose = FS.getTotalDoseForDay(intakes);
      const checkedCount = intakes.filter(i => i.checked).length;
      
      html += '<div class="bg-white/5 rounded-lg p-2">';
      html += '<div class="flex items-center justify-between mb-1">';
      html += '<span class="text-sm font-medium">' + FS.formatDateLocal(dateKey) + '</span>';
      html += '<span class="text-xs opacity-70">' + totalDose + ' ' + unit + ' (' + checkedCount + '/' + intakes.length + ')</span>';
      html += '</div>';
      
      for (const intake of intakes) {
        const checkedClass = intake.checked ? 'opacity-100' : 'opacity-40';
        html += '<div class="flex items-center gap-2 py-1 text-xs ' + checkedClass + '">';
        html += '<input type="checkbox" class="hist-intake-check rounded" data-date="' + dateKey + '" data-intake-id="' + intake.id + '"' + (intake.checked ? ' checked' : '') + '>';
        html += '<span class="w-12">' + (intake.time || '--:--') + '</span>';
        html += '<span class="flex-1">' + intake.dose + ' ' + unit + '</span>';
        html += '<button type="button" class="hist-intake-edit text-xs opacity-70" data-date="' + dateKey + '" data-intake-id="' + intake.id + '">вњЏ</button>';
        html += '</div>';
      }
      
      if (intakes.length === 0) {
        html += '<div class="text-xs opacity-50 py-1">РќРµС‚ РґР°РЅРЅС‹С…</div>';
      }
      
      html += '</div>';
    }
    
    html += '</div>';
    html += '<div class="flex gap-3 mt-4">';
    html += '<button type="button" id="histClose" class="flex-1 py-3 rounded-xl bg-white/20">Р—Р°РєСЂС‹С‚СЊ</button>';
    html += '</div>';
    
    fitnessOpenModal(html, () => {
      document.getElementById('histClose')?.addEventListener('click', fitnessCloseModal);
      
      // Checkbox handlers
      document.querySelectorAll('.hist-intake-check').forEach(cb => {
        cb.addEventListener('change', () => {
          const dateKey = cb.dataset.date;
          const intakeId = cb.dataset.intakeId;
          FS.toggleSupplementIntakeChecked(suppId, dateKey, intakeId);
          fitnessOpenSupplementHistoryModal(suppId); // Refresh
        });
      });
      
      // Edit handlers
      document.querySelectorAll('.hist-intake-edit').forEach(btn => {
        btn.addEventListener('click', () => {
          const dateKey = btn.dataset.date;
          const intakeId = btn.dataset.intakeId;
          fitnessOpenIntakeEditModal(suppId, dateKey, intakeId);
          // Refresh history after edit
          setTimeout(() => fitnessOpenSupplementHistoryModal(suppId), 500);
        });
      });
    });
  }
  
  function fitnessGetSelectedWorkProfile() {
    const input = document.querySelector('input[name="fitnessWorkProfile"]:checked');
    return input ? input.value : undefined;
  }

  function fitnessSetSelectedWorkProfile(value) {
    const all = document.querySelectorAll('input[name="fitnessWorkProfile"]');
    all.forEach((input) => {
      if (value && input.value === value) {
        input.checked = true;
      } else if (!value) {
        input.checked = false;
      }
    });
  }

  const fitnessOpenBtn = document.getElementById('fitnessBtn');
  if (fitnessOpenBtn && !fitnessOpenBtn.dataset.fitnessOpenBound) {
    fitnessOpenBtn.dataset.fitnessOpenBound = '1';
    fitnessOpenBtn.addEventListener('click', () => {
      showFitness();
      fitnessSelectedDate = new Date();
      const p = FS.getFitnessProfile();
      if (!isFitnessSetupDone()) {
        fitnessEl.profileSetup?.classList.remove('hidden');
        fitnessEl.dashboard?.classList.add('hidden');
        if (fitnessEl.weight) fitnessEl.weight.value = p.weight ?? '';
        if (fitnessEl.height) fitnessEl.height.value = p.height ?? '';
        if (fitnessEl.age) fitnessEl.age.value = p.age ?? '';
        if (fitnessEl.targetWeight) fitnessEl.targetWeight.value = p.targetWeight ?? '';
        fitnessSetSelectedWorkProfile(p.workProfile); // РќРћР’РћР•
      } else {
        fitnessEl.profileSetup?.classList.add('hidden');
        fitnessEl.dashboard?.classList.remove('hidden');
        fitnessRenderDashboard();
      }
    });
  }

  // Note: Old weight input block removed. Weight is now managed through the weight tracker UI only.

  fitnessEl.backBtn?.addEventListener('click', () => {
    fitnessEl.screen?.classList.add('hidden');
    el.main?.classList.remove('hidden');
  });

  fitnessEl.profileSkip?.addEventListener('click', () => {
    setFitnessSetupDone();
    fitnessEl.profileSetup?.classList.add('hidden');
    fitnessEl.dashboard?.classList.remove('hidden');
    fitnessRenderDashboard();
  });

  fitnessEl.profileSave?.addEventListener('click', () => {
    const workProfile = fitnessGetSelectedWorkProfile();
    const profile = FS.parseProfileFromValues({
      weight: fitnessEl.weight?.value,
      height: fitnessEl.height?.value,
      age: fitnessEl.age?.value,
      targetWeight: fitnessEl.targetWeight?.value,
      workProfile, // РќРћР’РћР•
    });
    FS.setFitnessProfile(profile);
    setFitnessSetupDone();
    fitnessEl.profileSetup?.classList.add('hidden');
    fitnessEl.dashboard?.classList.remove('hidden');
    fitnessRenderDashboard();
  });

  fitnessEl.datePrev?.addEventListener('click', () => {
    fitnessSelectedDate.setDate(fitnessSelectedDate.getDate() - 1);
    fitnessRenderDashboard();
  });
  fitnessEl.dateNext?.addEventListener('click', () => {
    fitnessSelectedDate.setDate(fitnessSelectedDate.getDate() + 1);
    fitnessRenderDashboard();
  });
  fitnessEl.profileEdit?.addEventListener('click', () => {
    const p = FS.getFitnessProfile();
    // РїРѕРєР°Р·Р°С‚СЊ С„РѕСЂРјСѓ РїСЂРѕС„РёР»СЏ РІРјРµСЃС‚Рѕ РґР°С€Р±РѕСЂРґР°
    fitnessEl.dashboard?.classList.add('hidden');
    fitnessEl.profileSetup?.classList.remove('hidden');

    if (fitnessEl.weight) fitnessEl.weight.value = p.weight ?? '';
    if (fitnessEl.height) fitnessEl.height.value = p.height ?? '';
    if (fitnessEl.age) fitnessEl.age.value = p.age ?? '';
    if (fitnessEl.targetWeight) fitnessEl.targetWeight.value = p.targetWeight ?? '';
    fitnessSetSelectedWorkProfile(p.workProfile);
  });

  document.querySelectorAll('.fitness-activity-btn').forEach(btn => {
    btn.addEventListener('click', () => { fitnessOpenActivityModal(null, btn.dataset.activity); });
  });

  // Quick activity buttons
  document.querySelectorAll('.fitness-quick-activity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const kind = btn.dataset.quickActivity;
      const duration = parseInt(btn.dataset.duration) || 30;
      fitnessAddQuickActivity(kind, duration);
    });
  });

  // Gym Activity Modal
  document.getElementById('gymActivityForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('gymActivityEditId')?.value;
    const formValues = {
      durationMinutes: parseInt(document.getElementById('gymActivityDuration')?.value) || 45,
      intensity: document.getElementById('gymActivityIntensity')?.value || 'moderate'
    };    
    const k = fitnessGetDateKey();
    const dayData = FS.getDayData(k);
    const entry = FS.buildActivityEntry('gym', formValues, editId || null);
    const next = FS.mergeActivity(dayData.activities, entry, editId || null);
    FS.updateDayData(k, { activities: next });
    document.getElementById('gymActivityModalOverlay')?.classList.add('hidden');
    fitnessRenderActivityList();
    fitnessRenderCalories();
    fitnessRenderActivityBlock();
  });
  document.getElementById('gymActivityCancelBtn')?.addEventListener('click', () => {
    document.getElementById('gymActivityModalOverlay')?.classList.add('hidden');
  });
  document.getElementById('gymActivityDuration')?.addEventListener('input', fitnessUpdateGymCaloriesPreview);
  document.getElementById('gymActivityIntensity')?.addEventListener('change', fitnessUpdateGymCaloriesPreview);

  // Cardio Modal
  document.getElementById('cardioForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('cardioEditId')?.value;
    const isOutdoor = document.getElementById('cardioIsOutdoor')?.value === 'true';
    const formValues = {
      cardioType: document.getElementById('cardioTypeSelect')?.value,
      durationMinutes: parseInt(document.getElementById('cardioDuration')?.value) || 30,
      distanceKm: parseFloat(document.getElementById('cardioDistance')?.value) || null
    };    
    const k = fitnessGetDateKey();
    const dayData = FS.getDayData(k);
    const kind = isOutdoor ? 'cardio_outdoor' : 'cardio_indoor';
    const entry = FS.buildActivityEntry(kind, formValues, editId || null);
    const next = FS.mergeActivity(dayData.activities, entry, editId || null);
    FS.updateDayData(k, { activities: next });
    document.getElementById('cardioModalOverlay')?.classList.add('hidden');
    fitnessRenderActivityList();
    fitnessRenderCalories();
    fitnessRenderActivityBlock();
  });
  document.getElementById('cardioCancelBtn')?.addEventListener('click', () => {
    document.getElementById('cardioModalOverlay')?.classList.add('hidden');
  });
  document.getElementById('cardioDuration')?.addEventListener('input', fitnessUpdateCardioCaloriesPreview);
  document.getElementById('cardioDistance')?.addEventListener('input', fitnessUpdateCardioCaloriesPreview);
  document.getElementById('cardioTypeSelect')?.addEventListener('change', fitnessUpdateCardioCaloriesPreview);
  
  // Home Exercise Modal
  document.getElementById('homeExerciseForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('homeEditId')?.value;
    const useReps = document.getElementById('homeUseReps')?.checked;
    const formValues = {
      exerciseType: document.getElementById('homeExerciseTypeSelect')?.value,
      durationMinutes: useReps ? null : (parseInt(document.getElementById('homeDuration')?.value) || 15),
      repetitions: useReps ? (parseInt(document.getElementById('homeRepetitions')?.value) || 20) : null
    };
    const k = fitnessGetDateKey();
    const dayData = FS.getDayData(k);
    const entry = FS.buildActivityEntry('home_exercise', formValues, editId || null);
    const next = FS.mergeActivity(dayData.activities, entry, editId || null);
    FS.updateDayData(k, { activities: next });
    document.getElementById('homeModalOverlay')?.classList.add('hidden');
    fitnessRenderActivityList();
    fitnessRenderCalories();
    fitnessRenderActivityBlock();
  });
  document.getElementById('homeCancelBtn')?.addEventListener('click', () => {
    document.getElementById('homeModalOverlay')?.classList.add('hidden');
  });
  document.getElementById('homeDuration')?.addEventListener('input', fitnessUpdateHomeCaloriesPreview);
  document.getElementById('homeRepetitions')?.addEventListener('input', fitnessUpdateHomeCaloriesPreview);
  document.getElementById('homeUseReps')?.addEventListener('change', () => {
    const useReps = document.getElementById('homeUseReps')?.checked;
    document.getElementById('homeDurationField')?.classList.toggle('hidden', useReps);
    document.getElementById('homeRepsField')?.classList.toggle('hidden', !useReps);
    fitnessUpdateHomeCaloriesPreview();
  });

  // Steps Modal
  document.getElementById('stepsForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('stepsEditId')?.value;
    const formValues = {
      steps: parseInt(document.getElementById('stepsCount')?.value) || 0,
      intensity: document.getElementById('stepsIntensity')?.value || 'normal'
    };
    const k = fitnessGetDateKey();
    const dayData = FS.getDayData(k);
    const entry = FS.buildActivityEntry('steps', formValues, editId || null);
    const next = FS.mergeActivity(dayData.activities, entry, editId || null);
    FS.updateDayData(k, { activities: next });
    document.getElementById('stepsModalOverlay')?.classList.add('hidden');
    fitnessRenderActivityList();
    fitnessRenderCalories();
    fitnessRenderActivityBlock();
  });
  document.getElementById('stepsCancelBtn')?.addEventListener('click', () => {
    document.getElementById('stepsModalOverlay')?.classList.add('hidden');
  });
  document.getElementById('stepsCount')?.addEventListener('input', fitnessUpdateStepsCaloriesPreview);
