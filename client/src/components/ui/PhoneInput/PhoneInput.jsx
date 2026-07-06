import ReactPhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import FieldLabel from '../FieldLabel/FieldLabel';
import FormErrorMessage from '../FormErrorMessage/FormErrorMessage';
import cn from '../../../utils/cn';

import { PHONE_REGEX } from '@shared/constants/validation';

const toDisplayValue = (value, countryData) => {
    if (!value) return '';

    const digits = String(value).replace(/\D/g, '');
    const dialCode = countryData?.dialCode || (countryData === 'in' ? '91' : '');

    if (dialCode) {
        const localDigits = digits.startsWith(dialCode) ? digits.slice(dialCode.length) : digits;
        return localDigits ? `${dialCode}${localDigits}` : '';
    }

    return digits;
};

const toLocalValue = (phone, countryData) => {
    const digits = String(phone).replace(/\D/g, '');
    const dialCode = countryData?.dialCode || '';

    if (dialCode && digits.startsWith(dialCode)) {
        return digits.slice(dialCode.length);
    }

    return digits;
};

const PhoneInput = ({
    label = 'Phone Number',
    name = 'phone',
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    country = 'in',
    className = '',
}) => {
    const dialCode = country === 'in' ? '91' : '';

    const handleChange = (phone, countryData) => {
        onChange({
            target: {
                name,
                value: toLocalValue(phone, countryData),
            },
        });
    };

    return (
        <div className={cn('w-full', className)}>
            <FieldLabel htmlFor={name} label={label} required={required} />

            <ReactPhoneInput
                country={country}
                value={toDisplayValue(value, { dialCode })}
                onChange={handleChange}
                disabled={disabled}
                inputProps={{
                    name,
                    id: name,
                    'aria-invalid': Boolean(error),
                    'aria-describedby': error ? `${name}-error` : undefined,
                }}
                containerClass="phone-input-container"
                inputClass={cn('phone-input-field', error && 'phone-input-field-error')}
                buttonClass="phone-input-flag-btn"
                dropdownClass="phone-input-dropdown"
                enableSearch
                countryCodeEditable={false}
                specialLabel=""
            />

            <FormErrorMessage message={error} id={`${name}-error`} />
        </div>
    );
};

export { PHONE_REGEX };
export default PhoneInput;
