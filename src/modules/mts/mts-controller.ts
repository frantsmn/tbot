import MtsModel from './mts-model'

export default class MtsController {
    constructor(BOT, MTS_FIREBASE) {

        BOT.onText(/mts/gi, async msg => {
            const userAccounts = await MTS_FIREBASE.getMtsAccountsByUserId(msg.from.id);
            if (userAccounts.length === 0) {
                BOT.sendMessage(msg.from.id, `🐸 Я не знаю ваш логин и пароль от кабинета MTS`);
                return;
            }
            userAccounts
                .map(account => MtsModel.createMessage(account))
                .forEach(message => BOT.sendMessage(msg.from.id, message.text, message.options))
        })

        BOT.on("callback_query", async response => {
            if (JSON.parse(response.data).query_id === "mts") {
                BOT.answerCallbackQuery(response.id, { text: `Обновляю данные...\nЭто может занять несколько секунд`, cache_time: 120, show_alert: true });

                const userAccounts = await MTS_FIREBASE.getMtsAccountsByUserId(response.message.chat.id)
                await MtsModel.updateAccounts(userAccounts);
                userAccounts
                    .map(account => MtsModel.createMessage(account))
                    .forEach(message => BOT.sendMessage(response.message.chat.id, message.text, message.options));
                MTS_FIREBASE.setMtsAccounts(userAccounts);

            }
        })

    }
}