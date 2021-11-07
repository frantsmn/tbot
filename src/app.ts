import path from 'path'
import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'

const ENV_PATH = path.resolve(require('os').homedir(), '.tbot/.env')
const KEYS_PATH = path.resolve(require('os').homedir(), '.tbot/keys/')
const FIREBASE_ACCOUNT_PATH = path.join(KEYS_PATH, 'firebase-adminsdk.json')
const TUYA_DEVICES_PATH = path.join(KEYS_PATH, 'tuya-devices.json')
const USER_DEVICES_PATH = path.join(KEYS_PATH, 'user-devices.json')

const FIREBASE_ACCOUNT = require(FIREBASE_ACCOUNT_PATH)
const TUYA_DEVICES = require(TUYA_DEVICES_PATH)
const USER_DEVICES = require(USER_DEVICES_PATH)

import firebase from './connect-firebase'
import AppController from './app-controller'

import Mts from "./modules/mts/index"
import Currency from './modules/currency/index'
import IoT from './modules/iot/index'

dotenv.config({path: ENV_PATH})

const ADMIN_ID = parseInt(process.env.ADMIN_ID)
const FIREBASE = firebase(FIREBASE_ACCOUNT)
const BOT = new TelegramBot(process.env.BOT_TOKEN, {polling: true})

const IOT_HOST = process.env.IOT_HOST;
const IOT_DEVICES = process.env.IOT_DEVICES;

new AppController(BOT, FIREBASE, ADMIN_ID)

// Modules
new Currency(BOT)
new Mts(BOT, FIREBASE)
new IoT(IOT_HOST, IOT_DEVICES, USER_DEVICES, BOT, ADMIN_ID)

console.log('tbot 2.0')
