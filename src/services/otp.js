import { supabase } from "../lib/supabase";

// Generates a 4-digit numeric OTP as a string
const generateOtpCode = () => {
  const min = 1000;
  const max = 9999;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

// Create or insert OTP entry and ask Edge Function to deliver SMS via Telnyx
export const requestOtp = async (phone) => {
  if (!phone) {
    return { ok: false, error: "Missing phone" };
  }

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

  // Persist OTP so we can verify later
  const { error: insertError } = await supabase
    .from("otps")
    .insert({ phone, code, expires_at: expiresAt, used: false });

  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  // Send via Supabase Edge Function (server calls Telnyx)
  try {
    const { data: fnData, error: fnError } = await supabase.functions.invoke("send-otp", {
      body: {
        to: phone,
        text: `Your verification code is ${code}`,
        from: "+18445023400",
      },
    });
    if (fnError) {
      const msg = typeof fnError === "string" ? fnError : fnError.message;
      return { ok: false, error: msg || "Failed to send OTP" };
    }
    return { ok: true, data: fnData };
  } catch (e) {
    return { ok: false, error: e?.message || "Failed to send OTP" };
  }
};

export const verifyOtp = async (phone, code) => {
  if (!phone || !code) {
    return { ok: false, error: "Missing phone or code" };
  }

  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("otps")
    .select("id, expires_at")
    .eq("phone", phone)
    .eq("code", code)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }
  if (!data) {
    return { ok: false, error: "Invalid code" };
  }
  if (data.expires_at && data.expires_at < nowIso) {
    return { ok: false, error: "Code expired" };
  }

  // Check if user exists
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id, phone, verified, is_onboarding_complete")
    .eq("phone", phone)
    .maybeSingle();

  if (userError) {
    return { ok: false, error: userError.message };
  }

  // If user doesn't exist, create new user
  if (!userData) {
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        phone: phone,
        verified: true,
        is_onboarding_complete: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      return { ok: false, error: createError.message };
    }

    return { 
      ok: true, 
      userExists: false, 
      user: newUser,
      redirectTo: 'onboarding'
    };
  }

  // User exists
  return { 
    ok: true, 
    userExists: true, 
    user: userData,
    redirectTo: 'dashboard'
  };
};
