import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://arbykwiinhpaymeuzhtl.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyYnlrd2lpbmhwYXltZXV6aHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NjY3MjEsImV4cCI6MjEwNDQ0MjcyMX0.damHq0EOInl_QdHKR0myBoPhiZXHh5P2SiVYzqAVxww";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
