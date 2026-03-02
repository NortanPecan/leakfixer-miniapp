/**
 * User Module
 * Handles user state, progress, and profile
 */

(function() {
  'use strict';

  const { user, supabaseEnabled, showAlert } = window.TelegramApp;
  const { SUPABASE_URL, SUPABASE_KEY } = window;

  let currentUser = null;
  let currentDay = 1;
  let currentAppUserId = null;

  // DOM elements cache
  const elements = {
    currentDay: null,
    streak: null,
    points: null
  };

  /**
   * Initialize user module
   */
  function init() {
    elements.currentDay = document.getElementById('currentDay');
    elements.streak = document.getElementById('streak');
    elements.points = document.getElementById('points');
  }

  /**
   * Get current app user ID
   * @returns {number|null}
   */
  function getAppUserId() {
    return currentAppUserId;
  }

  /**
   * Get current user data
   * @returns {Object|null}
   */
  function getCurrentUser() {
    return currentUser;
  }

  /**
   * Get current day number
   * @returns {number}
   */
  function getCurrentDay() {
    return currentDay;
  }

  /**
   * Update UI with current user data
   */
  function updateUI() {
    if (!currentUser) return;
    if (elements.currentDay) elements.currentDay.textContent = `День ${currentDay}/30`;
    if (elements.streak) elements.streak.textContent = String(currentUser.streak ?? 0);
    if (elements.points) elements.points.textContent = String(currentUser.points ?? 0);
  }

  /**
   * Initialize user from Supabase
   */
  async function initFromSupabase() {
    try {
      // 1. Find or create app_user by telegram_id
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

      // Initialize fitness sync if available
      if (typeof initFitnessSync === 'function') {
        initFitnessSync(currentAppUserId);
      }

      // 2. Get or create legacy user record for progress
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

      // Load day data
      if (window.LessonsModule?.loadDayFromSupabase) {
        await window.LessonsModule.loadDayFromSupabase();
      }
      updateUI();
      
      if (window.HabitsModule?.loadProfileHabits) {
        await window.HabitsModule.loadProfileHabits();
      }

    } catch (e) {
      console.error('Supabase init error:', e);
      showAlert('Ошибка инициализации (Supabase).');
      initBrowserMode();
    }
  }

  /**
   * Initialize browser/demo mode
   */
  function initBrowserMode() {
    currentUser = {
      telegram_id: null,
      username: 'browser',
      day: 1,
      streak: 0,
      points: 0
    };
    currentDay = 1;
    updateUI();
    if (window.HabitsModule?.loadProfileHabits) {
      window.HabitsModule.loadProfileHabits();
    }
  }

  /**
   * Go to next day
   */
  function nextDay() {
    currentDay++;
    if (currentUser) currentUser.day = currentDay;

    if (supabaseEnabled) {
      if (window.LessonsModule?.loadDayFromSupabase) {
        window.LessonsModule.loadDayFromSupabase().catch(() => initBrowserMode());
      }
    } else {
      initBrowserMode();
    }

    updateUI();
  }

  // Export to window
  window.UserModule = {
    init,
    getAppUserId,
    getCurrentUser,
    getCurrentDay,
    updateUI,
    initFromSupabase,
    initBrowserMode,
    nextDay
  };

  // Also set global for backward compatibility
  window.currentAppUserId = null;
})();
