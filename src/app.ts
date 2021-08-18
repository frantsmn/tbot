import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'

import FIREBASE_ACCOUNT from '@keys/firebase-adminsdk.json'
import TUYA_DEVICES from '@keys/tuya-devices.json'

import firebase from './connect-firebase'
import AppController from './app-controller'
import MtsController from '@modules/mts/mts-controller'
import CurrencyController from '@modules/currency/currency-controller'

dotenv.config()
globalThis.ADMIN_ID = parseInt(process.env.ADMIN_ID)
globalThis.TUYA_DEVICES = TUYA_DEVICES
globalThis.FIREBASE = firebase(FIREBASE_ACCOUNT)

const BOT = new TelegramBot(process.env.BOT_TOKEN, { polling: true })

new AppController(BOT)
new MtsController(BOT)
new CurrencyController(BOT)
