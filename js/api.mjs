import 'dotenv/config';
import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);

// Настройка вебхука
bot.telegram.setWebhook(process.env.WEBHOOK_URL);

// Логика при /start
bot.start((ctx) => {
    let user = ''

    const firstName = ctx.from.first_name || "";
    const lastName = ctx.from.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();

    if (ctx.from.username) {
        // Если есть ник, добавляем его
        user = `${fullName} (@${ctx.from.username})`;
    } else {
        // Если ника нет — делаем кликабельную ссылку по ID
        user = `${fullName} (tg://user?id=${ctx.from.id})`;
    }
    // читаем параметр start
    const args = ctx.startPayload; // "mastermind" или "coaching"

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
