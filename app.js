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
  window.currentAppUserId = null; // для fitness синхронизации

  let currentUser = null;
  let currentDay = 1;
  let currentAppUserId = null; // единый ID пользователя в нашем приложении

  const el = {
    main: document.getElementById('main'),
    buddyScreen: document.getElementById('buddyScreen'),
    completeBtn: document.getElementById('completeBtn'),
    habitsBtn: document.getElementById('habitsBtn'),
    buddyBtn: document.getElementById('buddyBtn'),
    backBtn: document.getElementById('backBtn'),
    lessonTitle: document.getElementById('lessonTitle'),
    lessonDesc: document.getElementById('lessonDesc'),
    video: document.getElementById('video'),
    currentDay: document.getElementById('currentDay'),
    streak: document.getElementById('streak'),
    points: document.getElementById('points'),
  };

  // корневые экраны
  const rootScreens = {
    main: document.getElementById('main'),
    fitness: document.getElementById('fitnessScreen'),
    buddy: document.getElementById('buddyScreen'),
  };

  function showMain() {
    if (rootScreens.main) rootScreens.main.classList.remove('hidden');
    if (rootScreens.fitness) rootScreens.fitness.classList.add('hidden');
    if (rootScreens.buddy) rootScreens.buddy.classList.add('hidden');
  }

  function showBuddy() {
    if (rootScreens.main) rootScreens.main.classList.add('hidden');
    if (rootScreens.fitness) rootScreens.fitness.classList.add('hidden');
    if (rootScreens.buddy) rootScreens.buddy.classList.remove('hidden');
  }

  function showFitness() {
    if (rootScreens.main) rootScreens.main.classList.add('hidden');
    if (rootScreens.buddy) rootScreens.buddy.classList.add('hidden');
    if (rootScreens.fitness) rootScreens.fitness.classList.remove('hidden');
    // ВНУТРЕННЮЮ очистку фитнеса добавим позже, когда fitnessEl будет объявлен
  }

  function showBuddy() {
    if (rootScreens.main) rootScreens.main.classList.add('hidden');
    if (rootScreens.fitness) rootScreens.fitness.classList.add('hidden');
    if (rootScreens.buddy) rootScreens.buddy.classList.remove('hidden');
  }


  function setCompleteButtonState({ completed }) {
    if (!el.completeBtn) return;
    if (completed) {
      el.completeBtn.textContent = '✅ Выполнено!';
      el.completeBtn.disabled = true;
      el.completeBtn.className = 'w-full bg-green-400 py-3 rounded-xl font-semibold text-lg cursor-not-allowed';
    } else {
      el.completeBtn.textContent = '✅ Выполнено';
      el.completeBtn.disabled = false;
      el.completeBtn.className = 'w-full bg-green-500 hover:bg-green-600 py-3 rounded-xl font-semibold text-lg';
    }
  }

  function updateUI() {
    if (!currentUser) return;
    if (el.currentDay) el.currentDay.textContent = `День ${currentDay}/30`;
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

    // Пока просто заглушка-аватар, позже подтянем реальное фото через Bot API
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
      // 1. Получаем список привычек
      const habitsRes = await fetch(`${SUPABASE_URL}/rest/v1/habits?select=*`, {
        headers: { apikey: SUPABASE_KEY }
      });
      const habits = await habitsRes.json();

      if (!Array.isArray(habits) || habits.length === 0) {
        container.innerHTML = '<div class="col-span-2 text-sm opacity-70 text-center">Привычки пока не добавлены</div>';
        return;
      }

      // 2. Получаем логи выполнения по текущему пользователю
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
          <div class="font-semibold mb-1">${habit.title || 'Привычка'}</div>
          <div class="text-xs opacity-80">${doneDays} / 30</div>
        `;

        container.appendChild(el);
      });
    } catch (e) {
      container.innerHTML = '<div class="col-span-2 text-sm opacity-70 text-center">Ошибка загрузки привычек</div>';
    }
  }

  async function initFromSupabase() {
    try {
      // 1. Ищем/создаем app_user по telegram_id
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
      // 2. Старую таблицу users можно временно использовать как «профиль прогресса»
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
      showAlert('Ошибка инициализации (Supabase).');
      initBrowserMode();
    }
  }


  function initBrowserMode() {
    currentUser = { telegram_id: null, username: 'browser', day: 1, streak: 0, points: 0 };
    currentDay = 1;

    if (el.lessonTitle) el.lessonTitle.textContent = 'Демо-режим';
    if (el.lessonDesc) el.lessonDesc.textContent = 'Открыто в браузере. Telegram-данные недоступны.';
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
      if (el.lessonTitle) el.lessonTitle.textContent = `День ${currentDay}`;
      if (el.lessonDesc) el.lessonDesc.textContent = 'Урок не найден.';
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
        showAlert('✅ День выполнен! +10 баллов');

        if (isTelegram && tg?.MainButton) {
          try {
            tg.MainButton.setText('Следующий день →').show();
            tg.MainButton.onClick(nextDay);
          } catch (e) {
            nextDay();
          }
        } else {
          nextDay();
        }
      } catch (e) {
        showAlert('Ошибка при сохранении.');
      }
    });
  }

  // --- Fitness tab (glue only: DOM refs, events, render; logic in fitness.js) ---
  const FITNESS_SETUP_DONE_KEY = 'leakfixer_fitness_setup_done';
  let fitnessSelectedDate = new Date();
  const FS = window.FitnessState;

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
    supplementList: document.getElementById('fitnessSupplementList'),
    supplementAdd: document.getElementById('fitnessSupplementAdd'),
    modalOverlay: document.getElementById('fitnessModalOverlay'),
    modalContent: document.getElementById('fitnessModalContent'),
    workDayLabel: document.getElementById('fitnessWorkDayLabel'),
    profileEdit: document.getElementById('fitnessProfileEdit'),
    weightDate: document.getElementById('fitnessWeightDate'),
    weightValue: document.getElementById('fitnessWeightValue'),
    weightSave: document.getElementById('fitnessWeightSave'),
    weightStatus: document.getElementById('fitnessWeightStatus'),
  };
  

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
    fitnessEl.calEaten.textContent = summary.eaten;
    fitnessEl.calBurned.textContent = summary.burned;
    fitnessEl.balance.textContent = summary.balance;
    fitnessEl.balance.className = 'font-semibold ' + (summary.balanceColor === 'green' ? 'text-green-300' : summary.balanceColor === 'red' ? 'text-red-300' : '');
    // АВТОСОХРАНЕНИЕ в Supabase
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
    let text = 'Как обычно';
    if (v === 'low') text = 'Больше сидел';
    if (v === 'normal') text = 'Обычный день';
    if (v === 'high') text = 'Очень активный день';
    fitnessEl.workDayLabel.textContent = text;
    // АВТОСОХРАНЕНИЕ
    if (window.FitnessSync && window.currentAppUserId) {
        const dateKey = fitnessGetDateKey();
        const dayData = FS.getDayData(dateKey);
        window.FitnessSync.saveDay(dateKey, {
          work_day: dayData.workDay || 'normal'
        }).catch(console.error);
  }
}

  function fitnessRenderDate() {
    if (fitnessEl.dateLabel) fitnessEl.dateLabel.textContent = FS.formatDateLocal(fitnessSelectedDate);
  }

  function fitnessRenderActivityList() {
    if (!fitnessEl.activityList) return;
    const dayData = FS.getDayData(fitnessGetDateKey());
    const items = FS.getActivityListViewModel(dayData.activities);
    const empty = '<li class="opacity-70 text-sm">Нет записей</li>';
    fitnessEl.activityList.innerHTML = items.length
      ? items.map((item) => `<li class="flex items-center justify-between py-2 border-b border-white/10">
        <span>${item.label}</span>
        <span>
          <button type="button" class="fitness-activity-edit mr-2 text-xs opacity-80" data-id="${item.id}">изм</button>
          <button type="button" class="fitness-activity-delete text-xs opacity-80 text-red-300" data-id="${item.id}">удл</button>
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
      });
    });
  }

  function fitnessRenderFoodList() {
    if (!fitnessEl.foodList) return;
    const dayData = FS.getDayData(fitnessGetDateKey());
    const items = FS.getFoodListViewModel(dayData.foods);
    const empty = '<li class="opacity-70 text-sm">Нет записей</li>';
    fitnessEl.foodList.innerHTML = items.length
      ? items.map((item) => `<li class="flex items-center justify-between py-2 border-b border-white/10">
            <span>
              ${item.timeText ? `<span class="opacity-70 mr-1">${item.timeText}</span>` : ''}
              ${item.name} ${item.amount}${item.caloriesText ? ' • ' + item.caloriesText : ''}
            </span>
            <span>
              <button type="button" class="fitness-food-edit mr-2 text-xs opacity-80" data-id="${item.id}">изм</button>
              <button type="button" class="fitness-food-delete text-xs opacity-80 text-red-300" data-id="${item.id}">удл</button>
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

  function fitnessRenderWater() {
    if (fitnessEl.waterTotal) {
      const dayData = FS.getDayData(fitnessGetDateKey());
      fitnessEl.waterTotal.textContent = FS.formatWaterLiters(dayData.waterMl);
      // АВТОСОХРАНЕНИЕ
      if (window.FitnessSync && window.currentAppUserId) {
          const dateKey = fitnessGetDateKey();
          const dayData = FS.getDayData(dateKey);
          window.FitnessSync.saveDay(dateKey, {
            water_ml: dayData.waterMl || 0
          }).catch(console.error);
        }
    }
  }

  function fitnessRenderSupplementList() {
    if (!fitnessEl.supplementList) return;
    const dayData = FS.getDayData(fitnessGetDateKey());
    const items = FS.getSupplementListViewModel(dayData.supplements);
    const empty = '<li class="opacity-70 text-sm">Нет записей</li>';
    fitnessEl.supplementList.innerHTML = items.length
      ? items.map((item) => `<li class="flex items-center justify-between py-2 border-b border-white/10">
            <span>
              ${item.timeText ? `<span class="opacity-70 mr-1">${item.timeText}</span>` : ''}
              ${item.name} ${item.dose} — ${item.taken ? '✓' : '—'}
            </span>
            <span>
              <button type="button" class="fitness-supplement-edit mr-2 text-xs opacity-80" data-id="${item.id}">изм</button>
              <button type="button" class="fitness-supplement-delete text-xs opacity-80 text-red-300" data-id="${item.id}">удл</button>
            </span>
          </li>`).join('')
      : empty;    
    fitnessEl.supplementList.querySelectorAll('.fitness-supplement-edit').forEach((btn) => {
      btn.addEventListener('click', () => fitnessOpenSupplementModal(btn.dataset.id));
    });
    fitnessEl.supplementList.querySelectorAll('.fitness-supplement-delete').forEach((btn) => {
      btn.addEventListener('click', () => {
        const k = fitnessGetDateKey();
        const dayData = FS.getDayData(k);
        const next = FS.removeSupplementById(dayData.supplements, btn.dataset.id);
        FS.updateDayData(k, { supplements: next });
        fitnessRenderSupplementList();
      });
    });
  }

  function fitnessRenderDashboard() {
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
    fitnessRenderFoodList();
    fitnessRenderWater();
    fitnessRenderSupplementList();
    fitnessRenderWorkDay();
  }
  

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

  function fitnessOpenActivityModal(editId, forceKind) {
    const dayData = FS.getDayData(fitnessGetDateKey());
    const existing = editId ? (dayData.activities || []).find((a) => a.id === editId) : null;
    const kind = forceKind || existing?.kind || 'gym';
    let html = '<h3 class="font-semibold mb-4">Добавить активность</h3>';
    html += '<input type="hidden" id="fmActivityKind" value="' + kind + '">';
    html += '<input type="hidden" id="fmActivityEditId" value="' + (editId || '') + '">';
    if (kind === 'gym') {
      html += '<div class="space-y-3"><label class="block">Минуты</label><input type="number" id="fmGymMinutes" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.durationMinutes ?? '') + '">';
      html += '<label class="block">Интенсивность</label><select id="fmGymIntensity" class="w-full p-3 bg-white/30 rounded-xl text-white">';
      ['low','medium','high'].forEach((v) => { html += '<option value="' + v + '"' + (existing?.intensity === v ? ' selected' : '') + '>' + (v === 'low' ? 'Низкая' : v === 'medium' ? 'Средняя' : 'Высокая') + '</option>'; });
      html += '</select></div>';
    } else if (kind === 'cardio') {
      html += '<div class="space-y-3"><label class="block">Минуты</label><input type="number" id="fmCardioMinutes" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.durationMinutes ?? '') + '">';
      html += '<label class="block">Тип</label><select id="fmCardioType" class="w-full p-3 bg-white/30 rounded-xl text-white">';
      ['run','walk','bike','other'].forEach((v) => { html += '<option value="' + v + '"' + (existing?.type === v ? ' selected' : '') + '>' + (v === 'run' ? 'Бег' : v === 'walk' ? 'Ходьба' : v === 'bike' ? 'Велосипед' : 'Другое') + '</option>'; });
      html += '</select></div>';
    } else {
      html += '<div class="space-y-3"><label class="block">Шаги</label><input type="number" id="fmSteps" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.steps ?? '') + '"></div>';
    }
    html += '<div class="flex gap-3 mt-4"><button type="button" id="fmActivityCancel" class="flex-1 py-3 rounded-xl bg-white/20">Отмена</button><button type="button" id="fmActivitySave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">Сохранить</button></div>';
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

  function fitnessOpenFoodModal(editId) {
    const dayData = FS.getDayData(fitnessGetDateKey());
    const existing = editId ? (dayData.foods || []).find((f) => f.id === editId) : null;
    const defaultTime = existing?.time || FS.formatTimeHM(new Date());
    let html = '<h3 class="font-semibold mb-4">Добавить приём пищи</h3>';
    html += '<div class="space-y-3"><label class="block">Название</label><input type="text" id="fmFoodName" class="w-full p-3 bg-white/30 rounded-xl text-white placeholder-white/70" value="' + (existing?.name ?? '') + '" placeholder="Что съели">';
    html += '<label class="block">Количество</label><input type="text" id="fmFoodAmount" class="w-full p-3 bg-white/30 rounded-xl text-white placeholder-white/70" value="' + (existing?.amount ?? '') + '" placeholder="200 г, 1 порция">';
    html += '<label class="block">Калории (опционально)</label><input type="number" id="fmFoodCalories" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.calories ?? '') + '">';
    html += '<label class="block">Время (примерно)</label><input type="time" id="fmFoodTime" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + defaultTime + '">';
    html += '<div class="flex gap-3 mt-4"><button type="button" id="fmFoodCancel" class="flex-1 py-3 rounded-xl bg-white/20">Отмена</button><button type="button" id="fmFoodSave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">Сохранить</button></div>';
    fitnessOpenModal(html, () => {
      fitnessEl.modalOverlay.querySelector('#fmFoodCancel')?.addEventListener('click', fitnessCloseModal);
      fitnessEl.modalOverlay.querySelector('#fmFoodSave')?.addEventListener('click', () => {
        const k = fitnessGetDateKey();
        const dayData = FS.getDayData(k);
        const formValues = {
          name: document.getElementById('fmFoodName')?.value,
          amount: document.getElementById('fmFoodAmount')?.value,
          calories: document.getElementById('fmFoodCalories')?.value,
          time: document.getElementById('fmFoodTime')?.value,
        };
  
        const entry = FS.buildFoodEntry(formValues, editId);
        const next = FS.mergeFood(dayData.foods, entry, editId);
        FS.updateDayData(k, { foods: next });
        fitnessCloseModal();
        fitnessRenderFoodList();
        fitnessRenderCalories();
      });
    });
  }

  function fitnessOpenSupplementModal(editId) {
    const dayData = FS.getDayData(fitnessGetDateKey());
    const existing = editId ? (dayData.supplements || []).find((s) => s.id === editId) : null;
    const defaultTime = existing?.time || FS.formatTimeHM(new Date());
    let html = '<h3 class="font-semibold mb-4">Добавить БАД</h3>';
    html += '<div class="space-y-3"><label class="block">Название</label><input type="text" id="fmSuppName" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.name ?? '') + '" placeholder="Омега-3">';
    html += '<label class="block">Доза</label><input type="text" id="fmSuppDose" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.dose ?? '') + '" placeholder="2 капсулы, 500 мг">';
    html += '<label class="block">Время приёма (примерно)</label><input type="time" id="fmSuppTime" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + defaultTime + '">';
    html += '<label class="flex items-center gap-2 mt-2"><input type="checkbox" id="fmSuppTaken" class="rounded"' + (existing?.taken ? ' checked' : '') + '> Принято сегодня</label></div>';
    html += '<div class="flex gap-3 mt-4"><button type="button" id="fmSuppCancel" class="flex-1 py-3 rounded-xl bg-white/20">Отмена</button><button type="button" id="fmSuppSave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">Сохранить</button></div>';
    fitnessOpenModal(html, () => {
      fitnessEl.modalOverlay.querySelector('#fmSuppCancel')?.addEventListener('click', fitnessCloseModal);
      fitnessEl.modalOverlay.querySelector('#fmSuppSave')?.addEventListener('click', () => {
        const k = fitnessGetDateKey();
        const dayData = FS.getDayData(k);
        const formValues = {
          name: document.getElementById('fmSuppName')?.value,
          dose: document.getElementById('fmSuppDose')?.value,
          taken: !!document.getElementById('fmSuppTaken')?.checked,
          time: document.getElementById('fmSuppTime')?.value,
        };
  
        const entry = FS.buildSupplementEntry(formValues, editId);
        const next = FS.mergeSupplement(dayData.supplements, entry, editId);
        FS.updateDayData(k, { supplements: next });
        fitnessCloseModal();
        fitnessRenderSupplementList();
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

  document.getElementById('fitnessBtn')?.addEventListener('click', () => {
    el.main?.classList.add('hidden');
    el.buddyScreen?.classList.add('hidden');
    fitnessEl.screen?.classList.remove('hidden');
    fitnessSelectedDate = new Date();
    const p = FS.getFitnessProfile();
    if (!isFitnessSetupDone()) {
      fitnessEl.profileSetup?.classList.remove('hidden');
      fitnessEl.dashboard?.classList.add('hidden');
      if (fitnessEl.weight) fitnessEl.weight.value = p.weight ?? '';
      if (fitnessEl.height) fitnessEl.height.value = p.height ?? '';
      if (fitnessEl.age) fitnessEl.age.value = p.age ?? '';
      if (fitnessEl.targetWeight) fitnessEl.targetWeight.value = p.targetWeight ?? '';
      fitnessSetSelectedWorkProfile(p.workProfile); // НОВОЕ
    } else {
      fitnessEl.profileSetup?.classList.add('hidden');
      fitnessEl.dashboard?.classList.remove('hidden');
      fitnessRenderDashboard();
    }
  });

  // Инициализация даты по умолчанию = сегодня
  if (fitnessEl.weightDate) {
    const today = FS.formatDateKey(new Date()); // YYYY-MM-DD
    fitnessEl.weightDate.value = today;
  }

  if (fitnessEl.weightSave) {
    fitnessEl.weightSave.addEventListener('click', async () => {
      if (!window.FitnessSync || !window.currentAppUserId) {
        if (fitnessEl.weightStatus) fitnessEl.weightStatus.textContent = 'Нет связи с сервером';
        return;
      }

      const dateKey = fitnessEl.weightDate?.value;
      const raw = fitnessEl.weightValue?.value;

      if (!dateKey) {
        if (fitnessEl.weightStatus) fitnessEl.weightStatus.textContent = 'Выберите дату';
        return;
      }
      if (!raw) {
        if (fitnessEl.weightStatus) fitnessEl.weightStatus.textContent = 'Введите вес';
        return;
      }

      const weight = parseFloat(raw.replace(',', '.'));
      if (Number.isNaN(weight) || weight <= 0) {
        if (fitnessEl.weightStatus) fitnessEl.weightStatus.textContent = 'Некорректный вес';
        return;
      }

      try {
        await window.FitnessSync.saveWeightMeasurement(dateKey, weight);

        // Обновляем локальный профиль (для расчётов калорий и т.п.)
        const profile = FS.getFitnessProfile();
        profile.weight = weight;
        FS.setFitnessProfile(profile);

        if (fitnessEl.weightStatus) {
          fitnessEl.weightStatus.textContent = `Сохранено для ${dateKey}`;
        }
      } catch (e) {
        console.error(e);
        if (fitnessEl.weightStatus) fitnessEl.weightStatus.textContent = 'Ошибка сохранения';
      }
    });
  }

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
      workProfile, // НОВОЕ
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
    // показать форму профиля вместо дашборда
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

  

  fitnessEl.foodAdd?.addEventListener('click', () => fitnessOpenFoodModal(null));
  fitnessEl.supplementAdd?.addEventListener('click', () => fitnessOpenSupplementModal(null));

  document.querySelectorAll('.fitness-water-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const addMl = Number(btn.dataset.water) || 0;
      const k = fitnessGetDateKey();
      const dayData = FS.getDayData(k);
      const nextMl = FS.addWaterToDay(dayData.waterMl, addMl);
      FS.updateDayData(k, { waterMl: nextMl });
      fitnessRenderWater();
    });
  });

  document.querySelectorAll('.fitness-workday-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.workday; // 'low' | 'normal' | 'high'
      const k = fitnessGetDateKey();
      const dayData = FS.getDayData(k);
      FS.updateDayData(k, { workDay: value });
      fitnessRenderWorkDay();
      fitnessRenderCalories(); // чтобы пересчитать ккал с учётом workDay
    });
  });

  fitnessEl.modalOverlay?.addEventListener('click', (e) => {
    if (e.target === fitnessEl.modalOverlay) fitnessCloseModal();
  });

    // --- Глобальная шкала настроения (главный экран) ---

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
      const level = 10 - index; // 10 = верхний
      segment.innerHTML = '';   // очищаем на всякий случай

      // базовый фон (неактивный)
      segment.style.backgroundColor = 'rgba(15,23,42,0.6)';

      if (level <= fullSegments) {
        // активный сегмент
        const hue = 120 - level * 8; // зелёный → красный
        const color = `hsl(${hue}, 70%, 50%)`;
        segment.style.backgroundColor = color;
      }
    });

    // числа
    scoreEl.textContent = value.toFixed(1);
    yesterdayEl.textContent = yesterday.toFixed(1);

    const diff = value - yesterday;
    if (Math.abs(diff) < 0.1) {
      trendEl.textContent = '→ 0.0';
      trendEl.className = 'text-[10px] opacity-70';
    } else if (diff > 0) {
      trendEl.textContent = `↗ +${diff.toFixed(1)}`;
      trendEl.className = 'text-[10px] text-emerald-300';
    } else {
      trendEl.textContent = `↘ ${diff.toFixed(1)}`;
      trendEl.className = 'text-[10px] text-red-300';
    }

    // статус
    let statusText = '';
    let statusClass = 'text-xs font-medium ';
    if (value >= 8.5) {
      statusText = 'Пик, используй момент';
      statusClass += 'text-orange-300';
    } else if (value >= 7) {
      statusText = 'Хороший тон, есть ресурс';
      statusClass += 'text-emerald-300';
    } else if (value >= 5) {
      statusText = 'Норма, держи базу';
      statusClass += 'text-amber-200';
    } else if (value >= 3) {
      statusText = 'Усталость, нужен отдых';
      statusClass += 'text-red-300';
    } else {
      statusText = 'Кризис, нужна поддержка';
      statusClass += 'text-red-400';
    }
    statusEl.textContent = statusText;
    statusEl.className = statusClass;
  }


  function initGlobalMoodWidget() {
    const btn = document.getElementById('logMoodBtn');
    if (btn) {
      btn.addEventListener('click', async () => {
        const raw = prompt('Текущее состояние (0–10):', '7');
        if (raw == null) return;
        const num = parseFloat(raw);
        if (Number.isNaN(num)) return;
  
        // обновляем UI
        renderGlobalMood(num, 6.5);
  
        // сохраняем в Supabase как daily_state + measurements
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
  
  


  // Инициализация профиля
  initProfileHeader();
  // Инициализация глобальной шкалы настроения
  initGlobalMoodWidget();

  // Запуск приложения
  if (supabaseEnabled) initFromSupabase();
  else initBrowserMode();

  let gymCurrentDayIndex = 1;


  // --- GYM: Тренировка в зале ---------------------------------------------
  const gymEl = {
    // экран списка периодов
    periodsScreen: document.getElementById('gymPeriodsScreen'),
    periodsBackBtn: document.getElementById('gymPeriodsBackBtn'),
    noPeriodsState: document.getElementById('gymNoPeriodsState'),
    periodsListWrapper: document.getElementById('gymPeriodsListWrapper'),
    periodsList: document.getElementById('gymPeriodsList'),
    createPeriodBtn: document.getElementById('gymCreatePeriodBtn'),
    createPeriodTopBtn: document.getElementById('gymCreatePeriodTopBtn'),

    // экран мастера периода
    periodWizardScreen: document.getElementById('gymPeriodWizardScreen'),
    periodWizardBackBtn: document.getElementById('gymPeriodWizardBackBtn'),
    periodStep1: document.getElementById('gymPeriodStep1'),
    periodStep2: document.getElementById('gymPeriodStep2'),
    periodStep1CancelBtn: document.getElementById('gymPeriodStep1CancelBtn'),
    periodStep1NextBtn: document.getElementById('gymPeriodStep1NextBtn'),
    periodDaysContainer: document.getElementById('gymPeriodDaysContainer'),
    periodStep2BackBtn: document.getElementById('gymPeriodStep2BackBtn'),
    periodStep2CreateBtn: document.getElementById('gymPeriodStep2CreateBtn'),

    // экран конкретного периода
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

  // до GYM-блока, после fitnessEl/gymEl
  const fitnessBtn = document.getElementById('fitnessBtn');

  // переопределяем showFitness с учётом fitnessEl и gymEl
  const _showFitnessBase = showFitness;
  function showFitnessFull() {
    _showFitnessBase();
    if (fitnessEl?.profileSetup) fitnessEl.profileSetup.classList.add('hidden');
    if (fitnessEl?.dashboard) fitnessEl.dashboard.classList.remove('hidden');
    if (gymEl?.periodsScreen) gymEl.periodsScreen.classList.add('hidden');
    if (gymEl?.periodWizardScreen) gymEl.periodWizardScreen.classList.add('hidden');
    if (gymEl?.screen) gymEl.screen.classList.add('hidden');
  }

  // Кнопки на главном экране
  if (el.habitsBtn) {
    el.habitsBtn.addEventListener('click', () => {
      showAlert('Экран привычек будет позже');
    });
  }

  if (el.buddyBtn) {
    el.buddyBtn.addEventListener('click', () => {
      showBuddy();
    });
  }

  if (fitnessBtn) {
    fitnessBtn.addEventListener('click', () => {
      showFitnessFull();
    });
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

  const GYM_STORAGE_KEY = 'leakfixer_gym_data';
  const GYM_DEFAULT_GROUPS = ['Грудь + Трицепс', 'Спина + Бицепс', 'Ноги + Икры'];

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
   // временный буфер для мастера периода
  let gymPeriodWizardDraft = null;


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
      gymState.runtime[period.id] = { currentCycle: 1, cycles: {} };
    }
  
    const rt = gymState.runtime[period.id];
    const currentCycle = rt.currentCycle || 1;
    const currentRuntime = rt.cycles[currentCycle] || { days: {} };
  
    // создаём следующий цикл
    const nextCycle = currentCycle + 1;
    const nextRuntimeDays = {};
  
    const baseDays = Array.isArray(period.days) ? period.days : [];
  
    baseDays.forEach((d) => {
      const dayIndex = d.dayIndex;
      const prevDayRuntime = currentRuntime.days?.[dayIndex];
  
      // читаем enabled из предыдущего цикла, по умолчанию true
      const enabled = prevDayRuntime ? prevDayRuntime.enabled !== false : true;
  
      if (!enabled) return; // этот день не переносим в новый цикл
  
      nextRuntimeDays[dayIndex] = {
        enabled: true,
        groups: prevDayRuntime && prevDayRuntime.groups
          ? JSON.parse(JSON.stringify(prevDayRuntime.groups))
          : {},
      };
    });
  
    rt.currentCycle = nextCycle;
    rt.cycles[nextCycle] = { days: nextRuntimeDays };
  
    gymSaveState(gymState);
    gymRenderHeader();
    gymRenderGroups();
  }
  
  if (gymEl.newCycleBtn) {
    gymEl.newCycleBtn.addEventListener('click', gymCreateNextCycle);
  }


  function gymSaveCurrentCycleDefinition() {
    const period = gymGetActivePeriod();
    if (!period || !gymEl.groupsContainer) return;
  
    // базовая карта только с dayIndex + muscles
    const daysMap = new Map();
    const baseDays = Array.isArray(period.days) ? period.days : [];
    baseDays.forEach((d) => {
      daysMap.set(d.dayIndex, {
        dayIndex: d.dayIndex,
        muscles: Array.isArray(d.muscles) ? d.muscles.slice() : [],
      });
    });
  
    // поверх накатываем то, что сейчас в DOM
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
  
    gymSaveState(gymState);
  }
  
  

  function gymOpenPeriodWizardStep1() {
    if (!gymEl.periodWizardScreen) return;
  
    // мы уже внутри фитнеса, прячем список периодов и экран конкретного периода
    if (gymEl.periodsScreen) gymEl.periodsScreen.classList.add('hidden');
    if (gymEl.screen) gymEl.screen.classList.add('hidden');
  
    // фитнес-экран остаётся видимым, просто показываем в нём мастер
    if (fitnessEl?.screen) fitnessEl.screen.classList.remove('hidden');
  
    gymEl.periodWizardScreen.classList.remove('hidden');
    if (gymEl.periodStep1) gymEl.periodStep1.classList.remove('hidden');
    if (gymEl.periodStep2) gymEl.periodStep2.classList.add('hidden');
  
    gymPeriodWizardDraft = {
      type: 'strength',
      name: 'На силу',
      splitType: 'split',
      cycleLengthDays: 7,
      totalCycles: 8,
      workoutsPerCycle: 3,   // НОВОЕ
      days: [],
    };    
  
    const cycleLenInput = document.getElementById('gymPeriodCycleLength');
    const totalCyclesInput = document.getElementById('gymPeriodTotalCycles');
    const customNameInput = document.getElementById('gymPeriodCustomName');
  
    if (cycleLenInput) cycleLenInput.value = '7';
    if (totalCyclesInput) totalCyclesInput.value = '8';
    if (customNameInput) customNameInput.value = '';
  }
  

  
  function gymClosePeriodWizard() {
    if (gymEl.periodWizardScreen) gymEl.periodWizardScreen.classList.add('hidden');
    // возвращаемся к списку периодов
    gymOpenPeriodsScreen();
  }  

  // Кнопка "Добавить день в цикл" на шаге 2 мастера периода
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
          <span class="text-sm font-medium text-white">День ${nextIndex}</span>
          <button type="button"
            data-role="deleteDay"
            class="text-11px text-red-300 underline">
            удалить
          </button>
        </div>

        <label class="flex items-center gap-1 text-11px text-slate-200">
          <input
            type="checkbox"
            data-field="dayEnabled"
            class="accent-emerald-400"
            checked
          >
          <span>День активен</span>
        </label>

        <div class="text-11px text-slate-300 mb-1">Группы мышц</div>
        <div data-role="muscleList" class="space-y-1"></div>

        <button
          type="button"
          data-role="addMuscleGroup"
          class="mt-1 text-11px text-emerald-300 underline"
        >
          Добавить группу мышц
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
            placeholder="Грудь, спина…"
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
              placeholder="Группа мышц"
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
  
    let name = 'Период';
    if (type === 'strength') name = 'На силу';
    else if (type === 'endurance') name = 'На выносливость';
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
  
    // переключаем шаги мастера
    if (gymEl.periodStep1) gymEl.periodStep1.classList.add('hidden');
    if (gymEl.periodStep2) gymEl.periodStep2.classList.remove('hidden');
  
    // генерим N тренировочных дней по workoutsPerCycle
    gymEl.periodDaysContainer.innerHTML = '';
    const wpc = gymPeriodWizardDraft.workoutsPerCycle || 3;
  
    for (let i = 1; i <= wpc; i += 1) {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'bg-white/10 rounded-xl px-3 py-3 space-y-2';
      dayDiv.dataset.dayIndex = String(i);
      dayDiv.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="font-semibold text-white text-sm">День ${i}</div>
          <button type="button" data-role="removeDay" class="text-[11px] text-red-300 underline">
            удалить
          </button>
        </div>
        <label class="flex items-center gap-2 text-xs text-slate-200">
          <input type="checkbox" data-field="dayEnabled" class="accent-emerald-400" checked>
          <span>День активен (основная тренировка)</span>
        </label>
        <input
          type="text"
          data-field="muscles"
          class="w-full bg-white/10 rounded-lg px-2 py-1 text-xs text-white"
          placeholder="Грудь, спина..."
        />
      `;
      gymEl.periodDaysContainer.appendChild(dayDiv);
    }
  
    // обработчик удаления дня
    gymEl.periodDaysContainer
      .querySelectorAll('button[data-role="removeDay"]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const dayDiv = btn.closest('[data-day-index]');
          dayDiv?.remove();
        });
      });
  }  

  // экран списка периодов
  function gymRenderPeriodsList() {
    if (!gymEl.periodsList || !gymState.periods) return;
  
    const order = Array.isArray(gymState.periodOrder)
      ? gymState.periodOrder
      : Object.keys(gymState.periods);
  
    gymEl.periodsList.innerHTML = '';
  
    if (!order.length) {
      // нет периодов — показываем заглушку
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
              ${p.cycleLengthDays} дн · ${p.totalCycles} циклов
            </div>
          </div>
          <div class="flex flex-col items-end gap-1">
            <button
              class="text-xs px-2 py-1 rounded-full bg-indigo-500 text-white"
              data-open-period="${p.id}"
            >
              Открыть
            </button>
            <button
              class="text-[11px] text-red-300 underline"
              data-delete-period="${p.id}"
            >
              Удалить
            </button>
          </div>
        </div>
      `;
  
      gymEl.periodsList.appendChild(card);
    });
  
    // открыть период
    gymEl.periodsList.querySelectorAll('button[data-open-period]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.openPeriod;
        if (!id) return;
        gymSetActivePeriod(id);
        gymOpen(); // показывает экран конкретного периода
      });
    });
  
    // удалить период с подтверждением
    gymEl.periodsList.querySelectorAll('button[data-delete-period]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.deletePeriod;
        if (!id) return;
        const p = gymState.periods[id];
        const name = p?.name || 'период';
        if (!confirm(`Точно удалить «${name}»? Это действие нельзя отменить.`)) {
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
  
    // фитнес-экран включён, но сам фитнес-дашборд прячем
    if (fitnessEl?.screen) fitnessEl.screen.classList.remove('hidden');
    if (fitnessEl?.profileSetup) fitnessEl.profileSetup.classList.add('hidden');
    if (fitnessEl?.dashboard) fitnessEl.dashboard.classList.add('hidden');
  
    // прячем экран конкретного периода и мастер
    if (gymEl.screen) gymEl.screen.classList.add('hidden');
    if (gymEl.periodWizardScreen) gymEl.periodWizardScreen.classList.add('hidden');
  
    // показываем "новое окно" – список периодов
    gymRenderPeriodsList();
    gymEl.periodsScreen.classList.remove('hidden');
  }
  
  

  function gymClosePeriodsScreen() {
    if (gymEl.periodsScreen) gymEl.periodsScreen.classList.add('hidden');
  
    // если есть фитнес-экран – возвращаемся к фитнес-дашборду
    if (fitnessEl?.screen) {
      fitnessEl.screen.classList.remove('hidden');
  
      if (fitnessEl.profileSetup) fitnessEl.profileSetup.classList.add('hidden');
      if (fitnessEl.dashboard) fitnessEl.dashboard.classList.remove('hidden');
  
      // на всякий случай прячем мастер и экран периода
      if (gymEl.periodWizardScreen) gymEl.periodWizardScreen.classList.add('hidden');
      if (gymEl.screen) gymEl.screen.classList.add('hidden');
  
      return;
    }
  
    // fallback: если по какой-то причине fitnessScreen нет – вернёмся на главный экран
    const main = document.getElementById('main');
    if (main) main.classList.remove('hidden');
  }
  

  // старый экран (конкретный период) пока оставляем как был — он не привязан к periods
  function gymGetCurrentCycle() {
    const period = gymGetActivePeriod();
    if (!period) return null;
  
    if (!gymState.runtime) gymState.runtime = {};
    if (!gymState.runtime[period.id]) {
      gymState.runtime[period.id] = {
        currentCycle: 1,
        totalCycles: period.totalCycles || 1,
        periodDone: 1,
        cycles: [],
      };
    }
    const rt = gymState.runtime[period.id];
  
    if (!rt.totalCycles) rt.totalCycles = period.totalCycles || 1;
    if (!rt.periodDone) rt.periodDone = 1;
    if (!rt.currentCycle) rt.currentCycle = 1;
  
    if (!rt.cycles || !rt.cycles.length) {
      rt.cycles = [
        {
          currentCycle: 1,
          totalCycles: rt.totalCycles,
          periodDone: 1,
          days: {},
        },
      ];
    }
  
    const idx = Math.max(1, Math.min(rt.currentCycle, rt.cycles.length));
    const cycle = rt.cycles[idx - 1];
  
    // дублируем удобные поля на уровне цикла
    if (cycle.currentCycle == null) cycle.currentCycle = rt.currentCycle;
    if (cycle.totalCycles == null) cycle.totalCycles = rt.totalCycles;
    if (cycle.periodDone == null) cycle.periodDone = rt.periodDone;
  
    gymSaveState(gymState);
    return cycle;
  }
  
  
  

  function gymRenderHeader() {
    if (!gymEl.cycleInfo || !gymEl.periodInfo || !gymEl.progressBar || !gymEl.progressLabel) return;
    const period = gymGetActivePeriod();
    if (!period) return;
  
    // берём текущий цикл из глобального runtime
    const runtimeCycle = gymGetCurrentCycle();
    if (!runtimeCycle) {
      gymEl.cycleInfo.textContent = '1/1';
      gymEl.periodInfo.textContent = period.name || 'Период';
      gymEl.progressBar.style.width = '0%';
      gymEl.progressLabel.textContent = '0/1';
      return;
    }
  
    const currentCycle = runtimeCycle.currentCycle ?? 1;
    const totalCycles = runtimeCycle.totalCycles ?? period.totalCycles ?? 1;
    const periodDone = runtimeCycle.periodDone ?? currentCycle;
  
    if (gymEl.cycleSelect) {
      gymEl.cycleSelect.innerHTML = '';
      for (let i = 1; i <= totalCycles; i += 1) {
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = String(i);
        if (i === currentCycle) opt.selected = true;
        gymEl.cycleSelect.appendChild(opt);
      }
    }
  
    gymEl.cycleInfo.textContent = `${currentCycle}/${totalCycles}`;
    gymEl.periodInfo.textContent = period.name || 'Период';
  
    const pct = Math.max(0, Math.min(100, (periodDone / totalCycles) * 100));
    gymEl.progressBar.style.width = `${pct}%`;
    gymEl.progressLabel.textContent = `${periodDone}/${totalCycles}`;
  }
  
  

  function gymRenderGroups() {
    if (!gymEl.groupsContainer) return;
  
    const period = gymGetActivePeriod();
    if (!period) return;
  
    const runtime = gymGetCurrentCycle();
    if (!runtime) return;
  
    if (!runtime.groups) runtime.groups = {};
    if (!runtime.days) runtime.days = {};
  
    // UI-состояние сворачивания и редактирования
    if (!gymState.uiCollapse) gymState.uiCollapse = {};
    const uiKey = `period-${period.id || 'default'}`;
    if (!gymState.uiCollapse[uiKey]) {
      gymState.uiCollapse[uiKey] = { days: {}, groups: {}, editDays: {} };
    }
    const ui = gymState.uiCollapse[uiKey];
    if (!ui.editDays) ui.editDays = {};
  
    gymEl.groupsContainer.innerHTML = '';
  
    const days = Array.isArray(period.days) && period.days.length ? period.days : [];
    const daysToRender = days.length ? days : [];
    
    // --- РЕНДЕР ДНЕЙ ---
    daysToRender.forEach((day) => {
      const dayIndex = day.dayIndex;
    
      // читаем enabled из runtime, по умолчанию true
      const runtimeDayRaw = runtime && runtime.days ? runtime.days[dayIndex] : null;
      const enabled = runtimeDayRaw ? runtimeDayRaw.enabled !== false : true;
    
      // если день выключен и не в режиме редактирования — пропускаем
      // if (!enabled && !ui.editDays[dayIndex]) return;
    
      if (!runtime.days[dayIndex]) runtime.days[dayIndex] = { groups: {} };
      const dayRuntime = runtime.days[dayIndex];
      if (!dayRuntime.groups) dayRuntime.groups = {};
    
      const isEditing = ui.editDays[dayIndex] === true;
    
      const dayWrapper = document.createElement('div');
      dayWrapper.className = 'bg-white/5 rounded-2xl px-3 py-3 space-y-2';
      dayWrapper.dataset.dayIndex = String(dayIndex);

      // --- ШАПКА ДНЯ ---
      const title = document.createElement('div');
      title.className = 'flex items-center justify-between mb-2';
  
      const left = document.createElement('div');
      left.className = 'flex items-center gap-2 flex-1';
  
      // чекбокс только в режиме редактирования
      if (isEditing) {
        const checkboxLabel = document.createElement('label');
        checkboxLabel.className = 'flex items-center gap-1 text-xs text-slate-200';
      
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'accent-emerald-400';
        checkbox.dataset.role = 'dayEnabled';
        checkbox.dataset.dayIndex = String(dayIndex);
      
        // читаем состояние из runtime текущего цикла
        const runtimeDay = runtime.days[dayIndex] || {};
        if (runtimeDay.enabled !== false) {
          checkbox.checked = true;
        } else {
          checkbox.checked = false;
        }
      
        const span = document.createElement('span');
        span.textContent = 'Активен';
      
        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(span);
      
        left.appendChild(checkboxLabel);
      }
      
  
      const titleBtn = document.createElement('button');
      titleBtn.type = 'button';
      titleBtn.className = 'text-left flex-1';
      titleBtn.dataset.role = 'toggleDay';
      titleBtn.dataset.dayIndex = String(dayIndex);
      titleBtn.innerHTML = `
        <div class="text-sm font-semibold text-white">День ${day.dayIndex}</div>
        <div class="text-xs text-slate-300" data-role="dayMusclesView">
          ${
            day.muscles && day.muscles.length
              ? day.muscles.join(', ')
              : 'Нажми "Редактировать", чтобы выбрать группы'
          }
        </div>
      `;
      left.appendChild(titleBtn);
  
      const right = document.createElement('div');
      right.className = 'flex items-center gap-2 ml-2';
  
      if (isEditing) {
        const saveBtn = document.createElement('button');
        saveBtn.type = 'button';
        saveBtn.className = 'text-[11px] text-emerald-300 underline';
        saveBtn.dataset.role = 'daySave';
        saveBtn.dataset.dayIndex = String(dayIndex);
        saveBtn.textContent = 'Сохранить';
  
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'text-[11px] text-red-300 underline';
        deleteBtn.dataset.role = 'dayDelete';
        deleteBtn.dataset.dayIndex = String(dayIndex);
        deleteBtn.textContent = 'Удалить день';
  
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'text-[11px] text-slate-300 underline';
        cancelBtn.dataset.role = 'dayCancel';
        cancelBtn.dataset.dayIndex = String(dayIndex);
        cancelBtn.textContent = 'Назад';
  
        right.appendChild(saveBtn);
        right.appendChild(deleteBtn);
        right.appendChild(cancelBtn);
      } else {
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'text-[11px] text-emerald-300 underline';
        editBtn.dataset.role = 'dayEdit';
        editBtn.dataset.dayIndex = String(dayIndex);
        editBtn.textContent = 'Редактировать';
  
        right.appendChild(editBtn);
      }
  
      title.appendChild(left);
      title.appendChild(right);
      dayWrapper.appendChild(title);
  
      // --- СТРОКА РЕДАКТИРОВАНИЯ ГРУПП МЫШЦ (ТОЛЬКО В РЕЖИМЕ РЕДАКТИРОВАНИЯ) ---
      if (isEditing) {
        const musclesRow = document.createElement('div');
        musclesRow.className = 'mb-2';
  
        musclesRow.innerHTML = `
          <div class="text-[11px] text-slate-300 mb-1">
            Группы мышц через запятую
          </div>
          <input
            class="w-full bg-white/10 text-white text-xs rounded-lg px-2 py-1"
            placeholder="Грудь, плечи, спина"
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
  
      // --- ТЕЛО ДНЯ ---
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
  
        // название группы
        const groupBtn = document.createElement('button');
        groupBtn.type = 'button';
        groupBtn.className = 'flex-1 text-left text-sm text-slate-100 font-medium';
        groupBtn.dataset.role = 'toggleGroup';
        groupBtn.dataset.group = groupName;
        groupBtn.textContent = groupName;
  
        header.appendChild(groupBtn);
  
        // кнопки для групп — только в режиме редактирования
        if (isEditing) {
          const groupActions = document.createElement('div');
          groupActions.className = 'flex items-center gap-2';
  
          const addExBtn = document.createElement('button');
          addExBtn.type = 'button';
          addExBtn.className = 'text-xs px-2 py-1 rounded-full bg-emerald-500 text-white';
          addExBtn.dataset.role = 'addExercise';
          addExBtn.dataset.group = groupName;
          addExBtn.textContent = '+ Упражнение';
  
          const delGroupBtn = document.createElement('button');
          delGroupBtn.type = 'button';
          delGroupBtn.className = 'text-[11px] text-red-300 underline';
          delGroupBtn.dataset.role = 'deleteGroup';
          delGroupBtn.dataset.group = groupName;
          delGroupBtn.textContent = 'удалить';
  
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
          empty.textContent = 'Добавь упражнение для этой группы.';
          listContainer.appendChild(empty);
        } else {
          exercises.forEach((ex, idx) => {
            const card = document.createElement('div');
            card.className = 'bg-slate-900/80 rounded-xl px-3 py-3 space-y-2';
            card.dataset.index = String(idx);
  
            // --- ШАПКА УПРАЖНЕНИЯ ---
            const exHeader = document.createElement('div');
            exHeader.className = 'flex items-center justify-between text-xs mb-1';

            const titleWrap = document.createElement('div');
            titleWrap.className = 'flex-1';

            if (isEditing) {
              // Редактируемое название
              const nameInput = document.createElement('input');
              nameInput.type = 'text';
              nameInput.className = 'w-full bg-transparent text-left text-slate-100 text-xs font-semibold border-b border-white/10 focus:outline-none';
              nameInput.placeholder = 'Название (Жим гантелей)';
              nameInput.value = ex.name || '';
              nameInput.dataset.field = 'name';
              titleWrap.appendChild(nameInput);
            } else {
              // Только текст (кнопка сворачивания)
              const nameBtn = document.createElement('button');
              nameBtn.type = 'button';
              nameBtn.className = 'text-left flex-1 text-slate-100';
              nameBtn.dataset.role = 'toggleExercise';
              nameBtn.textContent = ex.name || 'Упражнение ' + (idx + 1);
              titleWrap.appendChild(nameBtn);
            }

            exHeader.appendChild(titleWrap);

            // Кнопка удаления упражнения — ТОЛЬКО в режиме редактирования дня
            if (isEditing) {
              const delBtn = document.createElement('button');
              delBtn.type = 'button';
              delBtn.className = 'text-[11px] text-red-300 underline';
              delBtn.dataset.delete = '1';
              delBtn.textContent = 'Удалить';
              exHeader.appendChild(delBtn);
            }

            card.appendChild(exHeader);

  
            // --- ТЕЛО УПРАЖНЕНИЯ ---
            const body = document.createElement('div');
            body.className = 'space-y-2 hidden';
            body.dataset.role = 'exerciseBody';
  
            body.innerHTML = `
              <div class="flex gap-2 text-xs">
                <div class="flex-1">
                  <div class="text-slate-400 mb-1">Рабочие подходы</div>
                  <input
                    class="w-full bg-white/10 text-white rounded-lg px-2 py-1"
                    placeholder="4x10x35 кг"
                    value="${ex.sets || ''}"
                    data-field="sets"
                  />
                </div>
                <div class="flex-1">
                  <div class="text-slate-400 mb-1">Разминка (опц.)</div>
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
                  <div class="text-slate-400 mb-1">RPE 1–10</div>
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
                  <div class="text-slate-400 mb-1">Прогресс за период</div>
                  <input
                    class="w-full bg-white/10 text-white rounded-lg px-2 py-1"
                    placeholder="+5 кг с начала"
                    value="${ex.progressNote || ''}"
                    data-field="progressNote"
                  />
                </div>
                <div class="flex-1">
                  <div class="text-slate-400 mb-1">План на след. цикл</div>
                  <input
                    class="w-full bg-white/10 text-white rounded-lg px-2 py-1"
                    placeholder="След. цикл: 37 кг"
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
  
    // --- КНОПКА/ФОРМА "ДОБАВИТЬ ДЕНЬ" (как раньше) ---
    const addDayContainer = document.createElement('div');
    addDayContainer.className = 'mt-3 space-y-2 text-xs text-slate-200';
    addDayContainer.innerHTML = `
      <div
        class="bg-white/5 rounded-2xl px-3 py-3 space-y-2 hidden"
        data-role="newDayForm"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="text-sm font-semibold text-white">
            Новый день
          </div>
          <label class="flex items-center gap-1 text-[11px] text-slate-200">
            <input
              type="checkbox"
              class="accent-emerald-400"
              data-role="newDayEnabled"
              checked
            />
            <span>День активен</span>
          </label>
        </div>
  
        <div class="space-y-1">
          <div class="text-[11px] text-slate-300">Группы мышц через запятую</div>
          <input
            class="w-full bg-white/10 text-white text-xs rounded-lg px-2 py-1"
            placeholder="Грудь, плечи, спина"
            data-role="newDayMuscles"
          />
        </div>
  
        <div class="flex gap-2 mt-3">
          <button
            type="button"
            class="flex-1 bg-emerald-500 hover:bg-emerald-600 py-2 rounded-xl font-semibold text-sm"
            data-role="createDaySubmit"
          >
            Сохранить день
          </button>
          <button
            type="button"
            class="flex-1 bg-white/10 py-2 rounded-xl text-sm"
            data-role="createDayCancel"
          >
            Отмена
          </button>
        </div>
      </div>
  
      <button
        type="button"
        class="w-full bg-transparent border border-emerald-500/60 py-2 rounded-xl font-semibold text-sm"
        data-role="addDayFromScreen"
      >
        + Добавить день
      </button>
    `;
    gymEl.groupsContainer.appendChild(addDayContainer);
  
    // ---- ОБРАБОТЧИКИ "НОВЫЙ ДЕНЬ" ----
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

          period.days = [
            ...existingDays,
            {
              dayIndex: nextIndex,
              muscles: musclesFinal,
            },
          ];
        
          // 2) enabled записываем в runtime текущего цикла
          const runtime = gymGetCurrentCycle();
          if (runtime) {
            if (!runtime.days) runtime.days = {};
            if (!runtime.days[nextIndex]) runtime.days[nextIndex] = { groups: {} };
            runtime.days[nextIndex].enabled = enabled;
          }
        
          gymSaveState(gymState);
          gymRenderGroups();
        });        
      }
    }
  
    // ---- ПЕРЕКЛЮЧЕНИЕ РЕЖИМА ДНЯ ----
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
  
    // ---- СОХРАНИТЬ ДЕНЬ ----
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

  
    // ---- УДАЛИТЬ ДЕНЬ ----
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
  
    // ---- СВЕРНУТЬ/РАЗВЕРНУТЬ ДЕНЬ ----
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
  
    // ---- СВЕРНУТЬ/РАЗВЕРНУТЬ ГРУППУ ----
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
  
    // ---- ДОБАВИТЬ УПРАЖНЕНИЕ ----
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
            sets: '',
            warmup: '',
            rpe: 7,
            progressNote: '',
            nextCyclePlan: '',
          });
  
          gymSaveState(gymState);
          gymRenderGroups();
        });
      });
  
    // ---- УДАЛИТЬ ГРУППУ ----
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
  
    // ---- ИЗМЕНЕНИЯ В ПОЛЯХ УПРАЖНЕНИЙ (включая name) ----
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
        });
      });
  
    // ---- СВЕРНУТЬ/РАЗВЕРНУТЬ УПРАЖНЕНИЕ ----
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
  
    // ---- УДАЛЕНИЕ УПРАЖНЕНИЯ ----
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
  
  
  
  if (gymEl.daySelect) {
    gymEl.daySelect.addEventListener('change', () => {
      const period = gymGetActivePeriod();
      if (!period) return;
  
      // привязка вариантов к индексу дня цикла
      const value = gymEl.daySelect.value;
      if (value === 'Сегодня') {
        gymCurrentDayIndex = 1; // MVP: всегда День 1, позже привяжем к календарю
      } else {
        // если опции будут вида "День 1", "День 2" и т.п.
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
      gymCurrentDayIndex = 1; // всегда начинаем с Дня 1 цикла
    }
  
    gymRenderHeader();
    gymRenderGroups();
  }
  

  function gymClose() {
    if (!gymEl.screen) return;
    gymEl.screen.classList.add('hidden');
    if (gymEl.periodsScreen) gymEl.periodsScreen.classList.remove('hidden');
  }

  // кнопка "Фитнес → Зал"
  if (gymEl.fromFitnessBtn) {
    gymEl.fromFitnessBtn.addEventListener('click', gymOpenPeriodsScreen);
  }

  // список периодов: назад
  if (gymEl.periodsBackBtn) {
    gymEl.periodsBackBtn.addEventListener('click', gymClosePeriodsScreen);
  }

  // кнопки "Создать период"
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


  // мастер периода: навигация и действия
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
      // назад на шаг 1
      if (gymEl.periodStep2) gymEl.periodStep2.classList.add('hidden');
      if (gymEl.periodStep1) gymEl.periodStep1.classList.remove('hidden');
    });
  }
  if (gymEl.periodStep2CreateBtn) {
    gymEl.periodStep2CreateBtn.addEventListener('click', () => {
      if (!gymPeriodWizardDraft) return;
      if (!gymEl.periodDaysContainer) return;
  
      // Собираем дни из UI
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
      
      // в модель периода сохраняем только включённые дни
      const days = rawDays.filter((d) => d.enabled);
      gymPeriodWizardDraft.days = days;
  
      gymPeriodWizardDraft.days = days;
  
      // Создаём период в gymState
      const periodId = gymCreatePeriodId();
      const period = {
        id: periodId,
        name: gymPeriodWizardDraft.name || 'Период',
        type: gymPeriodWizardDraft.type,
        splitType: gymPeriodWizardDraft.splitType,
        cycleLengthDays: gymPeriodWizardDraft.cycleLengthDays,
        totalCycles: gymPeriodWizardDraft.totalCycles,
        workoutsPerCycle: gymPeriodWizardDraft.workoutsPerCycle || days.length, // НОВОЕ
        days,
        cycles: {}, // пока циклы храним тут, дальше расширим
        runtime: {}, // можно использовать для per-cycle данных, если нужно
      };
  
      gymState.periods[periodId] = period;
      gymState.periodOrder.push(periodId);
      gymSetActivePeriod(periodId);
  
      gymSaveState(gymState);
  
      // закрываем мастер и открываем экран периода
      if (gymEl.periodWizardScreen) gymEl.periodWizardScreen.classList.add('hidden');
      gymOpen();

    });
  }
  

  // экран конкретного периода
  if (gymEl.backBtn) {
    gymEl.backBtn.addEventListener('click', gymClose);
  }
  if (gymEl.newCycleBtn) {
    gymEl.newCycleBtn.addEventListener('click', () => {
      const period = gymGetActivePeriod();
      if (!period) return;
  
      const rt = gymState.runtime || (gymState.runtime = {});
      if (!rt[period.id]) {
        // форс-инициализация
        gymGetCurrentCycle();
      }
      const pr = rt[period.id];
      if (!pr) return;
  
      if (pr.currentCycle < pr.totalCycles) {
        const prevIndex = pr.currentCycle;
        pr.currentCycle += 1;
        pr.periodDone = Math.max(pr.periodDone || 1, pr.currentCycle);
  
        // создаём days для нового цикла на основе предыдущего
        if (!pr.cycles) pr.cycles = [];
        const prevCycle = pr.cycles[prevIndex - 1] || { days: {} };
        const nextCycle = pr.cycles[pr.currentCycle - 1] || { days: {} };
  
        if (!nextCycle.days) nextCycle.days = {};
  
        // копируем только включённые дни
        Object.keys(prevCycle.days || {}).forEach((key) => {
          const d = prevCycle.days[key];
          if (d && d.enabled !== false) {
            nextCycle.days[key] = { ...d };
          }
        });
  
        // записываем назад
        pr.cycles[pr.currentCycle - 1] = nextCycle;
  
        gymSaveState(gymState);
        gymRenderHeader();
        gymRenderGroups();
      }
    });
  }
  
  if (gymEl.saveBtn) {
    gymEl.saveBtn.textContent = 'Сохранить цикл';
    gymEl.saveBtn.addEventListener('click', () => {
      gymSaveCurrentCycleDefinition();
      gymRenderGroups();
    });
  }
  
  if (gymEl.historyBtn) {
    gymEl.historyBtn.addEventListener('click', () => {
      showAlert('История тренировок появится позже');
    });
  }
  if (gymEl.cycleSelect) {
    gymEl.cycleSelect.addEventListener('change', (e) => {
      const period = gymGetActivePeriod();
      if (!period || !period.runtime) return;
  
      const value = Number(e.target.value || 1);
      const runtime = period.runtime;
      runtime.currentCycle = Math.max(1, Math.min(runtime.totalCycles, value));
  
      // при ручном выборе можно не трогать periodDone,
      // но если хочешь — обнови progress:
      period.progress = {
        ...(period.progress || {}),
        currentCycle: runtime.currentCycle,
      };
  
      gymSaveState(gymState);
      gymRenderHeader();
      gymRenderGroups();
    });
  }
  

}); // конец DOMContentLoaded
