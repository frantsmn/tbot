import type winston from 'winston';
import type LoggerFactory from '../../LoggerFactory/LoggerFactory';

export default class MtsFirebase {
    FIREBASE: FirebaseFirestore.Firestore;
    private logger: winston.Logger;

    constructor(FIREBASE: FirebaseFirestore.Firestore, loggerFactory: LoggerFactory) {
        this.FIREBASE = FIREBASE;
        this.logger = loggerFactory.createLogger('MtsFirebase');
    }

    async getMtsAccountsByUserId(userId) {
        const collection = await this.FIREBASE.collection('mts').where('users', 'array-contains', userId).get();

        this.logger.info({
            message: `Получение аккаунтов для ${userId} из firebase`,
        });

        return collection.docs.map((account) => account.data());
    }

    async getAllMtsAccounts() {
        const collection = await this.FIREBASE.collection('mts').get();

        this.logger.info({
            message: 'Получение всех аккаунтов из firebase',
        });

        return collection.docs.map((account) => account.data());
    }

    async setMtsAccounts(accounts) {
        // eslint-disable-next-line no-restricted-syntax
        for await (const account of accounts) {
            await this.FIREBASE.doc(`mts/${account.login}`).set(account);

            this.logger.info({
                message: `Сохранение аккаунта [${account.login}] в firebase`,
            });
        }
    }
}
