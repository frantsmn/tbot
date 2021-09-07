<<<<<<< HEAD
import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'

import FIREBASE_ACCOUNT from './keys/firebase-adminsdk.json'
import TUYA_DEVICES from './keys/tuya-devices.json'
import USER_DEVICES from './keys/user-devices.json'
=======
import FIREBASE_ACCOUNT from '@keys/firebase-adminsdk.json'
import TUYA_DEVICES from '@keys/tuya-devices.json'
>>>>>>> 1cc944a (Фиксы)

import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'

import firebase from './connect-firebase'
import AppController from './app-controller'

<<<<<<< HEAD
import Mts from "./modules/mts/index";
import Currency from './modules/currency/index'
import IoT from './modules/iot/index'

=======
>>>>>>> bd10b55 (Рефакторинг модуля mts)
dotenv.config()
const ADMIN_ID = parseInt(process.env.ADMIN_ID)
const FIREBASE = firebase(FIREBASE_ACCOUNT)
const BOT = new TelegramBot(process.env.BOT_TOKEN, { polling: true })

new AppController(BOT, FIREBASE, ADMIN_ID)
<<<<<<< HEAD

// Modules
new Currency(BOT)
new Mts(BOT, FIREBASE)
new IoT(TUYA_DEVICES, USER_DEVICES, BOT, ADMIN_ID)
=======
new MtsController(BOT, FIREBASE)
new CurrencyController(BOT)
>>>>>>> bd10b55 (Рефакторинг модуля mts)
