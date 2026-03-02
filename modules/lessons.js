/**
 * Lessons Module
 * Handles daily lessons and completion
 */

(function() {
  'use strict';

  const { supabaseEnabled, showAlert, setupMainButton } = window.TelegramApp;
  const { SUPABASE_URL, SUPABASE_KEY } = window;

  // DOM elements
  let elements = {
    lessonTitle: null,
    lessonDesc: null,
    video: null,
    completeBtn: null
  };

  /**
   * Initialize lessons module
   */
  function init() {
    elements.lessonTitle = document.getElementById('lessonTitle');
    elements.lessonDesc = document.getElementById('lessonDesc');
    elements.video = document.getElementById('video');
    elements.completeBtn = document.getElementById('completeBtn');

    // Setup complete button handler
    if (elements.completeBtn) {
      elements.completeBtn.addEventListener('click', handleCompleteClick);
    }
  }

  /**
   * Set complete button state
   * @param {Object} options
   * @param {boolean} options.completed
   */
  function setCompleteButtonState({ completed }) {
    if (!elements.completeBtn) return;

    if (completed) {
      elements.completeBtn.textContent = '✅ Выполнено!';
      elements.completeBtn.disabled = true;
      elements.completeBtn.className = 'w-full bg-green-400 py-3 rounded-xl font-semibold text-lg cursor-not-allowed';
    } else {
      elements.completeBtn.textContent = '✅ Выполнено';
      elements.completeBtn.disabled = false;
      elements.completeBtn.className = 'w-full bg-green-500 hover:bg-green-600 py-3 rounded-xl font-semibold text-lg';
    }
  }

  /**
   * Load day data from Supabase
   */
  async function loadDayFromSupabase() {
    const currentDay = window.UserModule?.getCurrentDay() || 1;
    const currentAppUserId = window.UserModule?.getAppUserId();

    const lessons = await fetch(
      `${SUPABASE_URL}/rest/v1/lessons?day=eq.${currentDay}`,
      { headers: { apikey: SUPABASE_KEY } }
    ).then(r => r.json());

    const lesson = Array.isArray(lessons) ? lessons[0] : null;

    if (!lesson) {
      if (elements.lessonTitle) elements.lessonTitle.textContent = `День ${currentDay}`;
      if (elements.lessonDesc) elements.lessonDesc.textContent = 'Урок не найден.';
      if (elements.video) elements.video.style.display = 'none';
      setCompleteButtonState({ completed: false });
      return;
    }

    if (elements.lessonTitle) elements.lessonTitle.textContent = lesson.title ?? '';
    if (elements.lessonDesc) elements.lessonDesc.textContent = lesson.description ?? '';

    if (elements.video) {
      if (lesson.video_url) {
        elements.video.src = lesson.video_url;
        elements.video.style.display = 'block';
      } else {
        elements.video.style.display = 'none';
        elements.video.removeAttribute('src');
      }
    }

    // Check if already completed
    const logs = await fetch(
      `${SUPABASE_URL}/rest/v1/daily_logs?app_user_id=eq.${currentAppUserId}&day=eq.${currentDay}`,
      { headers: { apikey: SUPABASE_KEY } }
    ).then(r => r.json());

    const completed = Boolean(Array.isArray(logs) && logs[0]?.completed);
    setCompleteButtonState({ completed });
  }

  /**
   * Handle complete button click
   */
  async function handleCompleteClick() {
    if (!supabaseEnabled) {
      setCompleteButtonState({ completed: true });
      window.UserModule?.nextDay();
      return;
    }

    const currentDay = window.UserModule?.getCurrentDay() || 1;
    const currentAppUserId = window.UserModule?.getAppUserId();

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

      setupMainButton('Следующий день →', () => {
        window.UserModule?.nextDay();
      });

    } catch (e) {
      showAlert('Ошибка при сохранении.');
    }
  }

  /**
   * Setup demo mode
   */
  function setupDemoMode() {
    if (elements.lessonTitle) elements.lessonTitle.textContent = 'Демо-режим';
    if (elements.lessonDesc) elements.lessonDesc.textContent = 'Открыто в браузере. Telegram-данные недоступны.';
    if (elements.video) elements.video.style.display = 'none';
    setCompleteButtonState({ completed: false });
  }

  // Export to window
  window.LessonsModule = {
    init,
    loadDayFromSupabase,
    setCompleteButtonState,
    setupDemoMode
  };
})();
