<<<<<<< HEAD
import TelegramBot from "node-telegram-bot-api";
import { ADMIN_KEYBOARD, USER_KEYBOARD } from "./app-keyboards";
import Logger from '@modules/logger/logger'
const logger = new Logger('app-controller')
import AppFirebase from './app-firebase'

export default class AppController {

  constructor(BOT: TelegramBot, FIREBASE: FirebaseFirestore.Firestore, ADMIN_ID: number) {
    
=======
import TelegramBot, { ReplyKeyboardMarkup } from "node-telegram-bot-api";

import Logger from '@modules/logger/logger'
const logger = new Logger('app-controller')
import AppFirebase from './app-firebase'

export default class AppController {
  
  constructor(BOT: TelegramBot, FIREBASE: FirebaseFirestore.Firestore, ADMIN_ID: number) {
    interface IAdminKeyboard {
      keyboard: ReplyKeyboardMarkup
      setClipLightStatus: Function
      setAmbientLightStatus: Function
    }

    const ADMIN_KEYBOARD: IAdminKeyboard = {
      keyboard: {
        keyboard: [
          [{ text: "Курсы валют" }],
          [{ text: "⚫ Клипса" }, { text: "⚫ Подсветка" }],
        ],
        resize_keyboard: true,
      },

      setClipLightStatus(status) {
        this.keyboard.keyboard[1][0].text = status ? "🟡 Клипса" : "⚫ Клипса";
      },

      setAmbientLightStatus(status) {
        this.keyboard.keyboard[1][1].text = status ? "🟡 Подсветка" : "⚫ Подсветка";
      }

    }

    const USER_KEYBOARD: ReplyKeyboardMarkup = {
      keyboard: [[{ text: "Курсы валют" }], [{ text: "Баланс MTS" }]],
      resize_keyboard: true,
    }

>>>>>>> bd10b55 (Рефакторинг модуля mts)
    // Приветствие
    BOT.onText(/\/start/, msg => {
      switch (msg.chat.id) {
        case ADMIN_ID:
          BOT.sendMessage(msg.chat.id, `🐸 Ква, Создатель!`, {
            parse_mode: "Markdown",
            reply_markup: ADMIN_KEYBOARD.keyboard
          });
          break;

        default:
          BOT.sendMessage(
            msg.chat.id,
            `🐸 Привет, ${msg.chat.first_name}!

Вот мой список команд:

*Курсы валют*
- Кнопка просмотра курсов валют по нацбанку РБ
- Введите любое из следующих сочетаний для перевода валюты по текущему курсу: \`100 usd\`; \`500$\`; \`41 Eur\`; \`20byn\`; или просто любое число, и я переведу в другие валюты

*Баланс МТС*
- Кнопка для просмотра остатка средств, минут и траффика
- Ежедневная проверка и уведомление о пополнении, если необходимо

*Баланс Beltelecom*
- Кнопка для просмотра остатка
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
    const getUserByUserId = appFirebase.getUserByUserId;
    const setUser = appFirebase.setUser;

    BOT.on("message", async msg => {
      if (msg.from.id === ADMIN_ID) return;

      // Проверка на нового пользователя
      let user = await getUserByUserId(msg.from.id);
      if (!user?.hasOwnProperty("is_bot")) {
        setUser(msg.from);
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
