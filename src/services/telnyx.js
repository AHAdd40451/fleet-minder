// Minimal Telnyx SMS sender for React Native (uses fetch). For server-side, prefer axios.

const TELNYX_API_KEY = process.env.TELNYX_API_KEY;

export async function sendText({ from, to, text, messaging_profile_id, subject, media_urls, webhook_url, webhook_failover_url, use_profile_webhooks, type }) {
  if (!TELNYX_API_KEY) {
    throw new Error("Missing TELNYX_API_KEY env var");
  }

  const payload = {
    from,
    to,
    text: text ? `${text}\n\nPowered by 247Seating.com` : undefined,
    messaging_profile_id,
    subject,
    media_urls,
    webhook_url,
    webhook_failover_url,
    use_profile_webhooks,
    type,
  };

  // Clean undefined fields
  Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

  const res = await fetch("https://api.telnyx.com/v2/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${TELNYX_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `Telnyx error ${res.status}`);
  }

  return await res.json();
}


