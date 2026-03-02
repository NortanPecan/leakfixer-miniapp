/**
 * Navigation Module
 * Handles screen switching and navigation state
 */

(function() {
  'use strict';

  // Root screens
  const rootScreens = {
    main: null,
    fitness: null,
    buddy: null
  };

  /**
   * Initialize navigation with screen elements
   */
  function init() {
    rootScreens.main = document.getElementById('main');
    rootScreens.fitness = document.getElementById('fitnessScreen');
    rootScreens.buddy = document.getElementById('buddyScreen');
  }

  /**
   * Set fitness screen active state (for styling)
   * @param {boolean} active
   */
  function setFitnessScreenActive(active) {
    document.body.classList.toggle('fitness-screen-active', Boolean(active));
  }

  /**
   * Show main screen
   */
  function showMain() {
    setFitnessScreenActive(false);
    if (rootScreens.main) rootScreens.main.classList.remove('hidden');
    if (rootScreens.fitness) rootScreens.fitness.classList.add('hidden');
    if (rootScreens.buddy) rootScreens.buddy.classList.add('hidden');
  }

  /**
   * Show fitness screen
   */
  function showFitness() {
    setFitnessScreenActive(true);
    if (rootScreens.main) rootScreens.main.classList.add('hidden');
    if (rootScreens.buddy) rootScreens.buddy.classList.add('hidden');
    if (rootScreens.fitness) {
      rootScreens.fitness.classList.remove('hidden');
      rootScreens.fitness.scrollTop = 0;
    }
  }

  /**
   * Show buddy screen
   */
  function showBuddy() {
    setFitnessScreenActive(false);
    if (rootScreens.main) rootScreens.main.classList.add('hidden');
    if (rootScreens.fitness) rootScreens.fitness.classList.add('hidden');
    if (rootScreens.buddy) rootScreens.buddy.classList.remove('hidden');
  }

  // Export to window
  window.Navigation = {
    init,
    showMain,
    showFitness,
    showBuddy,
    setFitnessScreenActive
  };
})();
