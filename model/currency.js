const fetch = require('node-fetch');
const logger = require('../logger');

module.exports = class Currency {
    static errorText = 'Произошла ошибка!\nПопробуйте позже или перейдите на сайт:\nhttps://myfin.by/currency/minsk';

    static async currencyRequest(abbreviationArray) {
        const url = new URL("http://www.nbrb.by/API/ExRates/Rates");
        const params = new URLSearchParams({ Periodicity: 0 });
        try {
            const res = await fetch(url + '?' + params);
            const allRates = await res.json();
            return allRates.filter(obj => abbreviationArray.includes(obj['Cur_Abbreviation']));
        } catch (error) {
            logger.error(`[currency.js] >> \n\n${error}`);
            return [];
        }
    }

    static async getCurrency() {
        const rates = await this.currencyRequest(['USD', 'EUR', 'RUB']);
        if (!rates.length) return this.errorText;

        return rates.map(rate =>
            `${rate['Cur_Scale']} ${rate['Cur_Abbreviation']}\n\`Белорусских рублей: ${rate['Cur_OfficialRate']}\``
        ).join('\n\n');
    }

    static async getExchange(value, abbreviationRaw) {
        const rates = await this.currencyRequest(['USD', 'EUR', 'RUB']);
        if (!rates.length) return this.errorText;

        const abbreviationMap = { '$': 'USD', '€': 'EUR', '₽': 'RUB' };
        const abbreviation = abbreviationMap.hasOwnProperty(abbreviationRaw) ? abbreviationMap[abbreviationRaw] : abbreviationRaw && abbreviationRaw.toUpperCase();

        const convertToBYN = (rate, value) =>
            `\`${value} ${rate['Cur_Abbreviation']} \` : \` ${Math.round(value * rate['Cur_OfficialRate'] / rate['Cur_Scale'] * 1000) / 1000} BYN\``;
        const convertToCurrency = (rate, value) =>
            `\`${value} BYN \` : \` ${Math.round(value / rate['Cur_OfficialRate'] * rate['Cur_Scale'] * 1000) / 1000} ${rate['Cur_Abbreviation']}\``

        const bynStrings = rates.map(rate => convertToBYN(rate, value)).join('\n');
        const currStrings = rates.map(rate => convertToCurrency(rate, value)).join('\n');

        switch (abbreviation) {
            case undefined:
                return `${bynStrings}\n\n${currStrings}`

            case 'BYN':
                return currStrings;

            default:
                const rate = rates.find(rate => rate['Cur_Abbreviation'] === abbreviation);
                return convertToBYN(rate, value);
        }

    }
}