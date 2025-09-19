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


    // читаем параметр start
    const args = ctx.startPayload; // "mastermind" или "coaching"

    let clientMsg = "✅ Ваша заявка отправлена!";
    let adminMsg = `📩 Новая заявка от: ${user}`;

    let str = ''
    if (args === "mastermind") {
        str = 'на МАСТЕРМАЙНД'

    } else if (args === "coaching") {
        str = 'на КОУЧ-СЕССИЮ'
    }

    clientMsg = `✅ Ваша заявка ${str} отправлена!`;


    let url = ''
    if (ctx.from.username) {
        // Если есть ник, добавляем его
        user = `${fullName} (@${ctx.from.username})`;

        adminMsg = `📩 Новая заявка ${str}\nОт: ${user}`;
        bot.telegram.sendMessage(process.env.ADMIN_ID, adminMsg);
    } else {
        bot.telegram.sendMessage(
            process.env.ADMIN_ID,
            `📩 Новая заявка ${str}\nОт: <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name} ${ctx.from.last_name || ""}</a>`,
            {parse_mode: "HTML"}
        );
    }



    // сообщение клиенту
    ctx.reply(clientMsg);
    // сообщение админу
    //




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
