export default function currencyController(BOT, currencyFacade) {
    BOT.onText(/Курсы валют/gim, async (msg) => {
        const message = await currencyFacade.getCurrency();

        await BOT.sendMessage(msg.chat.id, message, {parse_mode: 'Markdown'});
        await BOT.deleteMessage(msg.chat.id, msg.message_id.toString());
    });

    BOT.onText(/\D*(\d*[.,]?\d+)\s*(\$|€|₽|usd|eur|rub|byn)/gim, async (msg, match) => {
        const value = parseFloat(match[1].replace(/,/, '.'));
        const abbreviation = match[2];
        const message = await currencyFacade.getExchange(value, abbreviation);

        await BOT.sendMessage(msg.chat.id, message, {parse_mode: 'Markdown'});
    });

    BOT.onText(/^(\d*[.,]?\d+)$/gim, async (msg, match) => {
        const value = parseFloat(match[1].replace(/,/, '.'));
        const message = await currencyFacade.getExchange(value);

        await BOT.sendMessage(msg.chat.id, message, {parse_mode: 'Markdown'});
    });
}
