import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'

import FIREBASE_ACCOUNT from './keys/firebase-adminsdk.json'
import TUYA_DEVICES from './keys/tuya-devices.json'
import USER_DEVICES from './keys/user-devices.json'

import firebase from './connect-firebase'
import AppController from './app-controller'

import Mts from "./modules/mts/index";
import Currency from './modules/currency/index'
import IoT from './modules/iot/index'

dotenv.config()
const ADMIN_ID = parseInt(process.env.ADMIN_ID)
const FIREBASE = firebase(FIREBASE_ACCOUNT)
const BOT = new TelegramBot(process.env.BOT_TOKEN, { polling: true })

new AppController(BOT, FIREBASE, ADMIN_ID)

// Modules
new Currency(BOT)
new Mts(BOT, FIREBASE)
new IoT(TUYA_DEVICES, USER_DEVICES, BOT, ADMIN_ID)
