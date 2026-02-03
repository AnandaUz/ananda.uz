import { Telegraf } from 'telegraf';
import { User } from './models/users.mjs';
import { WeightLog } from './models/weightLog.mjs';

const bot = new Telegraf(process.env.BOT_ISEE_TOKEN);
const userState = new Map();

/* /start */
bot.start(async (ctx) => {
    const telegramId = ctx.from.id;

    const user = await User.findOne({ telegramId });
    if (user) {
        await ctx.reply('Ты уже зарегистрирован');
        return;
    }

    userState.set(telegramId, { step: 'NAME', data: {} });
    await ctx.reply('Как тебя зовут?');
});

/* Текстовые сообщения */
bot.on('text', async (ctx) => {
    const telegramId = ctx.from.id;
    const text = ctx.message.text;

    const state = userState.get(telegramId);

    /* ЭТАП РЕГИСТРАЦИИ */
    if (state) {
        switch (state.step) {
            case 'NAME':
                state.data.name = text;
                state.step = 'START_WEIGHT';
                await ctx.reply('Сколько ты сейчас весишь?');
                return;

            case 'START_WEIGHT':
                state.data.weightStart = Number(text);
                state.step = 'GOAL';
                await ctx.reply('Какая цель?');
                return;

            case 'GOAL':
                state.data.goal = text;
                state.step = 'TARGET_DATE';
                await ctx.reply('К какому числу? (YYYY-MM-DD)');
                return;

            case 'TARGET_DATE':
                state.data.targetDate = new Date(text);

                await User.create({
                    telegramId,
                    ...state.data
                });

                userState.delete(telegramId);
                await ctx.reply('Регистрация завершена. Присылай вес каждый день.');
                return;
        }
    }

    /* ПОСЛЕ РЕГИСТРАЦИИ — ПРИЁМ ВЕСА */
    const user = await User.findOne({ telegramId });
    if (!user) return;

    const match = text.match(/^([\d.]+)\s*(.*)?$/);
    if (!match) return;

    const weight = Number(match[1]);
    const comment = match[2] || '';

    await WeightLog.create({
        userId: user._id,
        weight,
        comment
    });

    await ctx.reply('Вес сохранён');
});

export default bot;
