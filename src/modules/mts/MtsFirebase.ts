import type winston from 'winston';

export default class MtsFirebase {
    FIREBASE: FirebaseFirestore.Firestore;
    private logger: winston.Logger;

    constructor(FIREBASE: FirebaseFirestore.Firestore, logger) {
        this.FIREBASE = FIREBASE;
        this.logger = logger;
    }

    async getMtsAccountsByUserId(userId) {
        const collection = await this.FIREBASE.collection('mts').where('users', 'array-contains', userId).get();

        this.logger.info(`Получение аккаунтов для ${userId} из firebase`);

        return collection.docs.map((account) => account.data());
    }

    async getAllMtsAccounts() {
        const collection = await this.FIREBASE.collection('mts').get();

        this.logger.info('Получение всех аккаунтов из firebase');

        return collection.docs.map((account) => account.data());
    }

    async setMtsAccounts(accounts) {
        // eslint-disable-next-line no-restricted-syntax
        for await (const account of accounts) {
            await this.FIREBASE.doc(`mts/${account.login}`).set(account);

            this.logger.info(`Сохранение аккаунта [${account.login}] в firebase`);
        }
    }
}
