<<<<<<< HEAD
<<<<<<< HEAD
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
=======
import Mts from './mts'
import MtsFirebase from './mts-firebase'
=======
import MtsModel from './mts-model'
>>>>>>> 6bdb869 (refactoring)

export default class MtsController {
    constructor(BOT, MTS_FIREBASE) {

        BOT.onText(/mts/gi, async msg => {
            const userAccounts = await MTS_FIREBASE.getMtsAccountsByUserId(msg.from.id);
            if (userAccounts.length === 0) {
                BOT.sendMessage(msg.from.id, `🐸 Я не знаю ваш логин и пароль от кабинета MTS`);
                return;
            }
            userAccounts
<<<<<<< HEAD
                .map(account => Mts.createMessage(account))
>>>>>>> bd10b55 (Рефакторинг модуля mts)
=======
                .map(account => MtsModel.createMessage(account))
>>>>>>> 6bdb869 (refactoring)
                .forEach(message => BOT.sendMessage(msg.from.id, message.text, message.options))
        })

        BOT.on("callback_query", async response => {
            if (JSON.parse(response.data).query_id === "mts") {
                BOT.answerCallbackQuery(response.id, { text: `Обновляю данные...\nЭто может занять несколько секунд`, cache_time: 120, show_alert: true });

<<<<<<< HEAD
<<<<<<< HEAD
                const userAccounts = await MTS_FIREBASE.getMtsAccountsByUserId(response.message.chat.id)
                await MtsModel.updateAccounts(userAccounts);
                userAccounts
                    .map(account => MtsModel.createMessage(account))
                    .forEach(message => BOT.sendMessage(response.message.chat.id, message.text, message.options));
                MTS_FIREBASE.setMtsAccounts(userAccounts);
=======
                const userAccounts = await mtsFirebase.getMtsAccountsByUserId(response.message.chat.id)
                await Mts.updateAccounts(userAccounts);
=======
                const userAccounts = await MTS_FIREBASE.getMtsAccountsByUserId(response.message.chat.id)
                await MtsModel.updateAccounts(userAccounts);
>>>>>>> 6bdb869 (refactoring)
                userAccounts
                    .map(account => MtsModel.createMessage(account))
                    .forEach(message => BOT.sendMessage(response.message.chat.id, message.text, message.options));
<<<<<<< HEAD
                mtsFirebase.setMtsAccounts(userAccounts);
>>>>>>> bd10b55 (Рефакторинг модуля mts)
=======
                MTS_FIREBASE.setMtsAccounts(userAccounts);
>>>>>>> 6bdb869 (refactoring)

            }
        })

    }
}