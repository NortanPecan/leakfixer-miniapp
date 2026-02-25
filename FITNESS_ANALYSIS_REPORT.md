# Анализ текущего состояния фитнес-экрана — LeakFixer MiniApp

**Дата анализа:** 2024  
**Версия:** kimi v3.1

---

## 1. ПРОФИЛЬ / ПАРАМЕТРЫ ТЕЛА

### 1.1 Где реализовано

| Компонент | Файл | Строки |
|-----------|------|--------|
| HTML-форма | `index.html` | 170-224 |
| Логика сохранения | `app.js` | 415-445, 748-775 |
| Типы данных | `fitness.js` | 9-14 |
| CRUD операции | `fitness.js` | 166-182 |

### 1.2 Поля профиля (текущие)

```javascript
// fitness.js @typedef ProfileFitnessSettings
{
  weight: number,        // Вес (кг)
  height: number,        // Рост (см)
  age: number,           // Возраст (лет)
  targetWeight: number,  // Целевой вес (кг)
  workProfile: 'sedentary'|'mixed'|'physical'|'variable',  // Тип работы
  targetCalories: number, // Целевые калории (для BMR)
  waterBaselineMl: number // Базовая норма воды
}
```

### 1.3 Поля ввода (index.html)

```html
<input id="fitnessWeight" placeholder="Вес (кг)">
<input id="fitnessHeight" placeholder="Рост (см)">
<input id="fitnessAge" placeholder="Возраст (лет)">
<input id="fitnessTargetWeight" placeholder="Целевой вес (кг)">

<!-- Радио-кнопки типа работы -->
<input type="radio" name="fitnessWorkProfile" value="sedentary">  <!-- Сидячая -->
<input type="radio" name="fitnessWorkProfile" value="mixed">      <!-- На ногах -->
<input type="radio" name="fitnessWorkProfile" value="physical">   <!-- Физическая -->
<input type="radio" name="fitnessWorkProfile" value="variable">   <!-- Меняется -->
```

### 1.4 Обхваты тела (замеры)

**Статус:** ❌ НЕ РЕАЛИЗОВАНО

Полей для обхватов НЕТ:
- Нет полей: талия, бёдра, грудь, бицепс, бедро
- Нет в `ProfileFitnessSettings`
- Нет в `index.html`
- Нет в `app.js`

**Рекомендация для добавления:**
```javascript
// Добавить в ProfileFitnessSettings
{
  measurements: {
    waist: number,    // Талия (см)
    hips: number,     // Бёдра (см)
    chest: number,    // Грудь (см)
    bicep: number,    // Бицепс (см)
    thigh: number     // Бедро (см)
  },
  measurementHistory: [  // История измерений
    { date: '2024-01-15', waist: 85, hips: 95, ... }
  ]
}
```

### 1.5 Логика сохранения

```javascript
// app.js ~748-775
function fitnessSaveProfile() {
  const values = {
    weight: fitnessEl.weight?.value,
    height: fitnessEl.height?.value,
    age: fitnessEl.age?.value,
    targetWeight: fitnessEl.targetWeight?.value,
    workProfile: document.querySelector('input[name="fitnessWorkProfile"]:checked')?.value
  };
  const profile = FS.parseProfileFromValues(values);
  FS.setFitnessProfile(profile);
}

// fitness.js ~177-182
function setFitnessProfile(profile) {
  localStorage.setItem(getProfileStorageKey(), JSON.stringify(profile));
  // Синхронизация с Supabase
  if (window.FitnessSync && window.currentAppUserId) {
    window.FitnessSync.saveProfile(profile).catch(() => {});
  }
}
```

---

## 2. ТИП РАБОЧЕГО ДНЯ И «КАК ПРОШЁЛ ДЕНЬ ПО РАБОТЕ»

### 2.1 Структура данных

**Важно:** Есть ДВА разных понятия:

#### A. Базовый тип работы (профильная настройка)
```javascript
// Сохраняется в профиле (постоянная настройка)
profile.workProfile = 'sedentary' | 'mixed' | 'physical' | 'variable'

// Используется для расчёта BMR multiplier
function getWorkActivityMultiplier(profile, dayData) {
  let base = 1.2;  // sedentary по умолчанию
  if (profile.workProfile === 'mixed') base = 1.4;
  if (profile.workProfile === 'physical') base = 1.6;
  if (profile.workProfile === 'variable') base = 1.3;
  // ...
}
```

#### B. Дневной статус «Как прошёл день»
```javascript
// Сохраняется в данных конкретного дня (временная настройка)
dayData.workDay = 'low' | 'normal' | 'high'

// Влияет на multiplier ±0.1
if (dayData.workDay === 'low') base -= 0.1;
if (dayData.workDay === 'high') base += 0.1;
```

### 2.2 Где рендерится

| Элемент | Файл | Строки |
|---------|------|--------|
| Базовый тип работы | `index.html` | 179-220 (онбординг) |
| Дневной статус | `index.html` | 577-606 |

### 2.3 UI дневного статуса

```html
<!-- index.html 577-606 -->
<div>
  <div class="opacity-70">День по работе</div>
  <div class="font-medium" id="fitnessWorkDayLabel">Как обычно</div>
</div>
<div class="flex gap-2">
  <button class="fitness-workday-btn" data-workday="low">Больше сидел</button>
  <button class="fitness-workday-btn" data-workday="normal">Обычный</button>
  <button class="fitness-workday-btn" data-workday="high">Очень активный</button>
</div>
```

### 2.4 Логика сохранения дневного статуса

```javascript
// app.js ~481-499
function fitnessRenderWorkDay() {
  const dayData = FS.getDayData(fitnessGetDateKey());
  const v = dayData.workDay;
  let text = 'Как обычно';
  if (v === 'low') text = 'Больше сидел';
  if (v === 'high') text = 'Очень активный';
  fitnessEl.workDayLabel.textContent = text;
  // Автосохранение в Supabase...
}

// Обработчики кнопок
// app.js ~1027-1037 (внутри fitnessInit)
document.querySelectorAll('.fitness-workday-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const k = fitnessGetDateKey();
    const dayData = FS.getDayData(k);
    dayData.workDay = btn.dataset.workday;  // 'low' | 'normal' | 'high'
    FS.updateDayData(k, { workDay: dayData.workDay });
    fitnessRenderWorkDay();
    fitnessRenderCalories();  // Пересчёт калорий!
  });
});
```

### 2.5 Влияние на расчёты

```javascript
// fitness.js ~862-874
function getWorkActivityMultiplier(profile, dayData) {
  // Базовый мультипликатор из профиля
  let base = 1.2;  // sedentary
  if (profile.workProfile === 'mixed') base = 1.4;
  if (profile.workProfile === 'physical') base = 1.6;
  if (profile.workProfile === 'variable') base = 1.3;

  // Дневная корректировка
  if (dayData.workDay === 'low') base -= 0.1;
  if (dayData.workDay === 'high') base += 0.1;

  // Ограничения
  if (base < 1.1) base = 1.1;
  if (base > 1.8) base = 1.8;
  return base;
}
```

### 2.6 Чёткое разделение

| | Базовый тип работы | Дневной статус |
|---|-------------------|----------------|
| **Где хранится** | `profile.workProfile` | `dayData.workDay` |
| **Когда задаётся** | При онбординге / в настройках | Каждый день |
| **Для чего** | Базовый метаболизм | Корректировка под конкретный день |
| **UI** | Радио-кнопки в онбординге | Три кнопки в дашборде |
| **Сохранение** | `FS.setFitnessProfile()` | `FS.updateDayData()` |
| **Синхронизация** | Supabase `fitness_profiles` | Supabase `fitness_days` |

---

## 3. БЛОК «ЭНЕРГИЯ» (КАЛОРИИ)

### 3.1 Где рендерится

| Компонент | Файл | Строки |
|-----------|------|--------|
| HTML-структура | `index.html` | 528-561 |
| CSS стили бара | `index.html` | 8-34 (в `<style>`) |
| Логика расчёта | `fitness.js` | 839-874 |
| Рендеринг | `app.js` | 461-480 |

### 3.2 HTML-структура

```html
<div id="fitnessCaloriesCard" class="bg-white/20 backdrop-blur-xl rounded-2xl p-4">
  <!-- Заголовок -->
  <div>
    <div>Энергия тела</div>
    <div>Сводка дня</div>
    <span>день в плюс к цели</span>  <!-- Статус (заглушка) -->
  </div>

  <!-- Три карточки с цифрами -->
  <div class="grid grid-cols-3 gap-2">
    <div>
      <div>Съели</div>
      <div><span id="fitnessCalEaten">0</span> ккал</div>
    </div>
    <div>
      <div>Сожгли</div>
      <div><span id="fitnessCalBurned">0</span> ккал</div>
    </div>
    <div>
      <div>Баланс</div>
      <div><span id="fitnessBalance">0</span> ккал</div>
    </div>
  </div>
</div>

<!-- Бар баланса (под графиком веса) -->
<div>
  <div class="calorie-balance-bar-track">
    <div class="calorie-balance-bar-center-line"></div>  <!-- Центр (0) -->
    <div class="calorie-balance-bar-fill" id="fitnessCalorieBalanceFill"></div>
  </div>
  <div>
    <span>Дефицит</span>
    <span>Баланс дня</span>
    <span>Профицит</span>
  </div>
</div>
```

### 3.3 Функции расчёта

```javascript
// fitness.js ~839-855
function getCaloriesSummary(profile, dayData) {
  // 1. Съели (из еды)
  const eaten = (dayData.foods || []).reduce((s, f) => s + (f.calories || 0), 0);
  
  // 2. Базовый метаболизм (BMR)
  const baseRest = calculateBaseMetabolism(profile);  // FIXED: 2000 или profile.targetCalories
  
  // 3. Активность (тренировки)
  const activityCal = calculateActivityCalories(dayData.activities || []);
  
  // 4. Работа (множитель)
  const workMultiplier = getWorkActivityMultiplier(profile, dayData);
  const baseWithWork = Math.round(baseRest * workMultiplier);
  
  // 5. Всего сожгли
  const burned = baseWithWork + activityCal;
  
  // 6. Баланс
  const balance = eaten - burned;
  
  return {
    eaten,
    burned,
    balance,
    baseRest,
    activityCal,
    workMultiplier,
    balanceColor: getBalanceColor(balance)  // 'green' | 'red' | 'white'
  };
}
```

### 3.4 Рендеринг в app.js

```javascript
// app.js ~461-480
function fitnessRenderCalories() {
  if (!fitnessEl.calEaten || !fitnessEl.calBurned || !fitnessEl.balance) return;
  
  const profile = FS.getFitnessProfile();
  const dayData = FS.getDayData(fitnessGetDateKey());
  const summary = FS.getCaloriesSummary(profile, dayData);
  
  fitnessEl.calEaten.textContent = summary.eaten;
  fitnessEl.calBurned.textContent = summary.burned;
  fitnessEl.balance.textContent = summary.balance;
  
  // Цвет баланса
  fitnessEl.balance.className = 'font-semibold ' + 
    (summary.balanceColor === 'green' ? 'text-green-300' : 
     summary.balanceColor === 'red' ? 'text-red-300' : '');
  
  // Автосохранение в Supabase
  if (window.FitnessSync && window.currentAppUserId) {
    // ...
  }
}
```

### 3.5 Разбор состава (детализация)

**Статус:** ⚠️ ЧАСТИЧНО РЕАЛИЗОВАНО

| Компонент | Статус | Где |
|-----------|--------|-----|
| Съели — общее | ✅ Есть | `fitnessCalEaten` |
| Съели — по приёмам пищи | ✅ Есть | `fitnessFoodList` (отдельный список) |
| Сожгли — общее | ✅ Есть | `fitnessCalBurned` |
| Сожгли — детализация | ⚠️ Частично | `fitnessActivityBurnedTotal` + сессии |
| Баланс бар | ✅ Есть | `fitnessCalorieBalanceFill` |

**Что можно улучшить:**
1. Всплывающая подсказка при наведении на «Сожгли» с детализацией:
   - Базовый метаболизм: X ккал
   - Работа: Y ккал (множитель ×1.3)
   - Активность: Z ккал (N сессий)
2. Раскрывающийся список под блоком энергии

---

## 4. ВЕРХ ФИТНЕС-ЭКРАНА (ФОТО, ДАТА, КАЛЕНДАРЬ)

### 4.1 Структура fitnessDashboard

**Порядок блоков сверху вниз:**

```
1. Заголовок + кнопка редактирования профиля
2. Верхняя строка: аватар + график веса + бар баланса
3. Блок «Энергия тела» (Съели/Сожгли/Баланс)
4. Календарь (кнопка открытия)
5. Ввод веса (дата + значение + кнопка)
6. «День по работе» + кнопки
7. Блок «Активность»
8. Блок «Приём пищи»
9. Блок «Вода»
10. Блок «БАДы»
11. Выбор даты (переключатель дней)
```

### 4.2 Фото / Аватар

```html
<!-- index.html 60 -->
<img id="profilePhoto" class="w-14 h-14 rounded-full" src="" alt="avatar">

<!-- Квадратный аватар в фитнес-дашборде (новый) -->
<div id="fitnessAvatar"></div>  <!-- app.js 426 -->
```

**Профиль рядом с фото:**
- Имя: `profileName` (текст)
- Username: `@profileUsername`
- **Нет:** краткого профиля (вес, цель) рядом с аватаром

### 4.3 Дата / Переключатель дней

```html
<!-- index.html 615-620 -->
<div class="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
  <button id="fitnessDatePrev">‹</button>
  <span id="fitnessDateLabel">—</span>
  <button id="fitnessDateNext">›</button>
</div>
```

**Расположение:** ВНИЗУ дашборда (после всех блоков)

**Логика:**
```javascript
// app.js ~500-502
function fitnessRenderDate() {
  if (fitnessEl.dateLabel) {
    fitnessEl.dateLabel.textContent = FS.formatDateLocal(fitnessSelectedDate);
  }
}

// Обработчики
// app.js ~1018-1026
fitnessEl.datePrev?.addEventListener('click', () => { 
  fitnessSelectedDate.setDate(fitnessSelectedDate.getDate() - 1); 
  fitnessRenderDashboard(); 
});
fitnessEl.dateNext?.addEventListener('click', () => { 
  fitnessSelectedDate.setDate(fitnessSelectedDate.getDate() + 1); 
  fitnessRenderDashboard(); 
});
```

### 4.4 Календарь

**Важно:** Есть ДВА разных календаря:

#### A. GYM Календарь (периоды тренировок)
```html
<!-- index.html 385-458 -->
<div id="gymCalendarScreen">...</div>
<button id="gymCalendarOpenBtn">Календарь</button>
```
- Для просмотра периодов/циклов GYM
- Не для выбора даты фитнеса

#### B. Переключатель дат фитнеса
```html
<!-- index.html 615-620 (см. выше) -->
```
- Переключение между днями
- Нет визуального календаря (date picker)

### 4.5 График веса

```html
<!-- index.html 489-524 -->
<div id="fitnessWeightChart">
  <svg>...</svg>  <!-- SVG график -->
</div>
<!-- Под ним бар баланса -->
<div class="calorie-balance-bar-track">...</div>
```

### 4.6 Полный порядок элементов (index.html)

```html
<div id="fitnessDashboard" class="hidden space-y-6">
  
  <!-- 1. Заголовок -->
  <div class="flex items-center justify-between">
    <div>Фитнес-профиль</div>
    <button id="fitnessProfileEdit">Изменить</button>
  </div>
  
  <!-- 2. Верхняя строка: аватар + график + бар -->
  <div class="flex gap-4">
    <div class="w-16 h-16 rounded-xl overflow-hidden">  <!-- Аватар -->
      <img id="fitnessAvatar">
    </div>
    <div class="flex-1">
      <div id="fitnessWeightChart"></div>  <!-- График -->
      <div class="calorie-balance-bar-track"></div>  <!-- Бар -->
    </div>
  </div>
  
  <!-- 3. Энергия -->
  <div id="fitnessCaloriesCard">...</div>
  
  <!-- 4. Календарь GYM -->
  <button id="gymCalendarOpenBtn">Календарь</button>
  
  <!-- 5. Ввод веса -->
  <div>
    <input id="fitnessWeightDate" type="date">
    <input id="fitnessWeightValue" type="number">
    <button id="fitnessWeightSave">Сохранить</button>
  </div>
  
  <!-- 6. День по работе -->
  <div>
    <div id="fitnessWorkDayLabel">Как обычно</div>
    <div class="flex gap-2">
      <button data-workday="low">Больше сидел</button>
      <button data-workday="normal">Обычный</button>
      <button data-workday="high">Очень активный</button>
    </div>
  </div>
  
  <!-- 7. Активность -->
  <div id="fitnessActivityBlock">...</div>
  
  <!-- 8. Приём пищи -->
  <div id="fitnessFoodBlock">...</div>
  
  <!-- 9. Вода -->
  <div id="fitnessWaterBlock">...</div>
  
  <!-- 10. БАДы -->
  <div id="fitnessSupplementsBlock">...</div>
  
  <!-- 11. Переключатель дат (ВНИЗУ!) -->
  <div>
    <button id="fitnessDatePrev">‹</button>
    <span id="fitnessDateLabel">—</span>
    <button id="fitnessDateNext">›</button>
  </div>
  
</div>
```

---

## 5. ФУНКЦИИ РЕНДЕРИНГА (app.js)

```javascript
// Главная функция — вызывает все остальные
function fitnessRenderDashboard() {
  fitnessRenderDate();           // Дата в переключателе
  fitnessRenderCalories();       // Блок энергии
  fitnessRenderActivityList();   // Список активностей
  fitnessRenderActivityBlock();  // Блок активности (прогресс-бары) — НОВОЕ
  fitnessRenderFoodList();       // Список еды
  fitnessRenderWater();          // Блок воды
  fitnessRenderWeightChart();    // График веса
  fitnessRenderSupplementsTracking();  // БАДы
  fitnessRenderWorkDay();        // День по работе
}
```

---

## 6. СВЯЗЬ С БЭКЕНДОМ (fitness-sync.js)

### 6.1 Синхронизация профиля
```javascript
loadProfile()     // Загрузка из Supabase
saveProfile()     // Сохранение в Supabase
```

### 6.2 Синхронизация дней
```javascript
loadFitnessDay(dateKey)   // Загрузка конкретного дня
saveDay(dateKey, data)    // Сохранение дня
```

### 6.3 История веса
```javascript
getWeightHistory(days)       // История измерений
getWeightChartData(days)     // Данные для графика
updateWeightMeasurement()    // Обновление записи
```

---

## 7. ИТОГОВАЯ ТАБЛИЦА «ЧТО ЕСТЬ / ЧЕГО НЕТ»

| Функция | Статус | Файлы |
|---------|--------|-------|
| **Профиль** | | |
| Вес, рост, возраст | ✅ | fitness.js, index.html |
| Целевой вес | ✅ | fitness.js, index.html |
| Тип работы (базовый) | ✅ | fitness.js, index.html |
| Целевые калории | ✅ | fitness.js |
| Базовая норма воды | ✅ | fitness.js |
| Обхваты (талия, бёдра...) | ❌ | — |
| История обхватов | ❌ | — |
| **Рабочий день** | | |
| Базовый тип (профиль) | ✅ | fitness.js |
| Дневной статус | ✅ | fitness.js, index.html |
| Влияние на калории | ✅ | fitness.js |
| **Энергия** | | |
| Съели (общее) | ✅ | fitness.js, app.js |
| Съели (по приёмам) | ✅ | fitnessFoodList |
| Сожгли (общее) | ✅ | fitness.js, app.js |
| Сожгли (детализация) | ⚠️ | Только activityBurnedTotal |
| Баланс бар | ✅ | index.html, CSS |
| Цветовая индикация | ✅ | app.js |
| **Верх экрана** | | |
| Фото/аватар | ✅ | index.html |
| Имя/username | ✅ | index.html |
| Краткий профиль (вес/цель) | ❌ | — |
| График веса | ✅ | index.html, app.js |
| Бар баланса под графиком | ✅ | index.html |
| Переключатель дат | ✅ | index.html |
| Полноценный календарь | ❌ | Только стрелки |
| **Структура** | | |
| Порядок блоков | ✅ | index.html |
| Переключатель дат внизу | ⚠️ | Нелогично? |

---

## 8. РЕКОМЕНДАЦИИ ДЛЯ ДОРАБОТКИ

### 8.1 Высокий приоритет
1. **Добавить обхваты тела** — поля в профиле, история, графики
2. **Перенести переключатель дат вверх** — под фото/график
3. **Сделать блок энергии разборным** — подробнее при нажатии

### 8.2 Средний приоритет
1. **Добавить краткий профиль** рядом с аватаром (вес, цель)
2. **Улучшить детализацию «Сожгли»** — база + работа + активность
3. **Перенести «День по работе» в блок активности**

### 8.3 Низкий приоритет
1. **Полноценный календарь** для выбора даты
2. **Улучшенная визуализация** графиков

---

**Конец отчёта**
