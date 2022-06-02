import MtsModel from './mts-model'
import Logger from '../../modules/logger/logger'

export default class MtsController {
    constructor(BOT, MTS_FIREBASE, ADMIN_ID) {
        const logger = new Logger('mts-scheduler', BOT, ADMIN_ID);

        BOT.onText(/mts/gi, async (msg) => {
            try {
                const userAccounts = await MTS_FIREBASE.getMtsAccountsByUserId(msg.from.id);

                if (!userAccounts.length) {
                    await BOT.sendMessage(msg.from.id, `🐸 Я не знаю ваш логин и пароль от кабинета MTS`);

                    return;
                }

                await sendBalanceMessages(userAccounts, msg.from.id);
                logger.log({
                    value: `Сообщения с балансом отправлены`,
                    type: 'info',
                    isAlertAdmin: true,
                });
            } catch (error) {
                logger.log({
                    value: `Ошибка при получении аккаунтов\n${error}`,
                    type: 'error',
                    isAlertAdmin: true,
                });

                await BOT.sendMessage(msg.from.id, `🐸 Упс... Я сломалась!`);
            }
        });

        BOT.on("callback_query", async (response) => {
            if (JSON.parse(response.data).query_id === "mts") {
                BOT.answerCallbackQuery(response.id, {
                    text: `Обновляю данные...\nЭто может занять несколько секунд`,
                    cache_time: 120,
                    show_alert: true,
                });

                try {
                    const userAccounts = await MTS_FIREBASE.getMtsAccountsByUserId(response.message.chat.id);

                    await MtsModel.updateAccounts(userAccounts);
                    await sendBalanceMessages(userAccounts, response.message.chat.id);
                    await MTS_FIREBASE.setMtsAccounts(userAccounts);

                    logger.log({
                        value: `Сообщения с принудительно обновленным балансом отправлены`,
                        type: 'info',
                        isAlertAdmin: true,
                    });
                } catch (error) {
                    logger.log({
                        value: `Ошибка при попытке принудительного обновления аккаунтов\n${error}`,
                        type: 'error',
                        isAlertAdmin: true,
                    });
                }
            }
        });

        /**
         * Отправить сообщения с текущим балансом
         * @param userAccounts - массив аккаунтов
         * @param id - id пользователя
         */
        async function sendBalanceMessages(userAccounts, id) {
            const messagePromises = userAccounts.map((account) => {
                const {text, options} = MtsModel.createMessage(account);

                return BOT.sendMessage(id, text, options);
            });

            await Promise.all(messagePromises);
        }
    }
}
