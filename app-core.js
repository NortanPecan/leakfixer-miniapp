/**
 * LeakFixer MiniApp - Core Application
 * 
 * This file provides:
 * - Global state and configuration
 * - Initialization
 * - Navigation
 * - User management
 * - Theme handling
 * 
 * Modules loaded after this file can use window.App globals.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==================== TELEGRAM WEBAPP ====================
  const tg = window.Telegram?.WebApp;
  const isTelegram = Boolean(tg && typeof tg === 'object');
  
  if (isTelegram) {
    tg?.ready();
    try { if (typeof tg.expand === 'function') tg.expand(); } catch (e) {}
  }

  const tgUser = tg?.initDataUnsafe?.user ?? null;
  const isDemoUser = !(tgUser && tgUser.id);
  const user = !isDemoUser ? tgUser : { id: 123, username: 'demo_user', first_name: 'Demo User' };
  const supabaseEnabled = Boolean(isTelegram && !isDemoUser && user?.id);

  // ==================== SUPABASE CONFIG ====================
  const SUPABASE_URL = 'https://zhpwehjbonzffpxdrbyl.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpocHdlaGpib256ZmZweGRyYnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzM3MjAsImV4cCI6MjA4Njk0OTcyMH0.em0tBA_YArxA2QQO-r5CWCFnyiknre88Mn6wsrX2ARs';
  
  window.currentAppUserId = null;

  // ==================== ALERT HELPER ====================
  const showAlert = (message) => {
    if (isTelegram && typeof tg?.showAlert === 'function') {
      try { tg.showAlert(message); } catch (e) { window.alert(message); }
    } else { window.alert(message); }
  };

  // ==================== DOM ELEMENTS ====================
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

  // ==================== NAVIGATION ====================
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
    // Trigger fitness render if available
    if (typeof window.fitnessRenderDashboard === 'function') {
      window.fitnessRenderDashboard();
    }
  }

  // ==================== USER STATE ====================
  let currentUser = null;
  let currentDay = 1;
  let currentAppUserId = null;

  function updateUI() {
    if (!currentUser) return;
    if (el.currentDay) el.currentDay.textContent = `День ${currentDay}/30`;
    if (el.streak) el.streak.textContent = String(currentUser.streak ?? 0);
    if (el.points) el.points.textContent = String(currentUser.points ?? 0);
  }

  // ==================== PROFILE ====================
  function initProfileHeader() {
    const photoEl = document.getElementById('profilePhoto');
    const nameEl = document.getElementById('profileName');
    const usernameEl = document.getElementById('profileUsername');
    if (!photoEl || !nameEl || !usernameEl) return;
    nameEl.textContent = user.first_name || 'LeakFixer User';
    usernameEl.textContent = user.username || 'demo';
    photoEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || 'LF')}&background=4f46e5&color=ffffff`;
    loadTelegramProfilePhoto(photoEl);
  }

  async function loadTelegramProfilePhoto(photoEl) {
    if (!photoEl || !isTelegram || isDemoUser || !tg?.initData) return;
    const cacheKey = `tg_avatar_url:${user.id}`;
    const cached = window.localStorage?.getItem(cacheKey);
    if (cached) { photoEl.src = cached; return; }
    try {
      const res = await fetch(`/api/telegram-avatar?user_id=${encodeURIComponent(String(user.id))}`, {
        headers: { 'x-telegram-init-data': tg.initData },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.photo_url) {
        photoEl.src = data.photo_url;
        window.localStorage?.setItem(cacheKey, data.photo_url);
      }
    } catch (e) {}
  }

  // ==================== HABITS ====================
  async function loadProfileHabits() {
    const container = document.getElementById('profileHabits');
    if (!container) return;
    if (!supabaseEnabled) { container.innerHTML = ''; return; }
    try {
      const habitsRes = await fetch(`${SUPABASE_URL}/rest/v1/habits?select=*`, { headers: { apikey: SUPABASE_KEY } });
      const habits = await habitsRes.json();
      if (!Array.isArray(habits) || habits.length === 0) {
        container.innerHTML = '<div class="col-span-2 text-sm opacity-70 text-center">Привычки пока не добавлены</div>';
        return;
      }
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
        const div = document.createElement('div');
        div.className = 'bg-white/15 rounded-xl p-3 text-sm';
        div.innerHTML = `<div class="font-semibold mb-1">${habit.title || 'Привычка'}</div><div class="text-xs opacity-80">${doneDays} / 30</div>`;
        container.appendChild(div);
      });
    } catch (e) {
      container.innerHTML = '<div class="col-span-2 text-sm opacity-70 text-center">Ошибка загрузки привычек</div>';
    }
  }

  // ==================== LESSONS ====================
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

  async function loadDayFromSupabase() {
    const lessons = await fetch(`${SUPABASE_URL}/rest/v1/lessons?day=eq.${currentDay}`, {
      headers: { apikey: SUPABASE_KEY },
    }).then(r => r.json());
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
      if (lesson.video_url) { el.video.src = lesson.video_url; el.video.style.display = 'block'; }
      else { el.video.style.display = 'none'; el.video.removeAttribute('src'); }
    }
    const logs = await fetch(
      `${SUPABASE_URL}/rest/v1/daily_logs?app_user_id=eq.${currentAppUserId}&day=eq.${currentDay}`,
      { headers: { apikey: SUPABASE_KEY } }
    ).then(r => r.json());
    setCompleteButtonState({ completed: Boolean(Array.isArray(logs) && logs[0]?.completed) });
  }

  function nextDay() {
    currentDay++;
    if (currentUser) currentUser.day = currentDay;
    if (supabaseEnabled) loadDayFromSupabase().catch(() => initBrowserMode());
    else initBrowserMode();
    updateUI();
  }

  // ==================== SUPABASE INIT ====================
  async function initFromSupabase() {
    try {
      const usersRes = await fetch(
        `${SUPABASE_URL}/rest/v1/app_users?telegram_id=eq.${user.id}`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      const appUsers = await usersRes.json();
      let appUser = Array.isArray(appUsers) ? appUsers[0] : null;

      if (!appUser) {
        const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/app_users`, {
          method: 'POST',
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegram_id: user.id, username: user.username }),
        });
        const inserted = await insertRes.json();
        appUser = Array.isArray(inserted) ? inserted[0] : null;
      }

      if (!appUser) throw new Error('app_user not resolved');

      currentAppUserId = appUser.id;
      window.currentAppUserId = currentAppUserId;

      if (typeof initFitnessSync === 'function') initFitnessSync(currentAppUserId);

      const legacyUsers = await fetch(
        `${SUPABASE_URL}/rest/v1/users?app_user_id=eq.${currentAppUserId}`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      ).then(r => r.json());

      const existing = Array.isArray(legacyUsers) ? legacyUsers[0] : null;

      if (!existing) {
        const createRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
          method: 'POST',
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegram_id: user.id, username: user.username, app_user_id: currentAppUserId, day: 1, streak: 0, points: 0 }),
        });
        const createdArr = await createRes.json();
        const created = Array.isArray(createdArr) ? createdArr[0] : null;
        currentUser = created || { telegram_id: user.id, username: user.username, day: 1, streak: 0, points: 0, app_user_id: currentAppUserId };
        currentDay = 1;
      } else {
        currentUser = existing;
        currentDay = Number(existing.day ?? 1);
      }

      await loadDayFromSupabase();
      updateUI();
      await loadProfileHabits();
    } catch (e) {
      console.error('Supabase init error:', e);
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

  // ==================== COMPLETE BUTTON ====================
  if (el.completeBtn) {
    el.completeBtn.addEventListener('click', async () => {
      if (!supabaseEnabled) { setCompleteButtonState({ completed: true }); nextDay(); return; }
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/daily_logs`, {
          method: 'POST',
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ app_user_id: currentAppUserId, day: currentDay, completed: true }),
        });
        setCompleteButtonState({ completed: true });
        showAlert('✅ День выполнен! +10 баллов');
        if (isTelegram && tg?.MainButton) {
          try { tg.MainButton.setText('Следующий день →').show(); tg.MainButton.onClick(nextDay); } catch (e) { nextDay(); }
        } else { nextDay(); }
      } catch (e) { showAlert('Ошибка при сохранении.'); }
    });
  }

  // ==================== MOOD WIDGET ====================
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
      const level = 10 - index;
      segment.innerHTML = '';
      segment.style.backgroundColor = 'rgba(15,23,42,0.6)';
      if (level <= fullSegments) {
        const hue = 120 - level * 8;
        segment.style.backgroundColor = `hsl(${hue}, 70%, 50%)`;
      }
    });

    scoreEl.textContent = value.toFixed(1);
    yesterdayEl.textContent = yesterday.toFixed(1);

    const diff = value - yesterday;
    if (Math.abs(diff) < 0.1) { trendEl.textContent = '→ 0.0'; trendEl.className = 'text-[10px] opacity-70'; }
    else if (diff > 0) { trendEl.textContent = `↗ +${diff.toFixed(1)}`; trendEl.className = 'text-[10px] text-emerald-300'; }
    else { trendEl.textContent = `↘ ${diff.toFixed(1)}`; trendEl.className = 'text-[10px] text-red-300'; }

    let statusText = '', statusClass = 'text-xs font-medium ';
    if (value >= 8.5) { statusText = 'Пик, используй момент'; statusClass += 'text-orange-300'; }
    else if (value >= 7) { statusText = 'Хороший тон, есть ресурс'; statusClass += 'text-emerald-300'; }
    else if (value >= 5) { statusText = 'Норма, держи базу'; statusClass += 'text-amber-200'; }
    else if (value >= 3) { statusText = 'Усталость, нужен отдых'; statusClass += 'text-red-300'; }
    else { statusText = 'Кризис, нужна поддержка'; statusClass += 'text-red-400'; }
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
        renderGlobalMood(num, 6.5);
        if (window.FitnessSync && window.currentAppUserId) {
          const todayKey = window.FitnessState?.formatDateKey?.(new Date());
          if (todayKey) {
            try { await window.FitnessSync.saveMood(todayKey, num); } catch (e) { console.error('saveMood failed', e); }
          }
        }
      });
    }
    renderGlobalMood(7.3, 6.5);
  }

  // ==================== THEME ====================
  const THEME_STORAGE_KEY = 'fitnessTheme';
  const DEFAULT_THEME = 'dark';

  function fitnessApplyTheme(theme) {
    const root = document.documentElement;
    const themeToggle = document.getElementById('fitnessThemeToggle');
    const themeLabel = document.getElementById('fitnessThemeLabel');
    const mainThemeToggle = document.getElementById('mainThemeToggle');
    const mainThemeLabel = document.getElementById('mainThemeLabel');

    if (theme === 'dark') {
      root.setAttribute('data-fitness-theme', 'dark');
      if (themeToggle) { themeToggle.textContent = 'Тёмная'; themeToggle.className = 'px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-medium transition bg-indigo-500/50'; }
      if (themeLabel) themeLabel.textContent = 'Тёмная';
      if (mainThemeToggle) { mainThemeToggle.textContent = 'Тёмная'; mainThemeToggle.className = 'px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-medium transition bg-indigo-500/50'; }
      if (mainThemeLabel) mainThemeLabel.textContent = 'Тёмная';
    } else {
      root.removeAttribute('data-fitness-theme');
      if (themeToggle) { themeToggle.textContent = 'Светлая'; themeToggle.className = 'px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-medium transition'; }
      if (themeLabel) themeLabel.textContent = 'Светлая';
      if (mainThemeToggle) { mainThemeToggle.textContent = 'Светлая'; mainThemeToggle.className = 'px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-medium transition'; }
      if (mainThemeLabel) mainThemeLabel.textContent = 'Светлая';
    }
  }

  function fitnessToggleTheme() {
    const currentTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    fitnessApplyTheme(newTheme);
  }

  function fitnessInitTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
    fitnessApplyTheme(savedTheme);
  }

  const fitnessThemeToggle = document.getElementById('fitnessThemeToggle');
  if (fitnessThemeToggle) fitnessThemeToggle.addEventListener('click', fitnessToggleTheme);
  const mainThemeToggle = document.getElementById('mainThemeToggle');
  if (mainThemeToggle) mainThemeToggle.addEventListener('click', fitnessToggleTheme);
  fitnessInitTheme();

  // ==================== NAVIGATION BUTTONS ====================
  if (el.habitsBtn) el.habitsBtn.addEventListener('click', () => showAlert('Экран привычек будет позже'));
  if (el.buddyBtn) el.buddyBtn.addEventListener('click', showBuddy);
  if (el.backBtn) el.backBtn.addEventListener('click', showMain);

  // ==================== GLOBAL EXPORTS ====================
  window.App = {
    // Config
    tg, isTelegram, isDemoUser, user, supabaseEnabled,
    SUPABASE_URL, SUPABASE_KEY,
    
    // State
    get currentUser() { return currentUser; },
    get currentDay() { return currentDay; },
    get currentAppUserId() { return currentAppUserId; },
    
    // Navigation
    showMain, showBuddy, showFitness, setFitnessScreenActive,
    rootScreens, el,
    
    // Utils
    showAlert, updateUI,
    
    // Theme
    fitnessApplyTheme, fitnessToggleTheme, fitnessInitTheme,
  };

  // ==================== INITIALIZATION ====================
  initProfileHeader();
  initGlobalMoodWidget();

  if (supabaseEnabled) initFromSupabase();
  else initBrowserMode();

  console.log('[App Core] LeakFixer MiniApp initialized');

}); // end DOMContentLoaded
