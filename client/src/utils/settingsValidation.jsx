const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateStoreSettingsForm = (form) => {
    const errors = {};

    const storeName = form.storeName?.trim() || '';
    if (!storeName) {
        errors.storeName = 'Store name is required';
    } else if (storeName.length < 2) {
        errors.storeName = 'Store name must be at least 2 characters';
    } else if (storeName.length > 80) {
        errors.storeName = 'Store name cannot exceed 80 characters';
    }

    if (form.contactEmail?.trim() && !EMAIL_REGEX.test(form.contactEmail.trim())) {
        errors.contactEmail = 'Contact email must be a valid email address';
    }

    if (form.contactPhone && form.contactPhone.trim().length > 20) {
        errors.contactPhone = 'Contact phone cannot exceed 20 characters';
    }

    if (form.supportAddress && form.supportAddress.trim().length > 300) {
        errors.supportAddress = 'Support address cannot exceed 300 characters';
    }

    if (!form.currency) {
        errors.currency = 'Currency is required';
    }

    const taxRate = Number(form.taxRate);
    if (form.taxRate === '' || Number.isNaN(taxRate) || taxRate < 0 || taxRate > 100) {
        errors.taxRate = 'Tax rate must be between 0 and 100';
    }

    const freeShippingThreshold = Number(form.freeShippingThreshold);
    if (form.freeShippingThreshold === '' || Number.isNaN(freeShippingThreshold) || freeShippingThreshold < 0) {
        errors.freeShippingThreshold = 'Free shipping threshold must be 0 or greater';
    }

    const standardShippingFee = Number(form.standardShippingFee);
    if (form.standardShippingFee === '' || Number.isNaN(standardShippingFee) || standardShippingFee < 0) {
        errors.standardShippingFee = 'Standard shipping fee must be 0 or greater';
    }

    if (form.returnPolicy && form.returnPolicy.trim().length > 2000) {
        errors.returnPolicy = 'Return policy cannot exceed 2000 characters';
    }

    return errors;
};

export {
    validateStoreSettingsForm,
};
