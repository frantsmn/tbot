import MtsModel from './mts-model'
import Logger from '../../modules/logger/logger'

export default class MtsController {
    logger: Logger

    constructor(BOT, MTS_FIREBASE, ADMIN_ID) {
        this.logger = new Logger('mts-scheduler', BOT, ADMIN_ID);

        BOT.onText(/mts/gi, async msg => {
            let userAccounts = [];

            try {
                userAccounts = await MTS_FIREBASE.getMtsAccountsByUserId(msg.from.id);
            } catch (error) {
                BOT.sendMessage(msg.from.id, `🐸 Упс... Я сломалась`);
                this.logger.log({
                    value: `Ошибка при получении аккаунтов\n${error}`,
                    type: 'error',
                    isAlertAdmin: true,
                });
            }

            if (!userAccounts.length) {
                BOT.sendMessage(msg.from.id, `🐸 Я не знаю ваш логин и пароль от кабинета MTS`);

                return;
            }

            userAccounts
                .map(account => MtsModel.createMessage(account))
                .forEach(message => {
                    BOT.sendMessage(msg.from.id, message.text, message.options);
                    if (msg.from.id !== ADMIN_ID) {
                        BOT.sendMessage(ADMIN_ID, message.text, message.options);
                    }
                });
        })

        BOT.on("callback_query", async response => {
            if (JSON.parse(response.data).query_id === "mts") {
                BOT.answerCallbackQuery(response.id, {
                    text: `Обновляю данные...\nЭто может занять несколько секунд`,
                    cache_time: 120,
                    show_alert: true,
                });

                try {
                    const userAccounts = await MTS_FIREBASE.getMtsAccountsByUserId(response.message.chat.id)
                    await MtsModel.updateAccounts(userAccounts);
                    userAccounts
                        .map(account => MtsModel.createMessage(account))
                        .forEach(message => {
                            BOT.sendMessage(response.message.chat.id, message.text, message.options);
                            if (response.message.chat.id !== ADMIN_ID) {
                                BOT.sendMessage(ADMIN_ID, message.text, message.options);
                            }
                        });
                    MTS_FIREBASE.setMtsAccounts(userAccounts);
                } catch (error) {
                    this.logger.log({
                        value: `Ошибка при попытке принудительного обновления аккаунтов\n${error}`,
                        type: 'error',
                        isAlertAdmin: true,
                    });
                }
            }
        })
    }
}
