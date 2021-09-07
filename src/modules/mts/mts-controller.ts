import Mts from './mts'
import MtsFirebase from './mts-firebase'

export default class MtsController {
    constructor(BOT, FIREBASE) {

        const mtsFirebase = new MtsFirebase(FIREBASE);

        BOT.onText(/mts/gi, async msg => {
            const userAccounts = await mtsFirebase.getMtsAccountsByUserId(msg.from.id);
            if (userAccounts.length === 0) {
                BOT.sendMessage(msg.from.id, `🐸 Я не знаю ваш логин и пароль от кабинета Mts`);
                return;
            }
            userAccounts
                .map(account => Mts.createMessage(account))
                .forEach(message => BOT.sendMessage(msg.from.id, message.text, message.options))
        })

        BOT.on("callback_query", async response => {
            if (JSON.parse(response.data).query_id === "mts") {
                BOT.answerCallbackQuery(response.id, { text: `Обновляю данные...\nЭто может занять несколько секунд`, cache_time: 120, show_alert: true });

                const userAccounts = await mtsFirebase.getMtsAccountsByUserId(response.message.chat.id)
                await Mts.updateAccounts(userAccounts);
                userAccounts
                    .map(account => Mts.createMessage(account))
                    .forEach(message => BOT.sendMessage(response.message.chat.id, message.text, message.options));
                mtsFirebase.setMtsAccounts(userAccounts);

            }
        })

    }
}