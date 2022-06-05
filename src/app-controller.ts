import TelegramBot from 'node-telegram-bot-api';
import {ADMIN_KEYBOARD, USER_KEYBOARD} from './app-keyboards';
import type LoggerFactory from './LoggerFactory/LoggerFactory';

export default class AppController {
    constructor(BOT: TelegramBot, ADMIN_ID: number, loggerFactory: LoggerFactory) {
        const logger = loggerFactory.createLogger('AppController');
        const startMessage = `🐸 Привет!

Вот что я умею:

*Курсы валют*
- Кнопка просмотра курсов валют по нацбанку РБ
- Введите любое из следующих сочетаний для перевода валюты по текущему курсу: \`100 usd\`; \`500 $\`; \`41 Eur\`; \`20 byn\`; или просто любое число, и я переведу в другие валюты

*Баланс МТС*
- Кнопка для просмотра остатка средств, минут и траффика
- Ежедневная проверка и уведомление о пополнении, если необходимо`;

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
}
