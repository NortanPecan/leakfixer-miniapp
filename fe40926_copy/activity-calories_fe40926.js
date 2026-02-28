/**
 * Activity Calories Calculator
 * Реальные формулы расчёта энергозатрат для различных типов активности
 * На основе MET (Metabolic Equivalent of Task) и других научных моделей
 */

// ===================== КОНСТАНТЫ MET (Metabolic Equivalent of Task) =====================
// Источник: Compendium of Physical Activities (2024)
// 1 MET = 3.5 мл кислорода/кг/мин ≈ 1 ккал/кг/час для типичного человека

const MET_VALUES = {
  // Силовые тренировки
  STRENGTH: {
    LIGHT: 3.0,    // Лёгкая силовая (восстановительная)
    MODERATE: 5.0, // Средняя интенсивность
    VIGOROUS: 6.0, // Высокая интенсивность
    CIRCUIT: 8.0,  // Круговая тренировка
    POWERLIFTING: 6.0, // Пауэрлифтинг (тяжёлые веса, длинные паузы)
    BODYBUILDING: 5.5, // Бодибилдинг (средние веса, короткие паузы)
  },
  
  // Аэробные тренировки (зал)
  CARDIO_INDOOR: {
    WALKING_TREADMILL: 4.0,      // Ходьба на беговой дорожке
    RUNNING_TREADMILL_SLOW: 7.0,  // Бег на дорожке (8 км/ч)
    RUNNING_TREADMILL_FAST: 11.0, // Бег на дорожке (12+ км/ч)
    ELLIPTICAL_LIGHT: 5.0,       // Эллипс (лёгкий)
    ELLIPTICAL_MODERATE: 7.0,    // Эллипс (средний)
    ELLIPTICAL_VIGOROUS: 9.0,    // Эллипс (интенсивный)
    STATIONARY_BIKE_LIGHT: 4.0,  // Велотренажёр (лёгкий)
    STATIONARY_BIKE_MODERATE: 7.0, // Велотренажёр (средний)
    STATIONARY_BIKE_VIGOROUS: 10.5, // Велотренажёр (интенсивный)
    ROWING_LIGHT: 3.5,           // Гребной тренажёр (лёгкий)
    ROWING_MODERATE: 7.0,        // Гребной тренажёр (средний)
    ROWING_VIGOROUS: 8.5,        // Гребной тренажёр (интенсивный)
    STEPPER: 8.0,                // Степпер
  },
  
  // Аэробные тренировки (улица)
  CARDIO_OUTDOOR: {
    WALKING_LEISURE: 3.0,        // Прогулочная ходьба (3-4 км/ч)
    WALKING_BRISK: 4.5,          // Быстрая ходьба (5-6 км/ч)
    WALKING_RACE: 6.5,           // Спортивная ходьба (7+ км/ч)
    RUNNING_SLOW: 8.0,           // Бег (8-9 км/ч)
    RUNNING_MODERATE: 10.0,      // Бег (10-11 км/ч)
    RUNNING_FAST: 11.5,          // Бег (12-13 км/ч)
    RUNNING_SPRINT: 14.0,        // Бег спринт (14+ км/ч)
    CYCLING_LEISURE: 4.0,        // Велосипед прогулочный (<16 км/ч)
    CYCLING_MODERATE: 8.0,       // Велосипед средний (16-19 км/ч)
    CYCLING_FAST: 10.0,          // Велосипед быстрый (19-22 км/ч)
    CYCLING_RACE: 12.0,          // Велосипед гоночный (>22 км/ч)
    SWIMMING_LEISURE: 6.0,       // Плавание (лёгкое)
    SWIMMING_MODERATE: 8.0,      // Плавание (среднее)
    SWIMMING_VIGOROUS: 10.0,     // Плавание (интенсивное)
    SKIING_CROSS_COUNTRY: 9.0,   // Лыжи классика
    SKIING_SKATING: 12.0,        // Лыжи коньком
  },
  
  // Домашние упражнения (по времени)
  HOME_EXERCISE_TIME: {
    PUSHUPS_MODERATE: 4.0,       // Отжимания (умеренный темп)
    PUSHUPS_VIGOROUS: 8.0,       // Отжимания (интенсивно)
    SQUATS_BODYWEIGHT: 5.5,      // Приседания с весом тела
    SQUATS_WEIGHTED: 6.5,        // Приседания с доп. весом
    LUNGES: 4.0,                 // Выпады
    PLANK: 3.5,                  // Планка (статика)
    CRUNCHES: 4.0,               // Скручивания
    LEG_RAISES: 3.5,             // Подъёмы ног
    BURPEES: 8.0,                // Бёрпи
    JUMPING_JACKS: 8.0,          // Джампинг джек
    MOUNTAIN_CLIMBERS: 8.0,      // Альпинист
    HIGH_KNEES: 8.0,             // Бег с высоким подниманием колен
    SHADOW_BOXING: 6.0,          // Бокс с тенью
    YOGA_LIGHT: 2.5,             // Йога (лёгкая)
    YOGA_MODERATE: 4.0,          // Йога (средняя)
    PILATES: 3.5,                // Пилатес
    STRETCHING: 2.5,             // Растяжка
  },
  
  // Домашние упражнения (по повторениям - приблизительно)
  HOME_EXERCISE_REPS: {
    // Калории на 1 повторение для человека 70 кг
    // Зависят от техники и амплитуды
    PUSHUP: 0.5,                 // Отжимание
    SQUAT_BODYWEIGHT: 0.4,       // Приседание с весом тела
    SQUAT_WEIGHTED: 0.6,         // Приседание с весом
    LUNGE: 0.35,                 // Выпад
    CRUNCH: 0.15,                // Скручивание
    LEG_RAISE: 0.2,              // Подъём ног
    BURPEE: 1.5,                 // Бёрпи
    JUMPING_JACK: 0.2,           // Джампинг джек
  },
  
  // Шаги и повседневная активность
  DAILY: {
    STEPS_SLOW: 0.035,           // Ккал на шаг (медленная ходьба)
    STEPS_NORMAL: 0.04,          // Ккал на шаг (обычная ходьба)
    STEPS_BRISK: 0.05,           // Ккал на шаг (быстрая ходьба)
    STAIRS_UP: 0.15,             // Ккал на шаг вверх
    STAIRS_DOWN: 0.05,           // Ккал на шаг вниз
    STANDING: 1.3,               // Стояние (в час)
    LIGHT_MOVEMENT: 2.0,         // Лёгкая работа/движение
    HOUSEHOLD_LIGHT: 2.5,        // Домашние дела (лёгкие)
    HOUSEHOLD_MODERATE: 4.0,     // Домашние дела (умеренные)
  }
};

// ===================== ЦЕЛИ АКТИВНОСТИ (можно менять) =====================
const ACTIVITY_GOALS = {
  GYM_MINUTES: 45,           // Цель по времени силовой тренировки
  GYM_SESSIONS: 1,           // Цель по количеству силовых тренировок в день
  CARDIO_MINUTES: 30,        // Цель по времени кардио
  CARDIO_CALORIES: 300,      // Цель по калориям кардио
  STEPS: 8000,               // Цель по шагам
  HOME_MINUTES: 20,          // Цель по времени домашней тренировки
  HOME_CALORIES: 150,        // Цель по калориям домашней тренировки
};

// ===================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====================

/**
 * Получить вес пользователя из профиля (кг)
 * @returns {number} вес в кг, по умолчанию 70
 */
function getUserWeight() {
  try {
    // Try to get from fitness.js getFitnessProfile
    if (typeof getFitnessProfile === 'function') {
      const profile = getFitnessProfile();
      if (profile && profile.weight && profile.weight > 0) {
        return profile.weight;
      }
    }
    // Fallback to window.getFitnessProfile
    if (window.getFitnessProfile) {
      const profile = window.getFitnessProfile();
      if (profile && profile.weight && profile.weight > 0) {
        return profile.weight;
      }
    }
  } catch (e) {
    console.warn('[ActivityCalories] Could not get user weight:', e);
  }
  return 70; // Default weight
}

/**
 * Расчёт калорий по формуле MET
 * Формула: Ккал = MET × вес(кг) × время(час)
 * @param {number} met - значение MET
 * @param {number} weightKg - вес в кг
 * @param {number} minutes - время в минутах
 * @returns {number} калории
 */
function calculateMETCalories(met, weightKg, minutes) {
  return Math.round(met * weightKg * (minutes / 60));
}

// ===================== РАСЧЁТ КАЛОРИЙ ДЛЯ РАЗНЫХ ТИПОВ АКТИВНОСТИ =====================

/**
 * Расчёт калорий для силовой тренировки на основе объёма работы
 * Использует модель: объём (вес × повторения) + MET базовый
 * 
 * @param {Object} workoutData - данные тренировки
 * @param {number} workoutData.durationMinutes - длительность в минутах
 * @param {Array} workoutData.exercises - массив упражнений
 *   каждое упражнение: { setsCount, repsCount, workWeight, name }
 * @param {number} [weightKg] - вес пользователя
 * @returns {Object} { calories, details }
 */
function calculateStrengthCalories(workoutData, weightKg = null) {
  const userWeight = weightKg || getUserWeight();
  const duration = workoutData.durationMinutes || 45;
  const exercises = workoutData.exercises || [];
  
  // Базовый расход по MET (средняя интенсивность силовой)
  const baseMET = MET_VALUES.STRENGTH.MODERATE;
  const baseCalories = calculateMETCalories(baseMET, userWeight, duration);
  
  // Дополнительные калории за объём работы
  // Формула: каждый кг × повторение ≈ 0.1 ккал (очень приблизительно)
  let volumeCalories = 0;
  let totalVolume = 0; // суммарный объём (кг × повторения)
  
  exercises.forEach(ex => {
    const sets = parseInt(ex.setsCount) || 0;
    const reps = parseInt(ex.repsCount) || 0;
    const weight = parseFloat(ex.workWeight) || 0;
    
    if (sets > 0 && reps > 0) {
      // Объём для этого упражнения
      const exVolume = sets * reps * weight;
      totalVolume += exVolume;
      
      // Калории за объём (коэффициент зависит от веса)
      // Чем больше вес относительно веса тела - тем выше интенсивность
      const relativeIntensity = weight > 0 ? (weight / userWeight) : 0.5;
      const volumeFactor = 0.05 + (relativeIntensity * 0.05); // 0.05-0.1 ккал за кг×повтор
      volumeCalories += exVolume * volumeFactor;
    }
  });
  
  // Если нет данных об упражнениях - используем только MET
  if (exercises.length === 0 || totalVolume === 0) {
    return {
      calories: baseCalories,
      details: {
        baseCalories,
        volumeCalories: 0,
        totalVolume: 0,
        method: 'MET_only',
        met: baseMET,
        duration,
        userWeight
      }
    };
  }
  
  // Комбинированный расчёт: MET + объём
  // Весовой коэффициент: 70% MET (время) + 30% объём
  const totalCalories = Math.round(baseCalories * 0.7 + volumeCalories * 0.3);
  
  return {
    calories: totalCalories,
    details: {
      baseCalories: Math.round(baseCalories * 0.7),
      volumeCalories: Math.round(volumeCalories * 0.3),
      totalVolume,
      method: 'MET_plus_volume',
      met: baseMET,
      duration,
      userWeight,
      exerciseCount: exercises.length
    }
  };
}

/**
 * Упрощённый расчёт для силовой тренировки (только по времени)
 * Используется когда нет данных об упражнениях
 * 
 * @param {number} durationMinutes - длительность в минутах
 * @param {string} intensity - 'light', 'moderate', 'vigorous', 'circuit'
 * @param {number} [weightKg] - вес пользователя
 * @returns {number} калории
 */
function calculateSimpleStrengthCalories(durationMinutes, intensity = 'moderate', weightKg = null) {
  const userWeight = weightKg || getUserWeight();
  const metMap = {
    'light': MET_VALUES.STRENGTH.LIGHT,
    'moderate': MET_VALUES.STRENGTH.MODERATE,
    'vigorous': MET_VALUES.STRENGTH.VIGOROUS,
    'circuit': MET_VALUES.STRENGTH.CIRCUIT,
  };
  const met = metMap[intensity] || MET_VALUES.STRENGTH.MODERATE;
  return calculateMETCalories(met, userWeight, durationMinutes);
}

/**
 * Расчёт калорий для аэробной тренировки
 * 
 * @param {Object} cardioData - данные кардио
 * @param {string} cardioData.type - тип активности (ключ из MET_VALUES.CARDIO_INDOOR или CARDIO_OUTDOOR)
 * @param {number} cardioData.durationMinutes - длительность
 * @param {number} [cardioData.distanceKm] - дистанция (опционально для расчёта скорости)
 * @param {boolean} [cardioData.isOutdoor] - на улице или в зале
 * @param {number} [weightKg] - вес пользователя
 * @returns {Object} { calories, details }
 */
function calculateCardioCalories(cardioData, weightKg = null) {
  const userWeight = weightKg || getUserWeight();
  const duration = cardioData.durationMinutes || 0;
  const isOutdoor = cardioData.isOutdoor || false;
  
  // Определяем MET
  let met = 5.0; // default
  const type = cardioData.type || 'WALKING_TREADMILL';
  
  if (isOutdoor) {
    met = MET_VALUES.CARDIO_OUTDOOR[type] || MET_VALUES.CARDIO_OUTDOOR.WALKING_LEISURE;
  } else {
    met = MET_VALUES.CARDIO_INDOOR[type] || MET_VALUES.CARDIO_INDOOR.WALKING_TREADMILL;
  }
  
  // Если есть дистанция - можно скорректировать MET по фактической скорости
  let speedKmh = null;
  if (cardioData.distanceKm && duration > 0) {
    speedKmh = (cardioData.distanceKm / duration) * 60;
    
    // Корректировка MET по скорости для бега/ходьбы
    if (type.includes('WALKING')) {
      if (speedKmh < 4) met = MET_VALUES.CARDIO_OUTDOOR.WALKING_LEISURE;
      else if (speedKmh < 6) met = MET_VALUES.CARDIO_OUTDOOR.WALKING_BRISK;
      else met = MET_VALUES.CARDIO_OUTDOOR.WALKING_RACE;
    } else if (type.includes('RUNNING')) {
      if (speedKmh < 9) met = MET_VALUES.CARDIO_OUTDOOR.RUNNING_SLOW;
      else if (speedKmh < 11) met = MET_VALUES.CARDIO_OUTDOOR.RUNNING_MODERATE;
      else if (speedKmh < 13) met = MET_VALUES.CARDIO_OUTDOOR.RUNNING_FAST;
      else met = MET_VALUES.CARDIO_OUTDOOR.RUNNING_SPRINT;
    } else if (type.includes('CYCLING') || type.includes('BIKE')) {
      if (speedKmh < 16) met = isOutdoor ? MET_VALUES.CARDIO_OUTDOOR.CYCLING_LEISURE : MET_VALUES.CARDIO_INDOOR.STATIONARY_BIKE_LIGHT;
      else if (speedKmh < 19) met = isOutdoor ? MET_VALUES.CARDIO_OUTDOOR.CYCLING_MODERATE : MET_VALUES.CARDIO_INDOOR.STATIONARY_BIKE_MODERATE;
      else if (speedKmh < 22) met = isOutdoor ? MET_VALUES.CARDIO_OUTDOOR.CYCLING_FAST : MET_VALUES.CARDIO_INDOOR.STATIONARY_BIKE_VIGOROUS;
      else met = isOutdoor ? MET_VALUES.CARDIO_OUTDOOR.CYCLING_RACE : MET_VALUES.CARDIO_INDOOR.STATIONARY_BIKE_VIGOROUS;
    }
  }
  
  const calories = calculateMETCalories(met, userWeight, duration);
  
  return {
    calories,
    details: {
      met,
      duration,
      userWeight,
      speedKmh: speedKmh ? Math.round(speedKmh * 10) / 10 : null,
      distanceKm: cardioData.distanceKm || null,
      isOutdoor
    }
  };
}

/**
 * Расчёт калорий для домашней тренировки
 * 
 * @param {Object} homeData - данные домашней тренировки
 * @param {string} homeData.exerciseType - тип упражнения (ключ из HOME_EXERCISE_TIME или HOME_EXERCISE_REPS)
 * @param {number} [homeData.durationMinutes] - время выполнения (для временных упражнений)
 * @param {number} [homeData.repetitions] - количество повторений (для реп-based упражнений)
 * @param {number} [weightKg] - вес пользователя
 * @returns {Object} { calories, details }
 */
function calculateHomeExerciseCalories(homeData, weightKg = null) {
  const userWeight = weightKg || getUserWeight();
  const type = homeData.exerciseType || 'PUSHUPS_MODERATE';
  
  // Проверяем, есть ли тип в списке по времени
  const met = MET_VALUES.HOME_EXERCISE_TIME[type];
  
  if (met && homeData.durationMinutes) {
    // Расчёт по времени
    const calories = calculateMETCalories(met, userWeight, homeData.durationMinutes);
    return {
      calories,
      details: {
        method: 'time_based',
        met,
        duration: homeData.durationMinutes,
        userWeight,
        exerciseType: type
      }
    };
  }
  
  // Расчёт по повторениям
  const repCalories = MET_VALUES.HOME_EXERCISE_REPS[type];
  if (repCalories && homeData.repetitions) {
    // Корректировка на вес пользователя (норма 70 кг)
    const weightFactor = userWeight / 70;
    const calories = Math.round(homeData.repetitions * repCalories * weightFactor);
    return {
      calories,
      details: {
        method: 'reps_based',
        caloriesPerRep: repCalories,
        repetitions: homeData.repetitions,
        weightFactor: Math.round(weightFactor * 100) / 100,
        userWeight,
        exerciseType: type
      }
    };
  }
  
  // Fallback: если ничего не подошло
  return {
    calories: 0,
    details: {
      method: 'unknown',
      error: 'Could not calculate - missing duration or reps',
      exerciseType: type
    }
  };
}

/**
 * Расчёт калорий для шагов
 * 
 * @param {number} steps - количество шагов
 * @param {string} intensity - 'slow', 'normal', 'brisk'
 * @param {number} [weightKg] - вес пользователя
 * @returns {Object} { calories, details }
 */
function calculateStepsCalories(steps, intensity = 'normal', weightKg = null) {
  const userWeight = weightKg || getUserWeight();
  const factorMap = {
    'slow': MET_VALUES.DAILY.STEPS_SLOW,
    'normal': MET_VALUES.DAILY.STEPS_NORMAL,
    'brisk': MET_VALUES.DAILY.STEPS_BRISK,
  };
  const factor = factorMap[intensity] || MET_VALUES.DAILY.STEPS_NORMAL;
  
  // Корректировка на вес (норма 70 кг)
  const weightFactor = userWeight / 70;
  const calories = Math.round(steps * factor * weightFactor);
  
  return {
    calories,
    details: {
      steps,
      factor,
      weightFactor: Math.round(weightFactor * 100) / 100,
      userWeight,
      intensity
    }
  };
}

/**
 * Универсальная функция расчёта калорий для любой активности
 * Используется в fitness.js
 * 
 * @param {Object} activity - объект активности из fitness.js
 * @returns {number} калории
 */
function calculateActivityCaloriesUniversal(activity) {
  if (!activity) return 0;
  
  const kind = activity.kind;
  const userWeight = getUserWeight();
  
  switch (kind) {
    case 'gym':
    case 'strength':
      // Если есть данные о тренировке из GYM
      if (activity.gymData) {
        const result = calculateStrengthCalories(activity.gymData, userWeight);
        return result.calories;
      }
      // Иначе простой расчёт по времени
      return calculateSimpleStrengthCalories(
        activity.durationMinutes || 45,
        activity.intensity || 'moderate',
        userWeight
      );
      
    case 'cardio':
    case 'cardio_indoor':
      return calculateCardioCalories({
        type: activity.cardioType || 'WALKING_TREADMILL',
        durationMinutes: activity.durationMinutes || 0,
        distanceKm: activity.distanceKm,
        isOutdoor: false
      }, userWeight).calories;
      
    case 'cardio_outdoor':
      return calculateCardioCalories({
        type: activity.cardioType || 'WALKING_LEISURE',
        durationMinutes: activity.durationMinutes || 0,
        distanceKm: activity.distanceKm,
        isOutdoor: true
      }, userWeight).calories;
      
    case 'home':
    case 'home_exercise':
      return calculateHomeExerciseCalories({
        exerciseType: activity.exerciseType || 'PUSHUPS_MODERATE',
        durationMinutes: activity.durationMinutes,
        repetitions: activity.repetitions
      }, userWeight).calories;
      
    case 'steps':
      return calculateStepsCalories(
        activity.steps || 0,
        activity.intensity || 'normal',
        userWeight
      ).calories;
      
    default:
      // Для неизвестных типов - простой расчёт по MET
      if (activity.durationMinutes && activity.met) {
        return calculateMETCalories(activity.met, userWeight, activity.durationMinutes);
      }
      return activity.calories || 0;
  }
}

/**
 * Получить список доступных типов кардио
 * @param {boolean} isOutdoor - для улицы или зала
 * @returns {Array} список { key, label, met }
 */
function getCardioTypes(isOutdoor = false) {
  const source = isOutdoor ? MET_VALUES.CARDIO_OUTDOOR : MET_VALUES.CARDIO_INDOOR;
  const labels = isOutdoor ? {
    WALKING_LEISURE: 'Ходьба прогулочная',
    WALKING_BRISK: 'Ходьба быстрая',
    WALKING_RACE: 'Ходьба спортивная',
    RUNNING_SLOW: 'Бег (медленный)',
    RUNNING_MODERATE: 'Бег (средний)',
    RUNNING_FAST: 'Бег (быстрый)',
    RUNNING_SPRINT: 'Бег (спринт)',
    CYCLING_LEISURE: 'Велосипед прогулочный',
    CYCLING_MODERATE: 'Велосипед средний',
    CYCLING_FAST: 'Велосипед быстрый',
    CYCLING_RACE: 'Велосипед гоночный',
    SWIMMING_LEISURE: 'Плавание (лёгкое)',
    SWIMMING_MODERATE: 'Плавание (среднее)',
    SWIMMING_VIGOROUS: 'Плавание (интенсивное)',
    SKIING_CROSS_COUNTRY: 'Лыжи классика',
    SKIING_SKATING: 'Лыжи коньком',
  } : {
    WALKING_TREADMILL: 'Ходьба на дорожке',
    RUNNING_TREADMILL_SLOW: 'Бег на дорожке (медленный)',
    RUNNING_TREADMILL_FAST: 'Бег на дорожке (быстрый)',
    ELLIPTICAL_LIGHT: 'Эллипс (лёгкий)',
    ELLIPTICAL_MODERATE: 'Эллипс (средний)',
    ELLIPTICAL_VIGOROUS: 'Эллипс (интенсивный)',
    STATIONARY_BIKE_LIGHT: 'Велотренажёр (лёгкий)',
    STATIONARY_BIKE_MODERATE: 'Велотренажёр (средний)',
    STATIONARY_BIKE_VIGOROUS: 'Велотренажёр (интенсивный)',
    ROWING_LIGHT: 'Гребной тренажёр (лёгкий)',
    ROWING_MODERATE: 'Гребной тренажёр (средний)',
    ROWING_VIGOROUS: 'Гребной тренажёр (интенсивный)',
    STEPPER: 'Степпер',
  };
  
  return Object.keys(source).map(key => ({
    key,
    label: labels[key] || key,
    met: source[key]
  }));
}

/**
 * Получить список домашних упражнений
 * @returns {Array} список { key, label, category, inputType }
 */
function getHomeExerciseTypes() {
  return [
    // Силовые (время или повторения)
    { key: 'PUSHUPS_MODERATE', label: 'Отжимания (умеренно)', category: 'strength', inputType: 'both', met: MET_VALUES.HOME_EXERCISE_TIME.PUSHUPS_MODERATE },
    { key: 'PUSHUPS_VIGOROUS', label: 'Отжимания (интенсивно)', category: 'strength', inputType: 'both', met: MET_VALUES.HOME_EXERCISE_TIME.PUSHUPS_VIGOROUS },
    { key: 'SQUATS_BODYWEIGHT', label: 'Приседания с весом тела', category: 'strength', inputType: 'both', met: MET_VALUES.HOME_EXERCISE_TIME.SQUATS_BODYWEIGHT },
    { key: 'SQUATS_WEIGHTED', label: 'Приседания с доп. весом', category: 'strength', inputType: 'both', met: MET_VALUES.HOME_EXERCISE_TIME.SQUATS_WEIGHTED },
    { key: 'LUNGES', label: 'Выпады', category: 'strength', inputType: 'both', met: MET_VALUES.HOME_EXERCISE_TIME.LUNGES },
    
    // Пресс (время или повторения)
    { key: 'CRUNCHES', label: 'Скручивания', category: 'abs', inputType: 'both', met: MET_VALUES.HOME_EXERCISE_TIME.CRUNCHES },
    { key: 'LEG_RAISES', label: 'Подъёмы ног', category: 'abs', inputType: 'both', met: MET_VALUES.HOME_EXERCISE_TIME.LEG_RAISES },
    { key: 'PLANK', label: 'Планка', category: 'abs', inputType: 'time', met: MET_VALUES.HOME_EXERCISE_TIME.PLANK },
    
    // Кардио (время)
    { key: 'BURPEES', label: 'Бёрпи', category: 'cardio', inputType: 'both', met: MET_VALUES.HOME_EXERCISE_TIME.BURPEES },
    { key: 'JUMPING_JACKS', label: 'Джампинг джек', category: 'cardio', inputType: 'both', met: MET_VALUES.HOME_EXERCISE_TIME.JUMPING_JACKS },
    { key: 'MOUNTAIN_CLIMBERS', label: 'Альпинист', category: 'cardio', inputType: 'time', met: MET_VALUES.HOME_EXERCISE_TIME.MOUNTAIN_CLIMBERS },
    { key: 'HIGH_KNEES', label: 'Бег с высокими коленями', category: 'cardio', inputType: 'time', met: MET_VALUES.HOME_EXERCISE_TIME.HIGH_KNEES },
    { key: 'SHADOW_BOXING', label: 'Бокс с тенью', category: 'cardio', inputType: 'time', met: MET_VALUES.HOME_EXERCISE_TIME.SHADOW_BOXING },
    
    // Гибкость (время)
    { key: 'YOGA_LIGHT', label: 'Йога (лёгкая)', category: 'flexibility', inputType: 'time', met: MET_VALUES.HOME_EXERCISE_TIME.YOGA_LIGHT },
    { key: 'YOGA_MODERATE', label: 'Йога (средняя)', category: 'flexibility', inputType: 'time', met: MET_VALUES.HOME_EXERCISE_TIME.YOGA_MODERATE },
    { key: 'PILATES', label: 'Пилатес', category: 'flexibility', inputType: 'time', met: MET_VALUES.HOME_EXERCISE_TIME.PILATES },
    { key: 'STRETCHING', label: 'Растяжка', category: 'flexibility', inputType: 'time', met: MET_VALUES.HOME_EXERCISE_TIME.STRETCHING },
  ];
}

/**
 * Расчёт прогресса для прогресс-бара
 * @param {string} activityKind - тип активности
 * @param {Object} data - данные активности
 * @returns {Object} { current, target, percent, label }
 */
function calculateActivityProgress(activityKind, data) {
  switch (activityKind) {
    case 'gym':
    case 'strength': {
      // Для силовой: прогресс по времени или количеству тренировок
      const duration = data.durationMinutes || 0;
      const target = ACTIVITY_GOALS.GYM_MINUTES;
      const percent = Math.min(100, Math.round((duration / target) * 100));
      return {
        current: duration,
        target,
        percent,
        label: `${duration}/${target} мин`,
        type: 'time'
      };
    }
      
    case 'cardio':
    case 'cardio_indoor':
    case 'cardio_outdoor': {
      const duration = data.durationMinutes || 0;
      const calories = data.calories || 0;
      const targetTime = ACTIVITY_GOALS.CARDIO_MINUTES;
      const targetCals = ACTIVITY_GOALS.CARDIO_CALORIES;
      
      // Показываем прогресс по времени, но если калории значительны - показываем их
      const timePercent = Math.min(100, Math.round((duration / targetTime) * 100));
      const calPercent = Math.min(100, Math.round((calories / targetCals) * 100));
      
      return {
        current: duration,
        target: targetTime,
        percent: timePercent,
        label: `${duration} мин · ${calories} ккал`,
        type: 'time',
        secondary: {
          current: calories,
          target: targetCals,
          percent: calPercent,
          label: 'ккал'
        }
      };
    }
      
    case 'home':
    case 'home_exercise': {
      const duration = data.durationMinutes || 0;
      const calories = data.calories || 0;
      const targetTime = ACTIVITY_GOALS.HOME_MINUTES;
      const targetCals = ACTIVITY_GOALS.HOME_CALORIES;
      
      const timePercent = Math.min(100, Math.round((duration / targetTime) * 100));
      
      return {
        current: duration,
        target: targetTime,
        percent: timePercent,
        label: `${duration} мин · ${calories} ккал`,
        type: 'time'
      };
    }
      
    case 'steps': {
      const steps = data.steps || 0;
      const target = ACTIVITY_GOALS.STEPS;
      const percent = Math.min(100, Math.round((steps / target) * 100));
      return {
        current: steps,
        target,
        percent,
        label: `${steps.toLocaleString()}/${target.toLocaleString()} шагов`,
        type: 'count'
      };
    }
      
    default:
      return {
        current: 0,
        target: 100,
        percent: 0,
        label: '',
        type: 'unknown'
      };
  }
}

// ===================== ИНТЕГРАЦИЯ С GYM МОДУЛЕМ =====================

/**
 * Получить данные о завершённых тренировках GYM за дату
 * @param {string} dateKey - дата YYYY-MM-DD
 * @returns {Array} массив завершённых тренировок
 */
function getGymWorkoutsForDate(dateKey) {
  try {
    // Получаем gymState из localStorage
    const gymData = localStorage.getItem('leakfixer_gym_data');
    if (!gymData) return [];
    
    const gymState = JSON.parse(gymData);
    if (!gymState.completedWorkouts) return [];
    
    // Фильтруем по дате
    return gymState.completedWorkouts.filter(w => w.dateCompleted === dateKey);
  } catch (e) {
    console.warn('[ActivityCalories] Error reading gym data:', e);
    return [];
  }
}

/**
 * Получить детали тренировки GYM (упражнения, подходы и т.д.)
 * @param {string} periodId - ID периода
 * @param {number} cycleIndex - номер цикла
 * @param {number} dayIndex - номер дня
 * @returns {Object|null} данные тренировки
 */
function getGymWorkoutDetails(periodId, cycleIndex, dayIndex) {
  try {
    const gymData = localStorage.getItem('leakfixer_gym_data');
    if (!gymData) return null;
    
    const gymState = JSON.parse(gymData);
    const period = gymState.periods?.[periodId];
    if (!period) return null;
    
    // Получаем runtime данные для этого цикла/дня
    const runtime = gymState.runtime?.[periodId];
    const cycle = runtime?.cycles?.[cycleIndex];
    const day = cycle?.days?.[dayIndex];
    
    if (!day) return null;
    
    // Собираем все упражнения из всех групп
    const exercises = [];
    Object.values(day.groups || {}).forEach(group => {
      if (Array.isArray(group)) {
        exercises.push(...group);
      }
    });
    
    return {
      periodId,
      cycleIndex,
      dayIndex,
      exercises,
      exerciseCount: exercises.length,
      totalSets: exercises.reduce((sum, ex) => sum + (parseInt(ex.setsCount) || 0), 0),
      totalReps: exercises.reduce((sum, ex) => sum + ((parseInt(ex.setsCount) || 0) * (parseInt(ex.repsCount) || 0)), 0),
      totalVolume: exercises.reduce((sum, ex) => sum + ((parseInt(ex.setsCount) || 0) * (parseInt(ex.repsCount) || 0) * (parseFloat(ex.workWeight) || 0)), 0),
    };
  } catch (e) {
    console.warn('[ActivityCalories] Error getting workout details:', e);
    return null;
  }
}

// ===================== ЭКСПОРТ =====================

// Делаем функции доступными глобально
window.ActivityCalories = {
  // Константы
  MET_VALUES,
  ACTIVITY_GOALS,
  
  // Расчёт калорий
  calculateStrengthCalories,
  calculateSimpleStrengthCalories,
  calculateCardioCalories,
  calculateHomeExerciseCalories,
  calculateStepsCalories,
  calculateActivityCaloriesUniversal,
  calculateMETCalories,
  
  // Получение списков
  getCardioTypes,
  getHomeExerciseTypes,
  
  // Прогресс
  calculateActivityProgress,
  
  // Интеграция с GYM
  getGymWorkoutsForDate,
  getGymWorkoutDetails,
  
  // Вспомогательные
  getUserWeight,
};

console.log('[ActivityCalories] Module loaded successfully');
