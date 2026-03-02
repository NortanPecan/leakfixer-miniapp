/**
 * Profile Module
 * Handles user profile header (avatar, name, username)
 */

(function() {
  'use strict';

  const { user, isTelegram, isDemoUser } = window.TelegramApp;
  const { getInitData } = window.TelegramApp;
  const { SUPABASE_URL, SUPABASE_KEY } = window;

  /**
   * Initialize profile header
   */
  function initProfileHeader() {
    const photoEl = document.getElementById('profilePhoto');
    const nameEl = document.getElementById('profileName');
    const usernameEl = document.getElementById('profileUsername');

    if (!photoEl || !nameEl || !usernameEl) return;

    nameEl.textContent = user.first_name || 'LeakFixer User';
    usernameEl.textContent = user.username || 'demo';

    // Default avatar
    photoEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || 'LF')}&background=4f46e5&color=ffffff`;

    // Load real Telegram avatar
    loadTelegramProfilePhoto(photoEl);
  }

  /**
   * Load Telegram profile photo via API
   * @param {HTMLImageElement} photoEl
   */
  async function loadTelegramProfilePhoto(photoEl) {
    if (!photoEl) return;
    if (!isTelegram || isDemoUser) return;

    const initData = getInitData();
    if (!initData) return;

    const cacheKey = `tg_avatar_url:${user.id}`;
    const cached = window.localStorage?.getItem(cacheKey);

    if (cached) {
      photoEl.src = cached;
      return;
    }

    try {
      const res = await fetch(`/api/telegram-avatar?user_id=${encodeURIComponent(String(user.id))}`, {
        headers: {
          'x-telegram-init-data': initData,
        },
      });

      if (!res.ok) return;

      const data = await res.json();
      if (data?.photo_url) {
        photoEl.src = data.photo_url;
        window.localStorage?.setItem(cacheKey, data.photo_url);
      }
    } catch (e) {
      console.warn('Failed to load Telegram avatar:', e);
    }
  }

  // Export to window
  window.ProfileModule = {
    initProfileHeader,
    loadTelegramProfilePhoto
  };
})();
