import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { cancelMyOrder, getMyOrder, getOrderInvoiceUrl } from '../apis/store.api';
import { createReturnRequest, getMyReturnRequests } from '../apis/return.api';
import { Button, InputField, Loader, StatusBadge, showToastMessage, useConfirm, useToast } from '../components/ui';
import { showApiError } from '../components/ui/Toast/toastHelpers';
import { useStoreSettings } from '../context/StoreSettingsProvider';
import { useAppDispatch } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';
import formatCurrency from '../utils/formatCurrency';
import formatStatusLabel from '../utils/formatStatusLabel';
import { getImageUrl } from '../utils/imageUrl';
import { ORDER_STEPS, CANCELLABLE_STATUSES, RETURNABLE_STATUSES } from '../constants/index';
import './pages.css';

const renderAddress = (address) => {
    if (!address) {
        return '-';
    }

    return [
        address.fullName,
        address.phone,
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.postalCode,
        address.country,
    ].filter(Boolean).join(', ');
};

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const toast = useToast();
    const { confirm } = useConfirm();
    const { settings } = useStoreSettings();
    const currency = settings?.currency || 'INR';
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [returnReason, setReturnReason] = useState('');
    const [submittingReturn, setSubmittingReturn] = useState(false);
    const [returnRequest, setReturnRequest] = useState(null);

    const fetchOrder = useCallback(async () => {
        setLoading(true);
        try {
            const [data, returns] = await Promise.all([
                getMyOrder(orderId),
                getMyReturnRequests().catch(() => []),
            ]);
            setOrder(data);
            setReturnRequest(returns.find((entry) => entry.orderId === orderId) || null);
        } catch (err) {
            setOrder(null);
            showApiError(toast, err, 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    }, [orderId, toast]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const activeStepIndex = useMemo(() => {
        if (!order) {
            return -1;
        }

        if (order.orderStatus === 'cancelled' || order.orderStatus === 'returned') {
            return -1;
        }

        return ORDER_STEPS.findIndex((step) => step.key === order.orderStatus);
    }, [order]);

    const canCancel = order && CANCELLABLE_STATUSES.includes(order.orderStatus);
    const canRequestReturn = order
        && RETURNABLE_STATUSES.includes(order.orderStatus)
        && !returnRequest;
    const canBuyAgain = order?.items?.some((item) => item.productId);

    const handleRequestReturn = async () => {
        if (!returnReason.trim() || returnReason.trim().length < 10) {
            showToastMessage(toast, 'Please provide at least 10 characters for the return reason', 'warning');
            return;
        }

        setSubmittingReturn(true);
        try {
            const response = await createReturnRequest(orderId, { reason: returnReason.trim() });
            setReturnRequest(response.data);
            setReturnReason('');
            showToastMessage(toast, response.message || 'Return request submitted', 'success');
            fetchOrder();
        } catch (err) {
            showApiError(toast, err, 'Failed to submit return request');
        } finally {
            setSubmittingReturn(false);
        }
    };

    const handleOpenInvoice = () => {
        window.open(getOrderInvoiceUrl(orderId), '_blank', 'noopener,noreferrer');
    };

    const handleCancelOrder = async () => {
        const confirmed = await confirm({
            title: 'Cancel this order?',
            message: 'Stock will be restored and this order will be marked as cancelled.',
            confirmText: 'Cancel Order',
            variant: 'danger',
        });

        if (!confirmed) {
            return;
        }

        setCancelling(true);
        try {
            const response = await cancelMyOrder(orderId, {
                reason: cancelReason.trim() || undefined,
            });
            setOrder(response.data);
            setCancelReason('');
            showToastMessage(toast, response.message || 'Order cancelled successfully', 'success');
        } catch (err) {
            showApiError(toast, err, 'Failed to cancel order');
        } finally {
            setCancelling(false);
        }
    };

    const handleBuyAgain = () => {
        if (!order) {
            return;
        }

        let addedCount = 0;

        order.items.forEach((item) => {
            if (!item.productId) {
                return;
            }

            for (let index = 0; index < item.quantity; index += 1) {
                dispatch(addToCart({
                    id: item.productId,
                    name: item.productName,
                    imageUrl: item.imageUrl,
                    price: item.unitPrice,
                    currentPrice: item.unitPrice,
                    stockQuantity: item.quantity,
                }));
                addedCount += 1;
            }
        });

        if (addedCount === 0) {
            showToastMessage(toast, 'Unable to add items to cart', 'warning');
            return;
        }

        showToastMessage(toast, 'Items added to cart', 'success');
        navigate('/cart');
    };

    if (loading) {
        return (
            <div className="store-page">
                <Loader center label="Loading order details..." className="py-16" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="store-page">
                <div className="store-card store-order-empty">
                    <h1 className="store-card-title">Order not found</h1>
                    <p className="store-page-muted">This order is unavailable or you do not have access to it.</p>
                    <Button type="button" component={Link} to="/orders">
                        Back to Orders
                    </Button>
                </div>
            </div>
        );
    }

    const orderCurrency = order.currency || currency;

    return (
        <div className="store-page store-invoice-print">
            <div className="store-order-detail-header">
                <div>
                    <Link to="/orders" className="store-page-link">← Back to Orders</Link>
                    <h1>{order.orderNumber}</h1>
                    <p className="store-page-muted">
                        Placed on {new Date(order.placedAt).toLocaleString()}
                    </p>
                </div>
                <div className="store-order-badges">
                    <StatusBadge label={formatStatusLabel(order.orderStatus)} variant={order.orderStatus} />
                    <StatusBadge label={formatStatusLabel(order.paymentStatus)} variant={order.paymentStatus} />
                </div>
            </div>

            {order.orderStatus !== 'cancelled' && order.orderStatus !== 'returned' ? (
                <div className="store-card store-order-timeline">
                    <h2 className="store-card-title">Order Progress</h2>
                    <div className="store-order-steps">
                        {ORDER_STEPS.map((step, index) => (
                            <div
                                key={step.key}
                                className={`store-order-step${index <= activeStepIndex ? ' completed' : ''}${index === activeStepIndex ? ' active' : ''}`}
                            >
                                <span className="store-order-step-dot" />
                                <span className="store-order-step-label">{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            <div className="store-layout-grid">
                <div className="store-card-stack">
                    <div className="store-card">
                        <h2 className="store-card-title">Items</h2>
                        <div className="store-card-stack store-card-stack--spaced">
                            {order.items.map((item, index) => (
                                <div key={`${order.id}-${item.sku}-${index}`} className="store-order-item">
                                    <img
                                        src={getImageUrl(item.imageUrl)}
                                        alt={item.productName}
                                        className="store-cart-item-image"
                                    />
                                    <div className="store-order-item-info">
                                        <p className="store-card-row-main">{item.productName}</p>
                                        <p className="store-card-row-meta">
                                            Qty: {item.quantity} | SKU: {item.sku || '-'}
                                        </p>
                                        <p className="store-card-row-value">
                                            {formatCurrency(item.unitPrice, orderCurrency)} each
                                        </p>
                                    </div>
                                    <p className="store-card-row-value">
                                        {formatCurrency(item.lineTotal, orderCurrency)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="store-card">
                        <h2 className="store-card-title">Shipping Address</h2>
                        <p className="store-panel-muted">{renderAddress(order.shippingAddress)}</p>
                        {order.notes ? (
                            <>
                                <h3 className="store-order-subheading">Order Notes</h3>
                                <p className="store-panel-muted">{order.notes}</p>
                            </>
                        ) : null}
                    </div>

                    {canCancel ? (
                        <div className="store-card store-no-print">
                            <h2 className="store-card-title">Cancel Order</h2>
                            <p className="store-page-muted">You can cancel this order before it starts processing.</p>
                            <InputField
                                label="Reason (optional)"
                                name="cancelReason"
                                value={cancelReason}
                                onChange={(event) => setCancelReason(event.target.value)}
                                multiline
                                rows={2}
                            />
                            <div className="store-profile-actions">
                                <Button type="button" variant="outline" loading={cancelling} onClick={handleCancelOrder}>
                                    Cancel Order
                                </Button>
                            </div>
                        </div>
                    ) : null}

                    {canRequestReturn ? (
                        <div className="store-card store-no-print">
                            <h2 className="store-card-title">Request Return</h2>
                            <p className="store-page-muted">Tell us why you would like to return this order.</p>
                            <InputField
                                label="Return reason"
                                name="returnReason"
                                value={returnReason}
                                onChange={(event) => setReturnReason(event.target.value)}
                                multiline
                                rows={3}
                            />
                            <div className="store-profile-actions">
                                <Button type="button" loading={submittingReturn} onClick={handleRequestReturn}>
                                    Submit Return Request
                                </Button>
                            </div>
                        </div>
                    ) : null}

                    {returnRequest ? (
                        <div className="store-card">
                            <h2 className="store-card-title">Return Request</h2>
                            <p className="store-page-muted">Status: {formatStatusLabel(returnRequest.status)}</p>
                            <p className="store-panel-muted">{returnRequest.reason}</p>
                        </div>
                    ) : null}
                </div>

                <div className="store-card">
                    <h2 className="store-card-title">Payment Summary</h2>
                    <div className="store-summary-list">
                        <div className="store-summary-row">
                            <span>Subtotal</span>
                            <span>{formatCurrency(order.subtotal, orderCurrency)}</span>
                        </div>
                        <div className="store-summary-row">
                            <span>Shipping</span>
                            <span>
                                {order.shippingFee === 0
                                    ? 'Free'
                                    : formatCurrency(order.shippingFee, orderCurrency)}
                            </span>
                        </div>
                        <div className="store-summary-row">
                            <span>Tax</span>
                            <span>{formatCurrency(order.taxAmount, orderCurrency)}</span>
                        </div>
                        <div className="store-summary-row store-summary-row--discount">
                            <span>Discount</span>
                            <span>-{formatCurrency(order.discountAmount, orderCurrency)}</span>
                        </div>
                        <div className="store-summary-total">
                            <div className="store-summary-row">
                                <span>Total</span>
                                <span>{formatCurrency(order.totalAmount, orderCurrency)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="store-order-meta-list">
                        <p><strong>Payment method:</strong> {formatStatusLabel(order.paymentMethod)}</p>
                        <p><strong>Tracking:</strong> {order.trackingNumber || 'Not assigned yet'}</p>
                        <p><strong>Total items:</strong> {order.itemsCount}</p>
                    </div>

                    {canBuyAgain ? (
                        <div className="store-profile-actions store-no-print">
                            <Button type="button" onClick={handleBuyAgain}>
                                Buy Again
                            </Button>
                            <Button type="button" variant="outline" onClick={handleOpenInvoice}>
                                View Invoice
                            </Button>
                            <Button type="button" variant="outline" onClick={() => window.print()}>
                                Print
                            </Button>
                        </div>
                    ) : (
                        <div className="store-profile-actions store-no-print">
                            <Button type="button" variant="outline" onClick={handleOpenInvoice}>
                                View Invoice
                            </Button>
                            <Button type="button" variant="outline" onClick={() => window.print()}>
                                Print
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
