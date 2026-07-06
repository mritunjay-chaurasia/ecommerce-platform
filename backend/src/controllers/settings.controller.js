const { Settings } = require('../models/settings.model');
const {
    formatStoreSettings,
    getStoreSettings,
    formatPublicStoreSettings,
} = require('../utils/storeSettings');

const normalizeSettingsPayload = (payload = {}) => ({
    storeName: payload.storeName?.trim(),
    contactEmail: payload.contactEmail?.trim() || '',
    contactPhone: payload.contactPhone?.trim() || '',
    supportAddress: payload.supportAddress?.trim() || '',
    currency: payload.currency,
    taxRate: payload.taxRate,
    freeShippingThreshold: payload.freeShippingThreshold,
    standardShippingFee: payload.standardShippingFee,
    returnPolicy: payload.returnPolicy?.trim() || '',
});

const getAdminStoreSettings = async (_req, res) => {
    const settings = await getStoreSettings();

    return res.status(200).json({
        success: true,
        data: settings,
    });
};

const getPublicStoreSettings = async (_req, res) => {
    const settings = await getStoreSettings();

    return res.status(200).json({
        success: true,
        data: formatPublicStoreSettings(settings),
    });
};

const updateAdminStoreSettings = async (req, res) => {
    const payload = normalizeSettingsPayload(req.body);

    const settings = await Settings.findOneAndUpdate(
        { key: 'store' },
        { $set: payload },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).lean();

    return res.status(200).json({
        success: true,
        message: 'Store settings updated successfully',
        data: formatStoreSettings(settings),
    });
};

module.exports = {
    getAdminStoreSettings,
    getPublicStoreSettings,
    updateAdminStoreSettings,
};
