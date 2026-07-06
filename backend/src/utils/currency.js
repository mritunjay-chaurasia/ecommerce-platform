const formatMoney = (amount, currency = 'INR') => {
    const { CURRENCY_LOCALE_MAP } = require('../../../shared/constants/currency');
    const safeCurrency = CURRENCY_LOCALE_MAP[currency] ? currency : 'INR';

    return new Intl.NumberFormat(CURRENCY_LOCALE_MAP[safeCurrency], {
        style: 'currency',
        currency: safeCurrency,
        maximumFractionDigits: 2,
    }).format(Number(amount || 0));
};

module.exports = {
    formatMoney,
};
