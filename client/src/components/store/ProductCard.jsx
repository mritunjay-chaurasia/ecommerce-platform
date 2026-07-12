import { Link } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import WishlistButton from './WishlistButton';
import { addToCart } from '../../store/slices/cartSlice';
import { useStoreSettings } from '../../context/StoreSettingsProvider';
import { useAppDispatch } from '../../store/hooks';
import { Button, showToastMessage, useToast } from '../ui';
import formatCurrency from '../../utils/formatCurrency';
import ProductImage from './ProductImage';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const dispatch = useAppDispatch();
    const toast = useToast();
    const { settings } = useStoreSettings();
    const currency = settings?.currency || 'INR';
    const currentPrice = product.currentPrice ?? product.price;
    const originalPrice = product.price ?? product.mrp ?? currentPrice;
    const discount = originalPrice > currentPrice
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        : 0;
    const isOutOfStock = (product.stockQuantity ?? 0) <= 0;

    const handleAddToCart = () => {
        if (isOutOfStock) {
            showToastMessage(toast, 'This product is currently out of stock', 'warning');
            return;
        }

        dispatch(addToCart(product));
        showToastMessage(toast, 'Added to cart', 'success');
    };

    return (
        <article className="product-card">
            <Link to={`/products/${product.id}`} className="product-card-link">
                <div className="product-card-image-wrap">
                    <WishlistButton product={product} />
                    <ProductImage
                        src={product.imageUrl || product.image}
                        alt={product.name || product.title}
                        className="product-card-image"
                    />
                    {discount > 0 && (
                        <span className="product-card-discount">{discount}% off</span>
                    )}
                </div>
                <div className="product-card-body">
                    <p className="product-card-category">{product.categoryName || '-'}</p>
                    <h3 className="product-card-title">{product.name || product.title}</h3>
                    {product.avgRating ? (
                        <div className="product-card-rating">
                            <span className="product-card-rating-badge">
                                {product.avgRating}
                                <FiStar size={10} />
                            </span>
                        {product.reviewCount ? (
                            <span className="product-card-rating-count">
                                ({product.reviewCount})
                            </span>
                        ) : null}
                        </div>
                    ) : null}
                    <div className="product-card-pricing">
                        <span className="product-card-price">{formatCurrency(currentPrice, currency)}</span>
                        {originalPrice > currentPrice && (
                            <span className="product-card-mrp">{formatCurrency(originalPrice, currency)}</span>
                        )}
                    </div>
                </div>
            </Link>
            <div className="product-card-actions">
                <Button type="button" fullWidth onClick={handleAddToCart} disabled={isOutOfStock}>
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </Button>
            </div>
        </article>
    );
};

export default ProductCard;
