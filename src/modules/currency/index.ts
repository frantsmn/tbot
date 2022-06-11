import CurrencyNB from './CurrencyNB';
import CurrencyFacade from './CurrencyFacade';
import currencyController from './currency-controller';

export default function currency(BOT, loggerFactory) {
    const currencyNB = new CurrencyNB(
        {currCodes: ['USD', 'EUR', 'RUB']},
        loggerFactory.createLogger('CurrencyNB'),
    );
    const currencyFacade = new CurrencyFacade(
        {currencyNB},
        loggerFactory.createLogger('CurrencyFacade'),
    );

    currencyController(BOT, currencyFacade);
}
