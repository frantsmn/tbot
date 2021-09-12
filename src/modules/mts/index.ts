import MtsFirebase from './mts-firebase'
import MtsController from './mts-controller'
import MtsScheduler from './mts-scheduler'

export default class Mts {
    constructor(BOT, FIREBASE) {

        const MTS_FIREBASE = new MtsFirebase(FIREBASE)
        new MtsController(BOT, MTS_FIREBASE)
        new MtsScheduler(BOT, MTS_FIREBASE)

    }
}
