const { calculateOrderTotal, getEffectivePrice } = require('../../../shared/utils/pricing');

describe('pricing utils', () => {
    it('uses sale price when available', () => {
        expect(getEffectivePrice({ price: 1000, salePrice: 800 })).toBe(800);
    });

    it('calculates order total with shipping and tax', () => {
        const total = calculateOrderTotal(1000, 99, 180, 100);

        expect(total).toBe(1179);
    });
});
