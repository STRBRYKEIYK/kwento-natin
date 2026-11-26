import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const file = resolve('.firebase-migration-data/private/notifications.json');
function ask(prompt, hidden = false) {
  if (!process.stdin.isTTY) throw new Error('Run this setup in your own interactive terminal.');
  process.stdout.write(prompt);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  return new Promise(resolveAnswer => {
    let value = '';
    function onData(chunk) {
      for (const char of chunk.toString('utf8')) {
        if (char === '\u0003') { process.stdin.setRawMode(false); process.exit(130); }
        if (char === '\r' || char === '\n') {
          process.stdin.off('data', onData);
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolveAnswer(value.trim());
          return;
        }
        if (char === '\u007f' || char === '\b') { if (value.length) { value = value.slice(0, -1); process.stdout.write('\b \b'); } }
        else if (char >= ' ') { value += char; process.stdout.write(hidden ? '*' : char); }
      }
    }
    process.stdin.on('data', onData);
  });
}

async function main() {
  const config = JSON.parse((await readFile(file, 'utf8')).replace(/^\uFEFF/, ''));
  console.log('This restores your existing bot credentials locally. It does not send messages or change the bot.');
  console.log('Find your existing bot token in the original message from the official @BotFather, or its /mybots menu. Do not revoke it.');
  const token = await ask('Paste the existing bot token (hidden): ', true);
  if (!/^\d{5,}:[A-Za-z0-9_-]{20,}$/.test(token)) throw new Error('Invalid token');
  async function telegram(method) {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`);
    const result = await response.json();
    return result;
  }
  const me = await telegram('getMe');
  if (!me.ok) throw new Error('Token was not accepted');
  console.log(`Existing bot: @${me.result.username}`);
  console.log('Open that bot in Telegram and send it HI. This gives the setup a private chat ID to identify.');
  await ask('After sending HI to your bot, press Enter here: ');
  const updates = await telegram('getUpdates');
  const chats = new Map();
  for (const update of updates.result || []) {
    const chat = update.message?.chat;
    if (chat?.type === 'private') chats.set(String(chat.id), chat);
  }
  let chatId;
  const candidates = [...chats.values()];
  if (candidates.length) {
    candidates.forEach((chat, index) => console.log(`${index + 1}. ${[chat.first_name, chat.last_name].filter(Boolean).join(' ')}${chat.username ? ' (@' + chat.username + ')' : ''}`));
    const answer = await ask('Choose YOUR chat number for date notifications: ');
    const chosen = /^\d+$/.test(answer) ? candidates[Number(answer) - 1] : null;
    if (!chosen) throw new Error('No chat selected');
    chatId = String(chosen.id);
  } else {
    console.log('No private chat was available in getUpdates. You can enter the existing notification chat ID if you already have it.');
    chatId = await ask('Existing Telegram chat ID (hidden): ', true);
    if (!/^-?\d{5,}$/.test(chatId)) throw new Error('Invalid chat ID');
  }
  config.scheduler = { ...config.scheduler, TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId };
  await writeFile(file, JSON.stringify(config, null, 2), { mode: 0o600 });
  console.log('Saved both settings to the local ignored file. No credentials were printed or committed. Tell Codex: Telegram settings saved.');
}
main().catch(() => { console.error('Setup did not finish. Run it again in your terminal and check the existing token and chat selection. Your saved settings were not replaced.'); process.exitCode = 1; });
