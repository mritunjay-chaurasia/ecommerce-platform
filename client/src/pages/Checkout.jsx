import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createAddress, getMyAddresses } from '../apis/address.api';
import { createOrder, getCheckoutSummary } from '../apis/store.api';
import {
    Button,
    InputField,
    Loader,
    SelectField,
    showToastMessage,
    useToast,
} from '../components/ui';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearCart, selectCartItems } from '../store/slices/cartSlice';
import { selectIsAuthenticated, selectRole, selectUser } from '../store/slices/authSlice';
import { showApiError } from '../components/ui/Toast/toastHelpers';
import { useStoreSettings } from '../context/StoreSettingsProvider';
import formatCurrency from '../utils/formatCurrency';
import { validatePhone } from '../utils/phoneValidation';
import { PAYMENT_METHOD_OPTIONS } from '../constants/index';
import './pages.css';

const mapCartItemsToPayload = (items) => items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
}));

const Checkout = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const toast = useToast();
    const { settings } = useStoreSettings();
    const currency = settings?.currency || 'INR';
    const user = useAppSelector(selectUser);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const role = useAppSelector(selectRole);
    const isCustomer = isAuthenticated && role === 'customer';
    const cartItems = useAppSelector(selectCartItems);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCouponCode, setAppliedCouponCode] = useState('');
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [summary, setSummary] = useState(null);
    const [errors, setErrors] = useState({});
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [saveAddressForLater, setSaveAddressForLater] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [checkoutForm, setCheckoutForm] = useState({
        email: '',
        fullName: '',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        paymentMethod: 'cod',
        notes: '',
    });

    useEffect(() => {
        if (!user) {
            return;
        }

        setCheckoutForm((prev) => ({
            ...prev,
            email: prev.email || user.email || '',
            fullName: prev.fullName || user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            phone: prev.phone || user.phone || '',
        }));
    }, [user]);

    const fetchSavedAddresses = useCallback(async () => {
        if (!isCustomer) {
            setSavedAddresses([]);
            return;
        }

        try {
            const data = await getMyAddresses();
            setSavedAddresses(data || []);

            const defaultAddress = data?.find((address) => address.isDefault) || data?.[0];

            if (defaultAddress && !selectedAddressId) {
                setSelectedAddressId(defaultAddress.id);
                setCheckoutForm((prev) => ({
                    ...prev,
                    fullName: defaultAddress.fullName,
                    phone: defaultAddress.phone,
                    line1: defaultAddress.line1,
                    line2: defaultAddress.line2 || '',
                    city: defaultAddress.city,
                    state: defaultAddress.state || '',
                    postalCode: defaultAddress.postalCode || '',
                    country: defaultAddress.country,
                }));
            }
        } catch {
            setSavedAddresses([]);
        }
    }, [isCustomer, selectedAddressId]);

    useEffect(() => {
        fetchSavedAddresses();
    }, [fetchSavedAddresses]);

    const addressOptions = useMemo(() => savedAddresses.map((address) => ({
        value: address.id,
        label: `${address.label || 'Address'}${address.isDefault ? ' (Default)' : ''} — ${address.city}`,
    })), [savedAddresses]);

    const handleAddressSelect = (event) => {
        const addressId = event.target.value;
        setSelectedAddressId(addressId);

        if (!addressId) {
            return;
        }

        const address = savedAddresses.find((entry) => entry.id === addressId);

        if (!address) {
            return;
        }

        setCheckoutForm((prev) => ({
            ...prev,
            fullName: address.fullName,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2 || '',
            city: address.city,
            state: address.state || '',
            postalCode: address.postalCode || '',
            country: address.country,
        }));
        setErrors({});
    };

    const refreshSummary = useCallback(async (nextCouponCode = appliedCouponCode) => {
        if (cartItems.length === 0) {
            setSummary(null);
            return;
        }

        setLoadingSummary(true);
        try {
            const data = await getCheckoutSummary({
                items: mapCartItemsToPayload(cartItems),
                couponCode: nextCouponCode || undefined,
            });
            setSummary(data);
        } catch (err) {
            setSummary(null);
            showApiError(toast, err, 'Failed to calculate order total');
        } finally {
            setLoadingSummary(false);
        }
    }, [appliedCouponCode, cartItems, toast]);

    useEffect(() => {
        refreshSummary();
    }, [refreshSummary]);

    const handleCheckoutChange = (event) => {
        const { name, value } = event.target;
        setCheckoutForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleApplyCoupon = async () => {
        const normalizedCode = couponCode.trim().toUpperCase();

        if (!normalizedCode) {
            showToastMessage(toast, 'Enter a coupon code first', 'warning');
            return;
        }

        setLoadingSummary(true);
        try {
            const data = await getCheckoutSummary({
                items: mapCartItemsToPayload(cartItems),
                couponCode: normalizedCode,
            });
            setAppliedCouponCode(normalizedCode);
            setSummary(data);
            showToastMessage(toast, 'Coupon applied successfully', 'success');
        } catch (err) {
            showApiError(toast, err, 'Failed to apply coupon');
        } finally {
            setLoadingSummary(false);
        }
    };

    const handleRemoveCoupon = async () => {
        setAppliedCouponCode('');
        setCouponCode('');
        await refreshSummary('');
    };

    const validateCheckout = () => {
        const nextErrors = {};

        if (!isCustomer) {
            if (!checkoutForm.email.trim()) {
                nextErrors.email = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutForm.email.trim())) {
                nextErrors.email = 'Please enter a valid email address';
            }
        }

        if (!checkoutForm.fullName.trim()) nextErrors.fullName = 'Full name is required';
        const phoneError = validatePhone(checkoutForm.phone);
        if (phoneError) nextErrors.phone = phoneError;
        if (!checkoutForm.line1.trim()) nextErrors.line1 = 'Address line 1 is required';
        if (!checkoutForm.city.trim()) nextErrors.city = 'City is required';
        if (!checkoutForm.country.trim()) nextErrors.country = 'Country is required';
        if (!checkoutForm.paymentMethod) nextErrors.paymentMethod = 'Payment method is required';
        if (checkoutForm.notes.trim().length > 1000) nextErrors.notes = 'Notes cannot exceed 1000 characters';

        return nextErrors;
    };

    const handlePlaceOrder = async () => {
        const validationErrors = validateCheckout();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            showToastMessage(toast, Object.values(validationErrors).join(' • '), 'warning');
            return;
        }

        setPlacingOrder(true);
        try {
            const shippingAddress = {
                fullName: checkoutForm.fullName.trim(),
                phone: checkoutForm.phone.trim(),
                line1: checkoutForm.line1.trim(),
                line2: checkoutForm.line2.trim(),
                city: checkoutForm.city.trim(),
                state: checkoutForm.state.trim(),
                postalCode: checkoutForm.postalCode.trim(),
                country: checkoutForm.country.trim(),
            };

            if (!isCustomer) {
                shippingAddress.email = checkoutForm.email.trim().toLowerCase();
            }

            const response = await createOrder({
                items: mapCartItemsToPayload(cartItems),
                couponCode: appliedCouponCode || undefined,
                shippingAddress,
                paymentMethod: checkoutForm.paymentMethod,
                notes: checkoutForm.notes.trim(),
            });

            if (saveAddressForLater && user) {
                try {
                    await createAddress({
                        label: 'Checkout',
                        fullName: checkoutForm.fullName.trim(),
                        phone: checkoutForm.phone.trim(),
                        line1: checkoutForm.line1.trim(),
                        line2: checkoutForm.line2.trim(),
                        city: checkoutForm.city.trim(),
                        state: checkoutForm.state.trim(),
                        postalCode: checkoutForm.postalCode.trim(),
                        country: checkoutForm.country.trim(),
                    });
                } catch {
                    // Order succeeded even if address save fails.
                }
            }

            dispatch(clearCart());
            setAppliedCouponCode('');
            setCouponCode('');
            setSummary(null);

            const orderNumber = response.data?.orderNumber;

            if (isCustomer) {
                showToastMessage(toast, 'Order placed successfully', 'success');
                navigate('/orders', {
                    state: {
                        orderPlaced: true,
                        orderNumber,
                    },
                });
                return;
            }

            setOrderSuccess({
                orderNumber: orderNumber || 'N/A',
            });
            showToastMessage(
                toast,
                orderNumber ? `Order ${orderNumber} placed successfully` : 'Order placed successfully',
                'success',
            );
        } catch (err) {
            showApiError(toast, err, 'Failed to place order');
        } finally {
            setPlacingOrder(false);
        }
    };

    if (cartItems.length === 0 && !orderSuccess) {
        return (
            <div className="store-page">
                <h1>Checkout</h1>
                <p className="store-page-muted">Your cart is empty. Add items before checking out.</p>
                <Link to="/" className="store-page-link">Continue Shopping</Link>
            </div>
        );
    }

    if (orderSuccess) {
        return (
            <div className="store-page">
                <h1>Order Placed</h1>
                <div className="store-card">
                    <p className="store-page-muted">
                        Thank you for your order. Your order number is{' '}
                        <strong>{orderSuccess.orderNumber}</strong>.
                    </p>
                    <p className="store-page-muted">
                        A confirmation email will be sent to {checkoutForm.email || 'your email address'}.
                    </p>
                    <div className="store-cart-actions">
                        <Button type="button" component={Link} to="/">
                            Continue Shopping
                        </Button>
                        <Button type="button" variant="outline" component={Link} to="/login">
                            Sign in to track orders
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="store-page">
            <h1>Checkout</h1>
            <p className="store-page-muted">
                {isCustomer ? 'Review your details and place your order.' : 'Complete your order as a guest or sign in for saved addresses.'}
            </p>

            {!isCustomer ? (
                <div className="store-card store-checkout-login-banner">
                    <p className="store-page-muted">
                        Already have an account? Sign in to use saved addresses and track orders.
                    </p>
                    <Button type="button" component={Link} to="/login" state={{ from: '/checkout' }}>
                        Sign in
                    </Button>
                </div>
            ) : null}

            <div className="store-layout-grid">
                <div className="store-card-stack">
                    <div className="store-card">
                        <h2 className="store-card-title">Shipping Details</h2>
                        {savedAddresses.length > 0 ? (
                            <div className="store-checkout-address-picker">
                                <SelectField
                                    label="Saved Address"
                                    name="savedAddress"
                                    value={selectedAddressId}
                                    onChange={handleAddressSelect}
                                    options={[
                                        { value: '', label: 'Enter a new address' },
                                        ...addressOptions,
                                    ]}
                                />
                            </div>
                        ) : null}
                        <div className="store-form-grid">
                            {!isCustomer ? (
                                <InputField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={checkoutForm.email}
                                    onChange={handleCheckoutChange}
                                    error={errors.email}
                                    required
                                />
                            ) : null}
                            <InputField label="Full Name" name="fullName" value={checkoutForm.fullName} onChange={handleCheckoutChange} error={errors.fullName} required />
                            <InputField label="Phone" name="phone" value={checkoutForm.phone} onChange={handleCheckoutChange} error={errors.phone} required />
                            <InputField label="Address Line 1" name="line1" value={checkoutForm.line1} onChange={handleCheckoutChange} error={errors.line1} required />
                            <InputField label="Address Line 2" name="line2" value={checkoutForm.line2} onChange={handleCheckoutChange} error={errors.line2} />
                            <InputField label="City" name="city" value={checkoutForm.city} onChange={handleCheckoutChange} error={errors.city} required />
                            <InputField label="State" name="state" value={checkoutForm.state} onChange={handleCheckoutChange} error={errors.state} />
                            <InputField label="Postal Code" name="postalCode" value={checkoutForm.postalCode} onChange={handleCheckoutChange} error={errors.postalCode} />
                            <InputField label="Country" name="country" value={checkoutForm.country} onChange={handleCheckoutChange} error={errors.country} required />
                            <SelectField
                                label="Payment Method"
                                name="paymentMethod"
                                value={checkoutForm.paymentMethod}
                                onChange={handleCheckoutChange}
                                options={PAYMENT_METHOD_OPTIONS}
                                error={errors.paymentMethod}
                                required
                            />
                            <InputField
                                label="Notes"
                                name="notes"
                                value={checkoutForm.notes}
                                onChange={handleCheckoutChange}
                                error={errors.notes}
                                multiline
                                rows={3}
                            />
                            {user ? (
                                <label className="store-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={saveAddressForLater}
                                        onChange={(event) => setSaveAddressForLater(event.target.checked)}
                                    />
                                    Save this address for future orders
                                </label>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="store-card">
                    <h2 className="store-card-title">Order Summary</h2>

                    <div className="store-coupon-form">
                        <InputField
                            label="Coupon Code"
                            name="couponCode"
                            value={couponCode}
                            onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                            placeholder="Enter coupon code"
                            className="store-coupon-input"
                        />
                        <Button type="button" onClick={handleApplyCoupon} disabled={loadingSummary} className="self-start">
                            Apply
                        </Button>
                    </div>

                    {appliedCouponCode && (
                        <div className="store-coupon-applied">
                            <span>Applied coupon: {appliedCouponCode}</span>
                            <button type="button" onClick={handleRemoveCoupon} className="store-coupon-remove">
                                Remove
                            </button>
                        </div>
                    )}

                    {loadingSummary ? (
                        <Loader center label="Calculating total..." className="py-8" />
                    ) : summary ? (
                        <div className="store-summary-list">
                            <div className="store-summary-row">
                                <span>Subtotal</span>
                                <span>{formatCurrency(summary.subtotal, summary.currency || currency)}</span>
                            </div>
                            <div className="store-summary-row">
                                <span>Shipping</span>
                                <span>{summary.shippingFee === 0 ? 'Free' : formatCurrency(summary.shippingFee, summary.currency || currency)}</span>
                            </div>
                            <div className="store-summary-row">
                                <span>Tax</span>
                                <span>{formatCurrency(summary.taxAmount, summary.currency || currency)}</span>
                            </div>
                            <div className="store-summary-row store-summary-row--discount">
                                <span>Discount</span>
                                <span>-{formatCurrency(summary.discountAmount, summary.currency || currency)}</span>
                            </div>
                            <div className="store-summary-total">
                                <div className="store-summary-row">
                                    <span>Total</span>
                                    <span>{formatCurrency(summary.totalAmount, summary.currency || currency)}</span>
                                </div>
                            </div>
                            <p className="store-summary-note">
                                Free shipping on orders above {formatCurrency(summary.shippingRules?.freeShippingThreshold, summary.currency || currency)}.
                            </p>
                        </div>
                    ) : (
                        <p className="store-summary-note">Unable to calculate summary right now.</p>
                    )}

                    <div className="store-cart-actions">
                        <Button type="button" onClick={handlePlaceOrder} loading={placingOrder} disabled={!summary || loadingSummary}>
                            Place Order
                        </Button>
                        <Button type="button" variant="outline" component={Link} to="/cart">
                            Back to Cart
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
