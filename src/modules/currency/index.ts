import CurrencyNbApi from './currency-nb-api';
import CurrencyFacade from './currency-facade';
import currencyController from './currency-controller';

export default function currency(BOT) {
    const currencyNB = new CurrencyNbApi({currCodes: ['USD', 'EUR', 'RUB']});
    const currencyFacade = new CurrencyFacade({currencyNB});

    currencyController(BOT, currencyFacade);
}
