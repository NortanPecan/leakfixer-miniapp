// fitness-sync.js
class FitnessSync {
    constructor(appUserId) {
      this.appUserId = appUserId;
      this.SUPABASE_URL = 'https://zhpwehjbonzffpxdrbyl.supabase.co';
      this.SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpocHdlaGpib256ZmZweGRyYnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzM3MjAsImV4cCI6MjA4Njk0OTcyMH0.em0tBA_YArxA2QQO-r5CWCFnyiknre88Mn6wsrX2ARs';
    }
  
    async request(url, options = {}) {
      return fetch(url, {
        ...options,
        headers: {
          'apikey': this.SUPABASE_KEY,
          'Authorization': `Bearer ${this.SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
    }
  
    async loadProfile() {
      if (!this.appUserId) return null;
      try {
        const res = await this.request(`${this.SUPABASE_URL}/rest/v1/fitness_profiles?app_user_id=eq.${this.appUserId}`);
        const profiles = await res.json();
        return Array.isArray(profiles) ? profiles[0] : null;
      } catch (e) {
        return null;
      }
    }
  
    async saveProfile(profile) {
      if (!this.appUserId) return;
      try {
        await this.request(`${this.SUPABASE_URL}/rest/v1/fitness_profiles`, {
          method: 'POST',
          body: JSON.stringify({ 
            app_user_id: this.appUserId, 
            ...profile, 
            updated_at: new Date().toISOString() 
          })
        });
      } catch (e) {}
    }
  
    async loadDay(dateKey) {
      if (!this.appUserId || !dateKey) return null;
      try {
        const res = await this.request(
          `${this.SUPABASE_URL}/rest/v1/fitness_daily?app_user_id=eq.${this.appUserId}&date_key=eq.${dateKey}`
        );
        const days = await res.json();
        return Array.isArray(days) ? days[0] : null;
      } catch (e) {
        return null;
      }
    }
  
    async saveDay(dateKey, data) {
      if (!this.appUserId || !dateKey) return;
      try {
        await this.request(`${this.SUPABASE_URL}/rest/v1/fitness_daily`, {
          method: 'POST',
          body: JSON.stringify({ 
            app_user_id: this.appUserId, 
            date_key: dateKey, 
            water_ml: data.water_ml || 0,
            work_day: data.work_day || 'normal',
            data: data.data || {},
            updated_at: new Date().toISOString()
          })
        });
      } catch (e) {}
    }
  }
  
  let FitnessSyncInstance = null;
  function initFitnessSync(appUserId) {
    if (appUserId && !FitnessSyncInstance) {
      FitnessSyncInstance = new FitnessSync(appUserId);
      window.FitnessSync = FitnessSyncInstance;
    }
  }
  