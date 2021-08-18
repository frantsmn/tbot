import Logger from '@modules/logger/logger'
const logger = new Logger('mts-firebase')

declare const FIREBASE: any

export default class MtsFirebase {

    static async getMtsAccountsByUserId(userId) {
        logger.log({
            value: `Получение аккаунтов для ${userId} из firebase`,
            type: 'info',
        })
        const collection = await FIREBASE.collection('mts').where('users', 'array-contains', userId).get()
        return collection.docs.map(account => account.data())
    }

    static async getAllMtsAccounts() {
        logger.log({
            value: `Получение всех аккаунтов из firebase`,
            type: 'info',
        })
        const collection = await FIREBASE.collection('mts').get()
        return collection.docs.map(account => account.data())
    }

    static async getUrgentMtsAccounts() {
        logger.log({
            value: `Получение всех аккаунтов ожидающих обновления из firebase`,
            type: 'info',
        })
        const collection = await FIREBASE.collection('mts').get()
        return collection.docs
            .map(account => account.data())
            .filter(account => account.needUpdate)
    }

    static async setMtsAccounts(accounts) {
        for (const account of accounts) {
            logger.log({
                value: `Сохранение аккаунта ${account.login} в firebase`,
                type: 'info',
            })
            await FIREBASE.doc(`mts/${account.login}`).set(account)
        }
    }
}