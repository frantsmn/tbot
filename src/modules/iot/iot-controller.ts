import TelegramBot from "node-telegram-bot-api";
import {ADMIN_KEYBOARD} from "../../app-keyboards";
import iotInterface from "./iot-interface";

export default class iotController {
    constructor(BOT: TelegramBot, ADMIN_ID) {

        BOT.onText(/подсветка/gi, async msg => {
            if (msg.chat.id !== ADMIN_ID) return;
            // TODO в константы 'ambient'
            const {connected, status} = await iotInterface.toggle('ambient');
            ADMIN_KEYBOARD.setAmbientLightStatus(status);
            await BOT.sendMessage(ADMIN_ID, `Подсветка ${status ? 'включена' : 'выключена'}`,
                {
                    reply_markup: ADMIN_KEYBOARD.keyboard,
                    disable_notification: true,
                }
            );
            await BOT.deleteMessage(msg.chat.id, msg.message_id.toString());
        });

        BOT.onText(/клипса/gi, async msg => {
            if (msg.chat.id !== ADMIN_ID) return;
            // TODO в константы 'clip'
            const {connected, status} = await iotInterface.toggle('clip');
            ADMIN_KEYBOARD.setClipLightStatus(status);
            await BOT.sendMessage(ADMIN_ID, `Клипса ${status ? 'включена' : 'выключена'}`,
                {
                    reply_markup: ADMIN_KEYBOARD.keyboard,
                    disable_notification: true,
                });
            await BOT.deleteMessage(msg.chat.id, msg.message_id.toString());
        });
    }
}
