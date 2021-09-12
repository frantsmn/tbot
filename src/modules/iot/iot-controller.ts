import TuyaDevice from "./tuya-device";
import TelegramBot from "node-telegram-bot-api";
import { ADMIN_KEYBOARD } from "@/app-keyboards";

export default class IoTController {

    constructor(BOT: TelegramBot, ADMIN_ID, tyuaDevices: { clipLight: TuyaDevice, ambientLight: TuyaDevice }) {
        const { clipLight, ambientLight } = tyuaDevices;

        BOT.onText(/подсветка/gi, async msg => {
            if (msg.chat.id !== ADMIN_ID) return;
            ambientLight.toggle();
            BOT.deleteMessage(msg.chat.id, msg.message_id.toString());
        });
        ambientLight.on('statusChange', status => {
            ADMIN_KEYBOARD.setAmbientLightStatus(status);
            BOT.sendMessage(ADMIN_ID, `Устройство «${ambientLight.name}» ${status ? 'включено' : 'выключено'}`, {
                reply_markup: ADMIN_KEYBOARD.keyboard,
                disable_notification: true
            });
        });

        BOT.onText(/клипса/gi, async msg => {
            if (msg.chat.id !== ADMIN_ID) return;
            clipLight.toggle();
            BOT.deleteMessage(msg.chat.id, msg.message_id.toString());
        })
        clipLight.on('statusChange', status => {
            ADMIN_KEYBOARD.setClipLightStatus(status);
            BOT.sendMessage(ADMIN_ID, `Устройство «${clipLight.name}» ${status ? 'включено' : 'выключено'}`, {
                reply_markup: ADMIN_KEYBOARD.keyboard,
                disable_notification: true
            });
        });

    }
}