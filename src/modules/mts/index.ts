import MtsFirebase from './MtsFirebase';
import MtsScraper from './MtsScraper';
import mtsController from './mts-controller';
import mtsScheduler from './mts-scheduler';

export default function mts(BOT, FIREBASE, loggerFactory) {
    const firebaseLogger = loggerFactory.createLogger('MtsFirebase');
    const scraperLogger = loggerFactory.createLogger('MtsScraper');
    const controllerLogger = loggerFactory.createLogger('MtsController');
    const schedulerLogger = loggerFactory.createLogger('MtsScheduler');

    const MTS_FIREBASE = new MtsFirebase(FIREBASE, firebaseLogger);
    const mtsScraper = new MtsScraper({
        minUpdateInterval: 600000,
        minBalance: 0.9,
    }, scraperLogger);

    mtsController(BOT, MTS_FIREBASE, mtsScraper, controllerLogger);
    mtsScheduler(BOT, MTS_FIREBASE, mtsScraper, schedulerLogger);
}
