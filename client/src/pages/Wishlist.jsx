import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { removeWishlistProduct } from '../apis/wishlist.api';
import { Button, showToastMessage, useToast } from '../components/ui';
import { useStoreSettings } from '../context/StoreSettingsProvider';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';
import {
    selectWishlistItems,
    selectWishlistSynced,
    setWishlistItems,
} from '../store/slices/wishlistSlice';
import formatCurrency from '../utils/formatCurrency';
import { getImageUrl } from '../utils/imageUrl';
import './pages.css';

const Wishlist = () => {
    const dispatch = useAppDispatch();
    const toast = useToast();
    const { settings } = useStoreSettings();
    const currency = settings?.currency || 'INR';
    const items = useAppSelector(selectWishlistItems);
    const synced = useAppSelector(selectWishlistSynced);
    const [removingId, setRemovingId] = useState(null);

    const handleAddToCart = (item) => {
        if ((item.stockQuantity ?? 0) <= 0) {
            showToastMessage(toast, 'This product is currently out of stock', 'warning');
            return;
        }

        dispatch(addToCart({
            id: item.productId,
            name: item.name,
            categoryName: item.categoryName,
            imageUrl: item.imageUrl,
            price: item.originalPrice,
            currentPrice: item.price,
            stockQuantity: item.stockQuantity,
        }));
        showToastMessage(toast, 'Added to cart', 'success');
    };

    const handleRemove = async (productId) => {
        if (removingId) {
            return;
        }

        setRemovingId(productId);

        try {
            const response = await removeWishlistProduct(productId);
            dispatch(setWishlistItems(response.data));
            showToastMessage(toast, response.message, 'success');
        } catch (error) {
            const message = error.response?.data?.message || 'Could not remove item';
            showToastMessage(toast, message, 'error');
        } finally {
            setRemovingId(null);
        }
    };

    if (!synced) {
        return (
            <div className="store-page">
                <h1>My Wishlist</h1>
                <p className="store-page-muted">Loading your wishlist...</p>
            </div>
        );
    }

    return (
        <div className="store-page">
            <h1>My Wishlist</h1>
            <p className="store-page-muted">
                {items.length} saved item{items.length === 1 ? '' : 's'}
            </p>

            {items.length === 0 ? (
                <>
                    <p className="store-page-muted store-wishlist-empty">Your wishlist is empty.</p>
                    <Link to="/" className="store-page-link">Browse Products</Link>
                </>
            ) : (
                <div className="store-wishlist-list">
                    {items.map((item) => (
                        <article key={item.productId} className="store-card store-wishlist-item">
                            <Link to={`/products/${item.productId}`} className="store-wishlist-media">
                                <img
                                    src={getImageUrl(item.imageUrl)}
                                    alt={item.name}
                                    className="store-cart-item-image"
                                />
                                <div>
                                    <h2 className="store-card-row-main">{item.name}</h2>
                                    <p className="store-card-row-meta">{item.categoryName || 'General'}</p>
                                    <p className="store-card-row-value">{formatCurrency(item.price, currency)}</p>
                                </div>
                            </Link>

                            <div className="store-wishlist-actions">
                                <Button
                                    type="button"
                                    onClick={() => handleAddToCart(item)}
                                    disabled={(item.stockQuantity ?? 0) <= 0}
                                >
                                    <FiShoppingCart size={16} />
                                    Add to Cart
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleRemove(item.productId)}
                                    disabled={removingId === item.productId}
                                >
                                    <FiTrash2 size={16} />
                                    Remove
                                </Button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
