import Mts from './mts'

export default class MtsController {
    constructor(BOT) {

        BOT.onText(/mts/gi, async msg => {
            const messages = await Mts.getMessagesFromFirestore(msg.from.id)
            messages.forEach(message => BOT.sendMessage(message.userId, message.text, message.options))
        })

        BOT.on("callback_query", async response => {
            if (JSON.parse(response.data).query_id === "mts") {
                BOT.answerCallbackQuery(response.id, { text: `Обновляю данные...\nЭто может занять несколько секунд`, cache_time: 120, show_alert: true });
                const messages = await Mts.getMessagesFromMts(response.message.chat.id);
                messages.forEach(msg => BOT.sendMessage(msg.userId, msg.text, msg.options))
            }
        })

    }
}