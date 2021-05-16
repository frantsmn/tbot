const readline = require("readline");
global.rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});



// rl.on("close", function() {
//     console.log("\nBYE BYE !!!");
//     process.exit(0);
// });


require('dotenv').config();

global.FIREBASE_ACCOUNT = require("./firebase-adminsdk.json");
global.TUYA_DEVICES = require("./tuya-devices.json");
global.ADMIN_ID = Number(process.env.ADMIN_ID);

const TelegramBot = require('node-telegram-bot-api');
exports.bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

require('./controller');
require('./scheduler');