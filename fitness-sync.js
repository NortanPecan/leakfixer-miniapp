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
  }
  
  let FitnessSyncInstance = null;
  
  function initFitnessSync(appUserId) {
    if (!appUserId) return;
    FitnessSyncInstance = new FitnessSync(appUserId);
    window.FitnessSync = FitnessSyncInstance;
  }
  