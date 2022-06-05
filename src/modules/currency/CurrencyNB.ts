import schedule from 'node-schedule';
import fetch from 'node-fetch';
import Logger from '../logger/logger';

export default class CurrencyNB {
    logger: any;
    url: string;
    urlParams: URLSearchParams;
    currCodes: Array<String>;
    #rates: null | any;

    constructor({currCodes}) {
        this.logger = new Logger('CurrencyNB');
        this.url = 'https://www.nbrb.by/API/ExRates/Rates';
        this.urlParams = new URLSearchParams({Periodicity: '0'});
        this.currCodes = currCodes ?? ['USD', 'EUR', 'RUB'];
        this.#rates = null;

        (async function (context) {
            await context.update();
        }(this));

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
            this.logger.log({
                value: `Ошибка запроса к www.nbrb.by/API/ExRates/Rates\n${error}`,
                type: 'error',
                isAlertAdmin: true,
            });

            return null;
        }
    }

    async update() {
        const result = await this.request();

        if (!result) {
            return;
        }

        this.#rates = result;

        this.logger.log({
            value: 'Курсы НБРБ обновлены',
            type: 'info',
            isAlertAdmin: true,
        });
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
