import TelegramBot from 'node-telegram-bot-api';
import {ADMIN_KEYBOARD, USER_KEYBOARD} from './app-keyboards';
import type LoggerFactory from './LoggerFactory/LoggerFactory';

export default function appController(
    BOT: TelegramBot,
    ADMIN_ID: number,
    loggerFactory: LoggerFactory,
) {
    const logger = loggerFactory.createLogger('AppController');
    const startMessage = `🐸 Привет!

Вот что я умею:

*Курсы валют*
- Просмотр курсов валют НБРБ
- Понимаю и перевожу любое из следующих сочетаний валюты по текущему курсу: \`100 usd\`; \`500 $\`; \`41 Eur\`; \`20 byn\`; можно ввести просто число, и я переведу его в другие возможные валюты

*Баланс МТС*
- Просмотр остатка средств, минут и траффика (только для избранных)
- Проверяю баланс и уведомляю если его стоит пополнить`;

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

        logger.info({
            message: `Пользователь ${msg.from.first_name} \`${msg.chat.id}\` оставил сообщение`,
            isTg: true,
        });

        await BOT.forwardMessage(ADMIN_ID, msg.from.id, msg.message_id);
    });
}
