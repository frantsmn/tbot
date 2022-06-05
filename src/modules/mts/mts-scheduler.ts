import schedule from 'node-schedule';
import MtsModel from './mts-model';

export default class MtsScheduler {
    constructor(BOT, MTS_FIREBASE, loggerFactory) {
        const logger = loggerFactory.createLogger('MtsScheduler');

        async function updateAccounts() {
            try {
                logger.info({
                    message: 'Обновление аккаунтов...',
                });

                const userAccounts = await MTS_FIREBASE.getAllMtsAccounts();
                await MtsModel.updateAccounts(userAccounts);
                await MTS_FIREBASE.setMtsAccounts(userAccounts);
            } catch (error) {
                logger.error({
                    message: `Ошибка при обновлении аккаунтов\n${error}`,
                });
            } finally {
                logger.info({
                    message: 'Обновление аккаунтов завершено!',
                });
            }
        }

        async function balanceReminders() {
            try {
                logger.info({
                    message: 'Рассылка напоминаний о пополнении баланса...',
                });

                const userAccounts = await MTS_FIREBASE.getAllMtsAccounts();
                userAccounts.forEach((account) => {
                    if (account.isLowBalance) {
                        account.users.forEach((user) => {
                            const message = MtsModel.createMessage(account);
                            BOT.sendMessage(user, message.text, message.options);
                        });
                    }
                });
            } catch (error) {
                logger.error({
                    message: `Ошибка при рассылке напоминаний о пополнении баланса\n${error}`,
                });
            } finally {
                logger.info({
                    message: 'Рассылка напоминаний о пополнении баланса завершена!',
                });
            }
        }

        schedule.scheduleJob({hour: 5, minute: 10}, updateAccounts);
        schedule.scheduleJob({hour: 13, minute: 0}, updateAccounts);
        schedule.scheduleJob({hour: 13, minute: 10}, balanceReminders);
    }
}
