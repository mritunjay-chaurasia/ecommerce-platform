const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const MAX_UPLOAD_SIZE_MB = 20;
const MAX_FILE_SIZE = MAX_UPLOAD_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

module.exports = {
    UPLOAD_DIR,
    MAX_UPLOAD_SIZE_MB,
    MAX_FILE_SIZE,
    ALLOWED_MIME_TYPES,
    ALLOWED_EXTENSIONS,
};
