import CurrencyController from './currency-controller';

export default class Currency {
    constructor(BOT) {
        // todo: достать сюда кишки из CurrecyController
        // todo: и инициализировать их тут
        // todo: и в них прокинуть логгер

        new CurrencyController(BOT);
    }
}
