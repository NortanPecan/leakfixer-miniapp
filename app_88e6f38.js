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
  window.currentAppUserId = null; // Р В РўвЂР В Р’В»Р РЋР РЏ fitness Р РЋР С“Р В РЎвЂР В Р вЂ¦Р РЋРІР‚В¦Р РЋР вЂљР В РЎвЂўР В Р вЂ¦Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР В РЎвЂ

  let currentUser = null;
  let currentDay = 1;
  let currentAppUserId = null; // Р В Р’ВµР В РўвЂР В РЎвЂР В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ ID Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В Р’В·Р В РЎвЂўР В Р вЂ Р В Р’В°Р РЋРІР‚С™Р В Р’ВµР В Р’В»Р РЋР РЏ Р В Р вЂ  Р В Р вЂ¦Р В Р’В°Р РЋРІвЂљВ¬Р В Р’ВµР В РЎВ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В Р’В»Р В РЎвЂўР В Р’В¶Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В РЎвЂ

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

  // Р В РЎвЂќР В РЎвЂўР РЋР вЂљР В Р вЂ¦Р В Р’ВµР В Р вЂ Р РЋРІР‚в„–Р В Р’Вµ Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦Р РЋРІР‚в„–
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
    // Р В РІР‚в„ўР В РЎСљР В Р в‚¬Р В РЎС›Р В Р’В Р В РІР‚СћР В РЎСљР В РЎСљР В Р’В®Р В Р’В® Р В РЎвЂўР РЋРІР‚РЋР В РЎвЂР РЋР С“Р РЋРІР‚С™Р В РЎвЂќР РЋРЎвЂњ Р РЋРІР‚С›Р В РЎвЂР РЋРІР‚С™Р В Р вЂ¦Р В Р’ВµР РЋР С“Р В Р’В° Р В РўвЂР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В РЎвЂР В РЎВ Р В РЎвЂ”Р В РЎвЂўР В Р’В·Р В Р’В¶Р В Р’Вµ, Р В РЎвЂќР В РЎвЂўР В РЎвЂ“Р В РўвЂР В Р’В° fitnessEl Р В Р’В±Р РЋРЎвЂњР В РўвЂР В Р’ВµР РЋРІР‚С™ Р В РЎвЂўР В Р’В±Р РЋР вЂ°Р РЋР РЏР В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦
  }

  function showBuddy() {
    if (rootScreens.main) rootScreens.main.classList.add('hidden');
    if (rootScreens.fitness) rootScreens.fitness.classList.add('hidden');
    if (rootScreens.buddy) rootScreens.buddy.classList.remove('hidden');
  }


  function setCompleteButtonState({ completed }) {
    if (!el.completeBtn) return;
    if (completed) {
      el.completeBtn.textContent = 'Р Р†РЎС™РІР‚В¦ Р В РІР‚в„ўР РЋРІР‚в„–Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂў!';
      el.completeBtn.disabled = true;
      el.completeBtn.className = 'w-full bg-green-400 py-3 rounded-xl font-semibold text-lg cursor-not-allowed';
    } else {
      el.completeBtn.textContent = 'Р Р†РЎС™РІР‚В¦ Р В РІР‚в„ўР РЋРІР‚в„–Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂў';
      el.completeBtn.disabled = false;
      el.completeBtn.className = 'w-full bg-green-500 hover:bg-green-600 py-3 rounded-xl font-semibold text-lg';
    }
  }

  function updateUI() {
    if (!currentUser) return;
    if (el.currentDay) el.currentDay.textContent = `Р В РІР‚СњР В Р’ВµР В Р вЂ¦Р РЋР Р‰ ${currentDay}/30`;
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

    // Р В РЎСџР В РЎвЂўР В РЎвЂќР В Р’В° Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂў Р В Р’В·Р В Р’В°Р В РЎвЂ“Р В Р’В»Р РЋРЎвЂњР РЋРІвЂљВ¬Р В РЎвЂќР В Р’В°-Р В Р’В°Р В Р вЂ Р В Р’В°Р РЋРІР‚С™Р В Р’В°Р РЋР вЂљ, Р В РЎвЂ”Р В РЎвЂўР В Р’В·Р В Р’В¶Р В Р’Вµ Р В РЎвЂ”Р В РЎвЂўР В РўвЂР РЋРІР‚С™Р РЋР РЏР В Р вЂ¦Р В Р’ВµР В РЎВ Р РЋР вЂљР В Р’ВµР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂўР В Р’Вµ Р РЋРІР‚С›Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂў Р РЋРІР‚РЋР В Р’ВµР РЋР вЂљР В Р’ВµР В Р’В· Bot API
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
      // 1. Р В РЎСџР В РЎвЂўР В Р’В»Р РЋРЎвЂњР РЋРІР‚РЋР В Р’В°Р В Р’ВµР В РЎВ Р РЋР С“Р В РЎвЂ”Р В РЎвЂР РЋР С“Р В РЎвЂўР В РЎвЂќ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В Р вЂ Р РЋРІР‚в„–Р РЋРІР‚РЋР В Р’ВµР В РЎвЂќ
      const habitsRes = await fetch(`${SUPABASE_URL}/rest/v1/habits?select=*`, {
        headers: { apikey: SUPABASE_KEY }
      });
      const habits = await habitsRes.json();

      if (!Array.isArray(habits) || habits.length === 0) {
        container.innerHTML = '<div class="col-span-2 text-sm opacity-70 text-center">Р В РЎСџР РЋР вЂљР В РЎвЂР В Р вЂ Р РЋРІР‚в„–Р РЋРІР‚РЋР В РЎвЂќР В РЎвЂ Р В РЎвЂ”Р В РЎвЂўР В РЎвЂќР В Р’В° Р В Р вЂ¦Р В Р’Вµ Р В РўвЂР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦Р РЋРІР‚в„–</div>';
        return;
      }

      // 2. Р В РЎСџР В РЎвЂўР В Р’В»Р РЋРЎвЂњР РЋРІР‚РЋР В Р’В°Р В Р’ВµР В РЎВ Р В Р’В»Р В РЎвЂўР В РЎвЂ“Р В РЎвЂ Р В Р вЂ Р РЋРІР‚в„–Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ Р В РЎвЂ”Р В РЎвЂў Р РЋРІР‚С™Р В Р’ВµР В РЎвЂќР РЋРЎвЂњР РЋРІР‚В°Р В Р’ВµР В РЎВР РЋРЎвЂњ Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В Р’В·Р В РЎвЂўР В Р вЂ Р В Р’В°Р РЋРІР‚С™Р В Р’ВµР В Р’В»Р РЋР вЂ№
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
          <div class="font-semibold mb-1">${habit.title || 'Р В РЎСџР РЋР вЂљР В РЎвЂР В Р вЂ Р РЋРІР‚в„–Р РЋРІР‚РЋР В РЎвЂќР В Р’В°'}</div>
          <div class="text-xs opacity-80">${doneDays} / 30</div>
        `;

        container.appendChild(el);
      });
    } catch (e) {
      container.innerHTML = '<div class="col-span-2 text-sm opacity-70 text-center">Р В РЎвЂєР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В° Р В Р’В·Р В Р’В°Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В Р’В·Р В РЎвЂќР В РЎвЂ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В Р вЂ Р РЋРІР‚в„–Р РЋРІР‚РЋР В Р’ВµР В РЎвЂќ</div>';
    }
  }

  async function initFromSupabase() {
    try {
      // 1. Р В Р’ВР РЋРІР‚В°Р В Р’ВµР В РЎВ/Р РЋР С“Р В РЎвЂўР В Р’В·Р В РўвЂР В Р’В°Р В Р’ВµР В РЎВ app_user Р В РЎвЂ”Р В РЎвЂў telegram_id
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
      // 2. Р В Р Р‹Р РЋРІР‚С™Р В Р’В°Р РЋР вЂљР РЋРЎвЂњР РЋР вЂ№ Р РЋРІР‚С™Р В Р’В°Р В Р’В±Р В Р’В»Р В РЎвЂР РЋРІР‚В Р РЋРЎвЂњ users Р В РЎВР В РЎвЂўР В Р’В¶Р В Р вЂ¦Р В РЎвЂў Р В Р вЂ Р РЋР вЂљР В Р’ВµР В РЎВР В Р’ВµР В Р вЂ¦Р В Р вЂ¦Р В РЎвЂў Р В РЎвЂР РЋР С“Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В Р’В·Р В РЎвЂўР В Р вЂ Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂќР В Р’В°Р В РЎвЂќ Р вЂ™Р’В«Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР Р‰ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР В РЎвЂ“Р РЋР вЂљР В Р’ВµР РЋР С“Р РЋР С“Р В Р’В°Р вЂ™Р’В»
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
      showAlert('Р В РЎвЂєР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В° Р В РЎвЂР В Р вЂ¦Р В РЎвЂР РЋРІР‚В Р В РЎвЂР В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР В РЎвЂ (Supabase).');
      initBrowserMode();
    }
  }


  function initBrowserMode() {
    currentUser = { telegram_id: null, username: 'browser', day: 1, streak: 0, points: 0 };
    currentDay = 1;

    if (el.lessonTitle) el.lessonTitle.textContent = 'Р В РІР‚СњР В Р’ВµР В РЎВР В РЎвЂў-Р РЋР вЂљР В Р’ВµР В Р’В¶Р В РЎвЂР В РЎВ';
    if (el.lessonDesc) el.lessonDesc.textContent = 'Р В РЎвЂєР РЋРІР‚С™Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р В РЎвЂў Р В Р вЂ  Р В Р’В±Р РЋР вЂљР В Р’В°Р РЋРЎвЂњР В Р’В·Р В Р’ВµР РЋР вЂљР В Р’Вµ. Telegram-Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р В Р’Вµ Р В Р вЂ¦Р В Р’ВµР В РўвЂР В РЎвЂўР РЋР С“Р РЋРІР‚С™Р РЋРЎвЂњР В РЎвЂ”Р В Р вЂ¦Р РЋРІР‚в„–.';
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
      if (el.lessonTitle) el.lessonTitle.textContent = `Р В РІР‚СњР В Р’ВµР В Р вЂ¦Р РЋР Р‰ ${currentDay}`;
      if (el.lessonDesc) el.lessonDesc.textContent = 'Р В Р в‚¬Р РЋР вЂљР В РЎвЂўР В РЎвЂќ Р В Р вЂ¦Р В Р’Вµ Р В Р вЂ¦Р В Р’В°Р В РІвЂћвЂ“Р В РўвЂР В Р’ВµР В Р вЂ¦.';
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
        showAlert('Р Р†РЎС™РІР‚В¦ Р В РІР‚СњР В Р’ВµР В Р вЂ¦Р РЋР Р‰ Р В Р вЂ Р РЋРІР‚в„–Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦! +10 Р В Р’В±Р В Р’В°Р В Р’В»Р В Р’В»Р В РЎвЂўР В Р вЂ ');

        if (isTelegram && tg?.MainButton) {
          try {
            tg.MainButton.setText('Р В Р Р‹Р В Р’В»Р В Р’ВµР В РўвЂР РЋРЎвЂњР РЋР вЂ№Р РЋРІР‚В°Р В РЎвЂР В РІвЂћвЂ“ Р В РўвЂР В Р’ВµР В Р вЂ¦Р РЋР Р‰ Р Р†РІР‚В РІР‚в„ў').show();
            tg.MainButton.onClick(nextDay);
          } catch (e) {
            nextDay();
          }
        } else {
          nextDay();
        }
      } catch (e) {
        showAlert('Р В РЎвЂєР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В° Р В РЎвЂ”Р РЋР вЂљР В РЎвЂ Р РЋР С“Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В РЎвЂ.');
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
    supplementsTracking: document.getElementById('fitnessSupplementsTracking'),
    modalOverlay: document.getElementById('fitnessModalOverlay'),
    modalContent: document.getElementById('fitnessModalContent'),
    workDayLabel: document.getElementById('fitnessWorkDayLabel'),
    profileEdit: document.getElementById('fitnessProfileEdit'),
    weightDate: document.getElementById('fitnessWeightDate'),
    weightValue: document.getElementById('fitnessWeightValue'),
    weightSave: document.getElementById('fitnessWeightSave'),
    weightStatus: document.getElementById('fitnessWeightStatus'),
    settingsOpen: document.getElementById('fitnessSettingsOpen'),
    settingsSummary: document.getElementById('fitnessSettingsSummary'),
  };

  const fitnessTexts = {
    en: {
      settingsSummary: (water, work, target) => `Water baseline: ${water} ml | Work profile: ${work} | Target weight: ${target}`,
      targetWeightNotSet: 'not set',
      fitnessSettingsTitle: 'Fitness Settings',
      waterBaseline: 'Water baseline (ml)',
      targetWeight: 'Target weight (kg)',
      workProfile: 'Work profile',
      cancel: 'Cancel',
      save: 'Save',
      workSedentary: 'Sedentary',
      workMixed: 'Mixed',
      workPhysical: 'Physical',
      workVariable: 'Variable',
    },
  };
  const t = (key, ...args) => {
    const value = fitnessTexts.en[key];
    return typeof value === 'function' ? value(...args) : value;
  };

  function fitnessUpdateSettingsSummary() {
    const summaryEl = fitnessEl.settingsSummary || document.getElementById('fitnessSettingsSummary');
    if (!summaryEl) return;
    const profile = FS.getFitnessProfile();
    const water = profile.waterBaselineMl || 2000;
    const targetWeight = profile.targetWeight ? `${profile.targetWeight} kg` : t('targetWeightNotSet');
    const workProfile = profile.workProfile || 'variable';
    summaryEl.textContent = t('settingsSummary', water, workProfile, targetWeight);
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
    
    // Р В РЎвЂєР В Р’В±Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В Р’В±Р В Р’В°Р РЋР вЂљР В Р’В° Р В Р’В±Р В Р’В°Р В Р’В»Р В Р’В°Р В Р вЂ¦Р РЋР С“Р В Р’В° (Р В РЎвЂ”Р В РЎвЂўР В РўвЂ Р В РЎвЂ“Р РЋР вЂљР В Р’В°Р РЋРІР‚С›Р В РЎвЂР В РЎвЂќР В РЎвЂўР В РЎВ Р В Р вЂ Р В Р’ВµР РЋР С“Р В Р’В°)
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
    
    // Р В РЎвЂ™Р В РІР‚в„ўР В РЎС›Р В РЎвЂєР В Р Р‹Р В РЎвЂєР В РўС’Р В Р’В Р В РЎвЂ™Р В РЎСљР В РІР‚СћР В РЎСљР В Р’ВР В РІР‚Сћ Р В Р вЂ  Supabase
  }

  function fitnessRenderWorkDay() {
    if (!fitnessEl.workDayLabel) return;
    const dayData = FS.getDayData(fitnessGetDateKey());
    const v = dayData.workDay;
    let text = 'Р В РЎв„ўР В Р’В°Р В РЎвЂќ Р В РЎвЂўР В Р’В±Р РЋРІР‚в„–Р РЋРІР‚РЋР В Р вЂ¦Р В РЎвЂў';
    if (v === 'low') text = 'Р В РІР‚ВР В РЎвЂўР В Р’В»Р РЋР Р‰Р РЋРІвЂљВ¬Р В Р’Вµ Р РЋР С“Р В РЎвЂР В РўвЂР В Р’ВµР В Р’В»';
    if (v === 'normal') text = 'Р В РЎвЂєР В Р’В±Р РЋРІР‚в„–Р РЋРІР‚РЋР В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р В РўвЂР В Р’ВµР В Р вЂ¦Р РЋР Р‰';
    if (v === 'high') text = 'Р В РЎвЂєР РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р РЋР Р‰ Р В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР В Р вЂ Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р В РўвЂР В Р’ВµР В Р вЂ¦Р РЋР Р‰';
    fitnessEl.workDayLabel.textContent = text;
  }

  // Р В РЎвЂєР РЋРІР‚С™Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р РЋР Р‰ Р В РўвЂР В Р’ВµР РЋРІР‚С™Р В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР вЂ№ Р РЋР РЉР В Р вЂ¦Р В Р’ВµР РЋР вЂљР В РЎвЂ“Р В РЎвЂР В РЎвЂ
  function fitnessOpenEnergyDetails() {
    const profile = FS.getFitnessProfile();
    const dayData = FS.getDayData(fitnessGetDateKey());
    const summary = FS.getCaloriesSummary(profile, dayData);
    
    // Р В РІР‚вЂќР В Р’В°Р РЋРІР‚В°Р В РЎвЂР РЋРІР‚С™Р В Р’В° Р В РЎвЂўР РЋРІР‚С™ undefined - Р В РЎвЂР РЋР С“Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В Р’В·Р РЋРЎвЂњР В Р’ВµР В РЎВ Р В Р’В·Р В Р вЂ¦Р В Р’В°Р РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ Р В РЎвЂ”Р В РЎвЂў Р РЋРЎвЂњР В РЎВР В РЎвЂўР В Р’В»Р РЋРІР‚РЋР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР вЂ№
    const eaten = summary.eaten || 0;
    const burned = summary.burned || 0;
    const balance = summary.balance || 0;
    const baseRest = summary.baseRest || 0;
    const baseWithWork = summary.baseWithWork || 0;
    const activityCal = summary.activityCal || 0;
    const workMultiplier = summary.workMultiplier || 1.2;
    
    // Р В Р’В Р В Р’В°Р РЋР С“Р РЋРІР‚РЋР РЋРІР‚ВР РЋРІР‚С™ Р В РЎвЂќР В Р’В°Р В Р’В»Р В РЎвЂўР РЋР вЂљР В РЎвЂР В РІвЂћвЂ“ Р РЋР вЂљР В Р’В°Р В Р’В±Р В РЎвЂўР РЋРІР‚С™Р РЋРІР‚в„– (Р РЋР С“ Р В Р’В·Р В Р’В°Р РЋРІР‚В°Р В РЎвЂР РЋРІР‚С™Р В РЎвЂўР В РІвЂћвЂ“ Р В РЎвЂўР РЋРІР‚С™ NaN)
    const workKcal = Math.max(0, baseWithWork - baseRest);
    
    // Р В РІР‚вЂќР В Р’В°Р В  РЎвЂ”Р  В РЎвЂўР В Р’В»Р В Р вЂ¦Р РЋР РЏР В Р’ВµР В РЎВ Р В РЎВР В РЎвЂўР В РўвЂР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂўР В Р’Вµ Р В РЎвЂўР В РЎвЂќР В Р вЂ¦Р В РЎвЂў
    document.getElementById('energyDetailsEatenTotal').textContent = eaten + ' Р В РЎвЂќР В РЎвЂќР В Р’В°Р В Р’В»';
    document.getElementById('energyDetailsBurnedTotal').textContent = burned + ' Р В РЎвЂќР В РЎвЂќР В Р’В°Р В Р’В»';
    document.getElementById('energyDetailsBalance').textContent = balance + ' Р В РЎвЂќР В РЎвЂќР В Р’В°Р В Р’В»';
    document.getElementById('energyDetailsBaseRest').textContent = baseRest + ' Р В РЎвЂќР В РЎвЂќР В Р’В°Р В Р’В»';
    document.getElementById('energyDetailsWork').textContent = workKcal + ' Р В РЎвЂќР В РЎвЂќР В Р’В°Р В Р’В»';
    document.getElementById('energyDetailsActivity').textContent = activityCal + ' Р В РЎвЂќР В РЎвЂќР В Р’В°Р В Р’В»';
    
    // Р В РЎС›Р В РЎвЂР В РЎвЂ” Р РЋР вЂљР В Р’В°Р В Р’В±Р В РЎвЂўР РЋРІР‚С™Р РЋРІР‚в„– Р В РЎвЂ Р В РўвЂР В Р вЂ¦Р РЋР РЏ
    const workProfileLabels = { sedentary: 'Р В Р Р‹Р В РЎвЂР В РўвЂР РЋР РЏР РЋРІР‚РЋР В Р’В°Р РЋР РЏ', mixed: 'Р В РЎСљР В Р’В° Р В Р вЂ¦Р В РЎвЂўР В РЎвЂ“Р В Р’В°Р РЋРІР‚В¦', physical: 'Р В Р’В¤Р В РЎвЂР В Р’В·Р В РЎвЂР РЋРІР‚РЋР В Р’ВµР РЋР С“Р В РЎвЂќР В Р’В°Р РЋР РЏ', variable: 'Р В РЎС™Р В Р’ВµР В Р вЂ¦Р РЋР РЏР В Р’ВµР РЋРІР‚С™Р РЋР С“Р РЋР РЏ' };
    const workDayLabels = { none: 'Р В РЎСљР В Р’Вµ Р РЋР вЂљР В Р’В°Р В Р’В±Р В РЎвЂўР РЋРІР‚С™Р В Р’В°Р В Р’В»', low: 'Р В РІР‚ВР В РЎвЂўР В Р’В»Р РЋР Р‰Р РЋРІвЂљВ¬Р В Р’Вµ Р РЋР С“Р В РЎвЂР В РўвЂР В Р’ВµР В Р’В»', normal: 'Р В РЎвЂєР В Р’В±Р РЋРІР‚в„–Р РЋРІР‚РЋР В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“', high: 'Р В РЎвЂєР РЋРІР‚РЋР В Р’ВµР В Р вЂ¦Р РЋР Р‰ Р В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР В Р вЂ Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“' };
    document.getElementById('energyDetailsWorkProfile').textContent = workProfileLabels[profile.workProfile] || 'Р Р†Р вЂљРІР‚Сњ';
    document.getElementById('energyDetailsWorkDay').textContent = workDayLabels[dayData.workDay] || 'Р В РЎвЂєР В Р’В±Р РЋРІР‚в„–Р РЋРІР‚РЋР В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“';
    
    // Р В Р Р‹Р В РЎвЂ”Р В РЎвЂР РЋР С“Р В РЎвЂўР В РЎвЂќ Р В Р’ВµР В РўвЂР РЋРІР‚в„–
    const eatenList = document.getElementById('energyDetailsEatenList');
    if (dayData.foods && dayData.foods.length > 0) {
      eatenList.innerHTML = dayData.foods.map(function(f) { 
        return '<div class="flex justify-between bg-white/5 rounded px-2 py-1"><span>' + (f.name || 'Р В РІР‚СћР В РўвЂР В Р’В°') + '</span><span>' + (f.calories || 0) + ' Р В РЎвЂќР В РЎвЂќР В Р’В°Р В Р’В»</span></div>';
      }).join('');
    } else {
      eatenList.innerHTML = '<div class="opacity-50 text-center py-2">Р В РЎСљР В Р’ВµР РЋРІР‚С™ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р В РЎвЂР РЋР С“Р В Р’ВµР В РІвЂћвЂ“ Р В РЎвЂў Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР РЋРІР‚ВР В РЎВР В Р’В°Р РЋРІР‚В¦ Р В РЎвЂ”Р В РЎвЂР РЋРІР‚В°Р В РЎвЂ</div>';
    }
    
    // Р В РЎС›Р В Р’ВµР В РЎвЂќР РЋР С“Р РЋРІР‚С™ Р В Р’В±Р В Р’В°Р В Р’В»Р В Р’В°Р В Р вЂ¦Р РЋР С“Р В Р’В°
    const balanceText = document.getElementById('energyDetailsBalanceText');
    if (balance > 0) {
      balanceText.textContent = 'Р В РЎСџР РЋР вЂљР В РЎвЂўР РЋРІР‚С›Р В РЎвЂР РЋРІР‚В Р В РЎвЂР РЋРІР‚С™ Р Р†Р вЂљРІР‚Сњ Р В Р вЂ Р В РЎвЂўР В Р’В·Р В РЎВР В РЎвЂўР В Р’В¶Р В Р’ВµР В Р вЂ¦ Р В Р вЂ¦Р В Р’В°Р В Р’В±Р В РЎвЂўР РЋР вЂљ Р В Р вЂ Р В Р’ВµР РЋР С“Р В Р’В°';
      balanceText.className = 'text-xs text-red-300 mt-1 text-center';
    } else if (balance < 0) {
      balanceText.textContent = 'Р В РІР‚СњР В Р’ВµР РЋРІР‚С›Р В РЎвЂР РЋРІР‚В Р В РЎвЂР РЋРІР‚С™ Р Р†Р вЂљРІР‚Сњ Р В Р вЂ Р В РЎвЂўР В Р’В·Р В РЎВР В РЎвЂўР В Р’В¶Р В Р вЂ¦Р В Р’В° Р В РЎвЂ”Р В РЎвЂўР РЋРІР‚С™Р В Р’ВµР РЋР вЂљР РЋР РЏ Р В Р вЂ Р В Р’ВµР РЋР С“Р В Р’В°';
      balanceText.className = 'text-xs text-green-300 mt-1 text-center';
    } else {
      balanceText.textContent = 'Р В РЎСљР В Р’ВµР В РІвЂћвЂ“Р РЋРІР‚С™Р РЋР вЂљР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р В Р’В±Р В Р’В°Р В Р’В»Р В Р’В°Р В Р вЂ¦Р РЋР С“';
      balanceText.className = 'text-xs opacity-70 mt-1 text-center';
    }
    
    // Р В РЎСџР В РЎвЂўР В РЎвЂќР В Р’В°Р В Р’В·Р РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р В РЎВР В РЎвЂўР В РўвЂР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂўР В Р’Вµ Р В РЎвЂўР В РЎвЂќР В Р вЂ¦Р В РЎвЂў
    document.getElementById('energyDetailsModalOverlay').classList.remove('hidden');
  }

  function fitnessRenderDate() {
    if (fitnessEl.dateLabel) fitnessEl.dateLabel.textContent = FS.formatDateLocal(fitnessSelectedDate);
  }

  function fitnessApplyEnglishUILabels() {
    const addMealBtn = document.getElementById('fitnessFoodAdd');
    if (addMealBtn) addMealBtn.textContent = 'Add meal';

    const waterAdjustBtn = document.querySelector('.fitness-water-adjust');
    if (waterAdjustBtn) waterAdjustBtn.textContent = 'Adjust for today';

    const waterBaselineBtn = document.querySelector('.fitness-water-baseline');
    if (waterBaselineBtn) waterBaselineBtn.textContent = 'Edit baseline';

    const settingsOpenBtn = document.getElementById('fitnessSettingsOpen');
    if (settingsOpenBtn) settingsOpenBtn.textContent = 'Open Fitness Settings';

    const backFixedBtn = document.getElementById('fitnessBackInDashboardFixed');
    if (backFixedBtn) backFixedBtn.textContent = 'Back';
  }

  function fitnessRenderActivityList() {
    if (!fitnessEl.activityList) return;
    const dayData = FS.getDayData(fitnessGetDateKey());
    const items = FS.getActivityListViewModel(dayData.activities);
    const empty = '<li class="opacity-70 text-sm">Р В РЎСљР В Р’ВµР РЋРІР‚С™ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р В РЎвЂР РЋР С“Р В Р’ВµР В РІвЂћвЂ“</li>';
    fitnessEl.activityList.innerHTML = items.length
      ? items.map((item) => `<li class="flex items-center justify-between py-2 border-b border-white/10">
        <span>${item.label}</span>
        <span>
          <button type="button" class="fitness-activity-edit mr-2 text-xs opacity-80" data-id="${item.id}">Р В РЎвЂР В Р’В·Р В РЎВ</button>
          <button type="button" class="fitness-activity-delete text-xs opacity-80 text-red-300" data-id="${item.id}">Р РЋРЎвЂњР В РўвЂР В Р’В»</button>
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
    const empty = '<li class="opacity-70 text-sm">Р В РЎСљР В Р’ВµР РЋРІР‚С™ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р В РЎвЂР РЋР С“Р В Р’ВµР В РІвЂћвЂ“</li>';
    fitnessEl.foodList.innerHTML = items.length
      ? items.map((item) => `<li class="flex items-center justify-between py-2 border-b border-white/10">
            <span>
              ${item.timeText ? `<span class="opacity-70 mr-1">${item.timeText}</span>` : ''}
              ${item.name} ${item.amount ? item.amount + ' ' : ''}${item.caloriesText ? 'Р Р†Р вЂљРЎС› ' + item.caloriesText : ''}
              ${item.macrosText ? `<span class="text-xs opacity-70 ml-1">(${item.macrosText})</span>` : ''}
            </span>
            <span>
              <button type="button" class="fitness-food-edit mr-2 text-xs opacity-80" data-id="${item.id}">Р В РЎвЂР В Р’В·Р В РЎВ</button>
              <button type="button" class="fitness-food-delete text-xs opacity-80 text-red-300" data-id="${item.id}">Р РЋРЎвЂњР В РўвЂР В Р’В»</button>
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
    fitnessEl.waterTotal.textContent = `${currentLiters} / ${targetLiters} Р В Р’В»`;
    
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
  }

  // NEW: Adjust water by delta ml
  function fitnessAdjustWater(deltaMl) {
    const dateKey = fitnessGetDateKey();
    FS.adjustWater(dateKey, deltaMl);
    fitnessRenderWater();
  }

  // NEW: Open modal to manually adjust water
  function fitnessOpenWaterAdjustModal() {
    let html = '<h3 class="font-semibold mb-4">Adjust water</h3>';
    html += '<div class="space-y-3">';
    html += '<label class="block text-sm">Change amount (ml)</label>';
    html += '<input type="number" id="fmWaterDelta" class="w-full p-3 bg-white/30 rounded-xl text-white" placeholder="Example: -200 or +500">';
    html += '<p class="text-xs opacity-70">Positive value adds water, negative value subtracts water for the selected day.</p>';
    html += '</div>';
    html += '<div class="flex gap-3 mt-4"><button type="button" id="fmWaterAdjustCancel" class="flex-1 py-3 rounded-xl bg-white/20">Cancel</button><button type="button" id="fmWaterAdjustSave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">Save</button></div>';

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
// Dedicated modal for fitness-only configuration
  function fitnessOpenWaterBaselineModal() {
    const profile = FS.getFitnessProfile();
    const currentBaseline = profile.waterBaselineMl || 2000;
    const currentTargetWeight = profile.targetWeight ?? '';
    const currentWork = profile.workProfile || 'variable';

    let html = `<h3 class="font-semibold mb-4">${t('fitnessSettingsTitle')}</h3>`;
    html += '<div class="space-y-3">';
    html += `<label class="block text-sm">${t('waterBaseline')}</label>`;
    html += `<input type="number" id="fmWaterBaseline" class="w-full p-3 bg-white/30 rounded-xl text-white" value="${currentBaseline}" placeholder="2000">`;
    html += `<label class="block text-sm">${t('targetWeight')}</label>`;
    html += `<input type="number" id="fmTargetWeight" class="w-full p-3 bg-white/30 rounded-xl text-white" value="${currentTargetWeight}" placeholder="70">`;
    html += `<label class="block text-sm">${t('workProfile')}</label>`;
    html += '<select id="fmWorkProfile" class="w-full p-3 bg-white/30 rounded-xl text-white">';
    html += `<option value="sedentary"${currentWork === 'sedentary' ? ' selected' : ''}>${t('workSedentary')}</option>`;
    html += `<option value="mixed"${currentWork === 'mixed' ? ' selected' : ''}>${t('workMixed')}</option>`;
    html += `<option value="physical"${currentWork === 'physical' ? ' selected' : ''}>${t('workPhysical')}</option>`;
    html += `<option value="variable"${currentWork === 'variable' ? ' selected' : ''}>${t('workVariable')}</option>`;
    html += '</select>';
    html += '</div>';
    html += `<div class="flex gap-3 mt-4"><button type="button" id="fmWaterBaselineCancel" class="flex-1 py-3 rounded-xl bg-white/20">${t('cancel')}</button><button type="button" id="fmWaterBaselineSave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">${t('save')}</button></div>`;

    fitnessOpenModal(html, () => {
      fitnessEl.modalOverlay.querySelector('#fmWaterBaselineCancel')?.addEventListener('click', fitnessCloseModal);
      fitnessEl.modalOverlay.querySelector('#fmWaterBaselineSave')?.addEventListener('click', () => {
        const baselineInput = Number(document.getElementById('fmWaterBaseline')?.value);
        const targetWeightInput = Number(document.getElementById('fmTargetWeight')?.value);
        const workProfileInput = document.getElementById('fmWorkProfile')?.value || 'variable';

        if (!Number.isNaN(baselineInput) && baselineInput > 0) {
          profile.waterBaselineMl = baselineInput;
        }
        profile.workProfile = workProfileInput;
        profile.targetWeight = !Number.isNaN(targetWeightInput) && targetWeightInput > 0 ? targetWeightInput : null;
        FS.setFitnessProfile(profile);

        const dateKey = fitnessGetDateKey();
        const dayData = FS.getDayData(dateKey);
        if (dayData.water) {
          FS.updateDayData(dateKey, {
            water: {
              targetMl: profile.waterBaselineMl || currentBaseline,
              currentMl: dayData.water.currentMl || 0,
            },
          });
        }

        fitnessCloseModal();
        fitnessRenderWater();
        fitnessRenderCalories();
        fitnessUpdateSettingsSummary();
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
    chartContainer.innerHTML = '<div class="flex items-center justify-center h-full text-xs opacity-50">Р В РІР‚вЂќР В Р’В°Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В Р’В·Р В РЎвЂќР В Р’В°...</div>';
    
    if (!window.FitnessSync || !window.currentAppUserId) {
      chartContainer.innerHTML = '<div class="flex items-center justify-center h-full text-xs opacity-50">Р В РЎСљР В Р’ВµР РЋРІР‚С™ Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦</div>';
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
            <span class="text-xs opacity-70 mb-2">РЎР‚РЎСџРІР‚СљР вЂ° Р В РЎСџР В РЎвЂўР В РЎвЂќР В Р’В° Р В Р вЂ¦Р В Р’ВµР РЋРІР‚С™ Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В РЎвЂ”Р В РЎвЂў Р В Р вЂ Р В Р’ВµР РЋР С“Р РЋРЎвЂњ</span>
            <button type="button" id="weightChartAddBtn" class="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-sm font-medium">
              + Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В Р вЂ Р В Р’ВµР РЋР С“
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
      chartContainer.innerHTML = '<div class="flex items-center justify-center h-full text-xs opacity-50">Р В РЎвЂєР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В° Р В Р’В·Р В Р’В°Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В Р’В·Р В РЎвЂќР В РЎвЂ</div>';
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
        ${currentWeight > 0 ? currentWeight.toFixed(1) + ' Р В РЎвЂќР В РЎвЂ“' : 'Р Р†Р вЂљРІР‚Сњ'}
      </div>
    `;
    chartContainer.style.position = 'relative';
  }

  function fitnessRenderDashboard() {
    fitnessApplyEnglishUILabels();
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
    fitnessRenderWorkDay();
    
    // Р В РІР‚вЂќР В Р’В°Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В Р’В·Р В РЎвЂќР В Р’В° Р РЋР С“Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р РЋРІР‚ВР В Р вЂ¦Р В Р вЂ¦Р В РЎвЂўР В РЎвЂ“Р В РЎвЂў Р РЋРІР‚С›Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂў Р В РўвЂР В Р’В»Р РЋР РЏ Р РЋРІР‚С™Р В Р’ВµР В РЎвЂќР РЋРЎвЂњР РЋРІР‚В°Р В Р’ВµР В РІвЂћвЂ“ Р В РўвЂР В Р’В°Р РЋРІР‚С™Р РЋРІР‚в„–
    if (typeof fitnessLoadSavedPhoto === 'function') {
      fitnessLoadSavedPhoto();
    }
    
    // Р В Р’ВР В Р вЂ¦Р В РЎвЂР РЋРІР‚В Р В РЎвЂР В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ Р РЋР С“Р В Р вЂ Р В РЎвЂўР РЋР вЂљР В Р’В°Р РЋРІР‚РЋР В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВР РЋРІР‚в„–Р РЋРІР‚В¦ Р В РЎвЂќР В Р’В°Р РЋР вЂљР РЋРІР‚С™Р В РЎвЂўР РЋРІР‚РЋР В Р’ВµР В РЎвЂќ
    fitnessInitCollapsibleCards();
    // Р В РЎвЂєР В Р’В±Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎВР В РЎвЂР В Р вЂ¦Р В РЎвЂ-Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В Р вЂ  Р РЋРІвЂљВ¬Р В Р’В°Р В РЎвЂ”Р В РЎвЂќР В Р’В°Р РЋРІР‚В¦
    fitnessUpdateCardSummaries();
    // Р В Р Р‹Р В Р вЂ Р В РЎвЂўР РЋР вЂљР В Р’В°Р РЋРІР‚РЋР В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВ Р В Р вЂ Р РЋР С“Р В Р’Вµ Р В РЎвЂќР В Р’В°Р РЋР вЂљР РЋРІР‚С™Р В РЎвЂўР РЋРІР‚РЋР В РЎвЂќР В РЎвЂ Р В РЎвЂ”Р В РЎвЂў Р РЋРЎвЂњР В РЎВР В РЎвЂўР В Р’В»Р РЋРІР‚РЋР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР вЂ№ (Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В Р вЂ Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р РЋРЎвЂњР РЋР С“Р В РЎвЂќ)
    if (!window.fitnessCardsInitiallyCollapsed) {
      window.fitnessCardsInitiallyCollapsed = true;
      fitnessCollapseAllCards();
    }
  }

  // ========== Р В Р Р‹Р В РІР‚в„ўР В РЎвЂєР В Р’В Р В РЎвЂ™Р В Р’В§Р В Р’ВР В РІР‚в„ўР В РЎвЂ™Р В РІР‚СћР В РЎС™Р В Р’В«Р В РІР‚Сћ Р В РЎв„ўР В РЎвЂ™Р В Р’В Р В РЎС›Р В РЎвЂєР В Р’В§Р В РЎв„ўР В Р’В ==========
  
  // Р В Р’ВР В Р вЂ¦Р В РЎвЂР РЋРІР‚В Р В РЎвЂР В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ Р В РЎвЂўР В Р’В±Р РЋР вЂљР В Р’В°Р В Р’В±Р В РЎвЂўР РЋРІР‚С™Р РЋРІР‚РЋР В РЎвЂР В РЎвЂќР В РЎвЂўР В Р вЂ  Р В РЎвЂќР В Р’В»Р В РЎвЂР В РЎвЂќР В РЎвЂўР В Р вЂ  Р В РўвЂР В Р’В»Р РЋР РЏ Р РЋР С“Р В Р вЂ Р В РЎвЂўР РЋР вЂљР В Р’В°Р РЋРІР‚РЋР В РЎвЂР В Р вЂ Р В Р’В°Р В Р’ВµР В РЎВР РЋРІР‚в„–Р РЋРІР‚В¦ Р В РЎвЂќР В Р’В°Р РЋР вЂљР РЋРІР‚С™Р В РЎвЂўР РЋРІР‚РЋР В Р’ВµР В РЎвЂќ
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
        fitnessOpenEnergyDetails();
      });
    }
  }
  
  // Р В РЎвЂєР В Р’В±Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РЎВР В РЎвЂР В Р вЂ¦Р В РЎвЂ-Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦ Р В Р вЂ  Р РЋРІвЂљВ¬Р В Р’В°Р В РЎвЂ”Р В РЎвЂќР В Р’В°Р РЋРІР‚В¦ Р В Р вЂ Р РЋР С“Р В Р’ВµР РЋРІР‚В¦ Р В РЎвЂќР В Р’В°Р РЋР вЂљР РЋРІР‚С™Р В РЎвЂўР РЋРІР‚РЋР В Р’ВµР В РЎвЂќ
  function fitnessUpdateCardSummaries() {
    fitnessUpdateEnergyMiniSummary();
    fitnessUpdateActivityMiniSummary();
    fitnessUpdateSupportMiniSummary();
  }
  
  // Р В РЎС™Р В РЎвЂР В Р вЂ¦Р В РЎвЂ-Р РЋРІвЂљВ¬Р В РЎвЂќР В Р’В°Р В Р’В»Р В Р’В° Р В Р’В±Р В Р’В°Р В Р’В»Р В Р’В°Р В Р вЂ¦Р РЋР С“Р В Р’В° Р В Р вЂ  Р РЋРІвЂљВ¬Р В Р’В°Р В РЎвЂ”Р В РЎвЂќР В Р’Вµ "Р В Р’В­Р В Р вЂ¦Р В Р’ВµР РЋР вЂљР В РЎвЂ“Р В РЎвЂР РЋР РЏ Р РЋРІР‚С™Р В Р’ВµР В Р’В»Р В Р’В°"
  function fitnessUpdateEnergyMiniSummary() {
    const dateKey = fitnessGetDateKey();
    const dayData = FS.getDayData(dateKey);
    const profile = FS.getFitnessProfile();
    const summary = FS.getCaloriesSummary(profile, dayData);
    
    const miniFill = document.getElementById('energyMiniBalanceFill');
    const miniText = document.getElementById('energyMiniBalanceText');
    
    if (miniFill && miniText) {
      const balance = summary.balance || 0;
      const MAX_ABS_BALANCE = 1000; // Р В РЎС™Р В Р’В°Р В РЎвЂќР РЋР С“Р В РЎвЂР В РЎВР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂўР В Р’В±Р РЋР вЂљР В Р’В°Р В Р’В¶Р В Р’В°Р В Р’ВµР В РЎВР РЋРІР‚в„–Р В РІвЂћвЂ“ Р В Р’В±Р В Р’В°Р В Р’В»Р В Р’В°Р В Р вЂ¦Р РЋР С“
      
      // Р В РЎСљР В РЎвЂўР РЋР вЂљР В РЎВР В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р РЋРЎвЂњР В Р’ВµР В РЎВ: 0 = Р РЋРІР‚В Р В Р’ВµР В Р вЂ¦Р РЋРІР‚С™Р РЋР вЂљ, -1000 = Р В Р’В»Р В Р’ВµР В Р вЂ Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р В РЎвЂќР РЋР вЂљР В Р’В°Р В РІвЂћвЂ“, +1000 = Р В РЎвЂ”Р РЋР вЂљР В Р’В°Р В Р вЂ Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р В РЎвЂќР РЋР вЂљР В Р’В°Р В РІвЂћвЂ“
      const normalizedBalance = Math.max(-MAX_ABS_BALANCE, Math.min(MAX_ABS_BALANCE, balance));
      const percentFromCenter = (normalizedBalance / MAX_ABS_BALANCE) * 50; // 0-50%
      
      if (balance <= 0) {
        // Р В РІР‚СњР В Р’ВµР РЋРІР‚С›Р В РЎвЂР РЋРІР‚В Р В РЎвЂР РЋРІР‚С™ - Р В Р’В·Р В Р’В°Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В Р вЂ Р В Р’В»Р В Р’ВµР В Р вЂ Р В РЎвЂў Р В РЎвЂўР РЋРІР‚С™ Р РЋРІР‚В Р В Р’ВµР В Р вЂ¦Р РЋРІР‚С™Р РЋР вЂљР В Р’В°
        miniFill.style.left = (50 - percentFromCenter) + '%';
        miniFill.style.width = percentFromCenter + '%';
        miniFill.className = 'fitness-mini-balance-fill bg-green-400';
      } else {
        // Р В РЎСџР РЋР вЂљР В РЎвЂўР РЋРІР‚С›Р В РЎвЂР РЋРІР‚В Р В РЎвЂР РЋРІР‚С™ - Р В Р’В·Р В Р’В°Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В Р вЂ Р В РЎвЂ”Р РЋР вЂљР В Р’В°Р В Р вЂ Р В РЎвЂў Р В РЎвЂўР РЋРІР‚С™ Р РЋРІР‚В Р В Р’ВµР В Р вЂ¦Р РЋРІР‚С™Р РЋР вЂљР В Р’В°
        miniFill.style.left = '50%';
        miniFill.style.width = percentFromCenter + '%';
        miniFill.className = 'fitness-mini-balance-fill bg-red-400';
      }
      
      // Р В РЎС›Р В Р’ВµР В РЎвЂќР РЋР С“Р РЋРІР‚С™
      const sign = balance >= 0 ? '+' : '';
      miniText.textContent = sign + balance;
      miniText.className = 'text-[10px] font-medium ' + (balance >= 0 ? 'text-red-300' : 'text-green-300');
    }
  }
  
  // Р В РЎС™Р В РЎвЂР В Р вЂ¦Р В РЎвЂ-Р РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В РЎвЂќР В Р’В° Р В РЎвЂ Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В РЎвЂўР РЋР С“Р В РЎвЂќР В РЎвЂ Р В Р вЂ  Р РЋРІвЂљВ¬Р В Р’В°Р В РЎвЂ”Р В РЎвЂќР В Р’Вµ "Р В РЎвЂ™Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР В Р вЂ Р В Р вЂ¦Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р РЋР Р‰"
  function fitnessUpdateActivityMiniSummary() {
    const dateKey = fitnessGetDateKey();
    const dayData = FS.getDayData(dateKey);
    const activities = dayData.activities || [];
    
    // Р В РЎСџР В РЎвЂўР В РўвЂР РЋР С“Р РЋРІР‚РЋР РЋРІР‚ВР РЋРІР‚С™ Р В РЎвЂ”Р В РЎвЂў Р РЋРІР‚С™Р В РЎвЂР В РЎвЂ”Р В Р’В°Р В РЎВ
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
    
    // Р В РЎвЂєР В Р’В±Р РЋРІР‚В°Р В Р’ВµР В Р’Вµ Р В РЎвЂќР В РЎвЂўР В Р’В»Р В РЎвЂР РЋРІР‚РЋР В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ Р В РЎвЂў
    const totalCalories = totals.gym.calories + totals.cardio.calories + totals.home.calories + totals.steps.calories;
    const totalSessions = activities.length;
    
    // Р В РЎвЂєР В Р’В±Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР В РЎВ Р РЋРІР‚С™Р В Р’ВµР В РЎвЂќР РЋР С“Р РЋРІР‚С™
    const summaryEl = document.getElementById('activityMiniSummary');
    if (summaryEl) {
      summaryEl.textContent = `${totalSessions} Р В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР В Р вЂ Р В Р вЂ¦Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В Р’ВµР В РІвЂћвЂ“ Р вЂ™Р’В· ${totalCalories} Р В РЎвЂќР В РЎвЂќР В Р’В°Р В Р’В»`;
    }
    
    // Р В РЎвЂєР В Р’В±Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР В РЎВ Р В РЎВР В РЎвЂР В Р вЂ¦Р В РЎвЂ-Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р В РЎвЂўР РЋР С“Р В РЎвЂќР В РЎвЂ
    const maxCalories = Math.max(totalCalories, 1); // Р В РЎвЂР В Р’В·Р В Р’В±Р В Р’ВµР В РЎвЂ“Р В Р’В°Р В Р’ВµР В РЎВ Р В РўвЂР В Р’ВµР В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ Р В Р вЂ¦Р В Р’В° 0
    
    const stripGym = document.getElementById('miniStripGym');
    const stripCardio = document.getElementById('miniStripCardio');
    const stripHome = document.getElementById('miniStripHome');
    const stripSteps = document.getElementById('miniStripSteps');
    
    if (stripGym) stripGym.style.width = (totals.gym.calories / maxCalories * 60) + 'px';
    if (stripCardio) stripCardio.style.width = (totals.cardio.calories / maxCalories * 60) + 'px';
    if (stripHome) stripHome.style.width = (totals.home.calories / maxCalories * 60) + 'px';
    if (stripSteps) stripSteps.style.width = (totals.steps.calories / maxCalories * 60) + 'px';
  }
  
  // Р В РЎС™Р В РЎвЂР В Р вЂ¦Р В РЎвЂ-Р РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В РЎвЂќР В Р’В° Р В Р вЂ  Р РЋРІвЂљВ¬Р В Р’В°Р В РЎвЂ”Р В РЎвЂќР В Р’Вµ "Р В РЎСџР В РЎвЂўР В РўвЂР В РўвЂР В Р’ВµР РЋР вЂљР В Р’В¶Р В РЎвЂќР В Р’В° Р РЋРІР‚С™Р В Р’ВµР В Р’В»Р В Р’В°"
  function fitnessUpdateSupportMiniSummary() {
    const dateKey = fitnessGetDateKey();
    const dayData = FS.getDayData(dateKey);
    const profile = FS.getFitnessProfile();
    
    // Р В РІР‚СћР В РўвЂР В Р’В°
    const foods = dayData.foods || [];
    const totalEaten = foods.reduce((sum, f) => sum + (f.calories || 0), 0);
    
    // Р В РІР‚в„ўР В РЎвЂўР В РўвЂР В Р’В°
    const waterData = FS.getWaterData(dateKey);
    const waterCurrent = (waterData.currentMl || 0) / 1000;
    const waterTarget = (waterData.targetMl || profile.waterBaselineMl || 2000) / 1000;
    
    // Р В РІР‚ВР В РЎвЂ™Р В РІР‚СњР РЋРІР‚в„–
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
    
    // Р В РЎвЂєР В Р’В±Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР В РЎВ Р РЋРІР‚С™Р В Р’ВµР В РЎвЂќР РЋР С“Р РЋРІР‚С™
    const summaryEl = document.getElementById('supportMiniSummary');
    if (summaryEl) {
      const waterClass = waterCurrent >= waterTarget ? 'text-emerald-300' : 'text-white';
      const suppClass = suppTaken >= suppPlanned && suppPlanned > 0 ? 'text-emerald-300' : (suppTaken < suppPlanned ? 'text-amber-300' : 'text-white');
      
      summaryEl.innerHTML = `Р В РІР‚СћР В РўвЂР В Р’В°: ${totalEaten} Р В РЎвЂќР В РЎвЂќР В Р’В°Р В Р’В» Р вЂ™Р’В· <span class="${waterClass}">Р В РІР‚в„ўР В РЎвЂўР В РўвЂР В Р’В°: ${waterCurrent.toFixed(1)} / ${waterTarget.toFixed(1)} Р В Р’В»</span> Р вЂ™Р’В· <span class="${suppClass}">Р В РІР‚ВР В РЎвЂ™Р В РІР‚СњР РЋРІР‚в„–: ${suppTaken} / ${suppPlanned}</span>`;
    }
  }

  // ========== WEIGHT DETAIL SCREEN ==========
  
  window.fitnessOpenWeightDetailScreen = async function() {
    let html = '<div class="space-y-4">';
    html += '<div class="flex items-center justify-between">';
    html += '<h3 class="font-semibold text-lg">Р В РІР‚в„ўР В Р’ВµР РЋР С“</h3>';
    html += '<button type="button" id="weightDetailClose" class="text-xs px-3 py-1 rounded-full bg-white/20">Р В РІР‚вЂќР В Р’В°Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р РЋР Р‰</button>';
    html += '</div>';
    
    // Period selector
    html += '<div class="flex gap-2 text-xs">';
    html += '<button type="button" class="weight-period-btn flex-1 py-2 rounded-lg bg-white/10" data-days="7">7 Р В РўвЂР В Р вЂ¦Р В Р’ВµР В РІвЂћвЂ“</button>';
    html += '<button type="button" class="weight-period-btn flex-1 py-2 rounded-lg bg-green-500/50" data-days="30">30 Р В РўвЂР В Р вЂ¦Р В Р’ВµР В РІвЂћвЂ“</button>';
    html += '<button type="button" class="weight-period-btn flex-1 py-2 rounded-lg bg-white/10" data-days="90">90 Р В РўвЂР В Р вЂ¦</button>';
    html += '<button type="button" class="weight-period-btn flex-1 py-2 rounded-lg bg-white/10" data-days="365">Р В РІР‚в„ўР РЋР С“Р РЋРІР‚В</button>';
    html += '</div>';
    
    // Stats section
    html += '<div class="bg-white/10 rounded-xl p-3">';
    html += '<div class="grid grid-cols-3 gap-2 text-center text-xs">';
    html += '<div><div class="opacity-70">Р В РЎС›Р В Р’ВµР В РЎвЂќР РЋРЎвЂњР РЋРІР‚В°Р В РЎвЂР В РІвЂћвЂ“</div><div id="weightCurrent" class="text-lg font-semibold mt-1">Р Р†Р вЂљРІР‚Сњ</div></div>';
    html += '<div><div class="opacity-70">Р В Р’В¦Р В Р’ВµР В Р’В»Р РЋР Р‰</div><div id="weightGoal" class="text-lg font-semibold mt-1">Р Р†Р вЂљРІР‚Сњ</div></div>';
    html += '<div><div class="opacity-70">Р В РЎС›Р РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РўвЂ</div><div id="weightTrend" class="text-lg font-semibold mt-1">Р Р†Р вЂљРІР‚Сњ</div></div>';
    html += '</div>';
    html += '</div>';
    
    // Chart
    html += '<div id="weightDetailChart" class="h-40 bg-white/5 rounded-xl relative overflow-hidden">';
    html += '<div class="flex items-center justify-center h-full text-xs opacity-50">Р В РІР‚вЂќР В Р’В°Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В Р’В·Р В РЎвЂќР В Р’В°...</div>';
    html += '</div>';

    // Add button
    html += '<button type="button" id="weightAddBtn" class="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 font-semibold text-sm">+ Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В Р вЂ Р В Р’ВµР РЋР С“</button>';
    
    // History list
    html += '<div class="bg-white/10 rounded-xl p-3">';
    html += '<h4 class="text-sm font-semibold mb-2">Р В Р’ВР РЋР С“Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР В РЎвЂР РЋР РЏ</h4>';
    html += '<div id="weightHistoryList" class="space-y-2 max-h-64 overflow-y-auto">';
    html += '<div class="text-xs opacity-50 text-center py-4">Р В РІР‚вЂќР В Р’В°Р В РЎвЂ“Р РЋР вЂљР РЋРЎвЂњР В Р’В·Р В РЎвЂќР В Р’В°...</div>';
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
      
      document.getElementById('weightCurrent').textContent = currentWeight ? currentWeight.toFixed(1) + ' Р В РЎвЂќР В РЎвЂ“' : 'Р Р†Р вЂљРІР‚Сњ';
      document.getElementById('weightGoal').textContent = goalWeight ? goalWeight.toFixed(1) + ' Р В РЎвЂќР В РЎвЂ“' : 'Р Р†Р вЂљРІР‚Сњ';
      
      if (currentWeight && firstWeight) {
        const totalDiff = currentWeight - firstWeight;
        const trendText = totalDiff < -0.1 ? 'Р Р†РІР‚В РІР‚Сљ ' + Math.abs(totalDiff).toFixed(1) + ' Р В РЎвЂќР В РЎвЂ“' : 
                         totalDiff > 0.1 ? 'Р Р†РІР‚В РІР‚В +' + totalDiff.toFixed(1) + ' Р В РЎвЂќР В РЎвЂ“' : 'Р Р†РІР‚В РІР‚в„ў 0.0 Р В РЎвЂќР В РЎвЂ“';
        const trendEl = document.getElementById('weightTrend');
        trendEl.textContent = trendText;
        trendEl.className = 'text-lg font-semibold mt-1 ' + 
          (totalDiff < -0.1 ? 'text-green-400' : totalDiff > 0.1 ? 'text-red-400' : 'text-white');
      } else {
        document.getElementById('weightTrend').textContent = 'Р Р†Р вЂљРІР‚Сњ';
      }
  
      // Render chart
      const chartContainer = document.getElementById('weightDetailChart');
      if (chartData.length === 0) {
        chartContainer.innerHTML = '<div class="flex items-center justify-center h-full text-xs opacity-50">Р В РЎСљР В Р’ВµР РЋРІР‚С™ Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦</div>';
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
        listContainer.innerHTML = '<div class="text-xs opacity-50 text-center py-4">Р В РЎСљР В Р’ВµР РЋРІР‚С™ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р В РЎвЂР РЋР С“Р В Р’ВµР В РІвЂћвЂ“</div>';
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
                <span class="font-medium">${item.value.toFixed(1)} Р В РЎвЂќР В РЎвЂ“</span>
                <span class="text-xs opacity-50">Р Р†РЎС™Р РЏ</span>
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
    
    let html = '<h3 class="font-semibold mb-4">Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В Р вЂ Р В Р’ВµР РЋР С“</h3>';
    html += '<div class="space-y-3">';
    html += '<label class="block text-sm">Р В РІР‚в„ўР В Р’ВµР РЋР С“ (Р В РЎвЂќР В РЎвЂ“)</label>';
    html += '<input type="number" step="0.1" id="addWeightValue" class="w-full p-3 bg-white/30 rounded-xl text-white" placeholder="78.5" value="' + (profile.weight || '') + '">';
    html += '<label class="block text-sm">Р В РІР‚СњР В Р’В°Р РЋРІР‚С™Р В Р’В°</label>';
    html += '<input type="date" id="addWeightDate" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + today + '">';
    html += '<label class="block text-sm">Р В РІР‚в„ўР РЋР вЂљР В Р’ВµР В РЎВР РЋР РЏ</label>';
    html += '<input type="time" id="addWeightTime" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + currentTime + '">';
    html += '</div>';
    html += '<div class="flex gap-3 mt-4">';
    html += '<button type="button" id="addWeightCancel" class="flex-1 py-3 rounded-xl bg-white/20">Р В РЎвЂєР РЋРІР‚С™Р В РЎВР В Р’ВµР В Р вЂ¦Р В Р’В°</button>';
    html += '<button type="button" id="addWeightSave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">Р В Р Р‹Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰</button>';
    html += '</div>';
    
    fitnessOpenModal(html, () => {
      document.getElementById('addWeightCancel')?.addEventListener('click', fitnessCloseModal);
      document.getElementById('addWeightSave')?.addEventListener('click', async () => {
        const weight = parseFloat(document.getElementById('addWeightValue')?.value);
        const date = document.getElementById('addWeightDate')?.value;
        const time = document.getElementById('addWeightTime')?.value;
        
        if (!weight || weight <= 0) {
          alert('Р В РІР‚в„ўР В Р вЂ Р В Р’ВµР В РўвЂР В РЎвЂР РЋРІР‚С™Р В Р’Вµ Р В РЎвЂќР В РЎвЂўР РЋР вЂљР РЋР вЂљР В Р’ВµР В РЎвЂќР РЋРІР‚С™Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р В Р вЂ Р В Р’ВµР РЋР С“');
          return;
        }
        
        if (!window.FitnessSync || !window.currentAppUserId) {
          alert('Р В РЎСљР В Р’ВµР РЋРІР‚С™ Р РЋР С“Р В Р вЂ Р РЋР РЏР В Р’В·Р В РЎвЂ Р РЋР С“ Р РЋР С“Р В Р’ВµР РЋР вЂљР В Р вЂ Р В Р’ВµР РЋР вЂљР В РЎвЂўР В РЎВ');
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
          alert('Р В РЎвЂєР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В° Р РЋР С“Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ');
        }
      });
    });
  };
  
  window.fitnessOpenEditWeightModal = function(measurementId, currentWeight, measuredAt) {
    const date = new Date(measuredAt);
    const dateKey = FS.formatDateKey(date);
    const timeStr = date.toTimeString().slice(0, 5);
    
    let html = '<h3 class="font-semibold mb-4">Р В Р’ВР В Р’В·Р В РЎВР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂР В Р’В·Р В РЎВР В Р’ВµР РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ</h3>';
    html += '<div class="space-y-3">';
    html += '<label class="block text-sm">Р В РІР‚в„ўР В Р’ВµР РЋР С“ (Р В РЎвЂќР В РЎвЂ“)</label>';
    html += '<input type="number" step="0.1" id="editWeightValue" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + currentWeight + '">';
    html += '<label class="block text-sm">Р В РІР‚СњР В Р’В°Р РЋРІР‚С™Р В Р’В°</label>';
    html += '<input type="date" id="editWeightDate" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + dateKey + '">';
    html += '<label class="block text-sm">Р В РІР‚в„ўР РЋР вЂљР В Р’ВµР В РЎВР РЋР РЏ</label>';
    html += '<input type="time" id="editWeightTime" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + timeStr + '">';
    html += '</div>';
    html += '<div class="flex gap-3 mt-4">';
    html += '<button type="button" id="editWeightDelete" class="flex-1 py-3 rounded-xl bg-red-500/30 text-red-300">Р В Р в‚¬Р В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰</button>';
    html += '<button type="button" id="editWeightCancel" class="flex-1 py-3 rounded-xl bg-white/20">Р В РЎвЂєР РЋРІР‚С™Р В РЎВР В Р’ВµР В Р вЂ¦Р В Р’В°</button>';
    html += '<button type="button" id="editWeightSave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">Р В Р Р‹Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰</button>';
    html += '</div>';
    
    fitnessOpenModal(html, () => {
      document.getElementById('editWeightCancel')?.addEventListener('click', fitnessCloseModal);
      document.getElementById('editWeightDelete')?.addEventListener('click', async () => {
        if (!confirm('Р В Р в‚¬Р В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р РЋР РЉР РЋРІР‚С™Р В РЎвЂў Р В РЎвЂР В Р’В·Р В РЎВР В Р’ВµР РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ?')) return;
        
        try {
          await window.FitnessSync.deleteWeightMeasurement(measurementId);
          weightChartDataCache = null;
          
          fitnessCloseModal();
          fitnessRenderDashboard();
          setTimeout(() => window.fitnessOpenWeightDetailScreen(), 100);
        } catch (e) {
          alert('Р В РЎвЂєР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В° Р РЋРЎвЂњР В РўвЂР В Р’В°Р В Р’В»Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ');
        }
      });
      document.getElementById('editWeightSave')?.addEventListener('click', async () => {
        const weight = parseFloat(document.getElementById('editWeightValue')?.value);
        const date = document.getElementById('editWeightDate')?.value;
        const time = document.getElementById('editWeightTime')?.value;
        
        if (!weight || weight <= 0) {
          alert('Р В РІР‚в„ўР В Р вЂ Р В Р’ВµР В РўвЂР В РЎвЂР РЋРІР‚С™Р В Р’Вµ Р В РЎвЂќР В РЎвЂўР РЋР вЂљР РЋР вЂљР В Р’ВµР В РЎвЂќР РЋРІР‚С™Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р В Р вЂ Р В Р’ВµР РЋР С“');
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
          alert('Р В РЎвЂєР РЋРІвЂљВ¬Р В РЎвЂР В Р’В±Р В РЎвЂќР В Р’В° Р РЋР С“Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ');
        }
      });
    });
  };
  
  let fitnessModalScrollTop = 0;

  function fitnessCloseModal() {
    if (!fitnessEl.modalOverlay) return;
    const lockedTop = document.body.style.top;
    fitnessEl.modalOverlay.classList.add('hidden');
    fitnessEl.modalOverlay.style.display = '';
    document.body.classList.remove('fitness-modal-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    if (fitnessEl.screen) {
      fitnessEl.screen.style.overflow = '';
      fitnessEl.screen.scrollTop = fitnessModalScrollTop;
    } else if (lockedTop) {
      const y = Math.abs(parseInt(lockedTop, 10) || 0);
      window.scrollTo(0, y);
    }
  }

  function fitnessOpenModal(html, onMount) {
    if (!fitnessEl.modalContent || !fitnessEl.modalOverlay) return;
    fitnessModalScrollTop = fitnessEl.screen ? fitnessEl.screen.scrollTop : window.scrollY;
    if (fitnessEl.modalOverlay.parentElement !== document.body) {
      document.body.appendChild(fitnessEl.modalOverlay);
    }
    fitnessEl.modalContent.innerHTML = html;
    fitnessEl.modalOverlay.style.position = 'fixed';
    fitnessEl.modalOverlay.style.inset = '0';
    fitnessEl.modalOverlay.style.display = 'flex';
    fitnessEl.modalOverlay.style.alignItems = 'center';
    fitnessEl.modalOverlay.style.justifyContent = 'center';
    fitnessEl.modalOverlay.classList.remove('hidden');
    document.body.classList.add('fitness-modal-open');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${fitnessModalScrollTop}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    if (fitnessEl.screen) fitnessEl.screen.style.overflow = 'hidden';
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
    let html = '<h3 class="font-semibold mb-4">Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р РЋР С“Р В РЎвЂР В Р’В»Р В РЎвЂўР В Р вЂ Р РЋРЎвЂњР РЋР вЂ№ Р РЋРІР‚С™Р РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В РЎвЂќР РЋРЎвЂњ</h3>';
    html += '<div class="space-y-3">';
    html += '<button type="button" id="gymChoiceModule" class="w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-semibold">РЎР‚РЎСџР РЏРІР‚в„–Р С—РЎвЂР РЏ Р В РЎвЂєР РЋРІР‚С™Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р РЋР Р‰ GYM (Р В РЎвЂ”Р В Р’В»Р В Р’В°Р В Р вЂ¦ Р РЋРІР‚С™Р РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В РЎвЂўР В РЎвЂќ)</button>';
    html += '<button type="button" id="gymChoiceSimple" class="w-full py-4 rounded-xl bg-white/15 hover:bg-white/25">Р Р†Р РЏР’В±Р С—РЎвЂР РЏ Р В РІР‚ВР РЋРІР‚в„–Р РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В Р’В°Р РЋР РЏ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р В РЎвЂР РЋР С“Р РЋР Р‰ (Р РЋРІР‚С™Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В РЎвЂќР В РЎвЂў Р В Р вЂ Р РЋР вЂљР В Р’ВµР В РЎВР РЋР РЏ)</button>';
    html += '</div>';
    html += '<div class="mt-4"><button type="button" id="gymChoiceCancel" class="w-full py-3 rounded-xl bg-white/10">Р В РЎвЂєР РЋРІР‚С™Р В РЎВР В Р’ВµР В Р вЂ¦Р В Р’В°</button></div>';
    
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
    
    title.textContent = isOutdoor ? 'Р В РЎвЂ™Р РЋР РЉР РЋР вЂљР В РЎвЂўР В Р’В±Р В Р вЂ¦Р В Р’В°Р РЋР РЏ Р В Р вЂ¦Р В Р’В° Р РЋРЎвЂњР В Р’В»Р В РЎвЂР РЋРІР‚В Р В Р’Вµ' : 'Р В РЎв„ўР В Р’В°Р РЋР вЂљР В РўвЂР В РЎвЂР В РЎвЂў Р В Р вЂ  Р В Р’В·Р В Р’В°Р В Р’В»Р В Р’Вµ';
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
    let html = '<h3 class="font-semibold mb-4">Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР В Р вЂ Р В Р вЂ¦Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р РЋР Р‰</h3>';
    html += '<input type="hidden" id="fmActivityKind" value="' + kind + '">';
    html += '<input type="hidden" id="fmActivityEditId" value="' + (editId || '') + '">';
    if (kind === 'gym') {
      html += '<div class="space-y-3"><label class="block">Р В РЎС™Р В РЎвЂР В Р вЂ¦Р РЋРЎвЂњР РЋРІР‚С™Р РЋРІР‚в„–</label><input type="number" id="fmGymMinutes" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.durationMinutes ?? '') + '">';
      html += '<label class="block">Р В Р’ВР В Р вЂ¦Р РЋРІР‚С™Р В Р’ВµР В Р вЂ¦Р РЋР С“Р В РЎвЂР В Р вЂ Р В Р вЂ¦Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р РЋР Р‰</label><select id="fmGymIntensity" class="w-full p-3 bg-white/30 rounded-xl text-white">';
      ['low','medium','high'].forEach((v) => { html += '<option value="' + v + '"' + (existing?.intensity === v ? ' selected' : '') + '>' + (v === 'low' ? 'Р В РЎСљР В РЎвЂР В Р’В·Р В РЎвЂќР В Р’В°Р РЋР РЏ' : v === 'medium' ? 'Р В Р Р‹Р РЋР вЂљР В Р’ВµР В РўвЂР В Р вЂ¦Р РЋР РЏР РЋР РЏ' : 'Р В РІР‚в„ўР РЋРІР‚в„–Р РЋР С“Р В РЎвЂўР В РЎвЂќР В Р’В°Р РЋР РЏ') + '</option>'; });
      html += '</select></div>';
    } else if (kind === 'cardio') {
      html += '<div class="space-y-3"><label class="block">Р В РЎС™Р В РЎвЂР В Р вЂ¦Р РЋРЎвЂњР РЋРІР‚С™Р РЋРІР‚в„–</label><input type="number" id="fmCardioMinutes" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.durationMinutes ?? '') + '">';
      html += '<label class="block">Р В РЎС›Р В РЎвЂР В РЎвЂ”</label><select id="fmCardioType" class="w-full p-3 bg-white/30 rounded-xl text-white">';
      ['run','walk','bike','other'].forEach((v) => { html += '<option value="' + v + '"' + (existing?.type === v ? ' selected' : '') + '>' + (v === 'run' ? 'Р В РІР‚ВР В Р’ВµР В РЎвЂ“' : v === 'walk' ? 'Р В РўС’Р В РЎвЂўР В РўвЂР РЋР Р‰Р В Р’В±Р В Р’В°' : v === 'bike' ? 'Р В РІР‚в„ўР В Р’ВµР В Р’В»Р В РЎвЂўР РЋР С“Р В РЎвЂР В РЎвЂ”Р В Р’ВµР В РўвЂ' : 'Р В РІР‚СњР РЋР вЂљР РЋРЎвЂњР В РЎвЂ“Р В РЎвЂўР В Р’Вµ') + '</option>'; });
      html += '</select></div>';
    } else {
      html += '<div class="space-y-3"><label class="block">Р В Р РѓР В Р’В°Р В РЎвЂ“Р В РЎвЂ</label><input type="number" id="fmSteps" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.steps ?? '') + '"></div>';
    }
    html += '<div class="flex gap-3 mt-4"><button type="button" id="fmActivityCancel" class="flex-1 py-3 rounded-xl bg-white/20">Р В РЎвЂєР РЋРІР‚С™Р В РЎВР В Р’ВµР В Р вЂ¦Р В Р’В°</button><button type="button" id="fmActivitySave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">Р В Р Р‹Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰</button></div>';
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
      `${totals.gym.duration} Р В РЎВР В РЎвЂР В Р вЂ¦ Р вЂ™Р’В· ${totals.gym.calories} Р В РЎвЂќР В РЎвЂќР В Р’В°Р В Р’В»`;
    const gymPercent = Math.min(100, Math.round((totals.gym.duration / goals.GYM_MINUTES) * 100));
    document.getElementById('activityGymBar').style.width = `${gymPercent}%`;
    
    // Cardio Indoor
    document.getElementById('activityCardioIndoorStats').textContent = 
      `${totals.cardio_indoor.duration} Р В РЎВР В РЎвЂР В Р вЂ¦ Р вЂ™Р’В· ${totals.cardio_indoor.calories} Р В РЎвЂќР В РЎвЂќР В Р’В°Р В Р’В»`;
    const cardioInPercent = Math.min(100, Math.round((totals.cardio_indoor.duration / goals.CARDIO_MINUTES) * 100));
    document.getElementById('activityCardioIndoorBar').style.width = `${cardioInPercent}%`;
    
    // Cardio Outdoor
    document.getElementById('activityCardioOutdoorStats').textContent = 
      `${totals.cardio_outdoor.duration} Р В РЎВР В РЎвЂР В Р вЂ¦ Р вЂ™Р’В· ${totals.cardio_outdoor.calories} Р В РЎвЂќР В РЎвЂќР В Р’В°Р В Р’В»`;
    const cardioOutPercent = Math.min(100, Math.round((totals.cardio_outdoor.duration / goals.CARDIO_MINUTES) * 100));
    document.getElementById('activityCardioOutdoorBar').style.width = `${cardioOutPercent}%`;
    
    // Home
    document.getElementById('activityHomeStats').textContent = 
      `${totals.home.duration} Р В РЎВР В РЎвЂР В Р вЂ¦ Р вЂ™Р’В· ${totals.home.calories} Р В РЎвЂќР В РЎвЂќР В Р’В°Р В Р’В»`;
    const homePercent = Math.min(100, Math.round((totals.home.duration / goals.HOME_MINUTES) * 100));
    document.getElementById('activityHomeBar').style.width = `${homePercent}%`;
    
    // Steps
    document.getElementById('activityStepsStats').textContent = 
      `${totals.steps.steps.toLocaleString()} / ${goals.STEPS.toLocaleString()} Р РЋРІвЂљВ¬Р В Р’В°Р В РЎвЂ“Р В РЎвЂўР В Р вЂ `;
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
    const isEditMode = !!editId;

    let html = '<h3 class="font-semibold mb-4">' + (isEditMode ? 'Edit meal' : 'Add meal') + '</h3>';

    if (!isEditMode) {
      html += '<div class="flex gap-2 mb-4">';
      html += '<button type="button" id="fmModeManual" class="flex-1 py-2 px-3 rounded-lg bg-green-500/50 text-sm font-medium">Manual</button>';
      html += '<button type="button" id="fmModeAuto" class="flex-1 py-2 px-3 rounded-lg bg-white/10 text-sm font-medium opacity-70">Auto</button>';
      html += '</div>';
    }

    html += '<div id="fmManualContent" class="space-y-3">';
    html += '<label class="block text-sm">Meal name</label><input type="text" id="fmFoodName" class="w-full p-3 bg-white/30 rounded-xl text-white placeholder-white/70" value="' + (existing?.name ?? '') + '" placeholder="Chicken breast">';
    html += '<label class="block text-sm">Amount</label><input type="text" id="fmFoodAmount" class="w-full p-3 bg-white/30 rounded-xl text-white placeholder-white/70" value="' + (existing?.amount ?? '') + '" placeholder="200 g">';
    html += '<label class="block text-sm">Calories (kcal)</label><input type="number" id="fmFoodCalories" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.calories ?? '') + '">';
    html += '<div class="flex gap-2">';
    html += '<div class="flex-1"><label class="block text-sm">Protein (g)</label><input type="number" id="fmFoodProtein" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.protein ?? '') + '" placeholder="0"></div>';
    html += '<div class="flex-1"><label class="block text-sm">Fat (g)</label><input type="number" id="fmFoodFat" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.fat ?? '') + '" placeholder="0"></div>';
    html += '<div class="flex-1"><label class="block text-sm">Carbs (g)</label><input type="number" id="fmFoodCarbs" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.carbs ?? '') + '" placeholder="0"></div>';
    html += '</div>';
    html += '<label class="block text-sm">Time</label><input type="time" id="fmFoodTime" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + defaultTime + '">';
    html += '</div>';

    if (!isEditMode) {
      html += '<div id="fmAutoContent" class="space-y-3 hidden">';
      html += '<label class="block text-sm">Food query</label><input type="text" id="fmFoodQuery" class="w-full p-3 bg-white/30 rounded-xl text-white placeholder-white/70" placeholder="buckwheat 200 g">';
      html += '<p class="text-xs opacity-70">Use clear input with product and amount, for example: buckwheat 200 g.</p>';
      html += '<label class="block text-sm">Time</label><input type="time" id="fmFoodTimeAuto" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + defaultTime + '">';
      html += '<div id="fmAutoError" class="text-red-300 text-sm hidden"></div>';
      html += '</div>';
    }

    html += '<div class="flex gap-3 mt-4"><button type="button" id="fmFoodCancel" class="flex-1 py-3 rounded-xl bg-white/20">Cancel</button><button type="button" id="fmFoodSave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">' + (isEditMode ? 'Save' : 'Add') + '</button></div>';

    fitnessOpenModal(html, () => {
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

      fitnessEl.modalOverlay.querySelector('#fmFoodCancel')?.addEventListener('click', fitnessCloseModal);

      fitnessEl.modalOverlay.querySelector('#fmFoodSave')?.addEventListener('click', async () => {
        const k = fitnessGetDateKey();
        const dayDataNow = FS.getDayData(k);

        let isAutoMode = false;
        if (!isEditMode) {
          const autoContent = fitnessEl.modalOverlay.querySelector('#fmAutoContent');
          isAutoMode = !autoContent?.classList.contains('hidden');
        }

        if (isAutoMode) {
          const queryText = document.getElementById('fmFoodQuery')?.value?.trim();
          const time = document.getElementById('fmFoodTimeAuto')?.value;
          const saveBtn = fitnessEl.modalOverlay.querySelector('#fmFoodSave');
          const errorEl = fitnessEl.modalOverlay.querySelector('#fmAutoError');

          if (!queryText) {
            if (errorEl) {
              errorEl.textContent = 'Please enter a food query (for example: buckwheat 200 g).';
              errorEl.classList.remove('hidden');
            }
            return;
          }

          if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Loading...';
          }
          if (errorEl) errorEl.classList.add('hidden');

          try {
            const res = await fetch('/api/nutrition?query=' + encodeURIComponent(queryText));
            const data = await res.json();

            if (res.ok && data.kcal) {
              const entry = FS.buildFoodEntry({
                name: queryText,
                amount: null,
                calories: data.kcal,
                protein: data.b,
                fat: data.zh,
                carbs: data.u,
                time,
                source: 'auto',
              }, editId);

              const next = FS.mergeFood(dayDataNow.foods, entry, editId);
              FS.updateDayData(k, { foods: next });
              fitnessCloseModal();
              fitnessRenderFoodList();
              fitnessRenderCalories();
            } else {
              if (errorEl) {
                errorEl.textContent = 'Unable to parse this query. Use clear format like "buckwheat 200 g".';
                errorEl.classList.remove('hidden');
              }
              if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Add';
              }
            }
          } catch (err) {
            console.error('Auto mode error:', err);
            if (errorEl) {
              errorEl.textContent = 'Network error. Please enter nutrition values manually.';
              errorEl.classList.remove('hidden');
            }
            if (saveBtn) {
              saveBtn.disabled = false;
              saveBtn.textContent = 'Add';
            }
          }
        } else {
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
          const next = FS.mergeFood(dayDataNow.foods, entry, editId);
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

    fitnessEl.supplementsTracking.innerHTML = '';
    const dateKey = fitnessGetDateKey();
    const supplements = FS.getAllSupplements();

    if (supplements.length === 0) {
      fitnessEl.supplementsTracking.innerHTML = `
        <div class="text-center py-4 opacity-70">
          <p class="text-sm mb-2">No supplements yet</p>
          <button type="button" id="addFirstSupplement" class="text-green-400 text-sm hover:underline">+ Add first supplement</button>
        </div>
      `;
      fitnessBindSupplementsTrackingHandlers();
      return;
    }

    let html = '';
    let visibleCount = 0;

    for (const supp of supplements) {
      const intakes = FS.getSupplementIntakesForDay(supp.id, dateKey);
      const totalDose = FS.getTotalDoseForDay(intakes);
      const unitLabel = supp.unit || 'mg';

      let shouldShow = false;
      if (supp.daily) {
        shouldShow = FS.isDateInDailyInterval(supp, dateKey) || intakes.length > 0;
      } else {
        shouldShow = intakes.length > 0;
      }
      if (!shouldShow) continue;

      visibleCount++;
      html += '<div class="bg-white/5 rounded-xl p-3 mb-3">';
      html += '<div class="flex items-center justify-between mb-2">';
      html += '<h4 class="font-semibold text-sm">' + supp.name + '</h4>';
      html += '<div class="flex gap-1">';
      html += '<button type="button" class="supp-edit-norm text-xs opacity-70" data-id="' + supp.id + '">Edit</button>';
      html += '<button type="button" class="supp-history text-xs opacity-70" data-id="' + supp.id + '">History</button>';
      html += '<button type="button" class="supp-remove-from-day text-xs opacity-70 text-red-300" data-id="' + supp.id + '" title="Remove from this day">Remove day</button>';
      html += '</div></div>';

      html += '<p class="text-xs opacity-70 mb-2">' + supp.standardDailyDose + ' ' + unitLabel + '/day' + (supp.daily ? ' (scheduled daily)' : '') + '</p>';

      for (const intake of intakes) {
        const doseClass = intake.edited ? 'text-yellow-300' : '';
        const isFuture = FS.isFutureDate(dateKey);
        const checkboxDisabled = isFuture ? ' disabled' : '';
        const checkboxTitle = isFuture ? ' title="Future dates are read-only"' : '';

        html += '<div class="flex items-center gap-2 py-1 border-b border-white/5 last:border-0">';
        html += '<input type="checkbox" class="supp-intake-check rounded' + (isFuture ? ' opacity-50 cursor-not-allowed' : '') + '" data-supp-id="' + supp.id + '" data-intake-id="' + intake.id + '"' + (intake.checked ? ' checked' : '') + checkboxDisabled + checkboxTitle + '>';
        html += intake.time ? '<span class="text-xs opacity-70 w-12">' + intake.time + '</span>' : '<span class="text-xs opacity-30 w-12">--:--</span>';
        html += '<span class="flex-1 text-sm ' + doseClass + '">' + intake.dose + ' ' + unitLabel + '</span>';
        html += '<button type="button" class="supp-edit-intake text-xs opacity-70" data-supp-id="' + supp.id + '" data-intake-id="' + intake.id + '">Edit</button>';
        html += '</div>';
      }

      html += '<div class="text-xs mt-2 pt-2 border-t border-white/10">';
      html += 'Total: ' + totalDose + ' ' + unitLabel + ' / ' + supp.standardDailyDose + ' ' + unitLabel;
      html += '</div>';
      html += '<button type="button" class="supp-add-intake w-full mt-2 py-1 text-xs bg-white/10 rounded" data-supp-id="' + supp.id + '">+ Add intake</button>';
      html += '</div>';
    }

    if (visibleCount === 0) {
      html += '<div class="text-center py-6 opacity-70">';
      html += '<p class="text-sm mb-3">No supplements planned for this day</p>';
      html += '<button type="button" id="addFirstSupplement" class="text-green-400 text-sm hover:underline">+ Add supplement</button>';
      html += '</div>';
    }

    html += '<button type="button" id="addNewSupplement" class="w-full py-2 rounded-xl bg-green-500/30 text-sm">+ Add supplement</button>';
    html += '<button type="button" id="clearSupplementsHistory" class="w-full py-1 mt-2 rounded-xl bg-red-500/20 text-xs text-red-300 opacity-50 hover:opacity-100">Clear supplements history</button>';
    html += '<button type="button" id="resetAllSupplements" class="w-full py-1 mt-1 rounded-xl bg-red-900/40 text-xs text-red-400 opacity-50 hover:opacity-100">Delete all supplements</button>';

    fitnessEl.supplementsTracking.innerHTML = html;
    fitnessBindSupplementsTrackingHandlers();
  }
function fitnessBindSupplementsTrackingHandlers() {
    if (!fitnessEl.supplementsTracking || fitnessEl.supplementsTracking.dataset.bound === '1') return;
    fitnessEl.supplementsTracking.dataset.bound = '1';

    fitnessEl.supplementsTracking.addEventListener('click', (e) => {
      const dateKey = fitnessGetDateKey();
      const cb = e.target.closest('.supp-intake-check');

      if (cb) {
        e.preventDefault();
        const suppId = cb.dataset.suppId;
        const intakeId = cb.dataset.intakeId;
        if (!suppId || !intakeId) return;

        if (FS.isFutureDate(dateKey)) {
          alert('Future dates are read-only. You can only mark supplement intakes for today or past days.');
          return;
        }

        FS.toggleSupplementIntakeChecked(suppId, dateKey, intakeId);
        fitnessRenderSupplementsTracking();
        return;
      }

      if (e.target.closest('#addNewSupplement') || e.target.closest('#addFirstSupplement')) {
        fitnessOpenSupplementProfileModal();
        return;
      }

      if (e.target.closest('#clearSupplementsHistory')) {
        if (confirm('Clear all supplement intake history? This keeps supplement definitions and schedules.')) {
          const success = FS.clearAllSupplementsHistory();
          alert(success ? 'Supplement history was cleared.' : 'Unable to clear supplement history.');
          if (success) fitnessRenderSupplementsTracking();
        }
        return;
      }

      if (e.target.closest('#resetAllSupplements')) {
        if (confirm('Delete all supplements and all intake history? This action cannot be undone.') &&
            confirm('Please confirm once more: delete all supplements now?')) {
          FS.resetAllSupplements();
          alert('All supplements were deleted.');
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
        if (confirm('Remove "' + supp.name + '" from this day?')) {
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
    
    let html = '<h3 class="font-semibold mb-4">' + (existing ? 'Р В Р’В Р В Р’ВµР В РўвЂР В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р В РІР‚ВР В РЎвЂ™Р В РІР‚Сњ' : 'Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В РІР‚ВР В РЎвЂ™Р В РІР‚Сњ') + '</h3>';
    html += '<div class="space-y-3">';
    html += '<label class="block text-sm">Р В РЎСљР В Р’В°Р В Р’В·Р В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ</label>';
    html += '<input type="text" id="suppProfileName" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.name ?? '') + '" placeholder="Р В РЎв„ўР РЋР вЂљР В Р’ВµР В Р’В°Р РЋРІР‚С™Р В РЎвЂР В Р вЂ¦, Р В РЎв„ўР В Р’В»Р В Р’ВµР В Р вЂ¦Р В Р’В±Р РЋРЎвЂњР РЋРІР‚С™Р В Р’ВµР РЋР вЂљР В РЎвЂўР В Р’В»...">';
    
    html += '<label class="block text-sm">Р В РІР‚СћР В РўвЂР В РЎвЂР В Р вЂ¦Р В РЎвЂР РЋРІР‚В Р В Р’В° Р В РЎвЂР В Р’В·Р В РЎВР В Р’ВµР РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ</label>';
    html += '<select id="suppProfileUnit" class="w-full p-3 bg-white/30 rounded-xl text-white">';
    html += '<option value="Р В РЎВР В РЎвЂ“"' + (existing?.unit === 'Р В РЎВР В РЎвЂ“' ? ' selected' : '') + '>Р В РЎВР В РЎвЂ“</option>';
    html += '<option value="Р В РЎвЂ“"' + (existing?.unit === 'Р В РЎвЂ“' ? ' selected' : '') + '>Р В РЎвЂ“</option>';
    html += '<option value="Р РЋРІР‚С™Р В Р’В°Р В Р’В±Р В Р’В»"' + (existing?.unit === 'Р РЋРІР‚С™Р В Р’В°Р В Р’В±Р В Р’В»' ? ' selected' : '') + '>Р РЋРІР‚С™Р В Р’В°Р В Р’В±Р В Р’В»Р В Р’ВµР РЋРІР‚С™Р В РЎвЂќР В РЎвЂ</option>';
    html += '</select>';
    
    // CRITICAL: Daily checkbox with date interval controls
    html += '<div class="bg-white/5 rounded-lg p-3 mt-2">';
    html += '<label class="flex items-center gap-2">';
    html += '<input type="checkbox" id="suppProfileDaily" class="rounded"' + (existing?.daily ? ' checked' : '') + '>';
    html += '<span class="text-sm font-medium">Р В РЎСџР РЋР вЂљР В РЎвЂР В Р вЂ¦Р В РЎвЂР В РЎВР В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р В Р’ВµР В Р’В¶Р В Р’ВµР В РўвЂР В Р вЂ¦Р В Р’ВµР В Р вЂ Р В Р вЂ¦Р В РЎвЂў</span></label>';

    // Daily interval controls (shown only when daily is checked)
    html += '<div id="dailyIntervalControls" class="mt-3 space-y-2' + (existing?.daily ? '' : ' hidden') + '">';
    html += '<label class="block text-xs opacity-70">Р В РЎСљР В Р’В°Р РЋРІР‚РЋР В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р РЋР С“ Р В РўвЂР В Р’В°Р РЋРІР‚С™Р РЋРІР‚в„–</label>';
    html += '<input type="date" id="suppProfileDailyStart" class="w-full p-2 bg-white/30 rounded-xl text-white text-sm" value="' + (existing?.dailyStartDate ?? todayKey) + '">';

    html += '<label class="block text-xs opacity-70 mt-2">Р В РІР‚вЂќР В Р’В°Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р РЋРІР‚РЋР В РЎвЂР РЋРІР‚С™Р РЋР Р‰ (Р В Р вЂ¦Р В Р’ВµР В РЎвЂўР В Р’В±Р РЋР РЏР В Р’В·Р В Р’В°Р РЋРІР‚С™Р В Р’ВµР В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂў)</label>';
    html += '<input type="date" id="suppProfileDailyEnd" class="w-full p-2 bg-white/30 rounded-xl text-white text-sm" value="' + (existing?.dailyEndDate ?? '') + '">';
    html += '<label class="flex items-center gap-2 mt-1">';
    html += '<input type="checkbox" id="suppProfileDailyNoEnd" class="rounded"' + (!existing?.dailyEndDate ? ' checked' : '') + '>';
    html += '<span class="text-xs opacity-70">Р В РІР‚ВР В Р’ВµР В Р’В· Р В РЎвЂўР В РЎвЂќР В РЎвЂўР В Р вЂ¦Р РЋРІР‚РЋР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋР РЏ (Р В Р’В±Р В Р’ВµР РЋР С“Р В РЎвЂќР В РЎвЂўР В Р вЂ¦Р В Р’ВµР РЋРІР‚РЋР В Р вЂ¦Р В РЎвЂў)</span></label>';
    html += '</div>';
    html += '</div>';
    
    html += '<label class="block text-sm mt-2">Р В РІР‚СњР В Р вЂ¦Р В Р’ВµР В Р вЂ Р В Р вЂ¦Р В Р’В°Р РЋР РЏ Р В Р вЂ¦Р В РЎвЂўР РЋР вЂљР В РЎВР В Р’В°</label>';
    html += '<input type="number" id="suppProfileDailyDose" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.standardDailyDose ?? '1') + '" placeholder="10">';

    html += '<label class="block text-sm mt-2">Р В РЎв„ўР В РЎвЂўР В Р’В»Р В РЎвЂР РЋРІР‚РЋР В Р’ВµР РЋР С“Р РЋРІР‚С™Р В Р вЂ Р В РЎвЂў Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР РЋРІР‚ВР В РЎВР В РЎвЂўР В Р вЂ  Р В Р вЂ  Р В РўвЂР В Р’ВµР В Р вЂ¦Р РЋР Р‰</label>';
    html += '<input type="number" id="suppProfileIntakesCount" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.templateIntakes?.length ?? 1) + '" min="1" max="5">';

    html += '<label class="block text-sm mt-2">Р В РІР‚СњР В РЎвЂўР В Р’В·Р В Р’В° Р В Р вЂ¦Р В Р’В° Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР РЋРІР‚ВР В РЎВ (Р В Р’В±Р В Р’В°Р В Р’В·Р В РЎвЂўР В Р вЂ Р В Р’В°Р РЋР РЏ)</label>';
    html += '<input type="number" id="suppProfileDefaultDose" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (existing?.templateIntakes?.[0]?.defaultDose ?? '1') + '">';

    if (existing) {
      html += '<button type="button" id="suppProfileDelete" class="w-full py-2 mt-2 rounded-xl bg-red-500/30 text-sm text-red-300">Р В Р в‚¬Р В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В РІР‚ВР В РЎвЂ™Р В РІР‚Сњ</button>';
    }
    html += '</div>';

    html += '<div class="flex gap-3 mt-4">';
    html += '<button type="button" id="suppProfileCancel" class="flex-1 py-3 rounded-xl bg-white/20">Р В РЎвЂєР РЋРІР‚С™Р В РЎВР В Р’ВµР В Р вЂ¦Р В Р’В°</button>';
    html += '<button type="button" id="suppProfileSave" class="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600">Р В Р Р‹Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰</button>';
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
          alert('Р В РІР‚в„ўР В Р вЂ Р В Р’ВµР В РўвЂР В РЎвЂР РЋРІР‚С™Р В Р’Вµ Р В Р вЂ¦Р В Р’В°Р В Р’В·Р В Р вЂ Р В Р’В°Р В Р вЂ¦Р В РЎвЂР В Р’Вµ Р В РІР‚ВР В РЎвЂ™Р В РІР‚СњР В Р’В°');
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
        if (confirm('Р В Р в‚¬Р В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р РЋР РЉР РЋРІР‚С™Р В РЎвЂўР РЋРІР‚С™ Р В РІР‚ВР В РЎвЂ™Р В РІР‚Сњ? Р В Р’ВР РЋР С“Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР В РЎвЂР РЋР РЏ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР РЋРІР‚ВР В РЎВР В РЎвЂўР В Р вЂ  Р В Р’В±Р РЋРЎвЂњР В РўвЂР В Р’ВµР РЋРІР‚С™ Р В РЎвЂ”Р В РЎвЂўР РЋРІР‚С™Р В Р’ВµР РЋР вЂљР РЋР РЏР В Р вЂ¦Р В Р’В°.')) {
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
    const unit = supp?.unit || 'Р РЋРІР‚С™Р В Р’В°Р В Р’В±Р В Р’В»';
    
    let html = '<h3 class="font-semibold mb-4">Р В Р’ВР В Р’В·Р В РЎВР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР РЋРІР‚ВР В РЎВ</h3>';
    html += '<div class="space-y-3">';
    html += '<label class="block text-sm">Р В РІР‚СњР В РЎвЂўР В Р’В·Р В Р’В° (' + unit + ')</label>';
    html += '<input type="number" id="intakeEditDose" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + intake.dose + '">';
    html += '<div class="flex gap-2">';
    html += '<button type="button" id="intakeEditMinus1" class="flex-1 py-2 rounded-xl bg-white/20 text-sm">Р Р†РІвЂљВ¬РІР‚в„ў1</button>';
    html += '<button type="button" id="intakeEditPlus1" class="flex-1 py-2 rounded-xl bg-white/20 text-sm">+1</button>';
    html += '<button type="button" id="intakeEditX2" class="flex-1 py-2 rounded-xl bg-white/20 text-sm">Р вЂњРІР‚вЂќ2</button>';
    html += '</div>';
    html += '<label class="block text-sm mt-2">Р В РІР‚в„ўР РЋР вЂљР В Р’ВµР В РЎВР РЋР РЏ (HH:MM)</label>';
    html += '<input type="time" id="intakeEditTime" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + (intake.time || '') + '">';
    html += '</div>';
    html += '<div class="flex gap-3 mt-4">';
    html += '<button type="button" id="intakeEditDelete" class="flex-1 py-3 rounded-xl bg-red-500/30 text-red-300">Р В Р в‚¬Р В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰</button>';
    html += '<button type="button" id="intakeEditCancel" class="flex-1 py-3 rounded-xl bg-white/20">Р В РЎвЂєР РЋРІР‚С™Р В РЎВР В Р’ВµР В Р вЂ¦Р В Р’В°</button>';
    html += '<button type="button" id="intakeEditSave" class="flex-1 py-3 rounded-xl bg-green-500">Р В Р Р‹Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰</button>';
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
          if (confirm('Р В РІР‚СњР В РЎвЂўР В Р’В·Р В Р’В° = 0. Р В Р в‚¬Р В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р РЋР РЉР РЋРІР‚С™Р В РЎвЂўР РЋРІР‚С™ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР РЋРІР‚ВР В РЎВ?')) {
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
    const unit = supp?.unit || 'Р РЋРІР‚С™Р В Р’В°Р В Р’В±Р В Р’В»';
    const defaultDose = supp?.templateIntakes?.[0]?.defaultDose || 1;
    const currentTime = FS.formatTimeHM(new Date());
    
    let html = '<h3 class="font-semibold mb-4">Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР РЋРІР‚ВР В РЎВ</h3>';
    html += '<div class="space-y-3">';
    html += '<label class="block text-sm">Р В РІР‚СњР В РЎвЂўР В Р’В·Р В Р’В° (' + unit + ')</label>';
    html += '<input type="number" id="intakeAddDose" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + defaultDose + '">';
    html += '<label class="block text-sm mt-2">Р В РІР‚в„ўР РЋР вЂљР В Р’ВµР В РЎВР РЋР РЏ (HH:MM)</label>';
    html += '<input type="time" id="intakeAddTime" class="w-full p-3 bg-white/30 rounded-xl text-white" value="' + currentTime + '">';
    html += '</div>';
    html += '<div class="flex gap-3 mt-4">';
    html += '<button type="button" id="intakeAddCancel" class="flex-1 py-3 rounded-xl bg-white/20">Р В РЎвЂєР РЋРІР‚С™Р В РЎВР В Р’ВµР В Р вЂ¦Р В Р’В°</button>';
    html += '<button type="button" id="intakeAddSave" class="flex-1 py-3 rounded-xl bg-green-500">Р В РІР‚СњР В РЎвЂўР В Р’В±Р В Р’В°Р В Р вЂ Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰</button>';
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
    
    const unit = supp.unit || 'Р РЋРІР‚С™Р В Р’В°Р В Р’В±Р В Р’В»';
    const history = supp.history || [];
    
    // Get last 14 days with data
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(FS.formatDateKey(d));
    }
    
    let html = '<h3 class="font-semibold mb-4">Р В Р’ВР РЋР С“Р РЋРІР‚С™Р В РЎвЂўР РЋР вЂљР В РЎвЂР РЋР РЏ: ' + supp.name + '</h3>';
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
        html += '<button type="button" class="hist-intake-edit text-xs opacity-70" data-date="' + dateKey + '" data-intake-id="' + intake.id + '">Р Р†РЎС™Р РЏ</button>';
        html += '</div>';
      }
      
      if (intakes.length === 0) {
        html += '<div class="text-xs opacity-50 py-1">Р В РЎСљР В Р’ВµР РЋРІР‚С™ Р В РўвЂР В Р’В°Р В Р вЂ¦Р В Р вЂ¦Р РЋРІР‚в„–Р РЋРІР‚В¦</div>';
      }
      
      html += '</div>';
    }
    
    html += '</div>';
    html += '<div class="flex gap-3 mt-4">';
    html += '<button type="button" id="histClose" class="flex-1 py-3 rounded-xl bg-white/20">Р В РІР‚вЂќР В Р’В°Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р РЋР Р‰</button>';
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
        fitnessSetSelectedWorkProfile(p.workProfile); // Р В РЎСљР В РЎвЂєР В РІР‚в„ўР В РЎвЂєР В РІР‚Сћ
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
      workProfile, // Р В РЎСљР В РЎвЂєР В РІР‚в„ўР В РЎвЂєР В РІР‚Сћ
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
    // Р В РЎвЂ”Р В РЎвЂўР В РЎвЂќР В Р’В°Р В Р’В·Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р РЋРІР‚С›Р В РЎвЂўР РЋР вЂљР В РЎВР РЋРЎвЂњ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР РЏ Р В Р вЂ Р В РЎВР В Р’ВµР РЋР С“Р РЋРІР‚С™Р В РЎвЂў Р В РўвЂР В Р’В°Р РЋРІвЂљВ¬Р В Р’В±Р В РЎвЂўР РЋР вЂљР В РўвЂР В Р’В°
    fitnessEl.dashboard?.classList.add('hidden');
    fitnessEl.profileSetup?.classList.remove('hidden');

    if (fitnessEl.weight) fitnessEl.weight.value = p.weight ?? '';
    if (fitnessEl.height) fitnessEl.height.value = p.height ?? '';
    if (fitnessEl.age) fitnessEl.age.value = p.age ?? '';
    if (fitnessEl.targetWeight) fitnessEl.targetWeight.value = p.targetWeight ?? '';
    fitnessSetSelectedWorkProfile(p.workProfile);
  });

  fitnessEl.settingsOpen?.addEventListener('click', () => {
    fitnessOpenWaterBaselineModal();
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
  document.getElementById('stepsIntensity')?.addEventListener('change', fitnessUpdateStepsCaloriesPreview);

  fitnessEl.foodAdd?.addEventListener('click', () => fitnessOpenFoodModal(null));

  // Р В РЎв„ўР В Р’В»Р В РЎвЂР В РЎвЂќ Р В Р вЂ¦Р В Р’В° Р В РЎвЂќР В Р’В°Р РЋР вЂљР РЋРІР‚С™Р В РЎвЂўР РЋРІР‚РЋР В РЎвЂќР РЋРЎвЂњ Р РЋР РЉР В Р вЂ¦Р В Р’ВµР РЋР вЂљР В РЎвЂ“Р В РЎвЂР В РЎвЂ Р Р†Р вЂљРІР‚Сњ Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р РЋР Р‰ Р В РўвЂР В Р’ВµР РЋРІР‚С™Р В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР вЂ№
  document.getElementById('fitnessCaloriesCard')?.addEventListener('click', function(e) {
    // Р В РЎСљР В Р’Вµ Р В РЎвЂўР РЋРІР‚С™Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р В Р вЂ Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р В Р’ВµР РЋР С“Р В Р’В»Р В РЎвЂ Р В РЎвЂќР В Р’В»Р В РЎвЂР В РЎвЂќ Р В РЎвЂ”Р В РЎвЂў Р В РЎвЂќР В Р вЂ¦Р В РЎвЂўР В РЎвЂ”Р В РЎвЂќР В Р’В°Р В РЎВ Р В Р вЂ Р В Р вЂ¦Р РЋРЎвЂњР РЋРІР‚С™Р РЋР вЂљР В РЎвЂ Р В РЎвЂќР В Р’В°Р РЋР вЂљР РЋРІР‚С™Р В РЎвЂўР РЋРІР‚РЋР В РЎвЂќР В РЎвЂ
    if (e.target.closest('button')) return;
    fitnessOpenEnergyDetails();
  });

  // Р В РІР‚вЂќР В Р’В°Р В РЎвЂќР РЋР вЂљР РЋРІР‚в„–Р РЋРІР‚С™Р В РЎвЂР В Р’Вµ Р В РЎВР В РЎвЂўР В РўвЂР В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂўР В РЎвЂ“Р В РЎвЂў Р В РЎвЂўР В РЎвЂќР В Р вЂ¦Р В Р’В° Р РЋР РЉР В Р вЂ¦Р В Р’ВµР РЋР вЂљР В РЎвЂ“Р В РЎвЂР В РЎвЂ
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
      fitnessRenderCalories(); // Р РЋРІР‚РЋР РЋРІР‚С™Р В РЎвЂўР В Р’В±Р РЋРІР‚в„– Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В Р’ВµР РЋР С“Р РЋРІР‚РЋР В РЎвЂР РЋРІР‚С™Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂќР В РЎвЂќР В Р’В°Р В Р’В» Р РЋР С“ Р РЋРЎвЂњР РЋРІР‚РЋР РЋРІР‚ВР РЋРІР‚С™Р В РЎвЂўР В РЎВ workDay
    });
  });

  fitnessEl.modalOverlay?.addEventListener('click', (e) => {
    if (e.target === fitnessEl.modalOverlay) fitnessCloseModal();
  });

    // --- Р В РІР‚СљР В Р’В»Р В РЎвЂўР В Р’В±Р В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В Р’В°Р РЋР РЏ Р РЋРІвЂљВ¬Р В РЎвЂќР В Р’В°Р В Р’В»Р В Р’В° Р В Р вЂ¦Р В Р’В°Р РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ (Р В РЎвЂ“Р В Р’В»Р В Р’В°Р В Р вЂ Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦) ---

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
      const level = 10 - index; // 10 = Р В Р вЂ Р В Р’ВµР РЋР вЂљР РЋРІР‚В¦Р В Р вЂ¦Р В РЎвЂР В РІвЂћвЂ“
      segment.innerHTML = '';   // Р В РЎвЂўР РЋРІР‚РЋР В РЎвЂР РЋРІР‚В°Р В Р’В°Р В Р’ВµР В РЎВ Р В Р вЂ¦Р В Р’В° Р В Р вЂ Р РЋР С“Р РЋР РЏР В РЎвЂќР В РЎвЂР В РІвЂћвЂ“ Р РЋР С“Р В Р’В»Р РЋРЎвЂњР РЋРІР‚РЋР В Р’В°Р В РІвЂћвЂ“

      // Р В Р’В±Р В Р’В°Р В Р’В·Р В РЎвЂўР В Р вЂ Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р РЋРІР‚С›Р В РЎвЂўР В Р вЂ¦ (Р В Р вЂ¦Р В Р’ВµР В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР В Р вЂ Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“)
      segment.style.backgroundColor = 'rgba(15,23,42,0.6)';

      if (level <= fullSegments) {
        // Р В Р’В°Р В РЎвЂќР РЋРІР‚С™Р В РЎвЂР В Р вЂ Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р РЋР С“Р В Р’ВµР В РЎвЂ“Р В РЎВР В Р’ВµР В Р вЂ¦Р РЋРІР‚С™
        const hue = 120 - level * 8; // Р В Р’В·Р В Р’ВµР В Р’В»Р РЋРІР‚ВР В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“ Р Р†РІР‚В РІР‚в„ў Р В РЎвЂќР РЋР вЂљР В Р’В°Р РЋР С“Р В Р вЂ¦Р РЋРІР‚в„–Р В РІвЂћвЂ“
        const color = `hsl(${hue}, 70%, 50%)`;
        segment.style.backgroundColor = color;
      }
    });

    // Р РЋРІР‚РЋР В РЎвЂР РЋР С“Р В Р’В»Р В Р’В°
    scoreEl.textContent = value.toFixed(1);
    yesterdayEl.textContent = yesterday.toFixed(1);

    const diff = value - yesterday;
    if (Math.abs(diff) < 0.1) {
      trendEl.textContent = 'Р Р†РІР‚В РІР‚в„ў 0.0';
      trendEl.className = 'text-[10px] opacity-70';
    } else if (diff > 0) {
      trendEl.textContent = `Р Р†РІР‚В РІР‚вЂќ +${diff.toFixed(1)}`;
      trendEl.className = 'text-[10px] text-emerald-300';
    } else {
      trendEl.textContent = `Р Р†РІР‚В Р’В ${diff.toFixed(1)}`;
      trendEl.className = 'text-[10px] text-red-300';
    }

    // Р РЋР С“Р РЋРІР‚С™Р В Р’В°Р РЋРІР‚С™Р РЋРЎвЂњР РЋР С“
    let statusText = '';
    let statusClass = 'text-xs font-medium ';
    if (value >= 8.5) {
      statusText = 'Р В РЎСџР В РЎвЂР В РЎвЂќ, Р В РЎвЂР РЋР С“Р В РЎвЂ”Р В РЎвЂўР В Р’В»Р РЋР Р‰Р В Р’В·Р РЋРЎвЂњР В РІвЂћвЂ“ Р В РЎВР В РЎвЂўР В РЎВР В Р’ВµР В Р вЂ¦Р РЋРІР‚С™';
      statusClass += 'text-orange-300';
    } else if (value >= 7) {
      statusText = 'Р В РўС’Р В РЎвЂўР РЋР вЂљР В РЎвЂўР РЋРІвЂљВ¬Р В РЎвЂР В РІвЂћвЂ“ Р РЋРІР‚С™Р В РЎвЂўР В Р вЂ¦, Р В Р’ВµР РЋР С“Р РЋРІР‚С™Р РЋР Р‰ Р РЋР вЂљР В Р’ВµР РЋР С“Р РЋРЎвЂњР РЋР вЂљР РЋР С“';
      statusClass += 'text-emerald-300';
    } else if (value >= 5) {
      statusText = 'Р В РЎСљР В РЎвЂўР РЋР вЂљР В РЎВР В Р’В°, Р В РўвЂР В Р’ВµР РЋР вЂљР В Р’В¶Р В РЎвЂ Р В Р’В±Р В Р’В°Р В Р’В·Р РЋРЎвЂњ';
      statusClass += 'text-amber-200';
    } else if (value >= 3) {
      statusText = 'Р В Р в‚¬Р РЋР С“Р РЋРІР‚С™Р В Р’В°Р В Р’В»Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р РЋР Р‰, Р В Р вЂ¦Р РЋРЎвЂњР В Р’В¶Р В Р’ВµР В Р вЂ¦ Р В РЎвЂўР РЋРІР‚С™Р В РўвЂР РЋРІР‚в„–Р РЋРІР‚В¦';
      statusClass += 'text-red-300';
    } else {
      statusText = 'Р В РЎв„ўР РЋР вЂљР В РЎвЂР В Р’В·Р В РЎвЂР РЋР С“, Р В Р вЂ¦Р РЋРЎвЂњР В Р’В¶Р В Р вЂ¦Р В Р’В° Р В РЎвЂ”Р В РЎвЂўР В РўвЂР В РўвЂР В Р’ВµР РЋР вЂљР В Р’В¶Р В РЎвЂќР В Р’В°';
      statusClass += 'text-red-400';
    }
    statusEl.textContent = statusText;
    statusEl.className = statusClass;
  }


  function initGlobalMoodWidget() {
    const btn = document.getElementById('logMoodBtn');
    if (btn) {
      btn.addEventListener('click', async () => {
        const raw = prompt('Р В РЎС›Р В Р’ВµР В РЎвЂќР РЋРЎвЂњР РЋРІР‚В°Р В Р’ВµР В Р’Вµ Р РЋР С“Р В РЎвЂўР РЋР С“Р РЋРІР‚С™Р В РЎвЂўР РЋР РЏР В Р вЂ¦Р В РЎвЂР В Р’Вµ (0Р Р†Р вЂљРІР‚Сљ10):', '7');
        if (raw == null) return;
        const num = parseFloat(raw);
        if (Number.isNaN(num)) return;
  
        // Р В РЎвЂўР В Р’В±Р В Р вЂ¦Р В РЎвЂўР В Р вЂ Р В Р’В»Р РЋР РЏР В Р’ВµР В РЎВ UI
        renderGlobalMood(num, 6.5);
  
        // Р РЋР С“Р В РЎвЂўР РЋРІР‚В¦Р РЋР вЂљР В Р’В°Р В Р вЂ¦Р РЋР РЏР В Р’ВµР В РЎВ Р В Р вЂ  Supabase Р В РЎвЂќР В Р’В°Р В РЎвЂќ daily_state + measurements
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
  
  


  // Р В Р’ВР В Р вЂ¦Р В РЎвЂР РЋРІР‚В Р В РЎвЂР В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂўР РЋРІР‚С›Р В РЎвЂР В Р’В»Р РЋР РЏ
  initProfileHeader();
  // Р В Р’ВР В Р вЂ¦Р В РЎвЂР РЋРІР‚В Р В РЎвЂР В Р’В°Р В Р’В»Р В РЎвЂР В Р’В·Р В Р’В°Р РЋРІР‚В Р В РЎвЂР РЋР РЏ Р В РЎвЂ“Р В Р’В»Р В РЎвЂўР В Р’В±Р В Р’В°Р В Р’В»Р РЋР Р‰Р В Р вЂ¦Р В РЎвЂўР В РІвЂћвЂ“ Р РЋРІвЂљВ¬Р В РЎвЂќР В Р’В°Р В Р’В»Р РЋРІР‚в„– Р В Р вЂ¦Р В Р’В°Р РЋР С“Р РЋРІР‚С™Р РЋР вЂљР В РЎвЂўР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ
  initGlobalMoodWidget();

  // Р В РІР‚вЂќР В Р’В°Р В РЎвЂ”Р РЋРЎвЂњР РЋР С“Р В РЎвЂќ Р В РЎвЂ”Р РЋР вЂљР В РЎвЂР В Р’В»Р В РЎвЂўР В Р’В¶Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ
  if (supabaseEnabled) initFromSupabase();
  else initBrowserMode();

  let gymCurrentDayIndex = 1;


  // --- GYM: Р В РЎС›Р РЋР вЂљР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР вЂљР В РЎвЂўР В Р вЂ Р В РЎвЂќР В Р’В° Р В Р вЂ  Р В Р’В·Р В Р’В°Р В Р’В»Р В Р’Вµ ---------------------------------------------
  const gymEl = {
    // Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦ Р РЋР С“Р В РЎвЂ”Р В РЎвЂР РЋР С“Р В РЎвЂќР В Р’В° Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В РЎвЂўР В Р вЂ 
    periodsScreen: document.getElementById('gymPeriodsScreen'),
    periodsBackBtn: document.getElementById('gymPeriodsBackBtn'),
    noPeriodsState: document.getElementById('gymNoPeriodsState'),
    periodsListWrapper: document.getElementById('gymPeriodsListWrapper'),
    periodsList: document.getElementById('gymPeriodsList'),
    createPeriodBtn: document.getElementById('gymCreatePeriodBtn'),
    createPeriodTopBtn: document.getElementById('gymCreatePeriodTopBtn'),

    // Р РЋР РЉР В РЎвЂќР РЋР вЂљР В Р’В°Р В Р вЂ¦ Р В РЎВР В Р’В°Р РЋР С“Р РЋРІР‚С™Р В Р’ВµР РЋР вЂљР В Р’В° Р В РЎвЂ”Р В Р’ВµР РЋР вЂљР В РЎвЂР В РЎвЂўР В РўвЂР В Р’В°
    periodWizardScreen: document.getElementById('gymPeriodWizardScreen'),
    periodWizardBackBtn: document.getElementById('gymPeriodWizardBackBtn'),
    periodStep1: document.getElementById('gymPeriodStep1'),
    periodStep2: document.getElementById('gymPeriodStep2'),
    periodStep1CancelBtn: document.getElementById('gymPeriodStep1CancelBtn'),
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





