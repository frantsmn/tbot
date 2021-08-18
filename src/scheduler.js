const schedule = require('node-schedule');
const logger = require('./logger');
const bot = require('./app').bot;

const Mts = require('./model/mts');
// const Beltelecom = require('./model/beltelecom');
const scan = require('./model/scan');

//
//#region BALANCE REMINDERS

async function balanceReminders() {
    logger.info(`⌛ [scheduler] balanceReminders() started`);
    Mts.getAllWarningMessagesFirestore()
        .then(messages => messages.forEach(m => bot.sendMessage(m.id, m.text, m.options)));
    // Beltelecom.getAllWarningMessagesFirestore()
    //     .then(messages => messages.forEach(m => bot.sendMessage(m.id, m.text, m.options)));
    logger.info(`⌛ [scheduler] balanceReminders() finished`);
}

schedule.scheduleJob({ hour: 13, minute: 05 }, balanceReminders);

//#endregion
//


//
//#region UPDATE ACCOUNTS

async function updateAccounts() {
    logger.info(`⌛ [scheduler] updateAccounts() started`);
    await Mts.updateAllAccounts();
    // await Beltelecom.updateAllAccounts();
    logger.info(`⌛ [scheduler] updateAccounts() finished`);
}

schedule.scheduleJob({ hour: 05, minute: 30 }, updateAccounts);
schedule.scheduleJob({ hour: 17, minute: 30 }, updateAccounts);

//#endregion
//


//
//#region UPDATE URGENT ACCOUNTS

async function updateUrgentAccounts() {
    // logger.info(`⌛ [scheduler] updateUrgentAccounts() started`);
    await Mts.updateUrgentAccounts();
    // await Beltelecom.updateUrgentAccounts();
    // logger.info(`⌛ [scheduler] updateUrgentAccounts() finished`);
}

schedule.scheduleJob('*/10 * * * *', updateUrgentAccounts);

//#endregion
//

//
//#region checkDevice 
const ambientLight = require("./model/tuya").ambientLight;
const clipLight = require("./model/tuya").clipLight;

schedule.scheduleJob('*/1 * * * *', lightScheduler);

function lightScheduler() {
    const now = new Date().getHours()

    // По отклику телефона

    scan.checkDevice().then(result => {

        /**
         * Если телефон найден
         */

        if (result) {

            /* От 20:00 до 22:00 и если свет выключен */
            if (now >= 19 && now <= 22 && ambientLight.status === false) {

                // включить свет
                ambientLight.toggle();
                console.log('[scheduler.js] Ambient lights turn on! (20:00 - 22:00) [phone at home + lights was off])');

            }

        }

        /**
         * Если телефон не найден 
         */

        else {
            // TODO
            // Надо написать проверку на длительность молчания устройства
        }

    }).catch(error => console.log('[scheduler.js] checkDevice() error: ', error));


    /* 
    =================> В любом случае 
    */

    /* От 01:00 до 05:00 если AMBIENT свет включен */
    if (now >= 1 && now <= 5 && ambientLight.status === true) {

        // выключить свет
        ambientLight.toggle();
        console.log('[scheduler.js] Ambient lights turn off! (01:00 - 05:00) [light was on])');

    }

    /* От 01:00 до 05:00 если CLIPLIGHT свет включен */
    if (now >= 1 && now <= 5 && clipLight.status === true) {

        // выключить свет
        clipLight.toggle();
        console.log('[scheduler.js] Ambient lights turn off! (01:00 - 05:00) [light was on]');
    }

}

//#endregion
//