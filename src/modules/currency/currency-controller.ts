import CurrencyModel from './currency-model'

export default class CurrencyController {

    constructor(BOT) {

        BOT.onText(/Курсы валют/gim, async msg => {
            const messageText = await CurrencyModel.getCurrency()
            BOT.deleteMessage(msg.chat.id, msg.message_id)
            BOT.sendMessage(msg.chat.id, messageText, { parse_mode: "Markdown" })
        })

        BOT.onText(/\D*(\d*[.,]?\d+)\s*(\$|€|₽|usd|eur|rub|byn)/gim, async (msg, match) => {
            const value = parseFloat(match[1].replace(/,/, "."))
            const abbreviation = match[2]
            const text = await CurrencyModel.getExchange(value, abbreviation)
            BOT.sendMessage(msg.chat.id, text, { parse_mode: "Markdown" })
        })

        BOT.onText(/^(\d*[.,]?\d+)$/gim, async (msg, match) => {
            const value = parseFloat(match[1].replace(/,/, "."));
            const message = await CurrencyModel.getExchange(value)
            BOT.sendMessage(msg.chat.id, message, { parse_mode: "Markdown" })
        })

    }
}