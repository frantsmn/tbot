import puppeteer from 'puppeteer'
import MtsFirebase from './mts-firebase'
import Logger from '@modules/logger/logger'
const logger = new Logger('mts')

interface Account {
    login: string
    password: string
    balance: string
    minutes: string
    traffic: string
    spent: string
    needUpdate: boolean
    timestamp: number
    isLowBalance: boolean
    users: Array<number>
}

interface AccountStatusObject {
    balance: string
    traffic: string
    minutes: string
    spent: string
}

export default class Mts {

    private static MIN_UPDATE_INTERVAL = 600000
    private static MIN_BALANCE = 1.5

    private static async openBrowser() {
        try {
            // { headless: false }
            if (process.platform === "linux")
                return await puppeteer.launch({ executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
            else
                return await puppeteer.launch({ headless: false })

        } catch (error) {
            logger.log({
                value: `Ошибка при запуске браузера\n${error}`,
                type: 'error',
            })
            return undefined
        }
    }

    private static async getAccountStatusText(browser, account): Promise<string> {
        let statusText = ''
        const page = await browser.newPage()

        try {

            // Переход на страницу входа
            logger.log({
                value: `Переход на страницу входа`,
                type: 'info',
            })
            try {
                await page.goto('https://ihelper.mts.by/SelfCarePda/Security.mvc/LogOn', { waitUntil: 'domcontentloaded' })
            } catch (error) {
                throw `Не удалось открыть страницу входа\n${error}`
            }

            await page.waitForTimeout(1000)

            // Подстановка логина и пароля
            logger.log({
                value: 'Подстановка логина и пароля',
                type: 'info',
            })
            await page.evaluate(account => {
                const usernameInput = document.getElementsByName("username")[0] as HTMLInputElement;
                const passwordInput = document.getElementsByName("password")[0] as HTMLInputElement;
                if (usernameInput instanceof HTMLInputElement && passwordInput instanceof HTMLInputElement) {
                    usernameInput.value = account.login;
                    passwordInput.value = account.password;
                } else throw `Не найдены поля "Логин" и "Пароль"`

            }, account);

            await page.waitForTimeout(1000)

            // Попытка входа в личный кабинет
            logger.log({
                value: 'Попытка входа в личный кабинет',
                type: 'info',
            })
            await page.evaluate(() => {
                const formElement = document.querySelector("form") as HTMLFormElement
                if (formElement instanceof HTMLFormElement) {
                    formElement.submit()
                } else {
                    throw `Не найдена форма для отправки логина и пароля`
                }
            })

            await page.waitForTimeout(5000)

            // Проверка на ошибку при входе
            await page.evaluate(() => {
                const errorsList = document.querySelector("ul.operation-results-error") as HTMLUListElement
                if (errorsList instanceof HTMLUListElement && errorsList.children.length) {
                    const errorsText = [...errorsList.children].map(child => (child as HTMLLIElement).innerText.trim()).join('\n')
                    throw `Ошибка при попытке входа\n${errorsText}`
                }
            })

            await page.waitForTimeout(1000)

            // Переход на страницу статуса
            logger.log({
                value: `Переход на страницу статуса`,
                type: 'info',
            })
            try {
                await page.goto('https://ihelper.mts.by/SelfCarePda/Account.mvc/Status', { waitUntil: 'domcontentloaded' })
            } catch (error) {
                throw `Не удалось открыть страницу статуса\n${error}`
            }

            await page.waitForTimeout(2000)

            // Чтение данных о статусе
            logger.log({
                value: `Чтение данных о статусе`,
                type: 'info',
            })
            statusText = await page.evaluate(() => {
                const mainContainer = document.querySelector(".main") as HTMLElement
                if (mainContainer instanceof HTMLElement) {
                    return mainContainer.innerText
                }
                else throw `Не найден элемент с информацией о балансе`
            })

        } catch (error) {
            logger.log({ value: error, type: 'error' })
        }

        await page.close()
        return statusText
    }

    private static parseAccountStatusText(text: string): AccountStatusObject {
        const regExBalance = /Ваш текущий баланс: (\d+\,*\d*) руб/m
        const regExTraffic = /: (\d+\,*\d*)\s*(Мб|Mb)/mi
        const regExMinutes = /: (\d+\,*\d*)\s*(Мин|Min)/mi
        const regExSpent = /за период (.*$)/m

        const balance = text.match(regExBalance) ? text.match(regExBalance)[1] : undefined
        const traffic = text.match(regExTraffic) ? text.match(regExTraffic)[1] : undefined
        const minutes = text.match(regExMinutes) ? text.match(regExMinutes)[1] : undefined
        const spent = text.match(regExSpent) ? text.match(regExSpent)[1] : undefined

        return { balance, traffic, minutes, spent }
    }

    private static async updateAccounts(array: Array<Account>): Promise<Array<Account>> {
        const browser = await this.openBrowser()

        for await (let account of array) {
            //Если в течение интервала [this.MIN_UPDATE_INTERVAL] не обновлялся
            if (!account.timestamp || Date.now() - account.timestamp > this.MIN_UPDATE_INTERVAL) {

                logger.log({
                    value: `Обновление аккаунта [${account.login}]`,
                    type: 'info',
                })

                const accountStatusText: string = await this.getAccountStatusText(browser, account)
                const accountStatusObject: AccountStatusObject = this.parseAccountStatusText(accountStatusText)

                if (accountStatusObject.balance) {
                    account = Object.assign(account, accountStatusObject, {
                        timestamp: Date.now(),
                        isLowBalance: accountStatusObject.balance !== undefined && parseFloat(accountStatusObject.balance) < this.MIN_BALANCE
                    })

                    logger.log({
                        value: `Данные для аккаунта [${account.login}] получены`,
                        type: 'info',
                    })
                } else {
                    account.needUpdate = true

                    logger.log({
                        value: `Не удалось получить данные для аккаунта [${account.login}]`,
                        type: 'warn',
                    })
                }

            } else {
                logger.log({
                    value: `Аккаунт [${account.login}] уже обновлялся ${this.MIN_UPDATE_INTERVAL / 60000} минут назад`,
                    type: 'warn',
                })
            }
        }

        await browser.close();
        return array;
    }

    private static createMessage(userId: number, account: Account) {
        const { login, balance, traffic, minutes, spent, timestamp } = account
        const date = new Date(timestamp).toLocaleDateString()
        const time = new Date(timestamp).toLocaleTimeString()
        const isLowBalance = parseFloat(balance) <= this.MIN_BALANCE;
        //Если в течение интервала this.MIN_UPDATE_INTERVAL не обновлялся
        const isRecentlyUpdated = Date.now() - account.timestamp < this.MIN_UPDATE_INTERVAL
        const lowBalanceWarningText = isLowBalance ? `❗️*Пора пополнить баланс*❗️\n\n` : ``;
        const text = `${lowBalanceWarningText}*Баланс MTS*
\`Для номера: ${login}
По состоянию на: ${date} ${time}\n
Баланс: ${balance} руб.
Интернет: ${traffic} мб.
Минуты: ${minutes} мин.
Израсходовано ${spent}\``;

        const options = isRecentlyUpdated === false ? {
            parse_mode: "Markdown",
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{
                        text: "Узнать баланс на данный момент",
                        callback_data: JSON.stringify({ query_id: "mts" })
                    }]
                ]
            })
        } : { parse_mode: "Markdown" }

        return { userId, text, options }
    }

    static async getLowBalanceMessagesFromFirestore() {
        const userMtsAccounts = await MtsFirebase.getAllMtsAccounts()
        const messages = userMtsAccounts.reduce((messages, account) =>
            account.users.forEach(user => messages.push(this.createMessage(user, account))
            ), [])
        return messages.filter(message => message.warning)
    }

    static async getMessagesFromFirestore(userId) {
        const userAccounts = await MtsFirebase.getMtsAccountsByUserId(userId)
        if (userAccounts.length)
            return userAccounts.map(account => this.createMessage(userId, account))
        return [{
            id: userId,
            text: `🐸 Я не знаю ваш логин и пароль от кабинета Mts`,
            options: { parse_mode: "Markdown" }
        }]
    }

    static async getMessagesFromMts(userId) {
        const userAccounts = await MtsFirebase.getMtsAccountsByUserId(userId)
        await this.updateAccounts(userAccounts)
        MtsFirebase.setMtsAccounts(userAccounts)
        return userAccounts.map(account => this.createMessage(userId, account))
    }

}
