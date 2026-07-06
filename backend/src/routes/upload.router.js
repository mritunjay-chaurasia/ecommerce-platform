const { Router } = require('express');
const router = Router();
const { uploadImage } = require('../controllers/upload.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { uploadSingleImage, handleUploadError } = require('../middlewares/upload');

router.post(
    '/uploads',
    authenticate,
    authorize.admin,
    (req, res, next) => {
        uploadSingleImage(req, res, (err) => {
            if (err) {
                return handleUploadError(err, req, res, next);
            }

            return next();
        });
    },
    asyncHandler(uploadImage),
);

module.exports = router;
