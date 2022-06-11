import path from 'path';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import LoggerFactory from './LoggerFactory/LoggerFactory';
import firebase from './connect-firebase';

import logHub from './modules/logger/index';
import currency from './modules/currency/index';
import mts from './modules/mts/index';
import appController from './app-controller';

const ENV_PATH = path.resolve(require('os').homedir(), '.tbot/.env');
const KEYS_PATH = path.resolve(require('os').homedir(), '.tbot/keys/');
// eslint-disable-next-line import/no-dynamic-require
const FIREBASE_ACCOUNT = require(path.join(KEYS_PATH, 'firebase-adminsdk.json'));
const FIREBASE = firebase(FIREBASE_ACCOUNT);

dotenv.config({path: ENV_PATH});

const ADMIN_ID = parseInt(process.env.ADMIN_ID, 10);
const BOT = new TelegramBot(process.env.BOT_TOKEN, {polling: true});
const loggerFactory = new LoggerFactory({
    bot: BOT,
    adminId: ADMIN_ID,
});

logHub(loggerFactory);
currency(BOT); // todo + new logger
mts(BOT, FIREBASE, loggerFactory);
appController(BOT, ADMIN_ID, loggerFactory);
