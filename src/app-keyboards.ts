import { ReplyKeyboardMarkup } from "node-telegram-bot-api";

export const USER_KEYBOARD: ReplyKeyboardMarkup = {
    keyboard: [[{ text: "Курсы валют" }], [{ text: "Баланс MTS" }]],
    resize_keyboard: true,
}

export const ADMIN_KEYBOARD: ReplyKeyboardMarkup = {
    keyboard: [[{ text: "Курсы валют" }]],
    resize_keyboard: true,
}
