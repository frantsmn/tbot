
export default class AppController {
  constructor(BOT) {

    function AdminKeyboard() {

      this.keyboard = {
        keyboard: [
          ["Курсы валют"],
          ["⚫ Клипса", "⚫ Подсветка"]
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
        selective: false
      };

      this.setClipLightStatus = (status) => {
        this.keyboard.keyboard[1][0] = status ? "🟡 Клипса" : "⚫ Клипса";
      }

      this.setAmbientLightStatus = (status) => {
        this.keyboard.keyboard[1][1] = status ? "🟡 Подсветка" : "⚫ Подсветка";
      }

    }

    const ADMIN_KEYBOARD = new AdminKeyboard();

    const USER_KEYBOARD = {
      keyboard: [["Курсы валют", "Баланс MTS"]],
      resize_keyboard: true,
      one_time_keyboard: false,
      selective: false
    }

    /**
     * Приветствие
     */
    BOT.onText(/\/start/, msg => {
      switch (msg.chat.id) {
        case ADMIN_ID:
          BOT.sendMessage(msg.chat.id, `🐸 Ква, Создатель!`, {
            parse_mode: "Markdown",
            reply_markup: JSON.stringify(ADMIN_KEYBOARD.keyboard)
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
              reply_markup: JSON.stringify(USER_KEYBOARD)
            }
          );
          break;
      }
    });


    /**
     * Общие ответы
     */
    BOT.onText(/пасиб|спс|благодар|cgc|cgfcb/gi, async msg =>
      BOT.sendMessage(msg.chat.id, Math.random() > 0.5 ? "🐸❤️ Пожалуйста!" : "🐸❤️ Рада стараться!"));

    BOT.onText(/прив|ghbd|hello|hi/gi, async msg =>
      BOT.sendMessage(msg.chat.id, Math.random() > 0.5 ? `🐸✋ Привет, ${msg.chat.first_name}!` : "🐸 Ааа... Кто здесь?!"));


    /**
     * Отправка сообщения через бота: @id Text...
     */
    BOT.onText(/@([0-9]*)(.*)/, function (msg, match) {
      let id = match[1];
      let text = match[2];
      BOT.sendMessage(id, text);
    });


    /**
     * Трекинг пользователей
     */
    const setUser = require("./firestore").setUser;
    const getUserByUserId = require("./firestore").getUserByUserId;

    BOT.on("message", async msg => {
      if (msg.from.id !== ADMIN_ID) {

        //1. Проверка на нового пользователя
        let user = await getUserByUserId(msg.from.id);
        if (user && user.hasOwnProperty("is_bot")) {
          // logger.log(`Информация из базы: ${JSON.stringify(user)}`);
        } else {
          setUser(msg.from);
          logger.info(`❗❗ В базу добавлен пользователь\n\n${JSON.stringify(msg.from.first_name)}`);
          BOT.sendMessage(ADMIN_ID, `❗❗ В базу добавлен пользователь\n\n${JSON.stringify(msg.from.first_name)}`);
        }

        //2. Логгирование сообщений
        logger.info(`❗ Пользователь ${msg.from.first_name} ${msg.chat.id} оставил сообщение: ${JSON.stringify(msg)}`);
        BOT.forwardMessage(ADMIN_ID, msg.from.id, msg.message_id);
      }
    });

  }
}
