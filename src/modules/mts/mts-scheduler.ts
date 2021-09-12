import schedule from 'node-schedule'
import Logger from '@modules/logger/logger'
const logger = new Logger('mts-scheduler')
import MtsModel from './mts-model'

export default class MtsScheduler {
    BOT: any
    MTS_FIREBASE: any

    constructor(BOT, MTS_FIREBASE) {

        schedule.scheduleJob({ hour: 5, minute: 30 }, updateAccounts);
        schedule.scheduleJob({ hour: 13, minute: 5 }, balanceReminders);
        schedule.scheduleJob('*/20 * * * *', updateUrgentAccounts);

        async function updateUrgentAccounts() {
            logger.log({
                value: `⌛ Проверка на наличие аккаунтов требующих обновления`,
                type: 'info',
            });

            const userAccounts = await MTS_FIREBASE.getUrgentMtsAccounts();

            if (userAccounts.length) {
                logger.log({
                    value: `⌛ Повторное обновление аккаунтов...`,
                    type: 'warn',
                });

                await MtsModel.updateAccounts(userAccounts);
                await MTS_FIREBASE.setMtsAccounts(userAccounts);

                logger.log({
                    value: `⌛ Обновление аккаунтов завершено!`,
                    type: 'info',
                });
            }
        }

        async function updateAccounts() {
            logger.log({
                value: `⌛ Обновление аккаунтов...`,
                type: 'info',
            });

            const userAccounts = await MTS_FIREBASE.getAllMtsAccounts();
            await MtsModel.updateAccounts(userAccounts);
            await MTS_FIREBASE.setMtsAccounts(userAccounts);

            logger.log({
                value: `⌛ Обновление аккаунтов завершено!`,
                type: 'info',
            });
        }

        async function balanceReminders() {
            logger.log({
                value: `⌛ Рассылка напоминаний о пополнении баланса...`,
                type: 'info',
            });

            const userAccounts = await MTS_FIREBASE.getAllMtsAccounts();
            userAccounts.forEach(account => {
                if (account.isLowBalance)
                    account.users.forEach(user => {
                        const message = MtsModel.createMessage(account);
                        BOT.sendMessage(user, message.text, message.options);
                    })
            });
        }
    }

}