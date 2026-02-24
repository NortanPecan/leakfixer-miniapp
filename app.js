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
              ${item.name} ${item.amount ? item.amount + ' ' : ''}${item.caloriesText ? '• ' + item.caloriesText : ''}
              ${item.macrosText ? `<span class="text-xs opacity-70 ml-1">(${item.macrosText})</span>` : ''}
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
    fitnessEl.waterTotal.textContent = `${currentLiters} / ${targetLiters} л`;
    
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
    let html = '<h3 class="font-semibold mb-4">Изменить воду</h3>';
    html += '<div class="space-y-3">';
    html += '<label class="block text-sm">Изменение в мл (можно отрицательное)</label>';
    html += '<input type="number" id="fmWaterDelta" class="w-full p-3 bg-white/30 rounded-xl text-white" placeholder="Например: -200 или +500">';
    html += '<p class="text-xs opacity-70">Введите положительное число для добавления, отрицательное — для уменьшения</p>';
    html += '</div>';
    html += '<div class="flex gap-3 mt-4"><button type="button" id="fmWaterAdjustCancel" class="flex-1 py-3 rounded-xl bg-white/20">Отмена</button><button type="button" id="fmWaterAdjustSave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">Сохранить</button></div>';
    
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
      });
    });
  }

  // NEW: Open modal to change water baseline
  function fitnessOpenWaterBaselineModal() {
    const profile = FS.getFitnessProfile();
    const currentBaseline = profile.waterBaselineMl || 2000;
    
    let html = '<h3 class="font-semibold mb-4">Изменить норму воды</h3>';
    html += '<div class="space-y-3">';
    html += '<label class="block text-sm">Дневная норма в мл</label>';
    html += '<input type="number" id="fmWaterBaseline" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + currentBaseline + '" placeholder="2000">';
    html += '<p class="text-xs opacity-70">Примеры: 1800, 2000, 2500 мл</p>';
    html += '</div>';
    html += '<div class="flex gap-3 mt-4"><button type="button" id="fmWaterBaselineCancel" class="flex-1 py-3 rounded-xl bg-white/20">Отмена</button><button type="button" id="fmWaterBaselineSave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">Сохранить</button></div>';
    
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
    // NEW: Render new supplements tracking
    fitnessRenderSupplementsTracking();
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
    
    // For editing, only show Manual mode with pre-filled values
    const isEditMode = !!editId;
    
    let html = '<h3 class="font-semibold mb-4">' + (isEditMode ? 'Редактировать приём пищи' : 'Добавить приём пищи') + '</h3>';
    
    // Mode toggle (only for new entries)
    if (!isEditMode) {
      html += '<div class="flex gap-2 mb-4">';
      html += '<button type="button" id="fmModeManual" class="flex-1 py-2 px-3 rounded-lg bg-green-500/50 text-sm font-medium">Ручной ввод</button>';
      html += '<button type="button" id="fmModeAuto" class="flex-1 py-2 px-3 rounded-lg bg-white/10 text-sm font-medium opacity-70">Авто (текст)</button>';
      html += '</div>';
    }
    
    // Manual mode content
    html += '<div id="fmManualContent" class="space-y-3">';
    html += '<label class="block text-sm">Название</label><input type="text" id="fmFoodName" class="w-full p-3 bg-white/30 rounded-xl text-white placeholder-white/70" value="' + (existing?.name ?? '') + '" placeholder="Что съели">';
    html += '<label class="block text-sm">Количество</label><input type="text" id="fmFoodAmount" class="w-full p-3 bg-white/30 rounded-xl text-white placeholder-white/70" value="' + (existing?.amount ?? '') + '" placeholder="200 г, 1 порция">';
    html += '<label class="block text-sm">Калории (опционально)</label><input type="number" id="fmFoodCalories" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.calories ?? '') + '">';
    html += '<div class="flex gap-2">';
    html += '<div class="flex-1"><label class="block text-sm">Б (опц.)</label><input type="number" id="fmFoodProtein" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.protein ?? '') + '" placeholder="0"></div>';
    html += '<div class="flex-1"><label class="block text-sm">Ж (опц.)</label><input type="number" id="fmFoodFat" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.fat ?? '') + '" placeholder="0"></div>';
    html += '<div class="flex-1"><label class="block text-sm">У (опц.)</label><input type="number" id="fmFoodCarbs" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.carbs ?? '') + '" placeholder="0"></div>';
    html += '</div>';
    html += '<label class="block text-sm">Время (примерно)</label><input type="time" id="fmFoodTime" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + defaultTime + '">';
    html += '</div>';
    
    // Auto mode content (hidden by default, only for new entries)
    if (!isEditMode) {
      html += '<div id="fmAutoContent" class="space-y-3 hidden">';
      html += '<label class="block text-sm">Текст (лучше по‑английски)</label><input type="text" id="fmFoodQuery" class="w-full p-3 bg-white/30 rounded-xl text-white placeholder-white/70" placeholder="buckwheat 200 g или гречка 200 г">';
      html += '<p class="text-xs opacity-70">Авто‑режим считает калории и БЖУ по тексту. Лучше вводить на английском (buckwheat 200 g). Русский тоже работает: гречка 200 г, творог 150 г.</p>';
      html += '<label class="block text-sm">Время (примерно)</label><input type="time" id="fmFoodTimeAuto" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + defaultTime + '">';
      html += '<div id="fmAutoError" class="text-red-300 text-sm hidden"></div>';
      html += '</div>';
    }
    
    html += '<div class="flex gap-3 mt-4"><button type="button" id="fmFoodCancel" class="flex-1 py-3 rounded-xl bg-white/20">Отмена</button><button type="button" id="fmFoodSave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">' + (isEditMode ? 'Сохранить' : 'Добавить') + '</button></div>';
    
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
              errorEl.textContent = 'Введите текст (например: buckwheat 200 g)';
              errorEl.classList.remove('hidden');
            }
            return;
          }
          
          // Show loading state
          if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Считаем...';
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
                errorEl.textContent = 'Не удалось автоматически посчитать. Попробуйте ввести по‑английски (buckwheat 200 g) или используйте ручной ввод.';
                errorEl.classList.remove('hidden');
              }
              if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Добавить';
              }
            }
          } catch (err) {
            console.error('Auto mode error:', err);
            if (errorEl) {
              errorEl.textContent = 'Ошибка соединения. Попробуйте ещё раз или используйте ручной ввод.';
              errorEl.classList.remove('hidden');
            }
            if (saveBtn) {
              saveBtn.disabled = false;
              saveBtn.textContent = 'Добавить';
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

  // ===================== NEW SUPPLEMENTS TRACKING UI =====================

  // NEW: Render new supplements tracking (today's plan + intakes)
  function fitnessRenderSupplementsTracking() {
    if (!fitnessEl.supplementsTracking) return;
    
    const dateKey = fitnessGetDateKey();
    const supplements = FS.getAllSupplements();
    
    if (supplements.length === 0) {
      fitnessEl.supplementsTracking.innerHTML = `
        <div class="text-center py-4 opacity-70">
          <p class="text-sm mb-2">Нет добавленных БАДов</p>
          <button type="button" id="addFirstSupplement" class="text-green-400 text-sm hover:underline">+ Добавить первый БАД</button>
        </div>
      `;
      document.getElementById('addFirstSupplement')?.addEventListener('click', () => fitnessOpenSupplementProfileModal());
      return;
    }
  
    let html = '';
    
    for (const supp of supplements) {
      const intakes = FS.getSupplementIntakesForDay(supp.id, dateKey);
      const totalDose = FS.getTotalDoseForDay(intakes);
      const unitLabel = supp.unit === 'табл' ? 'табл' : supp.unit;
      
      html += '<div class="bg-white/5 rounded-xl p-3 mb-3">';
      html += '<div class="flex items-center justify-between mb-2">';
      html += '<h4 class="font-semibold text-sm">' + supp.name + '</h4>';
      html += '<div class="flex gap-1">';
      html += '<button type="button" class="supp-edit-norm text-xs opacity-70" data-id="' + supp.id + '">норма</button>';
      html += '<button type="button" class="supp-history text-xs opacity-70" data-id="' + supp.id + '">история</button>';
      html += '</div></div>';
      
      html += '<p class="text-xs opacity-70 mb-2">' + supp.standardDailyDose + ' ' + unitLabel + '/день' + (supp.daily ? ' (ежедневно)' : '') + '</p>';
      
      // Show intakes
      for (const intake of intakes) {
        const doseClass = intake.edited ? 'text-yellow-300' : '';
        const checkedClass = intake.checked ? 'opacity-100' : 'opacity-50';
        
        html += '<div class="flex items-center gap-2 py-1 border-b border-white/5 last:border-0">';
        html += '<input type="checkbox" class="supp-intake-check rounded" data-supp-id="' + supp.id + '" data-intake-id="' + intake.id + '"' + (intake.checked ? ' checked' : '') + '>';
        
        if (intake.time) {
          html += '<span class="text-xs opacity-70 w-12">' + intake.time + '</span>';
        } else {
          html += '<span class="text-xs opacity-30 w-12">--:--</span>';
        }
        
        html += '<span class="flex-1 text-sm ' + doseClass + '">' + intake.dose + ' ' + unitLabel + '</span>';
        
        html += '<button type="button" class="supp-edit-intake text-xs opacity-70" data-supp-id="' + supp.id + '" data-intake-id="' + intake.id + '">✏</button>';
        html += '</div>';
      }

      // Total for today
      html += '<div class="text-xs mt-2 pt-2 border-t border-white/10">';
      html += 'Сегодня: ' + totalDose + ' ' + unitLabel + ' / ' + supp.standardDailyDose + ' ' + unitLabel;
      html += '</div>';
      
      // Add intake button
      html += '<button type="button" class="supp-add-intake w-full mt-2 py-1 text-xs bg-white/10 rounded" data-supp-id="' + supp.id + '">+ Добавить приём</button>';
      
      html += '</div>';
    }
    
    // Add new supplement button
    html += '<button type="button" id="addNewSupplement" class="w-full py-2 rounded-xl bg-green-500/30 text-sm">+ Добавить БАД</button>';
    
    fitnessEl.supplementsTracking.innerHTML = html;
    
    // Attach event listeners
    document.getElementById('addNewSupplement')?.addEventListener('click', () => fitnessOpenSupplementProfileModal());
    document.getElementById('addFirstSupplement')?.addEventListener('click', () => fitnessOpenSupplementProfileModal());
    
    // Checkbox handlers
    document.querySelectorAll('.supp-intake-check').forEach(cb => {
      cb.addEventListener('change', () => {
        const suppId = cb.dataset.suppId;
        const intakeId = cb.dataset.intakeId;
        FS.toggleSupplementIntakeChecked(suppId, dateKey, intakeId);
        fitnessRenderSupplementsTracking();
      });
    });
    
    // Edit intake handlers
    document.querySelectorAll('.supp-edit-intake').forEach(btn => {
      btn.addEventListener('click', () => {
        const suppId = btn.dataset.suppId;
        const intakeId = btn.dataset.intakeId;
        fitnessOpenIntakeEditModal(suppId, dateKey, intakeId);
      });
    });
  
    // Add intake handlers
    document.querySelectorAll('.supp-add-intake').forEach(btn => {
      btn.addEventListener('click', () => {
        const suppId = btn.dataset.suppId;
        fitnessOpenIntakeAddModal(suppId, dateKey);
      });
    });
    
    // Edit norm handlers
    document.querySelectorAll('.supp-edit-norm').forEach(btn => {
      btn.addEventListener('click', () => {
        fitnessOpenSupplementProfileModal(btn.dataset.id);
      });
    });
    
    // History handlers
    document.querySelectorAll('.supp-history').forEach(btn => {
      btn.addEventListener('click', () => {
        fitnessOpenSupplementHistoryModal(btn.dataset.id);
      });
    });
  }

  // NEW: Open modal to add/edit supplement profile
  function fitnessOpenSupplementProfileModal(editId) {
    const existing = editId ? FS.getSupplementById(editId) : null;
    
    let html = '<h3 class="font-semibold mb-4">' + (existing ? 'Редактировать БАД' : 'Добавить БАД') + '</h3>';
    html += '<div class="space-y-3">';
    html += '<label class="block text-sm">Название</label>';
    html += '<input type="text" id="suppProfileName" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.name ?? '') + '" placeholder="Креатин, Кленбутерол...">';
    
    html += '<label class="block text-sm">Единица измерения</label>';
    html += '<select id="suppProfileUnit" class="w-full p-3 bg-white/30 rounded-xl text-white">';
    html += '<option value="мг"' + (existing?.unit === 'мг' ? ' selected' : '') + '>мг</option>';
    html += '<option value="г"' + (existing?.unit === 'г' ? ' selected' : '') + '>г</option>';
    html += '<option value="табл"' + (existing?.unit === 'табл' ? ' selected' : '') + '>таблетки</option>';
    html += '</select>';
    
    html += '<label class="flex items-center gap-2 mt-2">';
    html += '<input type="checkbox" id="suppProfileDaily" class="rounded"' + (existing?.daily !== false ? ' checked' : '') + '>';
    html += '<span class="text-sm">Принимать каждый день</span></label>';
    
    html += '<label class="block text-sm mt-2">Дневная норма</label>';
    html += '<input type="number" id="suppProfileDailyDose" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.standardDailyDose ?? '1') + '" placeholder="10">';
    
    html += '<label class="block text-sm mt-2">Количество приёмов в день</label>';
    html += '<input type="number" id="suppProfileIntakesCount" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.templateIntakes?.length ?? 1) + '" min="1" max="5">';
    
    html += '<label class="block text-sm mt-2">Доза на приём (базовая)</label>';
    html += '<input type="number" id="suppProfileDefaultDose" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.templateIntakes?.[0]?.defaultDose ?? '1') + '">';
    
    if (existing) {
      html += '<button type="button" id="suppProfileDelete" class="w-full py-2 mt-2 rounded-xl bg-red-500/30 text-sm text-red-300">Удалить БАД</button>';
    }
    html += '</div>';
    
    html += '<div class="flex gap-3 mt-4">';
    html += '<button type="button" id="suppProfileCancel" class="flex-1 py-3 rounded-xl bg-white/20">Отмена</button>';
    html += '<button type="button" id="suppProfileSave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">Сохранить</button>';
    html += '</div>';
    
    fitnessOpenModal(html, () => {
      document.getElementById('suppProfileCancel')?.addEventListener('click', fitnessCloseModal);
      document.getElementById('suppProfileSave')?.addEventListener('click', () => {
        const name = document.getElementById('suppProfileName')?.value?.trim();
        const unit = document.getElementById('suppProfileUnit')?.value;
        const daily = document.getElementById('suppProfileDaily')?.checked;
        const standardDailyDose = Number(document.getElementById('suppProfileDailyDose')?.value) || 1;
        const intakesCount = Number(document.getElementById('suppProfileIntakesCount')?.value) || 1;
        const defaultDose = Number(document.getElementById('suppProfileDefaultDose')?.value) || 1;
        
        if (!name) {
          alert('Введите название БАДа');
          return;
        }
  
        // Generate template intakes
        const templateIntakes = [];
        for (let i = 0; i < intakesCount; i++) {
          templateIntakes.push({ defaultDose: defaultDose });
        }
        
        if (editId) {
          FS.updateSupplement(editId, { name, unit, daily, standardDailyDose, templateIntakes });
        } else {
          FS.createSupplement({ name, unit, daily, standardDailyDose, templateIntakes });
        }
      
        fitnessCloseModal();
        fitnessRenderSupplementsTracking();
      });
      
      document.getElementById('suppProfileDelete')?.addEventListener('click', () => {
        if (confirm('Удалить этот БАД? История приёмов будет потеряна.')) {
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
    const unit = supp?.unit || 'табл';
    
    let html = '<h3 class="font-semibold mb-4">Изменить приём</h3>';
    html += '<div class="space-y-3">';
    html += '<label class="block text-sm">Доза (' + unit + ')</label>';
    html += '<input type="number" id="intakeEditDose" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + intake.dose + '">';
    html += '<div class="flex gap-2">';
    html += '<button type="button" id="intakeEditMinus1" class="flex-1 py-2 rounded-xl bg-white/20 text-sm">−1</button>';
    html += '<button type="button" id="intakeEditPlus1" class="flex-1 py-2 rounded-xl bg-white/20 text-sm">+1</button>';
    html += '<button type="button" id="intakeEditX2" class="flex-1 py-2 rounded-xl bg-white/20 text-sm">×2</button>';
    html += '</div>';
    html += '<label class="block text-sm mt-2">Время (HH:MM)</label>';
    html += '<input type="time" id="intakeEditTime" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (intake.time || '') + '">';
    html += '</div>';
    html += '<div class="flex gap-3 mt-4">';
    html += '<button type="button" id="intakeEditDelete" class="flex-1 py-3 rounded-xl bg-red-500/30 text-red-300">Удалить</button>';
    html += '<button type="button" id="intakeEditCancel" class="flex-1 py-3 rounded-xl bg-white/20">Отмена</button>';
    html += '<button type="button" id="intakeEditSave" class="flex-1 py-3 rounded-xl bg-green-500">Сохранить</button>';
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
        
        if (!isNaN(dose) && dose >= 0) {
          FS.updateSupplementIntake(suppId, dateKey, intakeId, { dose, time });
          fitnessCloseModal();
          fitnessRenderSupplementsTracking();
        }
      });
    });
  }

  // NEW: Open modal to add new intake
  function fitnessOpenIntakeAddModal(suppId, dateKey) {
    const supp = FS.getSupplementById(suppId);
    const unit = supp?.unit || 'табл';
    const defaultDose = supp?.templateIntakes?.[0]?.defaultDose || 1;
    const currentTime = FS.formatTimeHM(new Date());
    
    let html = '<h3 class="font-semibold mb-4">Добавить приём</h3>';
    html += '<div class="space-y-3">';
    html += '<label class="block text-sm">Доза (' + unit + ')</label>';
    html += '<input type="number" id="intakeAddDose" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + defaultDose + '">';
    html += '<label class="block text-sm mt-2">Время (HH:MM)</label>';
    html += '<input type="time" id="intakeAddTime" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + currentTime + '">';
    html += '</div>';
    html += '<div class="flex gap-3 mt-4">';
    html += '<button type="button" id="intakeAddCancel" class="flex-1 py-3 rounded-xl bg-white/20">Отмена</button>';
    html += '<button type="button" id="intakeAddSave" class="flex-1 py-3 rounded-xl bg-green-500">Добавить</button>';
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
    
    const unit = supp.unit || 'табл';
    const history = supp.history || [];
    
    // Get last 14 days with data
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(FS.formatDateKey(d));
    }
    
    let html = '<h3 class="font-semibold mb-4">История: ' + supp.name + '</h3>';
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
        html += '<button type="button" class="hist-intake-edit text-xs opacity-70" data-date="' + dateKey + '" data-intake-id="' + intake.id + '">✏</button>';
        html += '</div>';
      }
      
      if (intakes.length === 0) {
        html += '<div class="text-xs opacity-50 py-1">Нет данных</div>';
      }
      
      html += '</div>';
    }
    
    html += '</div>';
    html += '<div class="flex gap-3 mt-4">';
    html += '<button type="button" id="histClose" class="flex-1 py-3 rounded-xl bg-white/20">Закрыть</button>';
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
 *      → saved immediately to gymState + localStorage on change (low-frequency settings).
 *
 * 2) Cycle card (whole cycle with all days)
 *    - structural / planning changes for the cycle (days, which are active, how active days propagate to future cycles, etc.)
 *      live in memory/runtime while editing.
 *    - "Save cycle" button:
 *      → commits the current cycle structure and plan to gymState + localStorage,
 *      → used for copying active days to future cycles, updating period progress, etc.
 *
 * 3) Day card
 *    - editing a day (adding/removing exercises, toggling "day active", etc.)
 *      updates runtime for that day while editing.
 *    - "Save day" button:
 *      → commits that day's structure/settings to gymState + localStorage.
 *    - "Day completed" checkbox + completion date:
 *      → saved immediately (no extra button) to gymState.completedWorkouts + backend DB,
 *        using "today" if no date is chosen.
 *
 * 4) Exercise card
 *    - Header (right side of exercise name):
 *      - editable working sets: setsCount, repsCount, workWeight.
 *      - when these change:
 *          → update exercise fields in gymState,
 *          → immediately persist to localStorage via gymSaveState,
 *          → immediately send to backend DB (e.g. FitnessSync.saveGymExerciseSets),
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
  const GYM_DEFAULT_GROUPS = ['Грудь + Трицепс', 'Спина + Бицепс', 'Ноги + Икры'];

  // Функция форматирования даты без года для UI (дд MMM)
  function gymFormatDateNoYear(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    } catch (e) {
      return dateStr;
    }
  }

  // Централизованная функция сохранения GYM-состояния
  // Все записи в storage должны проходить через эту функцию
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

  // Централизованная функция рендера всего GYM UI
  // Вызывает все необходимые рендер-функции
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
   // временный буфер для мастера периода
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
  
      // старый формат: cycles как массив
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
  
      // новый формат: cycles как объект
      if (data.cycles && !Array.isArray(data.cycles)) {
        Object.entries(data.cycles).forEach(([k, c]) => {
          if (!c || typeof c !== 'object') return;
          cur.cycles[k] = {
            days: c.days || {},
            groups: c.groups || {},
          };
        });
      }
  
      // гарантируем хотя бы цикл 1
      if (!Object.keys(cur.cycles).length) {
        cur.cycles[cur.currentCycle] = { days: {}, groups: {} };
      }
  
      migrated[periodId] = cur;
    });
  
    return migrated;
  }
  
  // применяем миграцию
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
  
  // Обработчик создания нового периода (кнопка "Создать период" в мастере)
  if (gymEl.periodStep2CreateBtn) {
    gymEl.periodStep2CreateBtn.addEventListener('click', () => {
      if (!gymPeriodWizardDraft) return;
      
      const periodId = gymCreatePeriodId();
      const today = new Date().toISOString().slice(0, 10);
      
      // Собираем дни из DOM (шаг 2 мастера)
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
      
      // Создаём НОВЫЙ период без наследования истории от старых периодов
      const newPeriod = {
        id: periodId,
        name: gymPeriodWizardDraft.name || 'Период',
        type: gymPeriodWizardDraft.type || 'strength',
        splitType: gymPeriodWizardDraft.splitType || 'split',
        cycleLengthDays: gymPeriodWizardDraft.cycleLengthDays || 7,
        totalCycles: gymPeriodWizardDraft.totalCycles || 8,
        workoutsPerCycle: gymPeriodWizardDraft.workoutsPerCycle || 3,
        days: days,
        startDate: today, // Устанавливаем текущую дату сразу
        // НЕ копируем никакие данные из старых периодов:
        // - нет history
        // - нет completedWorkouts
        // - нет previousPeriodData
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
      
      // Добавляем в state
      if (!gymState.periods) gymState.periods = {};
      gymState.periods[periodId] = newPeriod;
      
      if (!gymState.periodOrder) gymState.periodOrder = [];
      gymState.periodOrder.push(periodId);
      
      // Инициализируем runtime для нового периода - чистый, без данных
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
      
      // Сохраняем и рендерим
      gymPersistState();
      
      // Закрываем мастер и открываем период
      if (gymEl.periodWizardScreen) gymEl.periodWizardScreen.classList.add('hidden');
      
      // Открываем список периодов - новый период будет виден
      gymOpenPeriodsScreen();
      
      // Автоматически открываем созданный период
      gymSetActivePeriod(periodId);
      gymOpen();
    });
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
    const wpcInput = document.getElementById('gymPeriodWorkoutsPerCycle');
  
    if (cycleLenInput) cycleLenInput.value = '7';
    if (totalCyclesInput) totalCyclesInput.value = '8';
    if (customNameInput) customNameInput.value = '';
    if (wpcInput) wpcInput.value = String(gymPeriodWizardDraft.workoutsPerCycle || 3);
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
        <div class="mt-2 text-xs text-slate-300">
          <label class="block mb-1">Дата старта периода (можно переопределить)</label>
          <input type="date" class="w-full bg-white/10 rounded-lg px-2 py-1" data-role="periodStartInput" value="${p.startDate || ''}" />
          <div class="mt-2">
            <div class="text-[11px]">План: <span data-role="plannedRange">—</span></div>
            <div class="text-[11px]">Фактически: <span data-role="actualRange">—</span></div>
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
            plannedRangeEl.textContent = `${gymFormatDateNoYear(cycleStarts[1])} — ${gymFormatDateNoYear(lastEndDate.toISOString().slice(0,10))}`;
          } else plannedRangeEl.textContent = '—';
        } else {
          plannedRangeEl.textContent = '—';
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
            actualRangeEl.textContent = `${gymFormatDateNoYear(earliest)} — ${gymFormatDateNoYear(lastDates[lastDates.length-1])}`;
          } else {
            actualRangeEl.textContent = `${gymFormatDateNoYear(earliest)} — —`;
          }
        } else {
          actualRangeEl.textContent = '—';
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
                plannedRangeEl.textContent = `${gymFormatDateNoYear(cycleStarts[1])} — ${gymFormatDateNoYear(lastEndDate.toISOString().slice(0,10))}`;
              } else plannedRangeEl.textContent = '—';
            } else {
              plannedRangeEl.textContent = '—';
            }
          }
          // Re-render periods list to reflect changes
          gymRenderPeriodsList();
        });
      }
  
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
      gymEl.cycleSelect.innerHTML = '<option value="1">Цикл 1</option>';
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
      options += `<option value="${i}">Цикл ${i}</option>`;
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
    gymEl.periodInfo.textContent = period.name || 'Период';
  
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
  
    // UI-состояние сворачивания и редактирования
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
      // titleBtn.innerHTML = `
      //   <div class="text-sm font-semibold text-white">День ${day.dayIndex}</div>
      //   <div class="text-xs text-slate-300" data-role="dayMusclesView">
      //     ${
      //       day.muscles && day.muscles.length
      //         ? day.muscles.join(', ')
      //         : 'Нажми "Редактировать", чтобы выбрать группы'
      //     }
      //   </div>
      // `;
      const periodId = period.id || 'default';
      const rt = gymState.runtime?.[periodId];
      const currentCycle = rt?.currentCycle || 1;

      titleBtn.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="text-sm font-semibold text-white">День ${day.dayIndex}</div>
        </div>
        <div class="text-xs text-slate-300" data-role="dayMusclesView">
          ${
            day.muscles && day.muscles.length
              ? day.muscles.join(', ')
              : 'Нажми "Редактировать", чтобы выбрать группы'
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
              <div class="flex gap-4 text-xs text-slate-300 mb-2">
                <div>
                  <span class="text-slate-400">Подходы:</span> ${ex.setsCount || '—'}
                </div>
                <div>
                  <span class="text-slate-400">Повторения:</span> ${ex.repsCount || '—'}
                </div>
                <div>
                  <span class="text-slate-400">Вес:</span> ${ex.workWeight || '—'}
                </div>
              </div>

              <div class="flex gap-2 text-xs">
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

          // UX: "План на след цикл" - apply only on blur (when user finishes typing)
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
      opt.textContent = `${p.name} (${p.cycleLengthDays}d · ${p.totalCycles} cyc)`;
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
      gymCalendarOutput.textContent = `Дата ${dateVal} → Цикл ${res.cycleIndex}, День ${res.dayOfCycle} (дней с начала: ${res.daysSince})`;
    });
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
      if (!gymState.periodOrder || !Array.isArray(gymState.periodOrder)) gymState.periodOrder = [];
      gymState.periodOrder.push(periodId);
      // Initialize runtime fresh for the new period — do NOT reuse old runtime data
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
  
      // закрываем мастер и открываем экран периода
      if (gymEl.periodWizardScreen) gymEl.periodWizardScreen.classList.add('hidden');
      // Re-render periods list to include new period, then open the period screen
      gymOpenPeriodsScreen();
      // Automatically open the newly created period
      gymSetActivePeriod(periodId);
      gymOpen();

    });
  }
  

  // экран конкретного периода
  if (gymEl.backBtn) {
    gymEl.backBtn.addEventListener('click', gymClose);
  }
  // "Save cycle": commit current runtime structure for this cycle to gymState + localStorage.
  // IMPORTANT: Only save current cycle data - do NOT propagate to future cycles
  if (gymEl.saveBtn) {
    gymEl.saveBtn.textContent = 'Сохранить цикл';
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
      showAlert('История тренировок появится позже');
    });
  }
  
  // --- Fitness: Еда - добавление (открытие модалки) ---
  const fitnessFoodAddBtn = document.getElementById('fitnessFoodAdd');

  if (fitnessFoodAddBtn) {
    fitnessFoodAddBtn.addEventListener('click', () => {
      fitnessOpenFoodModal(null); // открываем нашу объединённую форму (ручной/авто)
    });
  }


}); // конец DOMContentLoaded
