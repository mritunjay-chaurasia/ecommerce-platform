const { Settings } = require('../models/settings.model');

const DEFAULT_STORE_SETTINGS = {
    storeName: 'ShopKart',
    contactEmail: '',
    contactPhone: '',
    supportAddress: '',
    currency: 'INR',
    taxRate: 0,
    freeShippingThreshold: 2000,
    standardShippingFee: 99,
    returnPolicy: '',
};

const formatStoreSettings = (settings) => ({
    storeName: settings?.storeName ?? DEFAULT_STORE_SETTINGS.storeName,
    contactEmail: settings?.contactEmail ?? DEFAULT_STORE_SETTINGS.contactEmail,
    contactPhone: settings?.contactPhone ?? DEFAULT_STORE_SETTINGS.contactPhone,
    supportAddress: settings?.supportAddress ?? DEFAULT_STORE_SETTINGS.supportAddress,
    currency: settings?.currency ?? DEFAULT_STORE_SETTINGS.currency,
    taxRate: settings?.taxRate ?? DEFAULT_STORE_SETTINGS.taxRate,
    freeShippingThreshold: settings?.freeShippingThreshold ?? DEFAULT_STORE_SETTINGS.freeShippingThreshold,
    standardShippingFee: settings?.standardShippingFee ?? DEFAULT_STORE_SETTINGS.standardShippingFee,
    returnPolicy: settings?.returnPolicy ?? DEFAULT_STORE_SETTINGS.returnPolicy,
});

const getStoreSettings = async () => {
    const settings = await Settings.findOne({ key: 'store' }).lean();
    return formatStoreSettings(settings);
};

const formatPublicStoreSettings = (settings) => ({
    storeName: settings.storeName,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    supportAddress: settings.supportAddress,
    currency: settings.currency,
    returnPolicy: settings.returnPolicy,
    shippingRules: {
        freeShippingThreshold: settings.freeShippingThreshold,
        standardShippingFee: settings.standardShippingFee,
    },
    taxRate: settings.taxRate,
});

module.exports = {
    DEFAULT_STORE_SETTINGS,
    formatStoreSettings,
    getStoreSettings,
    formatPublicStoreSettings,
};
