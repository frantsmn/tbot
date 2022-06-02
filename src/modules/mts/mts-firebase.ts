import Logger from '../../modules/logger/logger'

export default class MtsFirebase {
    FIREBASE: FirebaseFirestore.Firestore
    BOT: any | null;
    ADMIN_ID: number | null
    logger: Logger

    constructor(FIREBASE: FirebaseFirestore.Firestore, BOT?: any, ADMIN_ID?: number) {
        this.FIREBASE = FIREBASE;
        this.BOT = BOT || null;
        this.ADMIN_ID = ADMIN_ID || null;
        this.logger = new Logger('mts-firebase', BOT, ADMIN_ID);
    }

    async getMtsAccountsByUserId(userId) {
        this.logger.log({
            value: `Получение аккаунтов для ${userId} из firebase`,
            type: 'info',
        })
        const collection = await this.FIREBASE.collection('mts').where('users', 'array-contains', userId).get();
        return collection.docs.map(account => account.data());
    }

    async getAllMtsAccounts() {
        this.logger.log({
            value: `Получение всех аккаунтов из firebase`,
            type: 'info',
        });
        const collection = await this.FIREBASE.collection('mts').get();
        return collection.docs.map(account => account.data());
    }

    async setMtsAccounts(accounts) {
        for (const account of accounts) {
            this.logger.log({
                value: `Сохранение аккаунта ${account.login} в firebase`,
                type: 'info',
            });
            await this.FIREBASE.doc(`mts/${account.login}`).set(account);
        }
    }
}
