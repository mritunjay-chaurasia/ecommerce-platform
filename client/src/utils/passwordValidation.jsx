export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export const validatePassword = (password) => {
    if (!password) {
        return 'Password is required';
    }

    if (password.length < 8) {
        return 'Password must be at least 8 characters';
    }

    if (!PASSWORD_REGEX.test(password)) {
        return 'Password must include uppercase, lowercase, and a number';
    }

    return '';
};
