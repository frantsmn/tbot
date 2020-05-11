const puppeteer = require('puppeteer');
const logger = require('../logger');
const firestore = require('../firestore');

module.exports = class Mts {
    static minUpdateInterval = 600000;
    static minBalance = 1.5;

    //Data
    static async __scrapeBalance(browser, account) {
        try {
            const page = await browser.newPage();
            await page.goto('https://ihelper.mts.by/SelfCarePda/Security.mvc/LogOn', { waitUntil: 'domcontentloaded' });
            await page.evaluate(account => {
                document.getElementsByName("username")[0].value = account.login;
                document.getElementsByName("password")[0].value = account.password;
            }, account);
            // page.screenshot({ path: 'example1.2.png' }),
            await Promise.all([
                page.waitForNavigation(),
                page.evaluate(() => {
                    document.querySelector("form").submit();
                })
            ]);
            // await page.screenshot({ path: 'example1.3.png' })
            await page.goto('https://ihelper.mts.by/SelfCarePda/Account.mvc/Status', { waitUntil: 'domcontentloaded' });
            // await page.screenshot({ path: 'example2.png' });
            const text = await page.evaluate(() => document.querySelector(".main").innerText);
            return text;
        } catch (error) {
            logger.error(`ERROR (mts.js)\n\n${error}`);
        }
    }
    static __parseData(text) {
        const regExBalance = /Ваш текущий баланс: (\d+\,*\d*) руб/m;
        const regExTraffic = /: (\d+\,*\d*)\s*(Мб|Mb)/mi;
        const regExMinutes = /: (\d+\,*\d*)\s*(Мин|Min)/mi;
        const regExSpent = /за период (.*$)/m;

        const balance = text.match(regExBalance) ? text.match(regExBalance)[1] : '(не найдено)';
        const traffic = text.match(regExTraffic) ? text.match(regExTraffic)[1] : '(не найдено)';
        const minutes = text.match(regExMinutes) ? text.match(regExMinutes)[1] : '(не найдено)';
        const spent = text.match(regExSpent) ? text.match(regExSpent)[1] : '(не найдено)';

        return { balance, traffic, minutes, spent }
    }
    static async updateAccounts(array) {
        const browser = await puppeteer.launch();

        for await (let account of array) {
            logger.log(`[mts] >> scrapeBalance() для [${account.login}]`);

            await this.__scrapeBalance(browser, account)
                .then(text => {
                    let data = this.__parseData(text);
                    data.timestamp = + new Date();
                    account = Object.assign(account, data);
                    // Sleep for 5 sec
                    (async () => await new Promise(resolve => setTimeout(resolve, 5000)))();
                })
                .catch(e => {
                    logger.error(`[mts] Ошибка при получении баланса: ${account.login}\n${e}`);
                    logger.log(`[mts] Данные не обновлены!`);
                })
                .finally(() => logger.log(`[mts] ▶️  Баланс: ${account.balance}`));
        }

        await browser.close();
        return array;
    }
    static async updateAllAccounts() {
        const allMtsAccounts = await firestore.getAllMtsAccounts();
        await this.updateAccounts(allMtsAccounts);
        firestore.setAllMtsAccounts(allMtsAccounts);
    }

    //Messages
    static __makeMessage(id, account, addRefreshButton = false) {
        const date = new Date(parseInt(account.timestamp)).toLocaleDateString();
        const time = new Date(parseInt(account.timestamp)).toLocaleTimeString();
        const warning = parseFloat(account.balance) <= this.minBalance;
        const warningText = warning ? `❗️*Пора пополнить баланс*❗️\n\n` : ``;
        const text = `${warningText}*Баланс MTS*\n\`Для номера: ${account.login}\nПо состоянию на: ${date} ${time}\n
Баланс: ${account.balance} руб.
Интернет: ${account.traffic} мб.
Минуты: ${account.minutes} мин.
Израсходовано ${account.spent}\``;
        const options = addRefreshButton ? {
            parse_mode: "Markdown",
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [
                        {
                            text: "Узнать баланс на данный момент",
                            callback_data: JSON.stringify({
                                query_id: "beltelecom"
                            })
                        }
                    ]
                ]
            })
        } : { parse_mode: "Markdown" };
        return { id, text, options, warning }
    }
    static async getAllWarningMessagesFirestore() {
        let messages = [];
        const userAccounts = await firestore.getAllMtsAccounts();
        userAccounts.forEach(account =>
            account.users.forEach(user =>
                messages.push(this.__makeMessage(user, account/*, true*/))));
        return messages.filter(message => message.warning);
    }
    static async getMessagesFirestoreByUserId(id) {
        let messages = [];
        const userAccounts = await firestore.getMtsAccountsByUserId(id);

        // Если аккаунты найдены
        if (userAccounts.length) {
            userAccounts.forEach(account => messages.push(this.__makeMessage(id, account/*, true*/)));
        }
        // Если аккаунты не найдены
        else {
            messages.push({
                id,
                text: `🐸 Я не знаю ваш логин и пароль от кабинета Mts`,
                options: { parse_mode: "Markdown" }
            });
        }
        return messages;
    }
}