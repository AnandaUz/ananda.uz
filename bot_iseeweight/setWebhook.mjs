import 'dotenv/config';
import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.BOT_ISEE_TOKEN);

// Настройка вебхука
bot.telegram.setWebhook(process.env.WEBHOOK_ISEE_URL);