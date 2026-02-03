import dotenv from "dotenv";

dotenv.config({ path: new URL('../.env', import.meta.url) });

import { Telegraf } from "telegraf";

console.log(process.env.BOT_ISEE_TOKEN)
const bot = new Telegraf(process.env.BOT_ISEE_TOKEN);

// Настройка вебхука
bot.telegram.setWebhook(process.env.WEBHOOK_ISEE_URL);