export const COUPON_CODE_REGEX = /^[A-Z0-9_-]+$/;
const MONEY_INPUT_REGEX = /^\d+(\.\d{1,2})?$/;
const INTEGER_INPUT_REGEX = /^\d+$/;

const isValidMoneyInput = (value) => MONEY_INPUT_REGEX.test(value);

export const normalizeCouponCode = (value = '') => value.toUpperCase().replace(/\s+/g, '').slice(0, 40);

export const validateCouponForm = (form) => {
    const errors = {};

    const code = form.code.trim();
    const description = form.description.trim();
    const discountValue = form.discountValue.trim();
    const minOrderAmount = form.minOrderAmount.trim();
    const maxDiscountAmount = form.maxDiscountAmount.trim();
    const usageLimit = form.usageLimit.trim();

    if (!code) {
        errors.code = 'Coupon code is required';
    } else if (code.length < 3) {
        errors.code = 'Coupon code must be at least 3 characters';
    } else if (code.length > 40) {
        errors.code = 'Coupon code cannot exceed 40 characters';
    } else if (!COUPON_CODE_REGEX.test(code)) {
        errors.code = 'Coupon code can contain only letters, numbers, hyphens, and underscores';
    }

    if (!form.discountType) {
        errors.discountType = 'Discount type is required';
    }

    if (!discountValue) {
        errors.discountValue = 'Discount value is required';
    } else if (!isValidMoneyInput(discountValue)) {
        errors.discountValue = 'Discount value must be a valid number with up to 2 decimals';
    } else if (Number(discountValue) <= 0) {
        errors.discountValue = 'Discount value must be greater than 0';
    } else if (form.discountType === 'percentage' && Number(discountValue) > 100) {
        errors.discountValue = 'Percentage discount cannot be greater than 100';
    }

    if (minOrderAmount) {
        if (!isValidMoneyInput(minOrderAmount)) {
            errors.minOrderAmount = 'Minimum order amount must be a valid number with up to 2 decimals';
        } else if (Number(minOrderAmount) < 0) {
            errors.minOrderAmount = 'Minimum order amount must be 0 or greater';
        }
    }

    if (maxDiscountAmount) {
        if (!isValidMoneyInput(maxDiscountAmount)) {
            errors.maxDiscountAmount = 'Maximum discount amount must be a valid number with up to 2 decimals';
        } else if (Number(maxDiscountAmount) <= 0) {
            errors.maxDiscountAmount = 'Maximum discount amount must be greater than 0';
        }
    }

    if (usageLimit) {
        if (!INTEGER_INPUT_REGEX.test(usageLimit)) {
            errors.usageLimit = 'Usage limit must be a whole number';
        } else if (Number(usageLimit) < 1) {
            errors.usageLimit = 'Usage limit must be greater than 0';
        }
    }

    if (form.startsAt && Number.isNaN(new Date(form.startsAt).getTime())) {
        errors.startsAt = 'Start date must be valid';
    }

    if (form.expiresAt && Number.isNaN(new Date(form.expiresAt).getTime())) {
        errors.expiresAt = 'Expiry date must be valid';
    }

    if (
        form.startsAt
        && form.expiresAt
        && !errors.startsAt
        && !errors.expiresAt
        && new Date(form.startsAt).getTime() > new Date(form.expiresAt).getTime()
    ) {
        errors.expiresAt = 'Expiry date must be after the start date';
    }

    if (description.length > 300) {
        errors.description = 'Description cannot exceed 300 characters';
    }

    return errors;
};
