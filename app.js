require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
global.ADMIN_ID = Number(process.env.ADMIN_ID);
exports.bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

//Взаимодействие с ботом
require('./controller');
//Действия по расписанию
require('./scheduler');