import TelegramBot from 'node-telegram-bot-api';
import Logger from './modules/logger/logger'
import {ADMIN_KEYBOARD, USER_KEYBOARD} from './app-keyboards';

const logger = new Logger('app-controller');

const startMessage = `🐸 Привет!

Вот что я умею:

*Курсы валют*
- Кнопка просмотра курсов валют по нацбанку РБ
- Введите любое из следующих сочетаний для перевода валюты по текущему курсу: \`100 usd\`; \`500 $\`; \`41 Eur\`; \`20 byn\`; или просто любое число, и я переведу в другие валюты

*Баланс МТС*
- Кнопка для просмотра остатка средств, минут и траффика
- Ежедневная проверка и уведомление о пополнении, если необходимо`;

export default class AppController {
    constructor(BOT: TelegramBot, FIREBASE: FirebaseFirestore.Firestore, ADMIN_ID: number) {

        // Приветствие
        BOT.onText(/\/start/, async msg => {
            if (msg.chat.id === ADMIN_ID) {
                await BOT.sendMessage(msg.chat.id, `🐸 Ква, Создатель!`, {
                    parse_mode: "Markdown",
                    reply_markup: ADMIN_KEYBOARD
                });
            } else {
                await BOT.sendMessage(
                    msg.chat.id,
                    startMessage,
                    {
                        parse_mode: "Markdown",
                        reply_markup: USER_KEYBOARD
                    }
                );
            }
        });

        // Отправка сообщения через бота: @id Text...
        BOT.onText(/@([0-9]*)(.*)/, async (msg, match) => {
            let id = match[1];
            let text = match[2];
            await BOT.sendMessage(id, text);
        });

        // Логгирование сообщений пользователей
        BOT.on("message", async msg => {
            if (msg.from.id === ADMIN_ID) return;

            logger.log({
                value: `Пользователь ${msg.from.first_name} ${msg.chat.id} оставил сообщение: ${msg.text}`,
                type: 'info',
            });

            await BOT.forwardMessage(ADMIN_ID, msg.from.id, msg.message_id);
        });
    }
}
