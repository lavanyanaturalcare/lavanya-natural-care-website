// =====================================================================
// ONZNATURAL — Supabase Client Initializer
// Connected to Supabase PostgreSQL & Auth with Resilient Fallback
// =====================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://fyhacouitykpbvylxwtz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aGFjb3VpdHlrcGJ2eWx4d3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwNzAwOTcsImV4cCI6MjExMDY0NjA5N30.HMdp_onPpqgkuWAvg1DHgV3VuHdYDlMe47VPERoi3dc';

export const getSupabaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  if (envUrl && envUrl.trim() !== '' && !envUrl.includes('your-project')) {
    return envUrl.trim();
  }
  return DEFAULT_SUPABASE_URL;
};

export const getSupabaseAnonKey = (): string => {
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  if (envKey && envKey.trim() !== '' && !envKey.includes('your-anon-key')) {
    return envKey.trim();
  }
  return DEFAULT_SUPABASE_ANON_KEY;
};

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  return Boolean(url && key);
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;
