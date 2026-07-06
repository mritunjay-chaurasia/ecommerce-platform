import { CURRENCY_LOCALE_MAP } from '../constants/index';

const formatCurrency = (amount, currency = 'INR') => {
    const safeCurrency = CURRENCY_LOCALE_MAP[currency] ? currency : 'INR';

    return new Intl.NumberFormat(CURRENCY_LOCALE_MAP[safeCurrency], {
        style: 'currency',
        currency: safeCurrency,
        maximumFractionDigits: 2,
    }).format(Number(amount || 0));
};

export default formatCurrency;
