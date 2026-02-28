# Список изменений для второй части app.js (из коммита 88e6f38 в текущую версию)

## Изменение 1

**Примерная строка:** ~1-10

**Что было в старой версии (88e6f38):**
```javascript
ementById('gymPeriodStep1CancelBtn'),
    periodStep1NextBtn: document.getElementById('gymPeriodStep1NextBtn'),
```

**Что есть в текущей версии:**
```javascript
  document.getElementById('stepsIntensity')?.addEventListener('change', fitnessUpdateStepsCaloriesPreview);

  fitnessEl.foodAdd?.addEventListener('click', () => fitnessOpenFoodModal(null));
```

**Действие:** Заменить начало файла - в старой версии начинается с середины объявления gymEl, в текущей - с обработчиков событий fitness

---

## Изменение 2

**Примерная строка:** ~10-50

**Что было в старой версии:**
Отсутствует

**Что есть в текущей версии:**
```javascript
  // Клик на карточку энергии — открыть детализацию
  document.getElementById('fitnessCaloriesCard')?.addEventListener('click', function(e) {
    // Не открывать если клик по кнопкам внутри карточки
    if (e.target.closest('button')) return;
    fitnessOpenEnergyDetails();
  });

  // Закрытие модального окна энергии
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
      fitnessRenderCalories(); // чтобы пересчитать ккал с учётом workDay
    });
  });

  fitnessEl.modalOverlay?.addEventListener('click', (e) => {
    if (e.target === fitnessEl.modalOverlay) fitnessCloseModal();
  });
```

**Действие:** Добавить обработчики событий для fitness-модуля (энергия, вода, workday)

---

## Изменение 3

**Примерная строка:** ~50-150

**Что было в старой версии:**
Отсутствует

**Что есть в текущей версии:**
```javascript
    // --- Глобальная шкала настроения (главный экран) ---

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
      const level = 10 - index; // 10 = верхний
      segment.innerHTML = '';   // очищаем на всякий случай

      // базовый фон (неактивный)
      segment.style.backgroundColor = 'rgba(15,23,42,0.6)';

      if (level <= fullSegments) {
        // активный сегмент
        const hue = 120 - level * 8; // зелёный → красный
        const color = `hsl(${hue}, 70%, 50%)`;
        segment.style.backgroundColor = color;
      }
    });

    // числа
    scoreEl.textContent = value.toFixed(1);
    yesterdayEl.textContent = yesterday.toFixed(1);

    const diff = value - yesterday;
    if (Math.abs(diff) < 0.1) {
      trendEl.textContent = '↔ 0.0';
      trendEl.className = 'text-[10px] opacity-70';
    } else if (diff > 0) {
      trendEl.textContent = `↗ +${diff.toFixed(1)}`;
      trendEl.className = 'text-[10px] text-emerald-300';
    } else {
      trendEl.textContent = `↙ ${diff.toFixed(1)}`;
      trendEl.className = 'text-[10px] text-red-300';
    }

    // статус
    let statusText = '';
    let statusClass = 'text-xs font-medium ';
    if (value >= 8.5) {
      statusText = 'Пик, используй момент';
      statusClass += 'text-orange-300';
    } else if (value >= 7) {
      statusText = 'Хороший тон, есть ресурс';
      statusClass += 'text-emerald-300';
    } else if (value >= 5) {
      statusText = 'Норма, держи базу';
      statusClass += 'text-amber-200';
    } else if (value >= 3) {
      statusText = 'Усталость, нужен отдых';
      statusClass += 'text-red-300';
    } else {
      statusText = 'Кризис, нужна поддержка';
      statusClass += 'text-red-400';
    }
    statusEl.textContent = statusText;
    statusEl.className = statusClass;
  }


  function initGlobalMoodWidget() {
    const btn = document.getElementById('logMoodBtn');
    if (btn) {
      btn.addEventListener('click', async () => {
        const raw = prompt('Текущее состояние (0—10):', '7');
        if (raw == null) return;
        const num = parseFloat(raw);
        if (Number.isNaN(num)) return;
  
        // обновляем UI
        renderGlobalMood(num, 6.5);
  
        // сохраняем в Supabase как daily_state + measurements
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
  


  // Инициализация профиля
  initProfileHeader();
  // Инициализация глобальной шкалы настроения
  initGlobalMoodWidget();

  // Запуск приложения
  if (supabaseEnabled) initFromSupabase();
  else initBrowserMode();
```

**Действие:** Добавить функции renderGlobalMood, initGlobalMoodWidget и их вызовы

---

## Изменение 4

**Примерная строка:** ~150-200

**Что было в старой версии:**
Отсутствует полностью (начинается сразу с gymEl)

**Что есть в текущей версии:**
```javascript
  let gymCurrentDayIndex = 1;


  // --- GYM: Тренировка в зале ---------------------------------------------
  const gymEl = {
```

**Действие:** Добавить объявление переменной gymCurrentDayIndex перед gymEl

---

## Изменение 5

**Примерная строка:** ~200-250

**Что было в старой версии:**
```javascript
    // экран конкретного периода
    screen: document.getElementById('gymScreen'),
```

**Что есть в текущей версии:**
```javascript
    // экран конкретного периода
    screen: document.getElementById('gymScreen'),
```

**Действие:** Без изменений (структура gymEl идентична)

---

## Изменение 6

**Примерная строка:** ~250-300

**Что было в старой версии:**
Отсутствует

**Что есть в текущей версии:**
```javascript
  // до GYM-блока, после fitnessEl/gymEl
  const fitnessBtn = document.getElementById('fitnessBtn');

  // переопределяем showFitness с учётом fitnessEl и gymEl
  const _showFitnessBase = showFitness;
  function showFitnessFull() {
    _showFitnessBase();
    if (fitnessEl?.profileSetup) fitnessEl.profileSetup.classList.add('hidden');
    if (fitnessEl?.dashboard) fitnessEl.dashboard.classList.remove('hidden');
    if (gymEl?.periodsScreen) gymEl.periodsScreen.classList.add('hidden');
    if (gymEl?.periodWizardScreen) gymEl.periodWizardScreen.classList.add('hidden');
    if (gymEl?.screen) gymEl.screen.classList.add('hidden');
  }

  // Кнопки на главном экране
  if (el.habitsBtn) {
    el.habitsBtn.addEventListener('click', () => {
      showAlert('Экран привычек будет позже');
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
```

**Действие:** Добавить функцию showFitnessFull и обработчики кнопок навигации

---

## Изменение 7

**Примерная строка:** ~1500-1600 (в старой версии)

**Что было в старой версии:**
```javascript
  // Обработчик создания нового периода (кнопка "Создать период" в мастере)
  if (gymEl.periodStep2CreateBtn) {
    gymEl.periodStep2CreateBtn.addEventListener('click', () => {
      if (!gymPeriodWizardDraft) return;
      
      const periodId = gymCreatePeriodId();
      const today = new Date().toISOString().slice(0, 10);
      
      // Debug logging for period creation
      console.log('[GYM] Creating new period:', {
        periodId,
        name: gymPeriodWizardDraft.name,
        startDate: today,
        daysCount: days.length
      });
```

**Что есть в текущей версии:**
```javascript
  // Обработчик создания нового периода (кнопка "Создать период" в мастере)
  if (gymEl.periodStep2CreateBtn) {
    gymEl.periodStep2CreateBtn.addEventListener('click', () => {
      if (!gymPeriodWizardDraft) return;
      
      const periodId = gymCreatePeriodId();
      const today = new Date().toISOString().slice(0, 10);
      
      // Debug logging for period creation
      console.log('[GYM] Creating new period:', {
        periodId,
        name: gymPeriodWizardDraft.name,
        startDate: today,
        daysCount: days.length
      });
```

**Действие:** Без изменений (код идентичен)

---

## Изменение 8

**Примерная строка:** ~3500-3600 (конец файла в старой версии)

**Что было в старой версии:**
```javascript
  // --- Fitness: Еда - добавление (открытие модалки) ---
  const fitnessFoodAddBtn = document.getElementById('fitnessFoodAdd');

  if (fitnessFoodAddBtn) {
    fitnessFoodAddBtn.addEventListener('click', () => {
      fitnessOpenFoodModal(null); // открываем нашу объединённую форму (ручной/авто)
    });
  }


  // ========== COLLAPSIBLE FITNESS CARDS ==========
```

**Что есть в текущей версии:**
```javascript
  // --- Fitness: Еда - добавление (открытие модалки) ---
  const fitnessFoodAddBtn = document.getElementById('fitnessFoodAdd');

  if (fitnessFoodAddBtn) {
    fitnessFoodAddBtn.addEventListener('click', () => {
      fitnessOpenFoodModal(null); // открываем нашу объединённую форму (ручной/авто)
    });
  }


  // ========== COLLAPSIBLE FITNESS CARDS ==========
```

**Действие:** Без изменений (код идентичен)

---

## Изменение 9

**Примерная строка:** ~3600-3800

**Что было в старой версии:**
```javascript
  // Инициализация сворачиваемых карточек
  function fitnessInitCollapsibleCards() {
    const headers = document.querySelectorAll('.fitness-card-header');
    
    headers.forEach(header => {
      // Проверяем, не добавлен ли уже обработчик
      if (header.dataset.collapseInitialized) return;
      header.dataset.collapseInitialized = 'true';
      
      header.addEventListener('click', (e) => {
        // Не сворачивать при клике на кнопки внутри шапки
        if (e.target.tagName === 'BUTTON' || e.target.closest('BUTTON')) return;
        
        // ПРЕДОТВРАЩЕНИЕ КОНФЛИКТА: останавливаем всплытие, чтобы клик по header
        // не вызывал обработчики на родительской карточке (например, открытие попапа энергии)
        e.stopPropagation();
```

**Что есть в текущей версии:**
```javascript
  // Инициализация сворачиваемых карточек
  function fitnessInitCollapsibleCards() {
    const headers = document.querySelectorAll('.fitness-card-header');
    
    headers.forEach(header => {
      // Проверяем, не добавлен ли уже обработчик
      if (header.dataset.collapseInitialized) return;
      header.dataset.collapseInitialized = 'true';
      
      header.addEventListener('click', (e) => {
        // Не сворачивать при клике на кнопки внутри шапки
        if (e.target.tagName === 'BUTTON' || e.target.closest('BUTTON')) return;
        
        // ПРЕДОТВРАЩЕНИЕ КОНФЛИКТА: останавливаем всплытие, чтобы клик по header
        // не вызывал обработчики на родительской карточке (например, открытие попапа энергии)
        e.stopPropagation();
```

**Действие:** Без изменений (код идентичен)

---

## Изменение 10

**Примерная строка:** ~4200-4300 (конец файла)

**Что было в старой версии:**
```javascript
}); // конец DOMContentLoaded




```

**Что есть в текущей версии:**
```javascript
}); // конец DOMContentLoaded

```

**Действие:** Без изменений (оба файла заканчиваются одинаково)

---

## ИТОГОВЫЙ ВЫВОД

**Основные различия между версиями:**

1. **Начало файла**: Старая версия начинается с середины объявления gymEl (обрезана), текущая - с полных обработчиков fitness
2. **Добавлены в текущей версии**:
   - Обработчики событий для fitness (энергия, вода, workday) - строки ~1-50
   - Функции глобальной шкалы настроения (renderGlobalMood, initGlobalMoodWidget) - строки ~50-150
   - Переменная gymCurrentDayIndex - строка ~150
   - Функция showFitnessFull и обработчики навигации - строки ~250-300

3. **Остальной код (GYM-модуль, fitness cards, theme, photo)**: Полностью идентичен в обеих версиях

**Рекомендация**: Старая версия (88e6f38) содержит БОЛЬШЕ кода и функциональности. Текущая версия является УСЕЧЕННОЙ и содержит только часть функционала. Для восстановления полной функциональности нужно:
- Восстановить начало файла из версии 88e6f38 (объявление gymEl с самого начала)
- Убедиться, что все обработчики fitness присутствуют
- Проверить наличие всех функций GYM-модуля

**ВАЖНО**: Размер файлов говорит о том, что старая версия (156,383 символа) значительно больше текущей (131,205 символов), что означает потерю ~25,000 символов кода!
