import type winston from 'winston';
import CurrencyNB from './CurrencyNB';

export default class CurrencyFacade {
    currencyNB: CurrencyNB;
    logger: winston.Logger;
    private errorMessage: string = '⚠️Произошла ошибка! НБРБ зажлобил данные по курсам\nВоспользуйтесь пока сайтом:\nhttps://select.by/kursy-valyut';

    constructor(sources, logger) {
        this.currencyNB = sources.currencyNB;
        this.logger = logger;
    }

    /**
     * Возвращает курсы валют в виде готового сообщения
     */
    async getCurrency(): Promise<string> {
        const {rates} = this.currencyNB;

        if (!rates) {
            this.logger.error('Не смог вернуть сообщение с курсами валют. Отсутствуют актуальные курсы');

            return this.errorMessage;
        }

        return rates.map((rate) => `${rate.Cur_Scale} ${rate.Cur_Abbreviation} • ${rate.Cur_OfficialRate} BYN`).join('\n\n');
    }

    /**
     * Переводит значение в валюты и возвращает в виде готового сообщения
     * @param value - объем переводимой валюты
     * @param abbreviationRaw - буквенное обозначение переводимой валюты
     */
    async getExchange(value: number, abbreviationRaw?: '$' | 'USD' | '€' | 'EUR' | '₽' | 'RUB') {
        const {rates} = this.currencyNB;

        if (!rates) {
            this.logger.error('Не смог вернуть сообщение с переводом валют. Отсутствуют актуальные курсы');

            return this.errorMessage;
        }

        const abbreviationMap = {$: 'USD'};
        const abbreviation = abbreviationRaw in abbreviationMap
            ? abbreviationMap[abbreviationRaw]
            : abbreviationRaw?.toUpperCase();

        /* eslint no-mixed-operators: 0 */
        const convertToBYN = (rate, value): string => `\`${value} ${rate.Cur_Abbreviation} \` : \` ${Math.round(value * rate.Cur_OfficialRate / rate.Cur_Scale * 1000) / 1000} BYN\``;
        const convertToCurrency = (rate, value): string => `\`${value} BYN \` : \` ${Math.round(value / rate.Cur_OfficialRate * rate.Cur_Scale * 1000) / 1000} ${rate.Cur_Abbreviation}\``;

        const bynStrings = rates.map((rate) => convertToBYN(rate, value)).join('\n');
        const currStrings = rates.map((rate) => convertToCurrency(rate, value)).join('\n');
        const rate = rates.find((rate) => rate.Cur_Abbreviation === abbreviation);

        switch (abbreviation) {
            case undefined:
                return `${bynStrings}\n\n${currStrings}`;
            case 'BYN':
                return currStrings;
            default:
                return convertToBYN(rate, value);
        }
    }
}
