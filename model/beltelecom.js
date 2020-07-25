const puppeteer = require('puppeteer');
const logger = require('../logger');
const firestore = require('../firestore');

module.exports = class Beltelecom {
    static minUpdateInterval = 600000;
    static minBalance = 3;

    //Data
    static async __scrapeBalance(browser, account) {
        try {
            const page = await browser.newPage();
            await page.goto('https://my.beltelecom.by/check-balance', { waitUntil: 'domcontentloaded' });
            // await page.screenshot({ path: `./1-[Beltelecom]-login-page.${account.login}.png` });
            let loginInput = await page.waitForSelector('#service-login');
            let passInput = await page.waitForSelector('#service-password');
            // await page.screenshot({ path: `./2-[Beltelecom]-login-page-wait-for-selectors.${account.login}.png` });
            await loginInput.focus();
            await loginInput.type(account.login);
            await passInput.focus();
            await passInput.type(account.password);
            // await page.screenshot({ path: `./3-[Beltelecom]-before-press-Enter.${account.login}.png` });
            await (await page.$('#service-password')).press('Enter');
            // await page.screenshot({ path: `./4-[Beltelecom]-after-press-Enter.${account.login}.png` });
            await page.waitForSelector('#loginCarousel div.auth-form-wrap div.balance');
            // await page.screenshot({ path: `./5-[Beltelecom]-after-waitForSelector.${account.login}.png` });
            const balance = await page.evaluate(() => document.querySelector('#loginCarousel div.auth-form-wrap div.balance span').innerText);
            await page.goto('about:blank');
            await page.close();
            return balance;
        } catch (error) {
            logger.error(`ERROR (beltelecom.js)\n\n${error}`);
        }
    }
    static async updateAccounts(array) {
        let browser;
        // { headless: false }
        if (process.platform === "linux")
            browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium-browser' });
        else
            browser = await puppeteer.launch();

        for await (let account of array) {
            //Если в течение интервала [this.minUpdateInterval] не обновлялся
            if (!account.timestamp || +new Date() - account.timestamp > this.minUpdateInterval) {

                logger.log(`[Beltelecom] >> scrapeBalance() для [${account.login}]`);
                await this.__scrapeBalance(browser, account)
                    .then(data => {
                        account.balance = data;
                        account.timestamp = + new Date();
                        // Sleep for 10 sec
                        (async () => await new Promise(resolve => setTimeout(resolve, 10000)))();
                    })
                    .catch(error => {
                        logger.error(`[Beltelecom] Ошибка при получении баланса: ${account.login}\n${error}`);
                        logger.log(`[Beltelecom] Данные не были обновлены!`);
                    })
                    .finally(() => logger.log(`[Beltelecom] ▶️  Баланс: ${account.balance}`));

            } else {
                logger.log(`❗❗ [Beltelecom] >> Аккаунт [${account.login}] уже обновлялся ${this.minUpdateInterval / 60000} минут назад`);
            }
        }

        await browser.close();
        return array;
    }
    static async updateAllAccounts() {
        const allBeltelecomAccounts = await firestore.getAllBeltelecomAccounts();
        await this.updateAccounts(allBeltelecomAccounts);
        firestore.setAllBeltelecomAccounts(allBeltelecomAccounts);
    }

    //Messages
    static __makeMessage(id, account, addRefreshButton = false) {
        const date = new Date(parseInt(account.timestamp)).toLocaleDateString();
        const time = new Date(parseInt(account.timestamp)).toLocaleTimeString();
        const warning = parseFloat(account.balance) <= this.minBalance;
        const warningText = warning ? `❗️*Пора пополнить баланс*❗️\n\n` : ``;
        const text = `${warningText}*Баланс Beltelecom*\n\`Для логина: ${account.login}\nПо состоянию на: ${date} ${time}\`\n\n*${account.balance}* руб.`;
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
        const userAccounts = await firestore.getAllBeltelecomAccounts();
        userAccounts.forEach(account =>
            account.users.forEach(user =>
                messages.push(this.__makeMessage(user, account, true))));
        return messages.filter(message => message.warning);
    }
    static async getMessagesFirestoreByUserId(id) {
        let messages = [];
        const userAccounts = await firestore.getBeltelecomAccountsByUserId(id);

        // Если аккаунты найдены
        if (userAccounts.length) {
            userAccounts.forEach(account => messages.push(this.__makeMessage(id, account, true)));
        }
        // Если аккаунты не найдены
        else {
            messages.push({
                id,
                text: `🐸 Я не знаю ваш логин и пароль от кабинета Beltelecom`,
                options: { parse_mode: "Markdown" }
            });
        }
        return messages;
    }
    static async getMessagesBeltelecomByUserId(id) {
        let messages = [];
        const userAccounts = await firestore.getBeltelecomAccountsByUserId(id);
        await this.updateAccounts(userAccounts);
        firestore.setAllBeltelecomAccounts(userAccounts);
        userAccounts.forEach(account => messages.push(this.__makeMessage(id, account, false)));
        return messages;
    }
}