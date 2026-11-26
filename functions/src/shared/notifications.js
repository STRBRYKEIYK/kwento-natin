// Shared by the API route. Files starting with "_" are not deployed as functions.
// Channels switch on by environment variables (see README / .env.example).
import { createHash } from "node:crypto";

async function post(url, body, headers) {
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
  return r.ok;
}

const sha = (s) => createHash("sha256").update(s).digest("hex");

// ntfy needs no account or key. The topic is the password, so it is never put in the repo:
// use NTFY_TOPIC if set, otherwise derive one from this Vercel project's private id.
export function ntfyTopic(env = process.env) {
  if (env.NTFY_TOPIC) return env.NTFY_TOPIC;
  return env.VERCEL_PROJECT_ID ? `chica-date-${sha(`ntfy:${env.VERCEL_PROJECT_ID}`).slice(0, 24)}` : "";
}

export function channels(env = process.env) {
  const topic = ntfyTopic(env);
  return {
    ntfy: Boolean(topic),
    ntfyFingerprint: topic ? sha(`fp:${topic}`).slice(0, 8) : "",
    telegram: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
    telegramChica: Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHICA_CHAT_ID),
    email: Boolean(env.RESEND_API_KEY && env.NOTIFY_EMAIL),
    whatsapp: Boolean(env.CALLMEBOT_APIKEY && env.NOTIFY_PHONE)
  };
}

// to: "keith" (default) pings Keith's channels; "chica" only sends her bot message (chicaText), used when Chico plans or changes a date.
export default async function notify({ text, subject, calendarUrl, chicaText, title = "Chica picked our date!", to = "keith" }, env = process.env) {

  const jobs = {};
  const withCal = calendarUrl ? `${text}\n\nAdd to Google Calendar:\n${calendarUrl}` : text;

  if (to === "chica") {
    if (!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHICA_CHAT_ID && chicaText)) return { ok: false, sent: {} };
    const ok = await post(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, { chat_id: env.TELEGRAM_CHICA_CHAT_ID, text: chicaText }).catch(() => false);
    return { ok, sent: { telegramChica: ok } };
  }

  const topic = ntfyTopic(env);
  if (topic) {
    jobs.ntfy = post(env.NTFY_SERVER || "https://ntfy.sh", {
      topic,
      title,
      message: text,
      priority: 4,
      tags: ["heart", "calendar"],
      ...(calendarUrl ? { click: calendarUrl, actions: [{ action: "view", label: "Add to Google Calendar", url: calendarUrl }] } : {})
    });
  }
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    jobs.telegram = post(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, { chat_id: env.TELEGRAM_CHAT_ID, text: withCal });
  }
  // Optional: a sweet confirmation to Chica herself, once she has pressed Start on the bot.
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHICA_CHAT_ID && chicaText) {
    jobs.telegramChica = post(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: env.TELEGRAM_CHICA_CHAT_ID,
      text: calendarUrl ? `${chicaText}\n\nSave the date:\n${calendarUrl}` : chicaText
    });
  }
  if (env.RESEND_API_KEY && env.NOTIFY_EMAIL) {
    jobs.email = post(
      "https://api.resend.com/emails",
      { from: "Chica's Date Scheduler <onboarding@resend.dev>", to: [env.NOTIFY_EMAIL], subject, text: withCal },
      { authorization: `Bearer ${env.RESEND_API_KEY}` }
    );
  }
  if (env.CALLMEBOT_APIKEY && env.NOTIFY_PHONE) {
    const u = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(env.NOTIFY_PHONE)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(env.CALLMEBOT_APIKEY)}`;
    jobs.whatsapp = fetch(u).then((r) => r.ok);
  }

  const keys = Object.keys(jobs);
  const results = await Promise.allSettled(keys.map((k) => jobs[k]));
  const sent = {};
  keys.forEach((k, i) => { sent[k] = results[i].status === "fulfilled" && results[i].value === true; });
  const forKeith = Object.entries(sent).filter(([k]) => k !== "telegramChica").map(([, v]) => v);
  return { ok: forKeith.some(Boolean), sent };
}
