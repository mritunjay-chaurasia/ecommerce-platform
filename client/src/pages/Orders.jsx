import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getMyOrders } from '../apis/store.api';
import { Loader, SelectField, StatusBadge, showToastMessage, useToast } from '../components/ui';
import { showApiError } from '../components/ui/Toast/toastHelpers';
import { useStoreSettings } from '../context/StoreSettingsProvider';
import formatCurrency from '../utils/formatCurrency';
import formatStatusLabel from '../utils/formatStatusLabel';
import './pages.css';
import { FILTER_ORDER_STATUS_OPTIONS } from '../constants/index';

const Orders = () => {
    const toast = useToast();
    const location = useLocation();
    const { settings } = useStoreSettings();
    const currency = settings?.currency || 'INR';
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredOrders = useMemo(() => {
        if (statusFilter === 'all') {
            return orders;
        }

        return orders.filter((order) => order.orderStatus === statusFilter);
    }, [orders, statusFilter]);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getMyOrders();
            setOrders(data);
        } catch (err) {
            setOrders([]);
            showApiError(toast, err, 'Failed to load your orders');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        if (location.state?.orderPlaced) {
            showToastMessage(
                toast,
                location.state.orderNumber
                    ? `Order ${location.state.orderNumber} placed successfully`
                    : 'Order placed successfully',
                'success',
            );
        }
    }, [location.state, toast]);

    return (
        <div className="store-page">
            <h1>My Orders</h1>
            <p className="store-page-muted">Track your recent purchases and delivery status.</p>

            {orders.length > 0 ? (
                <div className="store-orders-filter">
                    <SelectField
                        label="Filter by status"
                        name="statusFilter"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        options={FILTER_ORDER_STATUS_OPTIONS}
                        className="store-orders-filter-select"
                    />
                </div>
            ) : null}

            {loading ? (
                <Loader center label="Loading your orders..." className="py-10" />
            ) : orders.length === 0 ? (
                <>
                    <p className="store-page-muted mt-6">You have not placed any orders yet.</p>
                    <Link to="/" className="store-page-link">Continue Shopping</Link>
                </>
            ) : filteredOrders.length === 0 ? (
                <p className="store-page-muted mt-6">No orders match the selected status.</p>
            ) : (
                <div className="store-order-list">
                    {orders.map((order) => (
                        <div key={order.id} className="store-card">
                            <div className="store-order-header">
                                <div>
                                    <h2 className="store-card-title">{order.orderNumber}</h2>
                                    <p className="store-card-subtitle">
                                        Placed on {new Date(order.placedAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="store-order-badges">
                                    <StatusBadge label={formatStatusLabel(order.orderStatus)} variant={order.orderStatus} />
                                    <StatusBadge label={formatStatusLabel(order.paymentStatus)} variant={order.paymentStatus} />
                                </div>
                            </div>

                            <div className="store-card-stack store-card-stack--spaced">
                                {order.items.map((item, index) => (
                                    <div key={`${order.id}-${item.sku}-${index}`} className="store-card-row">
                                        <div>
                                            <p className="store-card-row-main">{item.productName}</p>
                                            <p className="store-card-row-meta">
                                                Qty: {item.quantity} | SKU: {item.sku || '-'}
                                            </p>
                                        </div>
                                        <p className="store-card-row-value">{formatCurrency(item.lineTotal, order.currency || currency)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="store-order-grid">
                                <p>Total items: {order.itemsCount}</p>
                                <p>Total amount: {formatCurrency(order.totalAmount, order.currency || currency)}</p>
                                <p>Payment method: {formatStatusLabel(order.paymentMethod)}</p>
                                <p>Tracking: {order.trackingNumber || 'Not assigned yet'}</p>
                            </div>

                            <div className="store-order-card-actions">
                                <Link to={`/orders/${order.id}`} className="store-page-link">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
