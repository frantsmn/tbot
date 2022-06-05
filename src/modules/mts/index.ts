import MtsFirebase from './mts-firebase';
import MtsController from './mts-controller';
import MtsScheduler from './mts-scheduler';

export default class Mts {
    constructor(BOT, FIREBASE, loggerFactory) {
        const MTS_FIREBASE = new MtsFirebase(FIREBASE, loggerFactory);

        new MtsController(BOT, MTS_FIREBASE, loggerFactory);
        new MtsScheduler(BOT, MTS_FIREBASE, loggerFactory);
    }
}
