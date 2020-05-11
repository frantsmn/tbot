const fetch = require('node-fetch');
const logger = require('../logger');

module.exports = class Currency {
    static errorText = 'Произошла ошибка!\nПопробуйте позже или перейдите на сайт:\nhttps://myfin.by/currency/minsk';
    static async __currencyRequest(abbreviationArray) {
        const url = new URL("http://www.nbrb.by/API/ExRates/Rates");
        const params = new URLSearchParams({ Periodicity: 0 });
        try {
            const res = await fetch(url + '?' + params);
            const allRates = await res.json();
            return allRates.filter(obj => abbreviationArray.includes(obj['Cur_Abbreviation']));
        } catch (error) {
            logger.error(`ERROR (currency.js)\n\n${error}`);
            return [];
        }
    }
    static async getCurrency() {
        const rates = await this.__currencyRequest(['USD', 'EUR', 'RUB']);
        let text = ``;
        rates.forEach(rate => text += `${rate['Cur_Scale']} ${rate['Cur_Abbreviation']} = ${rate['Cur_OfficialRate']} BYN\n`);
        return text.length ? text : this.errorText;
    }
    static async getExchange(currencyAbb, value) {
        const abbreviationMap = { '$': 'USD', '€': 'EUR', '₽': 'RUB' };
        const abbreviation = abbreviationMap.hasOwnProperty(currencyAbb) ? abbreviationMap[currencyAbb] : currencyAbb.toUpperCase();
        let rates = [];
        switch (abbreviation) {
            case 'USD':
            case 'EUR':
            case 'RUB':
                rates = await this.__currencyRequest([abbreviation]);
                return rates.length ? `${value} ${abbreviation}\n\`Белорусских рублей: ${Math.round(value * rates[0]['Cur_OfficialRate'] / rates[0]['Cur_Scale'] * 1000) / 1000}\`` : this.errorText;
            case 'BYN':
                rates = await this.__currencyRequest(['USD', 'EUR', 'RUB']);
                let text = `${value} ${abbreviation}\n`
                rates.forEach(rate => {
                    text += `\`${rate['Cur_Name']}: ${Math.round(value / rate['Cur_OfficialRate'] * rate['Cur_Scale'] * 1000) / 1000}\`\n`
                });
                return rates.length ? text : this.errorText;
        }
    }
}