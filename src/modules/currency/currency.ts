import fetch from 'node-fetch'
import Logger from '@modules/logger/logger'
import { URL, URLSearchParams } from 'url'
const logger = new Logger('currency')

type AbbrRaw = '$' | 'USD' | '€' | 'EUR' | '₽' | 'RUB'

export default class Currency {

    private static ERROR_MESSAGE: string = 'Произошла ошибка!\nПопробуйте позже или перейдите на сайт:\nhttps://myfin.by/currency/minsk'
    private static API_URL: string = 'http://www.nbrb.by/API/ExRates/Rates'
    private static PARAMS: URLSearchParams = new URLSearchParams({ Periodicity: '0' })
    private static ABBR_ARRAY: Array<string> = ['USD', 'EUR', 'RUB']

    private static async request(abbreviationArray: Array<string> = []): Promise<Array<object>> {
        const url = new URL(this.API_URL)
        const params = new URLSearchParams(this.PARAMS)
        try {
            const response = await fetch(url + '?' + params)
            const allRates = await response.json()
            return allRates.filter(rate => abbreviationArray.includes(rate['Cur_Abbreviation']))
        } catch (error) {
            logger.log({
                value: `Ошибка запроса к www.nbrb.by/API/ExRates/Rates\n${error}`,
                type: 'error'
            })
            return []
        }
    }

    static async getCurrency(): Promise<string> {
        const rates: Array<object> = await this.request(this.ABBR_ARRAY)
        if (!rates.length) return this.ERROR_MESSAGE
        return rates.map(rate =>
            `${rate['Cur_Scale']} ${rate['Cur_Abbreviation']}\n\`Белорусских рублей: ${rate['Cur_OfficialRate']}\``
        ).join('\n\n')
    }

    /**
     * @param value объем переводимой валюты
     * @param abbreviationRaw буквенное обозначение переводимой валюты
     */
    static async getExchange(value: number, abbreviationRaw?: AbbrRaw) {
        const rates = await this.request(this.ABBR_ARRAY)
        if (!rates.length) return this.ERROR_MESSAGE

        const abbreviationMap = { '$': 'USD', '€': 'EUR', '₽': 'RUB' }
        const abbreviation = abbreviationMap.hasOwnProperty(abbreviationRaw) ? abbreviationMap[abbreviationRaw] : abbreviationRaw && abbreviationRaw.toUpperCase()

        const convertToBYN = (rate, value): string =>
            `\`${value} ${rate['Cur_Abbreviation']} \` : \` ${Math.round(value * rate['Cur_OfficialRate'] / rate['Cur_Scale'] * 1000) / 1000} BYN\``
        const convertToCurrency = (rate, value): string =>
            `\`${value} BYN \` : \` ${Math.round(value / rate['Cur_OfficialRate'] * rate['Cur_Scale'] * 1000) / 1000} ${rate['Cur_Abbreviation']}\``

        const bynStrings = rates.map(rate => convertToBYN(rate, value)).join('\n')
        const currStrings = rates.map(rate => convertToCurrency(rate, value)).join('\n')

        switch (abbreviation) {
            case undefined: return `${bynStrings}\n\n${currStrings}`
            case 'BYN': return currStrings
            default:
                const rate = rates.find(rate => rate['Cur_Abbreviation'] === abbreviation)
                return convertToBYN(rate, value)
        }
    }

}
