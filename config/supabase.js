/**
 * Supabase Configuration
 * 
 * IMPORTANT: In production, use environment variables instead of hardcoded keys!
 * For Telegram Mini Apps, you can inject these from the backend.
 */

const SUPABASE_CONFIG = {
  url: 'https://zhpwehjbonzffpxdrbyl.supabase.co',
  // WARNING: This is a public anon key - safe for client-side use
  // but should ideally be injected at build time
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpocHdlaGpib256ZmZweGRyYnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzM3MjAsImV4cCI6MjA4Njk0OTcyMH0.em0tBA_YArxA2QQO-r5CWCFnyiknre88Mn6wsrX2ARs'
};

// Export for use in other modules
window.SupabaseConfig = SUPABASE_CONFIG;

// Convenience exports
window.SUPABASE_URL = SUPABASE_CONFIG.url;
window.SUPABASE_KEY = SUPABASE_CONFIG.anonKey;
