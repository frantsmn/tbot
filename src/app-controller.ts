import TelegramBot from "node-telegram-bot-api";
import AppFirebase from './app-firebase'
import Logger from './modules/logger/logger'
import {ADMIN_KEYBOARD, USER_KEYBOARD} from "./app-keyboards";

const logger = new Logger('app-controller')

export default class AppController {

    constructor(BOT: TelegramBot, FIREBASE: FirebaseFirestore.Firestore, ADMIN_ID: number) {

        // Приветствие
        BOT.onText(/\/start/, msg => {
            switch (msg.chat.id) {
                case ADMIN_ID:
                    BOT.sendMessage(msg.chat.id, `🐸 Ква, Создатель!`, {
                        parse_mode: "Markdown",
                        reply_markup: ADMIN_KEYBOARD
                    });
                    break;

                default:
                    BOT.sendMessage(
                        msg.chat.id,
                        `🐸 Привет, ${msg.chat.first_name}!

Вот что я умею:

*Курсы валют*
- Кнопка просмотра курсов валют по нацбанку РБ
- Введите любое из следующих сочетаний для перевода валюты по текущему курсу: \`100 usd\`; \`500$\`; \`41 Eur\`; \`20byn\`; или просто любое число, и я переведу в другие валюты

*Баланс МТС*
- Кнопка для просмотра остатка средств, минут и траффика
- Ежедневная проверка и уведомление о пополнении, если необходимо`,
                        {
                            parse_mode: "Markdown",
                            reply_markup: USER_KEYBOARD
                        }
                    );
                    break;
            }
        });

        // Общие ответы
        BOT.onText(/пасиб|спс|благодар|cgc|cgfcb/gi, msg =>
            BOT.sendMessage(msg.chat.id, Math.random() > 0.5 ? "🐸❤️ Пожалуйста!" : "🐸❤️ Рада стараться!"));

        BOT.onText(/прив|ghbd|hello|hi/gi, msg =>
            BOT.sendMessage(msg.chat.id, Math.random() > 0.5 ? `🐸✋ Привет, ${msg.chat.first_name}!` : "🐸 Ааа... Кто здесь?!"));

        // Отправка сообщения через бота: @id Text...
        BOT.onText(/@([0-9]*)(.*)/, (msg, match) => {
            let id = match[1];
            let text = match[2];
            BOT.sendMessage(id, text);
        });

        // Трекинг пользователей
        const appFirebase = new AppFirebase(FIREBASE);

        BOT.on("message", async msg => {
            if (msg.from.id === ADMIN_ID) return;

            // Проверка на нового пользователя
            let user = await appFirebase.getUserByUserId(msg.from.id);
            if (!user.hasOwnProperty("is_bot")) {
                appFirebase.setUser(msg.from);
                logger.log({
                    value: `В базу добавлен пользователь\n\n${JSON.stringify(msg.from.first_name)}`,
                    type: 'info',
                })
                BOT.sendMessage(ADMIN_ID, `В базу добавлен пользователь\n\n${JSON.stringify(msg.from.first_name)}`);
            }

            // Логгирование сообщений
            logger.log({
                value: `Пользователь ${msg.from.first_name} ${msg.chat.id} оставил сообщение: ${JSON.stringify(msg)}`,
                type: 'info',
            })
            BOT.forwardMessage(ADMIN_ID, msg.from.id, msg.message_id);
        });

    }
}
