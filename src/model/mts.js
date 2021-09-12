const puppeteer = require('puppeteer');
const firestore = require('../firestore');

module.exports = class Mts {
    static minUpdateInterval = 600000;
    static minBalance = 1.5;


    static async updateAllAccounts() {
        const allMtsAccounts = await firestore.getAllMtsAccounts();
        await this.updateAccounts(allMtsAccounts);
        firestore.setMtsAccounts(allMtsAccounts);
    }
    static async updateUrgentAccounts() {
        const urgentMtsAccounts = await firestore.getUrgentMtsAccounts();
        await this.updateAccounts(urgentMtsAccounts);
        firestore.setMtsAccounts(urgentMtsAccounts);
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
            userAccounts.forEach(account => messages.push(this.__makeMessage(id, account, true)));
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
    static async getMessagesMtsByUserId(id) {
        let messages = [];
        const userAccounts = await firestore.getMtsAccountsByUserId(id);
        await this.updateAccounts(userAccounts);
        firestore.setMtsAccounts(userAccounts);
        userAccounts.forEach(account => messages.push(this.__makeMessage(id, account, false)));
        return messages;
    }
}