const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');
const {
    UPLOAD_DIR,
    MAX_UPLOAD_SIZE_MB,
    MAX_FILE_SIZE,
    ALLOWED_MIME_TYPES,
    ALLOWED_EXTENSIONS,
} = require('../config/upload.config');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const safeExtension = ALLOWED_EXTENSIONS.includes(extension) ? extension : '.jpg';
        const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${safeExtension}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(extension)) {
        cb(new ApiError(400, 'Only JPG, PNG, WEBP, and GIF images are allowed'));
        return;
    }

    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
    },
});

const uploadSingleImage = upload.single('image');

const handleUploadError = (err, req, res, next) => {
    if (!err) {
        return next();
    }

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new ApiError(400, `Image size must be ${MAX_UPLOAD_SIZE_MB}MB or less`));
        }

        return next(new ApiError(400, err.message));
    }

    return next(err);
};

module.exports = {
    uploadSingleImage,
    handleUploadError,
};
