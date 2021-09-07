import Logger from '@modules/logger/logger'
const logger = new Logger('mts-firebase')

export default class MtsFirebase {
    FIREBASE: FirebaseFirestore.Firestore

    constructor(FIREBASE: FirebaseFirestore.Firestore) {
        this.FIREBASE = FIREBASE;
    }

    async getMtsAccountsByUserId(userId) {
        logger.log({
            value: `Получение аккаунтов для ${userId} из firebase`,
            type: 'info',
        })
        const collection = await this.FIREBASE.collection('mts').where('users', 'array-contains', userId).get()
        return collection.docs.map(account => account.data())
    }

    async getAllMtsAccounts() {
        logger.log({
            value: `Получение всех аккаунтов из firebase`,
            type: 'info',
        })
        const collection = await this.FIREBASE.collection('mts').get()
        return collection.docs.map(account => account.data())
    }

    async getUrgentMtsAccounts() {
        logger.log({
            value: `Получение всех аккаунтов ожидающих обновления из firebase`,
            type: 'info',
        })
        const collection = await this.FIREBASE.collection('mts').get()
        return collection.docs
            .map(account => account.data())
            .filter(account => account.needUpdate)
    }

    async setMtsAccounts(accounts) {
        for (const account of accounts) {
            logger.log({
                value: `Сохранение аккаунта ${account.login} в firebase`,
                type: 'info',
            })
            await this.FIREBASE.doc(`mts/${account.login}`).set(account)
        }
    }
}