import 'dotenv/config';
import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);

// Настройка вебхука
bot.telegram.setWebhook(process.env.WEBHOOK_URL);

// Логика при /start
bot.start((ctx) => {
    const user = ctx.from.username
        ? `@${ctx.from.username}`
        : `${ctx.from.first_name} ${ctx.from.last_name || ""}`;

    // читаем параметр start
    const args = ctx.startPayload; // "mastermind" или "coaching"

    console.log('> '+args)

    let clientMsg = "✅ Ваша заявка отправлена!";
    let adminMsg = `📩 Новая заявка от: ${user}`;

    if (args === "mastermind") {
        clientMsg = "✅ Ваша заявка на мастермайнд отправлена!";
        adminMsg = `📩 Новая заявка на МАСТЕРМАЙНД\nОт: ${user}`;
    } else if (args === "coaching") {
        clientMsg = "✅ Ваша заявка на коуч-сессию отправлена!";
        adminMsg = `📩 Новая заявка на КОУЧ-СЕССИЮ\nОт: ${user}`;
    }

    // сообщение клиенту
    ctx.reply(clientMsg);
    // сообщение админу
    bot.telegram.sendMessage(process.env.ADMIN_ID, adminMsg);
});

// Обработчик вебхука для Express / Vercel
export default async function handler(req, res) {
    try {
        // console.log("Received webhook update:", req.body);

        if (req.method !== "POST") {
            return res.status(200).json({ ok: true });
        }

        // передаём апдейт в Telegraf
        await bot.handleUpdate(req.body);

        // всегда возвращаем 200 ОК, чтобы Telegram не слал retry
        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("Error processing update:", err);
        return res.status(500).json({ ok: false, error: err.message });
    }
}
