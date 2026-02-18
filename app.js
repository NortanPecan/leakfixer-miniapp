document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;
  const isTelegram = Boolean(tg && typeof tg === 'object');
  const tgUser = tg?.initDataUnsafe?.user ?? null;
  const user = tgUser && tgUser.id ? tgUser : null;
  const supabaseEnabled = Boolean(isTelegram && user?.id);

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

  let currentUser = null;
  let currentDay = 1;

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

  async function initFromSupabase() {
    try {
      const users = await fetch(`${SUPABASE_URL}/rest/v1/users?telegram_id=eq.${user.id}`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      }).then((r) => r.json());

      const existing = Array.isArray(users) ? users[0] : null;

      if (!existing) {
        await fetch(`${SUPABASE_URL}/rest/v1/users`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ telegram_id: user.id, username: user.username }),
        });
        currentUser = { telegram_id: user.id, username: user.username, day: 1, streak: 0, points: 0 };
      } else {
        currentUser = existing;
        currentDay = Number(existing.day ?? 1);
      }

      await loadDayFromSupabase();
      updateUI();
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

    const logs = await fetch(`${SUPABASE_URL}/rest/v1/daily_logs?user_id=eq.${user.id}&day=eq.${currentDay}`, {
      headers: { apikey: SUPABASE_KEY },
    }).then((r) => r.json());

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
          body: JSON.stringify({ user_id: user.id, day: currentDay, completed: true }),
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

  if (el.habitsBtn) {
    el.habitsBtn.addEventListener('click', () => {
      // Экран привычек пока не реализован
    });
  }

  if (el.buddyBtn) {
    el.buddyBtn.addEventListener('click', () => {
      el.main?.classList.add('hidden');
      el.buddyScreen?.classList.remove('hidden');
    });
  }

  if (el.backBtn) {
    el.backBtn.addEventListener('click', () => {
      el.buddyScreen?.classList.add('hidden');
      el.main?.classList.remove('hidden');
    });
  }

  if (supabaseEnabled) initFromSupabase();
  else initBrowserMode();
});
