/**
 * Habits Module
 * Handles habits display and tracking
 */

(function() {
  'use strict';

  const { supabaseEnabled } = window.TelegramApp;
  const { SUPABASE_URL, SUPABASE_KEY } = window;

  /**
   * Load and display profile habits
   */
  async function loadProfileHabits() {
    const container = document.getElementById('profileHabits');
    if (!container) return;

    if (!supabaseEnabled) {
      container.innerHTML = '';
      return;
    }

    const currentAppUserId = window.UserModule?.getAppUserId();

    try {
      // 1. Get all habits
      const habitsRes = await fetch(`${SUPABASE_URL}/rest/v1/habits?select=*`, {
        headers: { apikey: SUPABASE_KEY }
      });
      const habits = await habitsRes.json();

      if (!Array.isArray(habits) || habits.length === 0) {
        container.innerHTML = '<div class="col-span-2 text-sm opacity-70 text-center">Привычки пока не добавлены</div>';
        return;
      }

      // 2. Get habit logs for current user
      const logsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/habit_logs?app_user_id=eq.${currentAppUserId}&completed=eq.true&select=habit_id,day`,
        { headers: { apikey: SUPABASE_KEY } }
      );
      const logs = await logsRes.json();

      // Count completed days per habit
      const counts = {};
      if (Array.isArray(logs)) {
        for (const log of logs) {
          if (!counts[log.habit_id]) counts[log.habit_id] = new Set();
          counts[log.habit_id].add(log.day);
        }
      }

      // Render habits
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
      console.error('Error loading habits:', e);
      container.innerHTML = '<div class="col-span-2 text-sm opacity-70 text-center">Ошибка загрузки привычек</div>';
    }
  }

  // Export to window
  window.HabitsModule = {
    loadProfileHabits
  };
})();
