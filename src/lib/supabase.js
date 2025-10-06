import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kwymyqdprvelwurdqydx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eW15cWRwcnZlbHd1cmRxeWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNzQwMzUsImV4cCI6MjA3NDg1MDAzNX0.I9Z8qxE52bijT48T0Otp2IlCUVfxCxjHOAum26LTPQ8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
