import { ReplyKeyboardMarkup } from "node-telegram-bot-api";

interface IAdminKeyboard {
    keyboard: ReplyKeyboardMarkup
    setClipLightStatus: Function
    setAmbientLightStatus: Function
}

export const ADMIN_KEYBOARD: IAdminKeyboard = {
    keyboard: {
        keyboard: [
            [{ text: "Курсы валют" }],
            [{ text: "⚫ Клипса" }, { text: "⚫ Подсветка" }],
        ],
        resize_keyboard: true,
    },

    setClipLightStatus(status) {
        this.keyboard.keyboard[1][0].text = status ? "🟡 Клипса" : "⚫ Клипса";
    },

    setAmbientLightStatus(status) {
        this.keyboard.keyboard[1][1].text = status ? "🟡 Подсветка" : "⚫ Подсветка";
    }
}

export const USER_KEYBOARD: ReplyKeyboardMarkup = {
    keyboard: [[{ text: "Курсы валют" }], [{ text: "Баланс MTS" }]],
    resize_keyboard: true,
}