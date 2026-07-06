const validateBannerForm = (form) => {
    const errors = {};

    const title = form.title?.trim() || '';
    if (!title) {
        errors.title = 'Title is required';
    } else if (title.length < 2) {
        errors.title = 'Title must be at least 2 characters';
    } else if (title.length > 120) {
        errors.title = 'Title cannot exceed 120 characters';
    }

    if (form.tag && form.tag.trim().length > 60) {
        errors.tag = 'Tag cannot exceed 60 characters';
    }

    if (form.subtitle && form.subtitle.trim().length > 300) {
        errors.subtitle = 'Subtitle cannot exceed 300 characters';
    }

    if (form.buttonText && form.buttonText.trim().length > 40) {
        errors.buttonText = 'Button text cannot exceed 40 characters';
    }

    if (form.sortOrder !== '' && form.sortOrder !== undefined) {
        const sortOrder = Number(form.sortOrder);
        if (Number.isNaN(sortOrder) || !Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 9999) {
            errors.sortOrder = 'Sort order must be a whole number between 0 and 9999';
        }
    }

    if (form.startsAt && form.expiresAt) {
        const startsAt = new Date(form.startsAt);
        const expiresAt = new Date(form.expiresAt);
        if (startsAt.getTime() > expiresAt.getTime()) {
            errors.expiresAt = 'Expiry date must be after the start date';
        }
    }

    return errors;
};

export {
    validateBannerForm,
};
