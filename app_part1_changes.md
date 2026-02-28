# Изменения в app.js (часть 1) - сравнение текущей версии с 88e6f38

## Строки для проверки и изменения:

### 1. Удалена константа FITNESS_SETTINGS_PANEL_ID (строка ~450 в старой версии)
**Старая версия:**
```javascript
const FITNESS_SETTINGS_PANEL_ID = 'fitnessSettingsPanelDynamic';
```
**Текущая версия:** Отсутствует
**Действие:** Добавить эту константу после объявления `const FS = window.FitnessState;`

---

### 2. Удалена функция ensureFitnessSettingsPanel() (строка ~470 в старой версии)
**Старая версия:** Функция создает динамическую панель настроек фитнеса
**Текущая версия:** Отсутствует
**Действие:** Добавить функцию после объявления fitnessEl

---

### 3. Удалена функция fitnessApplyEnglishTexts() (строка ~500 в старой версии)
**Старая версия:** Функция применяет английские тексты к элементам UI
**Текущая версия:** Отсутствует
**Действие:** Добавить функцию

---

### 4. Изменена функция fitnessUpdateSettingsSummary() (строка ~520)
**Старая версия:** Использует объект fitnessTexts и функцию t() для локализации
```javascript
const t = (key, ...args) => {
  const value = fitnessTexts.en[key];
  return typeof value === 'function' ? value(...args) : value;
};
```
**Текущая версия:** Использует прямые строки на русском
**Действие:** Заменить на версию с локализацией

---

### 5. Удален объект fitnessTexts (строка ~440 в старой версии)
**Старая версия:** Объект с английскими текстами для UI
```javascript
const fitnessTexts = {
  en: {
    settingsSummary: (water, work, target) => `Water baseline: ${water} ml | Work profile: ${work} | Target weight: ${target}`,
    // ... другие ключи
  }
};
```
**Текущая версия:** Отсутствует
**Действие:** Добавить объект после fitnessEl

---

### 6. Изменена функция fitnessRenderCalories() (строка ~570)
**Старая версия:** Содержит автосохранение в Supabase
```javascript
// АВТОСОХРАНЕНИЕ в Supabase
if (window.FitnessSync && window.currentAppUserId) {
  const dateKey = fitnessGetDateKey();
  const dayData = FS.getDayData(dateKey);
  window.FitnessSync.saveDay(dateKey, {
    water_ml: dayData.waterMl || 0,
    work_day: dayData.workDay || 'normal'
  }).catch(console.error);
}
```
**Текущая версия:** Отсутствует
**Действие:** Добавить блок автосохранения в конец функции

---

### 7. Изменена функция fitnessRenderDate() (строка ~680)
**Старая версия:** Только одна строка
**Текущая версия:** Только одна строка
**Действие:** Без изменений

---

### 8. Добавлена функция fitnessApplyEnglishUILabels() (строка ~685 в старой версии)
**Старая версия:** Функция применяет английские лейблы к UI элементам
**Текущая версия:** Отсутствует
**Действие:** Добавить функцию после fitnessRenderDate()

---

### 9. Изменена функция fitnessRenderWater() (строка ~750)
**Старая версия:** Содержит автосохранение в Supabase в конце функции
**Текущая версия:** Автосохранение отсутствует
**Действие:** Добавить блок автосохранения в конец функции

---

### 10. Изменена функция fitnessOpenWaterBaselineModal() (строка ~850)
**Старая версия:** Расширенная версия с настройками targetWeight и workProfile
```javascript
function fitnessOpenWaterBaselineModal() {
  const profile = FS.getFitnessProfile();
  const currentBaseline = profile.waterBaselineMl || 2000;
  const currentTargetWeight = profile.targetWeight ?? '';
  const currentWork = profile.workProfile || 'variable';
  
  let html = `<h3 class="font-semibold mb-4">${t('fitnessSettingsTitle')}</h3>`;
  // ... включает поля для targetWeight и workProfile
}
```
**Текущая версия:** Упрощенная версия только с waterBaseline
**Действие:** Заменить на расширенную версию

---

### 11. Изменена функция fitnessRenderDashboard() (строка ~1050)
**Старая версия:** Вызывает fitnessApplyEnglishUILabels() в начале
**Текущая версия:** Вызывает fitnessApplyEnglishTexts()
**Действие:** Заменить вызов на fitnessApplyEnglishUILabels()

---

### 12. Изменена функция fitnessOpenFoodModal() (строка ~2100)
**Старая версия:** Использует английские тексты для UI
```javascript
let html = '<h3 class="font-semibold mb-4">' + (isEditMode ? 'Edit meal' : 'Add meal') + '</h3>';
```
**Текущая версия:** Использует русские тексты
**Действие:** Заменить на английские тексты

---

### 13. Изменена функция fitnessRenderSupplementsTracking() (строка ~2300)
**Старая версия:** Использует английские тексты для UI
```javascript
html += '<button type=\"button\" class=\"supp-edit-norm text-xs opacity-70\" data-id=\"' + supp.id + '\">Edit</button>';
```
**Текущая версия:** Использует русские тексты
**Действие:** Заменить на английские тексты

---

### 14. Изменена функция fitnessBindSupplementsTrackingHandlers() (строка ~2450)
**Старая версия:** Использует английские тексты для alert
```javascript
alert('Future dates are read-only. You can only mark supplement intakes for today or past days.');
```
**Текущая версия:** Использует русские тексты
**Действие:** Заменить на английские тексты

---

### 15. Добавлен обработчик для fitnessEl.settingsOpen (строка ~3100 в старой версии)
**Старая версия:**
```javascript
fitnessEl.settingsOpen?.addEventListener('click', () => {
  fitnessOpenWaterBaselineModal();
});
```
**Текущая версия:** Отсутствует
**Действие:** Добавить обработчик после fitnessEl.profileEdit

---

## Итого изменений:
- Добавить константу FITNESS_SETTINGS_PANEL_ID
- Добавить функцию ensureFitnessSettingsPanel()
- Добавить объект fitnessTexts с английскими текстами
- Добавить функцию fitnessApplyEnglishUILabels()
- Удалить функцию fitnessApplyEnglishTexts()
- Добавить автосохранение в Supabase в fitnessRenderCalories() и fitnessRenderWater()
- Заменить fitnessOpenWaterBaselineModal() на расширенную версию
- Заменить все русские тексты на английские в модальных окнах
- Добавить обработчик для fitnessEl.settingsOpen
