import { useState } from 'react';
import { Link } from 'react-router-dom';
import { removeCartItem, updateCartItemQuantity } from '../apis/cart.api';
import {
    Button,
    InputField,
    showToastMessage,
    useToast,
} from '../components/ui';
import { showApiError } from '../components/ui/Toast/toastHelpers';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    removeFromCart,
    selectCartItems,
    selectCartSubtotal,
    setCartItems,
    updateCartQuantity,
} from '../store/slices/cartSlice';
import { selectIsAuthenticated, selectRole } from '../store/slices/authSlice';
import { useStoreSettings } from '../context/StoreSettingsProvider';
import { getImageUrl } from '../utils/imageUrl';
import formatCurrency from '../utils/formatCurrency';
import './pages.css';

const Cart = () => {
    const dispatch = useAppDispatch();
    const toast = useToast();
    const { settings } = useStoreSettings();
    const currency = settings?.currency || 'INR';
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const role = useAppSelector(selectRole);
    const isCustomer = isAuthenticated && role === 'customer';
    const cartItems = useAppSelector(selectCartItems);
    const cartSubtotal = useAppSelector(selectCartSubtotal);
    const [updatingProductId, setUpdatingProductId] = useState(null);

    const handleQuantityChange = async (productId, quantity) => {
        if (isCustomer) {
            setUpdatingProductId(productId);
            try {
                const items = await updateCartItemQuantity(productId, quantity);
                dispatch(setCartItems(items));
            } catch (err) {
                showApiError(toast, err, 'Failed to update cart');
            } finally {
                setUpdatingProductId(null);
            }
            return;
        }

        dispatch(updateCartQuantity({ productId, quantity }));
    };

    const handleRemoveItem = async (productId) => {
        if (isCustomer) {
            setUpdatingProductId(productId);
            try {
                const items = await removeCartItem(productId);
                dispatch(setCartItems(items));
                showToastMessage(toast, 'Item removed from cart', 'success');
            } catch (err) {
                showApiError(toast, err, 'Failed to remove item');
            } finally {
                setUpdatingProductId(null);
            }
            return;
        }

        dispatch(removeFromCart(productId));
    };

    if (cartItems.length === 0) {
        return (
            <div className="store-page">
                <h1>My Cart</h1>
                <p className="store-page-muted">Your cart is empty. Browse products and add items to get started.</p>
                <Link to="/" className="store-page-link">Continue Shopping</Link>
            </div>
        );
    }

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="store-page">
            <h1>My Cart</h1>
            <p className="store-page-muted">{cartCount} item(s) in your cart.</p>

            <div className="store-layout-grid">
                <div className="store-card">
                    <div className="store-card-stack">
                        {cartItems.map((item) => (
                            <div key={item.productId} className="store-cart-item">
                                <div className="store-cart-item-media">
                                    <img
                                        src={getImageUrl(item.imageUrl)}
                                        alt={item.name}
                                        className="store-cart-item-image"
                                    />
                                    <div>
                                        <h3 className="store-card-row-main">{item.name}</h3>
                                        <p className="store-card-row-meta">{item.categoryName || 'General'}</p>
                                        <p className="store-card-row-value">{formatCurrency(item.price, currency)}</p>
                                    </div>
                                </div>

                                <div className="store-cart-item-actions">
                                    <InputField
                                        name={`qty-${item.productId}`}
                                        type="number"
                                        value={item.quantity}
                                        onChange={(event) => handleQuantityChange(item.productId, Number(event.target.value))}
                                        className="!w-24"
                                        inputProps={{ min: 1, max: item.stockQuantity, step: 1 }}
                                        disabled={updatingProductId === item.productId}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleRemoveItem(item.productId)}
                                        loading={updatingProductId === item.productId}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="store-card">
                    <h2 className="store-card-title">Cart Summary</h2>
                    <div className="store-summary-list">
                        <div className="store-summary-row">
                            <span>Subtotal ({cartCount} items)</span>
                            <span>{formatCurrency(cartSubtotal, currency)}</span>
                        </div>
                        <p className="store-summary-note">
                            Shipping, tax, and discounts are calculated at checkout.
                        </p>
                    </div>

                    <div className="store-cart-actions">
                        <Button type="button" component={Link} to="/checkout">
                            Proceed to Checkout
                        </Button>
                        <Button type="button" variant="outline" component={Link} to="/">
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
