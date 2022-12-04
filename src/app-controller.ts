import TelegramBot from 'node-telegram-bot-api';
import {ADMIN_KEYBOARD, USER_KEYBOARD} from './app-keyboards';

export default function appController(
    BOT: TelegramBot,
    ADMIN_ID: number,
) {
    const startMessage = `🐸 Привет!

Вот что я умею:

*Курсы валют*
- Просмотр курсов валют НБРБ
- Понимаю и перевожу любое из следующих сочетаний валюты по текущему курсу: \`100 usd\`; \`500 $\`; \`41 Eur\`; \`20 byn\`; а можно ввести просто число, и я переведу его в другие валюты`;

    // Приветствие
    BOT.onText(/\/start/, async (msg) => {
        if (msg.chat.id === ADMIN_ID) {
            await BOT.sendMessage(msg.chat.id, '🐸 Ква, Создатель!', {
                parse_mode: 'Markdown',
                reply_markup: ADMIN_KEYBOARD,
            });
        } else {
            await BOT.sendMessage(
                msg.chat.id,
                startMessage,
                {
                    parse_mode: 'Markdown',
                    reply_markup: USER_KEYBOARD,
                },
            );
        }
    });

    // Fallback
    BOT.onText(/MTS|МТС/gim, async (msg) => {
        await BOT.sendMessage(msg.chat.id, '🐸 Баланс больше не работает. Воспользуйтесь приложением: https://play.google.com/store/apps/details?id=by.mts.client', {
            parse_mode: 'Markdown',
            reply_markup: USER_KEYBOARD,
        });
    });

    // Отправка сообщения через бота: @id Text...
    BOT.onText(/@(\d*)(.*)/, async (msg, match) => {
        const id = match[1];
        const text = match[2];
        await BOT.sendMessage(id, text);
    });

    // Логгирование сообщений пользователей
    BOT.on('message', async (msg) => {
        if (msg.from.id === ADMIN_ID) {
            return;
        }

        await BOT.forwardMessage(ADMIN_ID, msg.from.id, msg.message_id);
    });
}
