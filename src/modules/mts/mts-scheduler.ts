import schedule from 'node-schedule';
import Logger from '../logger/logger';
import MtsModel from './mts-model';

export default class MtsScheduler {
    constructor(BOT, MTS_FIREBASE, ADMIN_ID) {
        const logger = new Logger('mts-scheduler', BOT, ADMIN_ID);

        async function updateAccounts() {
            try {
                logger.log({
                    value: '⌛ Обновление аккаунтов...',
                    type: 'info',
                });

                const userAccounts = await MTS_FIREBASE.getAllMtsAccounts();
                await MtsModel.updateAccounts(userAccounts);
                await MTS_FIREBASE.setMtsAccounts(userAccounts);
            } catch (error) {
                logger.log({
                    value: `Ошибка при обновлении аккаунтов\n${error}`,
                    type: 'error',
                    isAlertAdmin: true,
                });
            } finally {
                logger.log({
                    value: '⌛ Обновление аккаунтов завершено!',
                    type: 'info',
                });
            }
        }

        async function balanceReminders() {
            try {
                logger.log({
                    value: '⌛ Рассылка напоминаний о пополнении баланса...',
                    type: 'info',
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
                logger.log({
                    value: `Ошибка при рассылке напоминаний о пополнении баланса\n${error}`,
                    type: 'error',
                    isAlertAdmin: true,
                });
            } finally {
                logger.log({
                    value: '⌛ Рассылка напоминаний о пополнении баланса завершена!',
                    type: 'info',
                });
            }
        }

        schedule.scheduleJob({hour: 5, minute: 10}, updateAccounts);
        schedule.scheduleJob({hour: 13, minute: 0}, updateAccounts);
        schedule.scheduleJob({hour: 13, minute: 10}, balanceReminders);
    }
}
