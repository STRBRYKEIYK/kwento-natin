// Shared by the API routes. Files starting with "_" are not deployed as functions.
// Channels switch on by environment variables (see README / .env.example).
async function post(url, body, headers) {
  const r = await fetch(url, { method: "POST", headers: Object.assign({ "content-type": "application/json" }, headers), body: JSON.stringify(body) });
  return r.ok;
}

module.exports = async function notify(text, subject, env = process.env) {

  const jobs = {};

  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    jobs.telegram = post("https://api.telegram.org/bot" + env.TELEGRAM_BOT_TOKEN + "/sendMessage", { chat_id: env.TELEGRAM_CHAT_ID, text });
  }
  if (env.RESEND_API_KEY && env.NOTIFY_EMAIL) {
    jobs.email = post("https://api.resend.com/emails",
      { from: "Love Voucher Book <onboarding@resend.dev>", to: [env.NOTIFY_EMAIL], subject, text },
      { authorization: "Bearer " + env.RESEND_API_KEY });
  }
  if (env.CALLMEBOT_APIKEY && env.NOTIFY_PHONE) {
    const u = "https://api.callmebot.com/whatsapp.php?phone=" + encodeURIComponent(env.NOTIFY_PHONE) +
      "&text=" + encodeURIComponent(text) + "&apikey=" + encodeURIComponent(env.CALLMEBOT_APIKEY);
    jobs.whatsapp = fetch(u).then(r => r.ok);
  }

  const keys = Object.keys(jobs);
  const results = await Promise.allSettled(keys.map(k => jobs[k]));
  const sent = {};
  keys.forEach((k, i) => { sent[k] = results[i].status === "fulfilled" && results[i].value === true; });
  return { ok: Object.values(sent).some(Boolean), sent };
};
