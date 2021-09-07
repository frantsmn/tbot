import FIREBASE_ACCOUNT from '@keys/firebase-adminsdk.json'
import TUYA_DEVICES from '@keys/tuya-devices.json'

import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'

import firebase from './connect-firebase'
import AppController from './app-controller'
import MtsController from '@modules/mts/mts-controller'
import CurrencyController from '@modules/currency/currency-controller'

dotenv.config()
const ADMIN_ID = parseInt(process.env.ADMIN_ID)
const FIREBASE = firebase(FIREBASE_ACCOUNT)
const BOT = new TelegramBot(process.env.BOT_TOKEN, { polling: true })

new AppController(BOT, FIREBASE, ADMIN_ID)
new MtsController(BOT, FIREBASE)
new CurrencyController(BOT)
