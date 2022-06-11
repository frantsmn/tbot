import schedule from 'node-schedule';

export default function mtsScheduler(BOT, MTS_FIREBASE, mtsScraper, logger) {
    async function updateAccounts() {
        try {
            logger.info('Обновление аккаунтов...');

            const userAccounts = await MTS_FIREBASE.getAllMtsAccounts();

            await mtsScraper.updateAccounts(userAccounts);
            await MTS_FIREBASE.setMtsAccounts(userAccounts);
        } catch (error) {
            logger.error(`Ошибка при обновлении аккаунтов\n${error}`);
        } finally {
            logger.info('Обновление аккаунтов завершено!');
        }
    }

    async function balanceReminders() {
        try {
            logger.info('Рассылка напоминаний о пополнении баланса...');

            const userAccounts = await MTS_FIREBASE.getAllMtsAccounts();

            userAccounts.forEach((account) => {
                if (account.isLowBalance) {
                    account.users.forEach((user) => {
                        const message = mtsScraper.createMessage(account);
                        BOT.sendMessage(user, message.text, message.options);
                    });
                }
            });
        } catch (error) {
            logger.error(`Ошибка при рассылке напоминаний о пополнении баланса\n${error}`);
        } finally {
            logger.info('Рассылка напоминаний о пополнении баланса завершена!');
        }
    }

    schedule.scheduleJob({hour: 5, minute: 10}, updateAccounts);
    schedule.scheduleJob({hour: 13, minute: 0}, updateAccounts);
    schedule.scheduleJob({hour: 13, minute: 10}, balanceReminders);
}
