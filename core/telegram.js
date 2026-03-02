/**
 * Telegram WebApp Integration
 * Handles Telegram Mini App initialization and utilities
 */

(function() {
  'use strict';

  const tg = window.Telegram?.WebApp;
  const isTelegram = Boolean(tg && typeof tg === 'object');

  // Initialize Telegram WebApp
  if (isTelegram) {
    tg?.ready();
    try {
      if (typeof tg.expand === 'function') tg.expand();
    } catch (e) {
      console.warn('Failed to expand Telegram WebApp:', e);
    }
  }

  const tgUser = tg?.initDataUnsafe?.user ?? null;
  const isDemoUser = !(tgUser && tgUser.id);
  const user = !isDemoUser ? tgUser : {
    id: 123,
    username: 'demo_user',
    first_name: 'Demo User'
  };
  const supabaseEnabled = Boolean(isTelegram && !isDemoUser && user?.id);

  /**
   * Show alert (uses Telegram native alert or browser fallback)
   * @param {string} message - Message to display
   */
  function showAlert(message) {
    if (isTelegram && typeof tg?.showAlert === 'function') {
      try {
        tg.showAlert(message);
      } catch (e) {
        window.alert(message);
      }
    } else {
      window.alert(message);
    }
  }

  /**
   * Get Telegram init data for API requests
   * @returns {string|null}
   */
  function getInitData() {
    return tg?.initData || null;
  }

  /**
   * Setup main button
   * @param {string} text - Button text
   * @param {Function} onClick - Click handler
   */
  function setupMainButton(text, onClick) {
    if (isTelegram && tg?.MainButton) {
      try {
        tg.MainButton.setText(text).show();
        tg.MainButton.onClick(onClick);
      } catch (e) {
        console.warn('Failed to setup MainButton:', e);
      }
    }
  }

  /**
   * Haptic feedback
   */
  function haptic(style = 'light') {
    if (isTelegram && tg?.HapticFeedback) {
      try {
        if (style === 'light') tg.HapticFeedback.impactOccurred('light');
        else if (style === 'medium') tg.HapticFeedback.impactOccurred('medium');
        else if (style === 'heavy') tg.HapticFeedback.impactOccurred('heavy');
        else if (style === 'success') tg.HapticFeedback.notificationOccurred('success');
        else if (style === 'error') tg.HapticFeedback.notificationOccurred('error');
      } catch (e) {}
    }
  }

  // Export to window
  window.TelegramApp = {
    tg,
    isTelegram,
    isDemoUser,
    user,
    supabaseEnabled,
    showAlert,
    getInitData,
    setupMainButton,
    haptic
  };
})();
