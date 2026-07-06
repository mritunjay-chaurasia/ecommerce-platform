const { Router } = require('express');
const router = Router();
const {
    getAdminReviews,
    updateReviewStatus,
    deleteReview,
} = require('../controllers/review.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const joiValidate = require('../middlewares/joiValidate');
const {
    listReviewsQuerySchema,
    reviewIdParamsSchema,
    updateReviewStatusSchema,
} = require('../validators/schemas/review.schema');

router.get('/reviews', authenticate, authorize.admin, joiValidate(listReviewsQuerySchema, 'query'), asyncHandler(getAdminReviews));
router.patch(
    '/reviews/:id/status',
    authenticate,
    authorize.admin,
    joiValidate(reviewIdParamsSchema, 'params'),
    joiValidate(updateReviewStatusSchema),
    asyncHandler(updateReviewStatus),
);
router.delete(
    '/reviews/:id',
    authenticate,
    authorize.admin,
    joiValidate(reviewIdParamsSchema, 'params'),
    asyncHandler(deleteReview),
);

module.exports = router;
