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

//#region checkDevice 
schedule.scheduleJob('*/1 * * * *', scan.checkDevice);
scan.checkDevice();

//
//#region REMINDERS

// function workdayEnd() {

//     function getRandomInt(max) {
//         return Math.floor(Math.random() * Math.floor(max));
//     }

//     switch (getRandomInt(4)) {
//         case 0:
//             bot.sendMessage(ADMIN_ID, `🐸 Наработался?! 👨‍💻\nА теперь домой!`);
//             break;
//         case 1:
//             bot.sendMessage(ADMIN_ID, `🐸 Беги отсюда! 🏃\nБеги Форест, беги!`);
//             break;
//         case 2:
//             bot.sendMessage(ADMIN_ID, `🐸 Харош сидеть! 🪑\nВали жить для себя!`);
//             break;
//         case 3:
//             bot.sendMessage(ADMIN_ID, `🐸 Конец рабочего дня! 🎉\nПора отдыхать!`);
//             break;
//         default: break;
//     }

// }

// schedule.scheduleJob({ dayOfWeek: [new schedule.Range(1, 5)], hour: 17, minute: 58, second: 55 }, workdayEnd);


// const getAllUsers = require('./firestore').getAllUsers;
// async function newYearGratters() {
//     const users = await getAllUsers();

//     console.log(users);

//     users.forEach((user) => {
//         bot.sendMessage(user.id, `🐸 🍾🥂🕛🎄\n\n*Мои дорогие друзья!*\nИскренне поздравляю вас с наступающими праздниками. Никогда не меняйтесь, оставайтесь всегда такими же! Это пожелание - от всей души, не как эти дурацкие и безликие поздравления, которые народ пересылает друг другу, даже не читая. Вы - самая лучшая команда по водному поло, с которой мне приходилось играть! С новым 2013 годом!`, { parse_mode: "Markdown" });
//     });

//     logger.log("⌛ [scheduler] >> ❗️❗️❗️❗️❗️❗️ Отправлены новогодние поздравления ❗️❗️❗️❗️❗️❗️");
// }

// const newYear = new Date(2020, 11, 31, 22, 58, 55);
// schedule.scheduleJob(newYear, newYearGratters);

//#endregion
//