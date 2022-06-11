import type winston from 'winston';
import schedule from 'node-schedule';
import fetch from 'node-fetch';

export default class CurrencyNB {
    logger: winston.Logger;
    url: string;
    urlParams: URLSearchParams;
    currCodes: Array<String>;
    #rates: null | any;

    constructor({currCodes}, logger) {
        this.logger = logger;
        this.url = 'https://www.nbrb.by/API/ExRates/Rates';
        this.urlParams = new URLSearchParams({Periodicity: '0'});
        this.currCodes = currCodes ?? ['USD', 'EUR', 'RUB'];
        this.#rates = null;

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
            this.logger.error(`Ошибка запроса к www.nbrb.by/API/ExRates/Rates\n${error}`);

            return null;
        }
    }

    async update() {
        const result = await this.request();

        if (!result) {
            return;
        }

        this.#rates = result;

        this.logger.info('Курсы НБРБ обновлены');
    }

    /**
     * Актуальные курсы НБРБ
     */
    get rates() {
        return this.#rates
            ? this.#rates.filter((rate) => this.currCodes.includes(rate.Cur_Abbreviation))
            : null;
    }
}
