import { uploadImage } from '../apis/upload.api';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_UPLOAD_SIZE_MB = 20;
const MAX_IMAGE_SIZE = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

const createExistingImageItem = (url) => ({
    kind: 'existing',
    url,
});

const createPendingImageItem = (file) => ({
    kind: 'pending',
    file,
    previewUrl: URL.createObjectURL(file),
});

const revokeImageItemPreview = (item) => {
    if (item?.kind === 'pending' && item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
    }
};

const revokeImageItemsPreview = (items = []) => {
    items.forEach(revokeImageItemPreview);
};

const getImageItemPreview = (item) => {
    if (!item) {
        return '';
    }

    if (item.kind === 'existing') {
        return item.url;
    }

    return item.previewUrl;
};

const validateImageFiles = (files, maxFiles, currentCount) => {
    if (!files.length) {
        return { error: '', acceptedFiles: [] };
    }

    const remainingSlots = maxFiles - currentCount;

    if (remainingSlots <= 0) {
        return { error: `You can select up to ${maxFiles} images`, acceptedFiles: [] };
    }

    const acceptedFiles = files.slice(0, remainingSlots);
    const invalidFile = acceptedFiles.find((file) => (
        !ACCEPTED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_SIZE
    ));

    if (invalidFile) {
        return {
            error: `Only JPG, PNG, WEBP, or GIF images up to ${MAX_UPLOAD_SIZE_MB}MB are allowed`,
            acceptedFiles: [],
        };
    }

    return { error: '', acceptedFiles };
};

const resolveImageItems = async (items = []) => {
    const resolvedUrls = [];

    for (const item of items) {
        if (item.kind === 'existing') {
            resolvedUrls.push(item.url);
            continue;
        }

        const result = await uploadImage(item.file);
        resolvedUrls.push(result.url);
    }

    return resolvedUrls;
};

const resolveSingleImageItem = async (item) => {
    if (!item) {
        return '';
    }

    if (item.kind === 'existing') {
        return item.url;
    }

    const result = await uploadImage(item.file);
    return result.url;
};

export {
    ACCEPTED_IMAGE_TYPES,
    MAX_UPLOAD_SIZE_MB,
    MAX_IMAGE_SIZE,
    createExistingImageItem,
    createPendingImageItem,
    revokeImageItemPreview,
    revokeImageItemsPreview,
    getImageItemPreview,
    validateImageFiles,
    resolveImageItems,
    resolveSingleImageItem,
};
