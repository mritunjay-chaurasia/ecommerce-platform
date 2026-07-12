import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import WishlistButton from '../components/store/WishlistButton';
import {
    getMyProductReview,
    getProductReviews,
    getRelatedProducts,
    getStoreProduct,
    submitProductReview,
} from '../apis/store.api';
import ProductCard from '../components/store/ProductCard';
import {
    Button,
    InputField,
    Loader,
    showToastMessage,
    useToast,
} from '../components/ui';
import { showApiError } from '../components/ui/Toast/toastHelpers';
import { useStoreSettings } from '../context/StoreSettingsProvider';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectIsAuthenticated, selectRole } from '../store/slices/authSlice';
import { addToCart } from '../store/slices/cartSlice';
import formatCurrency from '../utils/formatCurrency';
import { getImageUrl } from '../utils/imageUrl';
import { RATING_OPTIONS } from '../constants/index';
import { trackRecentlyViewedProduct } from '../utils/recentlyViewed';
import './ProductDetail.css';

const emptyReviewForm = {
    rating: 5,
    title: '',
    comment: '',
};

const formatReviewDate = (value) => {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const toast = useToast();
    const { settings } = useStoreSettings();
    const currency = settings?.currency || 'INR';
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const role = useAppSelector(selectRole);
    const isCustomer = isAuthenticated && role === 'customer';

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [myReview, setMyReview] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewForm, setReviewForm] = useState(emptyReviewForm);
    const [reviewErrors, setReviewErrors] = useState({});
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [relatedLoading, setRelatedLoading] = useState(false);

    const fetchProduct = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getStoreProduct(productId);
            setProduct(data);
            setActiveImageIndex(0);
            setQuantity(1);
        } catch {
            setProduct(null);
            showToastMessage(toast, 'Product not found', 'error');
        } finally {
            setLoading(false);
        }
    }, [productId, toast]);

    const fetchReviews = useCallback(async () => {
        setReviewsLoading(true);
        try {
            const data = await getProductReviews(productId);
            setReviews(data || []);
        } catch {
            setReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    }, [productId]);

    const fetchMyReview = useCallback(async () => {
        if (!isCustomer) {
            setMyReview(null);
            return;
        }

        try {
            const data = await getMyProductReview(productId);
            setMyReview(data);
        } catch {
            setMyReview(null);
        }
    }, [isCustomer, productId]);

    const fetchRelatedProducts = useCallback(async () => {
        setRelatedLoading(true);
        try {
            const data = await getRelatedProducts(productId);
            setRelatedProducts(data || []);
        } catch {
            setRelatedProducts([]);
        } finally {
            setRelatedLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchProduct();
        fetchReviews();
        fetchMyReview();
        fetchRelatedProducts();
    }, [fetchMyReview, fetchProduct, fetchRelatedProducts, fetchReviews]);

    useEffect(() => {
        if (product?.id) {
            trackRecentlyViewedProduct(product.id);
        }
    }, [product?.id]);

    const images = useMemo(() => {
        if (!product) {
            return [];
        }

        const gallery = product.imageUrls?.length
            ? product.imageUrls
            : product.imageUrl
                ? [product.imageUrl]
                : [];

        return gallery.filter(Boolean);
    }, [product]);

    const currentPrice = product?.currentPrice ?? product?.price ?? 0;
    const originalPrice = product?.price ?? currentPrice;
    const discount = originalPrice > currentPrice
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        : 0;
    const isOutOfStock = (product?.stockQuantity ?? 0) <= 0;
    const activeImage = images[activeImageIndex] || '';

    const handleAddToCart = () => {
        if (!product || isOutOfStock) {
            showToastMessage(toast, 'This product is currently out of stock', 'warning');
            return;
        }

        for (let index = 0; index < quantity; index += 1) {
            dispatch(addToCart(product));
        }

        showToastMessage(toast, `Added ${quantity} item(s) to cart`, 'success');
    };

    const handleBuyNow = () => {
        if (!product || isOutOfStock) {
            showToastMessage(toast, 'This product is currently out of stock', 'warning');
            return;
        }

        for (let index = 0; index < quantity; index += 1) {
            dispatch(addToCart(product));
        }

        navigate('/cart');
    };

    const handleReviewChange = (event) => {
        const { name, value } = event.target;
        setReviewForm((prev) => ({ ...prev, [name]: value }));
        setReviewErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateReviewForm = () => {
        const nextErrors = {};

        if (!reviewForm.rating) {
            nextErrors.rating = 'Rating is required';
        }

        if (!reviewForm.comment.trim()) {
            nextErrors.comment = 'Comment is required';
        } else if (reviewForm.comment.trim().length < 3) {
            nextErrors.comment = 'Comment must be at least 3 characters';
        }

        return nextErrors;
    };

    const handleSubmitReview = async (event) => {
        event.preventDefault();

        if (!isCustomer) {
            navigate('/login', { state: { from: `/products/${productId}` } });
            return;
        }

        const nextErrors = validateReviewForm();
        setReviewErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        setSubmittingReview(true);
        try {
            const response = await submitProductReview({
                productId,
                rating: Number(reviewForm.rating),
                title: reviewForm.title.trim(),
                comment: reviewForm.comment.trim(),
            });

            setMyReview(response.data || {
                rating: Number(reviewForm.rating),
                title: reviewForm.title.trim(),
                comment: reviewForm.comment.trim(),
                status: 'pending',
            });
            setReviewForm(emptyReviewForm);
            showToastMessage(toast, response.message || 'Review submitted successfully', 'success');
        } catch (err) {
            showApiError(toast, err, 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="product-detail-page">
                <Loader center label="Loading product..." className="py-16" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-page">
                <div className="product-detail-empty">
                    <h1>Product not found</h1>
                    <p>The product you are looking for is unavailable or has been removed.</p>
                    <Button type="button" component={Link} to="/">
                        Back to store
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="product-detail-page">
            <div className="product-detail-breadcrumb">
                <Link to="/">Home</Link>
                <span>/</span>
                {product.category ? (
                    <>
                        <Link to={`/?category=${product.category}`}>{product.categoryName || 'Category'}</Link>
                        <span>/</span>
                    </>
                ) : (
                    <>
                        <span>{product.categoryName || 'Products'}</span>
                        <span>/</span>
                    </>
                )}
                <span>{product.name}</span>
            </div>

            <div className="product-detail-layout">
                <section className="product-detail-gallery">
                    <div className="product-detail-main-image-wrap">
                        <img
                            src={getImageUrl(activeImage)}
                            alt={product.name}
                            className="product-detail-main-image"
                        />
                        {discount > 0 ? (
                            <span className="product-detail-discount">{discount}% off</span>
                        ) : null}
                    </div>

                    {images.length > 1 ? (
                        <div className="product-detail-thumbs">
                            {images.map((image, index) => (
                                <button
                                    key={`${image}-${index}`}
                                    type="button"
                                    className={`product-detail-thumb${index === activeImageIndex ? ' active' : ''}`}
                                    onClick={() => setActiveImageIndex(index)}
                                    aria-label={`Show image ${index + 1}`}
                                >
                                    <img src={getImageUrl(image)} alt="" />
                                </button>
                            ))}
                        </div>
                    ) : null}
                </section>

                <section className="product-detail-info">
                    <p className="product-detail-category">{product.categoryName || '-'}</p>
                    <div className="product-detail-title-row">
                        <h1 className="product-detail-title">{product.name}</h1>
                        <WishlistButton product={product} />
                    </div>

                    {product.avgRating ? (
                        <div className="product-detail-rating">
                            <span className="product-detail-rating-badge">
                                {product.avgRating}
                                <FiStar size={12} />
                            </span>
                            <span className="product-detail-rating-count">
                                {product.reviewCount} review{product.reviewCount === 1 ? '' : 's'}
                            </span>
                        </div>
                    ) : null}

                    <div className="product-detail-pricing">
                        <span className="product-detail-price">
                            {formatCurrency(currentPrice, currency)}
                        </span>
                        {originalPrice > currentPrice ? (
                            <span className="product-detail-mrp">
                                {formatCurrency(originalPrice, currency)}
                            </span>
                        ) : null}
                    </div>

                    <div className="product-detail-meta">
                        <p><strong>Brand:</strong> {product.brand || '-'}</p>
                        <p><strong>SKU:</strong> {product.sku || '-'}</p>
                        <p>
                            <strong>Availability:</strong>{' '}
                            {isOutOfStock ? 'Out of stock' : `${product.stockQuantity} in stock`}
                        </p>
                    </div>

                    {product.description ? (
                        <div className="product-detail-description">
                            <h2>Description</h2>
                            <p>{product.description}</p>
                        </div>
                    ) : null}

                    <div className="product-detail-actions">
                        <InputField
                            name="quantity"
                            type="number"
                            label="Quantity"
                            value={quantity}
                            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                            className="product-detail-quantity"
                            inputProps={{ min: 1, max: product.stockQuantity || 1, step: 1 }}
                            disabled={isOutOfStock}
                        />
                        <Button type="button" onClick={handleAddToCart} disabled={isOutOfStock}>
                            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                        <Button type="button" variant="outline" onClick={handleBuyNow} disabled={isOutOfStock}>
                            Buy Now
                        </Button>
                        <Button type="button" variant="outline" component={Link} to="/cart">
                            Go to Cart
                        </Button>
                    </div>
                </section>
            </div>

            <section className="product-detail-reviews">
                <div className="product-detail-reviews-header">
                    <h2>Customer Reviews</h2>
                    <span>{reviews.length} approved review{reviews.length === 1 ? '' : 's'}</span>
                </div>

                {myReview ? (
                    <div className="product-detail-my-review">
                        <p className="product-detail-my-review-title">Your review</p>
                        <div className="product-detail-review-card">
                            <div className="product-detail-review-card-header">
                                <span className="product-detail-review-rating">
                                    {myReview.rating}
                                    <FiStar size={12} />
                                </span>
                                <span className="product-detail-review-status">{myReview.status}</span>
                            </div>
                            {myReview.title ? <h3>{myReview.title}</h3> : null}
                            <p>{myReview.comment}</p>
                        </div>
                    </div>
                ) : (
                    <form className="product-detail-review-form" onSubmit={handleSubmitReview}>
                        <h3>{isCustomer ? 'Write a review' : 'Login to write a review'}</h3>

                        <div className="product-detail-rating-input">
                            <span>Rating</span>
                            <div className="product-detail-rating-options">
                                {RATING_OPTIONS.map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        className={`product-detail-rating-option${Number(reviewForm.rating) === value ? ' active' : ''}`}
                                        onClick={() => {
                                            setReviewForm((prev) => ({ ...prev, rating: value }));
                                            setReviewErrors((prev) => ({ ...prev, rating: '' }));
                                        }}
                                        disabled={!isCustomer}
                                    >
                                        {value}
                                        <FiStar size={12} />
                                    </button>
                                ))}
                            </div>
                            {reviewErrors.rating ? (
                                <p className="product-detail-form-error">{reviewErrors.rating}</p>
                            ) : null}
                        </div>

                        <InputField
                            label="Title (optional)"
                            name="title"
                            value={reviewForm.title}
                            onChange={handleReviewChange}
                            disabled={!isCustomer}
                        />
                        <InputField
                            label="Comment"
                            name="comment"
                            value={reviewForm.comment}
                            onChange={handleReviewChange}
                            error={reviewErrors.comment}
                            multiline
                            rows={4}
                            disabled={!isCustomer}
                            required
                        />

                        {isCustomer ? (
                            <Button type="submit" loading={submittingReview}>
                                Submit Review
                            </Button>
                        ) : (
                            <Button type="button" component={Link} to="/login" state={{ from: `/products/${productId}` }}>
                                Login to Review
                            </Button>
                        )}
                    </form>
                )}

                {reviewsLoading ? (
                    <Loader center label="Loading reviews..." className="py-8" />
                ) : reviews.length > 0 ? (
                    <div className="product-detail-review-list">
                        {reviews.map((review) => (
                            <article key={review.id} className="product-detail-review-card">
                                <div className="product-detail-review-card-header">
                                    <div>
                                        <p className="product-detail-review-author">{review.customerName}</p>
                                        <p className="product-detail-review-date">{formatReviewDate(review.createdAt)}</p>
                                    </div>
                                    <span className="product-detail-review-rating">
                                        {review.rating}
                                        <FiStar size={12} />
                                    </span>
                                </div>
                                {review.title ? <h3>{review.title}</h3> : null}
                                <p>{review.comment}</p>
                            </article>
                        ))}
                    </div>
                ) : (
                    <p className="product-detail-no-reviews">No approved reviews yet. Be the first to review this product.</p>
                )}
            </section>

            {relatedProducts.length > 0 || relatedLoading ? (
                <section className="product-detail-related">
                    <div className="product-detail-reviews-header">
                        <h2>Related Products</h2>
                        <span>{relatedProducts.length} item{relatedProducts.length === 1 ? '' : 's'}</span>
                    </div>
                    {relatedLoading ? (
                        <Loader center label="Loading related products..." className="py-8" />
                    ) : (
                        <div className="product-detail-related-grid">
                            {relatedProducts.map((relatedProduct) => (
                                <ProductCard key={relatedProduct.id} product={relatedProduct} />
                            ))}
                        </div>
                    )}
                </section>
            ) : null}
        </div>
    );
};

export default ProductDetail;
