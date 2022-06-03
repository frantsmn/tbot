import CurrencyNB from "./CurrencyNB";
import Logger from "../logger/logger";

export default class CurrencyFacade {
    private static logger: Logger = new Logger('CurrencyFacade');
    private static currencyNB: CurrencyNB = new CurrencyNB({currCodes: ['USD', 'EUR', 'RUB']});
    private static errorMessage: string = `⚠️Произошла ошибка! НБРБ зажлобил данные по курсам\n
Воспользуйтесь пока сайтом:
https://select.by/kursy-valyut`;

    /**
     * Возвращает курсы валют в виде готового сообщения
     */
    static async getCurrency(): Promise<string> {
        const {rates} = this.currencyNB;

        if (!rates) {
            this.logger.log({
                value: 'Не смог вернуть сообщение с курсами валют. Отсутствуют актуальные курсы',
                type: 'error',
                isAlertAdmin: true,
            });

            return this.errorMessage;
        }

        return rates.map(rate =>
            `${rate['Cur_Scale']} ${rate['Cur_Abbreviation']} • ${rate['Cur_OfficialRate']} BYN`
        ).join('\n\n');
    }

    /**
     * Переводит значение в валюты и возвращает в виде готового сообщения
     * @param value - объем переводимой валюты
     * @param abbreviationRaw - буквенное обозначение переводимой валюты
     */
    static async getExchange(value: number, abbreviationRaw?: '$' | 'USD' | '€' | 'EUR' | '₽' | 'RUB') {
        const {rates} = this.currencyNB;

        if (!rates) {
            this.logger.log({
                value: 'Не смог вернуть сообщение с переводом валют. Отсутствуют актуальные курсы',
                type: 'error',
                isAlertAdmin: true,
            });

            return this.errorMessage;
        }

        const abbreviationMap = {'$': 'USD', '€': 'EUR', '₽': 'RUB'};
        const abbreviation = abbreviationMap.hasOwnProperty(abbreviationRaw)
            ? abbreviationMap[abbreviationRaw]
            : abbreviationRaw?.toUpperCase();

        const convertToBYN = (rate, value): string =>
            `\`${value} ${rate['Cur_Abbreviation']} \` : \` ${Math.round(value * rate['Cur_OfficialRate'] / rate['Cur_Scale'] * 1000) / 1000} BYN\``;
        const convertToCurrency = (rate, value): string =>
            `\`${value} BYN \` : \` ${Math.round(value / rate['Cur_OfficialRate'] * rate['Cur_Scale'] * 1000) / 1000} ${rate['Cur_Abbreviation']}\``;

        const bynStrings = rates.map(rate => convertToBYN(rate, value)).join('\n');
        const currStrings = rates.map(rate => convertToCurrency(rate, value)).join('\n');

        switch (abbreviation) {
            case undefined:
                return `${bynStrings}\n\n${currStrings}`;
            case 'BYN':
                return currStrings;
            default:
                const rate = rates.find((rate) => rate['Cur_Abbreviation'] === abbreviation);

                return convertToBYN(rate, value);
        }
    }
}
