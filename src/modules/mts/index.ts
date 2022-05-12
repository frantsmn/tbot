import MtsFirebase from './mts-firebase'
import MtsController from './mts-controller'
import MtsScheduler from './mts-scheduler'

export default class Mts {
    constructor(BOT, FIREBASE, ADMIN_ID) {
        const MTS_FIREBASE = new MtsFirebase(FIREBASE, BOT, ADMIN_ID);
        new MtsController(BOT, MTS_FIREBASE, ADMIN_ID);
        new MtsScheduler(BOT, MTS_FIREBASE, ADMIN_ID);
    }
}
