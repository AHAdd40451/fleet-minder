import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jilgpoawwzmgikgjbwgj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppbGdwb2F3d3ptZ2lrZ2pid2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MDM5OTMsImV4cCI6MjA3NTA3OTk5M30.KvcVYVwH65crVgnaoQjKmav0JNtv3BSx2s2mGCpvHsE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
