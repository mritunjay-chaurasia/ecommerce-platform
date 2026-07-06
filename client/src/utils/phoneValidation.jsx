import { PHONE_REGEX } from '@shared/constants/validation';

export const validatePhone = (phone) => {
    if (!phone?.trim()) {
        return 'Phone number is required';
    }

    if (!PHONE_REGEX.test(phone.trim())) {
        return 'Enter a valid 10-digit phone number';
    }

    return '';
};

export { PHONE_REGEX };
