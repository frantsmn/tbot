const bot = require("./app").bot;
const logger = require("./logger");

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
bot.onText(/\/start/, msg => {
  switch (msg.chat.id) {
    case ADMIN_ID:
      bot.sendMessage(msg.chat.id, `🐸 Ква, Создатель!`, {
        parse_mode: "Markdown",
        reply_markup: JSON.stringify(ADMIN_KEYBOARD.keyboard)
      });
      break;

    default:
      bot.sendMessage(
        msg.chat.id,
        `🐸 Привет, ${msg.chat.first_name}!
        
Вот мой список команд:

*Курсы валют*
- Кнопка просмотра курсов валют по нацбанку РБ
- Введите любое из следующих сочетаний для перевода валюты по текущему курсу: \`100 usd\`; \`500$\`; \`41 Eur\`; \`20byn\`; или просто любое число, и я уточню введенную валюту

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
bot.onText(/пасиб|спс|благодар|cgc|cgfcb/gi, async msg =>
  bot.sendMessage(msg.chat.id, Math.random() > 0.5 ? "🐸❤️ Пожалуйста!" : "🐸❤️ Рада стараться!"));

bot.onText(/прив|ghbd|hello|hi/gi, async msg =>
  bot.sendMessage(msg.chat.id, Math.random() > 0.5 ? `🐸✋ Привет, ${msg.chat.first_name}!` : "🐸 Ааа... Кто здесь?!"));


/**
 * Отправка сообщения через бота: @id Text...
 */
bot.onText(/@([0-9]*)(.*)/, function (msg, match) {
  let id = match[1];
  let text = match[2];
  bot.sendMessage(id, text);
});


/**
 * Трекинг пользователей
 */
const setUser = require("./firestore").setUser;
const getUserByUserId = require("./firestore").getUserByUserId;

bot.on("message", async msg => {
  if (msg.from.id !== ADMIN_ID) {

    //1. Проверка на нового пользователя
    let user = await getUserByUserId(msg.from.id);
    if (user && user.hasOwnProperty("is_bot")) {
      // logger.log(`Информация из базы: ${JSON.stringify(user)}`);
    } else {
      setUser(msg.from);
      logger.info(`❗❗ В базу добавлен пользователь\n\n${JSON.stringify(msg.from.first_name)}`);
      bot.sendMessage(ADMIN_ID, `❗❗ В базу добавлен пользователь\n\n${JSON.stringify(msg.from.first_name)}`);
    }

    //2. Логгирование сообщений
    logger.info(`❗ Пользователь ${msg.from.first_name} ${msg.chat.id} оставил сообщение: ${JSON.stringify(msg)}`);
    bot.forwardMessage(ADMIN_ID, msg.from.id, msg.message_id);
  }
});


/**
 * Beltelecom
 */
// const Beltelecom = require('./model/beltelecom');

// bot.onText(/beltelecom/gi, async msg => {
//   const messages = await Beltelecom.getMessagesFirestoreByUserId(msg.from.id);
//   messages.forEach(m => {
//     bot.sendMessage(m.id, m.text, m.options);
//     if (msg.from.id !== ADMIN_ID)
//       bot.sendMessage(ADMIN_ID, `Пользователю ${msg.from.first_name} ${msg.chat.id} отправлено сообщение:\n\n${m.text}`, m.options);
//   });
// });

// bot.on("callback_query", async response => {
//   if (JSON.parse(response.data).query_id === "beltelecom") {
//     bot.answerCallbackQuery(response.id, { text: `Обновляю данные...\nЭто может занять несколько секунд`, cache_time: 120, show_alert: true });
//     const messages = await Beltelecom.getMessagesBeltelecomByUserId(response.message.chat.id);
//     messages.forEach(m => {
//       bot.sendMessage(m.id, m.text, m.options);
//       if (msg.from.id !== ADMIN_ID)
//         bot.sendMessage(ADMIN_ID, `Пользователю ${msg.from.first_name} ${msg.chat.id} отправлено сообщение:\n\n${m.text}`, m.options);
//     });
//   }
// });






/**
 * Tuya
 */

const ambientLight = require("./model/tuya").ambientLight;
bot.onText(/подсветка/gi, async msg => {
  if (msg.chat.id !== ADMIN_ID) return;
  ambientLight.toggle();
  bot.deleteMessage(msg.chat.id, msg.message_id);
})
ambientLight.on('statusChange', status => {
  ADMIN_KEYBOARD.setAmbientLightStatus(status);
  bot.sendMessage(ADMIN_ID, `Подсветка ${status ? 'включена' : 'выключена'}`, {
    reply_markup: JSON.stringify(ADMIN_KEYBOARD.keyboard),
    disable_notification: true
  });
});

const clipLight = require("./model/tuya").clipLight;
bot.onText(/клипса/gi, async msg => {
  if (msg.chat.id !== ADMIN_ID) return;
  clipLight.toggle();
  bot.deleteMessage(msg.chat.id, msg.message_id);
})
clipLight.on('statusChange', status => {
  ADMIN_KEYBOARD.setClipLightStatus(status);
  bot.sendMessage(ADMIN_ID, `Клипса ${status ? 'включена' : 'выключена'}`, {
    reply_markup: JSON.stringify(ADMIN_KEYBOARD.keyboard),
    disable_notification: true
  });
});

// bot.onText(/^(\d*[.,]?\d+)$/gim, (msg, match) => {
//   const value = parseFloat(match[1].replace(/,/, "."));
//   const options = {
//     reply_to_message_id: msg.message_id,
//     reply_markup: JSON.stringify({
//       inline_keyboard: [
//         [
//           {
//             text: "USD",
//             callback_data: JSON.stringify({
//               query_id: "currency",
//               value: value,
//               currency: "USD"
//             })
//           },
//           {
//             text: "EUR",
//             callback_data: JSON.stringify({
//               query_id: "currency",
//               value: value,
//               currency: "EUR"
//             })
//           },
//           {
//             text: "RUB",
//             callback_data: JSON.stringify({
//               query_id: "currency",
//               value: value,
//               currency: "RUB"
//             })
//           },
//           {
//             text: "BYN",
//             callback_data: JSON.stringify({
//               query_id: "currency",
//               value: value,
//               currency: "BYN"
//             })
//           }
//         ]
//       ]
//     })
//   };
//   bot.sendMessage(msg.chat.id, "Выберите валюту", options);
// });

// bot.on("callback_query", async response => {
//   const data = JSON.parse(response.data);
//   if (data.query_id === "currency") {
//     bot.answerCallbackQuery(response.id);
//     const text = await Currency.getExchange(data.currency, data.value);
//     bot.sendMessage(response.message.chat.id, text, { parse_mode: "Markdown" });
//   }
// });