import type winston from 'winston';
import puppeteer from 'puppeteer';

export default class MtsScraper {
    logger: winston.Logger;
    MIN_UPDATE_INTERVAL: number;
    MIN_BALANCE: number;

    /**
     * Скрапер баланса Mts
     * @param {Number?} minUpdateInterval Минимальный интервал принудительного обновления аккаунтов
     * @param {Number?} minBalance Минимальный баланс для отправки сообщения о пополненини
     * @param logger
     */
    constructor({
        minUpdateInterval = 600000,
        minBalance = 0.9,
    }: {
        minUpdateInterval: number,
        minBalance: number
    }, logger) {
        this.MIN_UPDATE_INTERVAL = minUpdateInterval;
        this.MIN_BALANCE = minBalance;
        this.logger = logger;
    }

    /**
     * Метод обновления аккаунтов. Возвращает массив обновленных аккаунтов в промисе
     * @param {Array<Account>} array массив аккаунтов
     * @returns {Promise<Array<Account>>} промис с массивом аккаунтов
     */
    async updateAccounts(array: Array<Account>): Promise<Array<Account>> {
        const browser = await MtsScraper.openBrowser();

        // eslint-disable-next-line no-restricted-syntax
        for await (let account of array) {
            // Если в течение интервала [this.MIN_UPDATE_INTERVAL] не обновлялся
            if (!account.timestamp || Date.now() - account.timestamp > this.MIN_UPDATE_INTERVAL) {
                this.logger.info(`Обновление аккаунта [${account.login}]`);

                const accountStatusText: string = await this.getAccountStatusText(browser, account);
                const accountStatus: AccountStatus = MtsScraper
                    .parseAccountStatusText(accountStatusText);

                if (accountStatus.balance) {
                    account = Object.assign(account, accountStatus, {
                        timestamp: Date.now(),
                        isLowBalance: parseFloat(accountStatus.balance) < this.MIN_BALANCE,
                    });

                    this.logger.info(`Данные для аккаунта [${account.login}] получены`);
                } else {
                    this.logger.error(`Не удалось получить данные для аккаунта [${account.login}]`);
                }
            } else {
                this.logger.warn(`Аккаунт [${account.login}] уже обновлялся в течение ${this.MIN_UPDATE_INTERVAL / 60000} минут`);
            }
        }

        await browser.close();
        return array;
    }

    /**
     * Создание Telegram сообщения о статусе аккаунта
     * @param {Account} account
     * @returns {Object} - сообщение для телеграмма {text, options}
     */
    createMessage(account: FirebaseFirestore.DocumentData) {
        const {
            login,
            balance,
            traffic,
            minutes,
            spent,
            timestamp,
        } = account;
        const date = new Date(timestamp).toLocaleDateString();
        const time = new Date(timestamp).toLocaleTimeString();
        const isLowBalance = parseFloat(balance) <= this.MIN_BALANCE;
        // Если в течение интервала this.MIN_UPDATE_INTERVAL не обновлялся
        const isRecentlyUpdated = Date.now() - account.timestamp < this.MIN_UPDATE_INTERVAL;
        const lowBalanceWarningText = isLowBalance ? '❗️*Пора пополнить баланс*❗️\n\n' : '';
        const text = `${lowBalanceWarningText}*Баланс MTS*
\`Для номера: ${login}
По состоянию на: ${date} ${time}\n
Баланс: ${balance} руб.
Интернет: ${traffic} мб.
Минуты: ${minutes} мин.
Израсходовано ${spent}\``;
        const options: any = isRecentlyUpdated === false ? {
            parse_mode: 'Markdown',
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{
                        text: 'Узнать баланс на данный момент',
                        callback_data: JSON.stringify({query_id: 'mts'}),
                    }],
                ],
            }),
        } : {parse_mode: 'Markdown'};

        return {text, options};
    }

    /**
     * Кросплатформенный метод открытия браузера
     * @private
     */
    static async openBrowser() {
        try {
            if (process.platform === 'linux') {
                return await puppeteer.launch({
                    executablePath: '/usr/bin/chromium-browser',
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
                });
            }

            return await puppeteer.launch({headless: true});
        } catch (error) {
            throw Error(`Ошибка при запуске браузера\n${error}`);
        }
    }

    /**
     * Получение текста с текущим балансом с сайта
     * @param browser
     * @param {Account} account
     * @returns {String}
     */
    async getAccountStatusText(browser: puppeteer.Browser, account: Account): Promise<string> {
        let statusText = '';
        const page = await browser.newPage();

        // Переход на страницу входа
        this.logger.silly('Переход на страницу входа');
        try {
            await page.goto('https://ihelper.mts.by/SelfCarePda/Security.mvc/LogOn', {waitUntil: 'domcontentloaded'});
        } catch (error) {
            throw Error(`Не удалось открыть страницу входа\n${error}`);
        }

        await page.waitForTimeout(500);

        // Подстановка логина и пароля
        this.logger.silly('Подстановка логина и пароля');
        await page.evaluate(({login, password}) => {
            const usernameInput = document.getElementsByName('username')[0] as HTMLInputElement;
            const passwordInput = document.getElementsByName('password')[0] as HTMLInputElement;

            if (usernameInput instanceof HTMLInputElement
                && passwordInput instanceof HTMLInputElement) {
                usernameInput.value = login;
                passwordInput.value = password;
            } else {
                throw new Error('Не найдены поля "Логин" и "Пароль"');
            }
        }, {login: account.login, password: account.password});

        await page.waitForTimeout(500);

        // Попытка входа в личный кабинет
        this.logger.silly('Попытка входа в личный кабинет');
        await page.evaluate(() => {
            const formElement = document.querySelector('form') as HTMLFormElement;
            if (formElement instanceof HTMLFormElement) {
                formElement.submit();
            } else {
                throw Error('Не найдена форма для отправки логина и пароля');
            }
        });

        await page.waitForTimeout(4000);

        // Проверка на ошибку при входе
        await page.evaluate(() => {
            const errorsList = document.querySelector('ul.operation-results-error') as HTMLUListElement;

            if (errorsList instanceof HTMLUListElement && errorsList.children.length) {
                const errorsText = [...errorsList.children]
                    .map((child) => (child as HTMLLIElement).innerText.trim())
                    .join('\n');
                throw Error(`Ошибка при попытке входа\n${errorsText}`);
            }
        });

        // Переход на страницу статуса
        this.logger.silly('Переход на страницу статуса');
        try {
            await page.goto('https://ihelper.mts.by/SelfCarePda/Account.mvc/Status', {waitUntil: 'domcontentloaded'});
        } catch (error) {
            throw Error(`Не удалось открыть страницу статуса\n${error}`);
        }

        await page.waitForTimeout(2000);

        // Чтение данных о статусе
        this.logger.silly('Чтение данных о статусе');
        statusText = await page.evaluate(() => {
            const mainContainer = document.querySelector('.main') as HTMLElement;
            if (mainContainer instanceof HTMLElement) {
                return mainContainer.innerText;
            }

            throw Error('Не найден элемент с информацией о балансе');
        });

        await page.close();
        return statusText;
    }

    /**
     * Парсинг текста сайта в объект AccountStatus
     * @param {String} text
     * @returns {AccountStatus}
     */
    static parseAccountStatusText(text: string): AccountStatus {
        const regExBalance = /Ваш текущий баланс: (\d+,*\d*) руб/m;
        const regExTraffic = /: (\d+,*\d*)\s*(Мб|Mb)/mi;
        const regExMinutes = /: (\d+,*\d*)\s*(Мин|Min)/mi;
        const regExSpent = /за период (.*$)/m;

        const balance = text.match(regExBalance) ? text.match(regExBalance)[1] : undefined;
        const traffic = text.match(regExTraffic) ? text.match(regExTraffic)[1] : undefined;
        const minutes = text.match(regExMinutes) ? text.match(regExMinutes)[1] : undefined;
        const spent = text.match(regExSpent) ? text.match(regExSpent)[1] : undefined;

        return {
            balance,
            traffic,
            minutes,
            spent,
        } as AccountStatus;
    }
}
