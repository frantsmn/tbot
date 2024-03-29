import schedule from 'node-schedule';
import fetch from 'node-fetch';

export default class CurrencyNbApi {
    url: string;
    urlParams: URLSearchParams;
    currCodes: Array<String>;
    #rates: null | any;
    #lastUpdateDate: null | Date;

    constructor({currCodes}) {
        this.url = 'https://www.nbrb.by/API/ExRates/Rates';
        this.urlParams = new URLSearchParams({Periodicity: '0'});
        this.currCodes = currCodes ?? ['USD', 'EUR', 'RUB'];
        this.#rates = null;
        this.#lastUpdateDate = null;

        this.update().then();

        schedule.scheduleJob({hour: 0, minute: 5}, () => this.update());
        schedule.scheduleJob({hour: 6, minute: 5}, () => this.update());
        schedule.scheduleJob({hour: 12, minute: 5}, () => this.update());
        schedule.scheduleJob({hour: 18, minute: 5}, () => this.update());
    }

    async request(): Promise<Array<object>> {
        try {
            const url = new URL(this.url);
            const params = new URLSearchParams(this.urlParams);
            const response = await fetch(`${url}?${params}`);

            return response.json();
        } catch (error) {
            console.error(`Ошибка запроса к www.nbrb.by/API/ExRates/Rates\n${error}`);

            return null;
        }
    }

    async update() {
        const result = await this.request();

        if (!result) {
            return;
        }

        this.#rates = result;
        this.#lastUpdateDate = new Date();

        console.info('Курсы НБРБ обновлены');
    }

    /**
     * Актуальные курсы НБРБ
     */
    get rates() {
        return this.#rates
            ? this.#rates.filter((rate) => this.currCodes.includes(rate.Cur_Abbreviation))
            : null;
    }

    /**
     * Время последнего обновления
     */
    get lastUpdateDate() {
        return this.#lastUpdateDate;
    }
}
