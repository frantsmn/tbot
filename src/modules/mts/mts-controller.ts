import MtsModel from './mts-model';

export default class MtsController {
    constructor(BOT, MTS_FIREBASE, loggerFactory) {
        const logger = loggerFactory.createLogger('MtsController');

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

        BOT.onText(/mts/gi, async (msg) => {
            try {
                const userAccounts = await MTS_FIREBASE.getMtsAccountsByUserId(msg.from.id);

                if (!userAccounts.length) {
                    await BOT.sendMessage(msg.from.id, '🐸 Я не знаю ваш логин и пароль от кабинета MTS');

                    return;
                }

                await sendBalanceMessages(userAccounts, msg.from.id);

                logger.info({
                    message: 'Сообщения с балансом отправлены',
                    isTg: true,
                });
            } catch (error) {
                await BOT.sendMessage(msg.from.id, '🐸 Упс... Я сломалась!');

                logger.error({
                    message: `Ошибка при получении аккаунтов\n${error}`,
                });
            }
        });

        BOT.on('callback_query', async (response) => {
            if (JSON.parse(response.data).query_id !== 'mts') {
                return;
            }

            BOT.answerCallbackQuery(response.id, {
                text: 'Обновляю данные...\nЭто может занять несколько секунд',
                cache_time: 120,
                show_alert: true,
            });

            try {
                const userAccounts = await MTS_FIREBASE
                    .getMtsAccountsByUserId(response.message.chat.id);

                await MtsModel.updateAccounts(userAccounts);
                await sendBalanceMessages(userAccounts, response.message.chat.id);
                await MTS_FIREBASE.setMtsAccounts(userAccounts);

                logger.info({
                    message: 'Сообщения с принудительно обновленным балансом отправлены',
                    isTg: true,
                });
            } catch (error) {
                logger.error({
                    message: `Ошибка при попытке принудительного обновления аккаунтов\n${error}`,
                });
            }
        });
    }
}
