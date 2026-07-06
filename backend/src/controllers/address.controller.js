const Address = require('../models/address.model');
const ApiError = require('../utils/ApiError');

const formatAddress = (address) => ({
    id: String(address._id),
    label: address.label,
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    isDefault: address.isDefault,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
});

const unsetDefaultAddresses = async (userId, excludeId = null) => {
    const filter = { user: userId, isDefault: true };

    if (excludeId) {
        filter._id = { $ne: excludeId };
    }

    await Address.updateMany(filter, { isDefault: false });
};

const getMyAddresses = async (req, res) => {
    const addresses = await Address.find({ user: req.user._id })
        .sort({ isDefault: -1, updatedAt: -1 })
        .lean();

    return res.status(200).json({
        success: true,
        data: addresses.map(formatAddress),
    });
};

const createAddress = async (req, res) => {
    const payload = req.body;
    const shouldBeDefault = payload.isDefault || false;

    if (shouldBeDefault) {
        await unsetDefaultAddresses(req.user._id);
    }

    const existingCount = await Address.countDocuments({ user: req.user._id });

    const address = await Address.create({
        user: req.user._id,
        label: payload.label?.trim() || 'Home',
        fullName: payload.fullName.trim(),
        phone: payload.phone.trim(),
        line1: payload.line1.trim(),
        line2: payload.line2?.trim() || '',
        city: payload.city.trim(),
        state: payload.state?.trim() || '',
        postalCode: payload.postalCode?.trim() || '',
        country: payload.country.trim(),
        isDefault: existingCount === 0 ? true : shouldBeDefault,
    });

    if (address.isDefault) {
        await unsetDefaultAddresses(req.user._id, address._id);
    }

    return res.status(201).json({
        success: true,
        message: 'Address saved successfully',
        data: formatAddress(address),
    });
};

const updateAddress = async (req, res) => {
    const { id } = req.params;
    const address = await Address.findOne({ _id: id, user: req.user._id });

    if (!address) {
        throw new ApiError(404, 'Address not found');
    }

    const fields = [
        'label',
        'fullName',
        'phone',
        'line1',
        'line2',
        'city',
        'state',
        'postalCode',
        'country',
        'isDefault',
    ];

    fields.forEach((field) => {
        if (req.body[field] !== undefined) {
            address[field] = typeof req.body[field] === 'string'
                ? req.body[field].trim()
                : req.body[field];
        }
    });

    if (req.body.isDefault) {
        await unsetDefaultAddresses(req.user._id, address._id);
    }

    await address.save();

    return res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        data: formatAddress(address),
    });
};

const deleteAddress = async (req, res) => {
    const { id } = req.params;
    const address = await Address.findOneAndDelete({ _id: id, user: req.user._id });

    if (!address) {
        throw new ApiError(404, 'Address not found');
    }

    if (address.isDefault) {
        const nextDefault = await Address.findOne({ user: req.user._id })
            .sort({ updatedAt: -1 });

        if (nextDefault) {
            nextDefault.isDefault = true;
            await nextDefault.save();
        }
    }

    return res.status(200).json({
        success: true,
        message: 'Address deleted successfully',
    });
};

const setDefaultAddress = async (req, res) => {
    const { id } = req.params;
    const address = await Address.findOne({ _id: id, user: req.user._id });

    if (!address) {
        throw new ApiError(404, 'Address not found');
    }

    await unsetDefaultAddresses(req.user._id, address._id);
    address.isDefault = true;
    await address.save();

    return res.status(200).json({
        success: true,
        message: 'Default address updated successfully',
        data: formatAddress(address),
    });
};

module.exports = {
    getMyAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
};
