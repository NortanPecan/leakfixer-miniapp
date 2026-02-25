// fitness-sync.js
class FitnessSync {
    constructor(appUserId) {
      this.appUserId = appUserId;
      this.SUPABASE_URL = 'https://zhpwehjbonzffpxdrbyl.supabase.co';
      this.SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpocHdlaGpib256ZmZweGRyYnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzM3MjAsImV4cCI6MjA4Njk0OTcyMH0.em0tBA_YArxA2QQO-r5CWCFnyiknre88Mn6wsrX2ARs';
    }
  
    async request(path, options = {}) {
      return fetch(`${this.SUPABASE_URL}${path}`, {
        ...options,
        headers: {
          'apikey': this.SUPABASE_KEY,
          'Authorization': `Bearer ${this.SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });
    }
  
    // ─── PROFILE: user_profile + measurements ─────────────────────────
  
    /**
     * Загрузка актуального профиля.
     * Возвращает объект в формате ProfileFitnessSettings + любые доп. поля из settings.
     */
    async loadProfile() {
      if (!this.appUserId) return null;
      try {
        const res = await this.request(`/rest/v1/user_profile?app_user_id=eq.${this.appUserId}`);
        const rows = await res.json();
        const row = Array.isArray(rows) ? rows[0] : null;
        if (!row) return null;
  
        const base = {
          weight: row.current_weight ?? undefined,
          height: row.current_height ?? undefined,
          // возраст можно вычислять из birth_date, пока оставим так:
          age: undefined,
          workProfile: row.current_work_profile ?? undefined,
        };
  
        return {
          ...base,
          ...(row.settings || {}),
        };
      } catch (e) {
        console.error('loadProfile error', e);
        return null;
      }
    }
  
    /**
     * Сохранение профиля:
     * - обновляет user_profile (ядро + settings)
     * - логирует изменения веса / работы в measurements
     */
    async saveProfile(profile) {
      if (!this.appUserId) return;
      try {
        // Разделяем ядро и settings
        const {
          weight,
          height,
          age,            // сейчас не пишем в базу, используем birth_date позже
          workProfile,
          ...restSettings
        } = profile;
  
        const now = new Date().toISOString();
  
        // 1) upsert в user_profile
        await this.request('/rest/v1/user_profile', {
          method: 'POST',
          body: JSON.stringify({
            app_user_id: this.appUserId,
            current_weight: typeof weight === 'number' ? weight : null,
            current_height: typeof height === 'number' ? height : null,
            current_work_profile: workProfile || null,
            settings: restSettings,
            updated_at: now,
          }),
        });
  
        // 2) логируем измерения (event log)
        const measurements = [];
  
        if (typeof weight === 'number') {
          measurements.push({
            app_user_id: this.appUserId,
            measured_at: now,
            type: 'weight',
            value: weight,
            text_value: null,
            meta: {},
          });
        }
  
        if (typeof height === 'number') {
          measurements.push({
            app_user_id: this.appUserId,
            measured_at: now,
            type: 'height',
            value: height,
            text_value: null,
            meta: {},
          });
        }
  
        if (workProfile) {
          measurements.push({
            app_user_id: this.appUserId,
            measured_at: now,
            type: 'work_profile',
            value: null,
            text_value: workProfile,
            meta: {},
          });
        }
  
        if (measurements.length > 0) {
          await this.request('/rest/v1/measurements', {
            method: 'POST',
            body: JSON.stringify(measurements),
          });
        }
      } catch (e) {
        console.error('saveProfile error', e);
      }
    }
  
    // ─── FITNESS DAY: fitness_daily + daily_state.data.fitness ──────
  
    /**
     * Загрузка фитнес-дня (если будешь использовать).
     * Сейчас основное храним через FitnessState + saveDay().
     */
    async loadFitnessDay(dateKey) {
      if (!this.appUserId || !dateKey) return null;
      try {
        const res = await this.request(
          `/rest/v1/fitness_daily?app_user_id=eq.${this.appUserId}&date_key=eq.${dateKey}`
        );
        const rows = await res.json();
        return Array.isArray(rows) ? rows[0] : null;
      } catch (e) {
        console.error('loadFitnessDay error', e);
        return null;
      }
    }
  
    /**
     * Сохранение дневного фитнес-состояния:
     * - fitness_daily (как сейчас)
     * - daily_state.data.fitness (агрегаты)
     */
    async saveDay(dateKey, data) {
      if (!this.appUserId || !dateKey) return;
      try {
        const now = new Date().toISOString();
  
        // 1) fitness_daily (как раньше)
        await this.request('/rest/v1/fitness_daily', {
          method: 'POST',
          body: JSON.stringify({
            app_user_id: this.appUserId,
            date_key: dateKey,
            water_ml: data.water_ml ?? 0,
            work_day: data.work_day || 'normal',
            data: data.data || {},
            updated_at: now,
          }),
        });
  
        // 2) daily_state (агрегаты по дню)
        // конвертим dateKey YYYY-MM-DD → date
        const dateOnly = dateKey;
  
        // сначала читаем существующий daily_state
        const dsRes = await this.request(
          `/rest/v1/daily_state?app_user_id=eq.${this.appUserId}&date=eq.${dateOnly}`
        );
        const existingArr = await dsRes.json();
        const existing = Array.isArray(existingArr) ? existingArr[0] : null;
  
        const baseData = existing?.data || {};
        const nextFitness = {
          ...(baseData.fitness || {}),
          water_ml: data.water_ml ?? baseData.fitness?.water_ml ?? 0,
          work_day: data.work_day || baseData.fitness?.work_day || 'normal',
        };
  
        const nextData = {
          ...baseData,
          fitness: nextFitness,
        };
  
        await this.request('/rest/v1/daily_state', {
          method: 'POST',
          body: JSON.stringify({
            app_user_id: this.appUserId,
            date: dateOnly,
            data: nextData,
            mood: existing?.mood ?? null,
            streak: existing?.streak ?? null,
            notes: existing?.notes ?? null,
            updated_at: now,
          }),
        });
      } catch (e) {
        console.error('saveDay error', e);
      }
    }
  
    // ─── DAILY STATE: настроение и т.п. ─────────────────────────────
  
    /**
     * Сохранить настроение (и при желании залогировать отдельным измерением).
     */
    async saveMood(dateKey, moodValue) {
      if (!this.appUserId || !dateKey) return;
      try {
        const now = new Date().toISOString();
        const dateOnly = dateKey;
  
        // читаем существующий daily_state
        const dsRes = await this.request(
          `/rest/v1/daily_state?app_user_id=eq.${this.appUserId}&date=eq.${dateOnly}`
        );
        const existingArr = await dsRes.json();
        const existing = Array.isArray(existingArr) ? existingArr[0] : null;
  
        const baseData = existing?.data || {};
  
        await this.request('/rest/v1/daily_state', {
          method: 'POST',
          body: JSON.stringify({
            app_user_id: this.appUserId,
            date: dateOnly,
            mood: moodValue,
            streak: existing?.streak ?? null,
            notes: existing?.notes ?? null,
            data: baseData,
            updated_at: now,
          }),
        });
  
        // логируем как измерение "mood"
        await this.request('/rest/v1/measurements', {
          method: 'POST',
          body: JSON.stringify([{
            app_user_id: this.appUserId,
            measured_at: now,
            type: 'mood',
            value: moodValue,
            text_value: null,
            meta: {},
          }]),
        });
      } catch (e) {
        console.error('saveMood error', e);
      }
    }
    /**
     * Сохранить новое измерение веса.
     * dateKey: 'YYYY-MM-DD', weight: число, time: 'HH:MM' (опционально).
     * Создаёт новую запись в measurements. Не перезаписывает существующие.
     */
    async saveWeightMeasurement(dateKey, weight, time = null) {
        if (!this.appUserId || !dateKey || typeof weight !== 'number') return null;
        try {
            const now = new Date();
            const [y, m, d] = dateKey.split('-').map(Number);
            
            // Если время не указано - используем текущее
            let measuredAt;
            if (time) {
                const [hours, minutes] = time.split(':').map(Number);
                measuredAt = new Date(y, m - 1, d, hours, minutes, 0);
            } else {
                measuredAt = new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds());
            }
            const measuredAtIso = measuredAt.toISOString();

            // 1) Создаём новое измерение в measurements
            const measurementRes = await this.request('/rest/v1/measurements', {
                method: 'POST',
                body: JSON.stringify([{
                    app_user_id: this.appUserId,
                    measured_at: measuredAtIso,
                    type: 'weight',
                    value: weight,
                    text_value: null,
                    meta: { source: 'weight_tracker', time: time || null },
                }]),
            });
            const measurementData = await measurementRes.json();
            const measurement = Array.isArray(measurementData) ? measurementData[0] : null;

            // 2) Обновляем актуальный вес в user_profile (последнее измерение)
            await this.request('/rest/v1/user_profile', {
                method: 'POST',
                body: JSON.stringify({
                    app_user_id: this.appUserId,
                    current_weight: weight,
                    updated_at: new Date().toISOString(),
                }),
            });

            return measurement;
        } catch (e) {
            console.error('saveWeightMeasurement error', e);
            return null;
        }
    }    

    /**
     * Получить историю измерений веса за период.
     * days: количество дней назад (по умолчанию 30).
     * Возвращает массив измерений отсортированных по времени (новые первые).
     */
    async getWeightHistory(days = 30) {
        if (!this.appUserId) return [];
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            const startIso = startDate.toISOString();
            const endIso = endDate.toISOString();

            const res = await this.request(
                `/rest/v1/measurements?app_user_id=eq.${this.appUserId}&type=eq.weight&measured_at=gte.${startIso}&measured_at=lte.${endIso}&order=measured_at.desc`
            );
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch (e) {
            console.error('getWeightHistory error', e);
            return [];
        }
    }

    /**
     * Получить последнее измерение веса.
     */
    async getLastWeightMeasurement() {
        if (!this.appUserId) return null;
        try {
            const res = await this.request(
                `/rest/v1/measurements?app_user_id=eq.${this.appUserId}&type=eq.weight&order=measured_at.desc&limit=1`
            );
            const data = await res.json();
            return Array.isArray(data) && data.length > 0 ? data[0] : null;
        } catch (e) {
            console.error('getLastWeightMeasurement error', e);
            return null;
        }
    }

    /**
     * Обновить существующее измерение веса.
     * measurementId: ID записи, weight: новое значение, dateKey/time: новые дата/время.
     */
    async updateWeightMeasurement(measurementId, weight, dateKey, time) {
        if (!this.appUserId || !measurementId || typeof weight !== 'number') return null;
        try {
            const [y, m, d] = dateKey.split('-').map(Number);
            const [hours, minutes] = time.split(':').map(Number);
            const measuredAt = new Date(y, m - 1, d, hours, minutes, 0);
            
            const res = await this.request(`/rest/v1/measurements?id=eq.${measurementId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    value: weight,
                    measured_at: measuredAt.toISOString(),
                    meta: { source: 'weight_tracker', updated: true },
                    updated_at: new Date().toISOString(),
                }),
            });
            
            // Обновляем current_weight если это было последнее измерение
            const lastMeasurement = await this.getLastWeightMeasurement();
            if (lastMeasurement && lastMeasurement.id === measurementId) {
                await this.request('/rest/v1/user_profile', {
                    method: 'POST',
                    body: JSON.stringify({
                        app_user_id: this.appUserId,
                        current_weight: weight,
                        updated_at: new Date().toISOString(),
                    }),
                });
            }
            
            return await res.json();
        } catch (e) {
            console.error('updateWeightMeasurement error', e);
            return null;
        }
    }

    /**
     * Удалить измерение веса.
     */
    async deleteWeightMeasurement(measurementId) {
        if (!this.appUserId || !measurementId) return false;
        try {
            await this.request(`/rest/v1/measurements?id=eq.${measurementId}`, {
                method: 'DELETE',
            });
            
            // Обновляем current_weight на последнее оставшееся измерение
            const lastMeasurement = await this.getLastWeightMeasurement();
            if (lastMeasurement) {
                await this.request('/rest/v1/user_profile', {
                    method: 'POST',
                    body: JSON.stringify({
                        app_user_id: this.appUserId,
                        current_weight: lastMeasurement.value,
                        updated_at: new Date().toISOString(),
                    }),
                });
            }
            
            return true;
        } catch (e) {
            console.error('deleteWeightMeasurement error', e);
            return false;
        }
    }

    /**
     * Получить агрегированные данные по весу за период (для графика).
     * Возвращает массив { date: 'YYYY-MM-DD', value: number } — средний вес за день.
     */
    async getWeightChartData(days = 30) {
        const history = await this.getWeightHistory(days);
        
        // Группируем по датам
        const byDate = {};
        history.forEach(item => {
            const date = item.measured_at.split('T')[0];
            if (!byDate[date]) byDate[date] = [];
            byDate[date].push(item.value);
        });
        
        // Считаем среднее для каждой даты и сортируем
        const result = Object.entries(byDate).map(([date, values]) => ({
            date,
            value: values.reduce((a, b) => a + b, 0) / values.length,
        })).sort((a, b) => a.date.localeCompare(b.date));
        
        return result;
    }    
  }
  

  
  
  let FitnessSyncInstance = null;
  
  function initFitnessSync(appUserId) {
    if (!appUserId) return;
    FitnessSyncInstance = new FitnessSync(appUserId);
    window.FitnessSync = FitnessSyncInstance;
  }
  