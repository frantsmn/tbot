import path from 'path'
import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'

const ENV_PATH = path.resolve(require('os').homedir(), '.tbot/.env')
const KEYS_PATH = path.resolve(require('os').homedir(), '.tbot/keys/')
const FIREBASE_ACCOUNT_PATH = path.join(KEYS_PATH, 'firebase-adminsdk.json')
const FIREBASE_ACCOUNT = require(FIREBASE_ACCOUNT_PATH)

import firebase from './connect-firebase'
import AppController from './app-controller'

import Mts from "./modules/mts/index"
import Currency from './modules/currency/index'

dotenv.config({path: ENV_PATH})

const ADMIN_ID = parseInt(process.env.ADMIN_ID)
const FIREBASE = firebase(FIREBASE_ACCOUNT)
const BOT = new TelegramBot(process.env.BOT_TOKEN, {polling: true})

new AppController(BOT, FIREBASE, ADMIN_ID)

new Currency(BOT)
new Mts(BOT, FIREBASE, ADMIN_ID)

console.log('tbot 2.3')
