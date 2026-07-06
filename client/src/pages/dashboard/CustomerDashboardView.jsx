import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../../apis/store.api';
import { PageLoader, StatusBadge } from '../../components/ui';
import { useStoreSettings } from '../../context/StoreSettingsProvider';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../store/slices/authSlice';
import { selectCartItemCount } from '../../store/slices/cartSlice';
import { selectWishlistCount } from '../../store/slices/wishlistSlice';
import iconMap from '../../config/iconMap';
import { CUSTOMER_DASHBOARD_LINKS } from '../../constants/index';
import formatCurrency from '../../utils/formatCurrency';
import formatStatusLabel from '../../utils/formatStatusLabel';
import '../pages.css';

const CustomerDashboardView = () => {
    const user = useAppSelector(selectUser);
    const cartCount = useAppSelector(selectCartItemCount);
    const wishlistCount = useAppSelector(selectWishlistCount);
    const { settings } = useStoreSettings();
    const currency = settings?.currency || 'INR';
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const displayName = user?.fullName || user?.firstName || 'there';

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getMyOrders();
            setOrders(data.slice(0, 3));
        } catch {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const stats = useMemo(() => [
        { label: 'Cart Items', value: cartCount },
        { label: 'Wishlist Items', value: wishlistCount },
        { label: 'Recent Orders', value: orders.length },
    ], [cartCount, orders.length, wishlistCount]);

    if (loading) {
        return <PageLoader label="Loading dashboard..." />;
    }

    return (
        <div className="store-page">
            <h1>My Dashboard</h1>
            <p className="store-page-muted">
                Welcome back, {displayName}. Continue shopping or manage your account.
            </p>

            <div className="store-dashboard-stats">
                {stats.map((stat) => (
                    <div key={stat.label} className="store-card store-dashboard-stat">
                        <p className="store-card-row-meta">{stat.label}</p>
                        <p className="store-dashboard-stat-value">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="store-dashboard-links">
                {CUSTOMER_DASHBOARD_LINKS.map(({ label, description, path, icon }) => {
                    const Icon = iconMap[icon];
                    return (
                    <Link key={path} to={path} className="store-card store-dashboard-link">
                        <span className="store-dashboard-link-icon">
                            {Icon ? <Icon size={20} /> : null}
                        </span>
                        <h2 className="store-card-row-main">{label}</h2>
                        <p className="store-card-row-meta">{description}</p>
                    </Link>
                    );
                })}
            </div>

            <div className="store-card store-dashboard-recent">
                <div className="store-dashboard-recent-header">
                    <h2 className="store-card-title">Recent Orders</h2>
                    <Link to="/orders" className="store-page-link">View all</Link>
                </div>

                {orders.length === 0 ? (
                    <p className="store-page-muted">You have not placed any orders yet.</p>
                ) : (
                    <div className="store-card-stack">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                to={`/orders/${order.id}`}
                                className="store-card-row store-dashboard-order-link"
                            >
                                <div>
                                    <p className="store-card-row-main">{order.orderNumber}</p>
                                    <p className="store-card-row-meta">
                                        {new Date(order.placedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="store-dashboard-order-meta">
                                    <StatusBadge
                                        label={formatStatusLabel(order.orderStatus)}
                                        variant={order.orderStatus}
                                    />
                                    <span className="store-card-row-value">
                                        {formatCurrency(order.totalAmount, order.currency || currency)}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <div className="store-card store-dashboard-cta">
                <h2 className="store-card-title">Start shopping</h2>
                <p className="store-panel-muted">
                    Browse products and add items to your cart from the home page.
                </p>
                <Link to="/" className="store-page-link store-dashboard-cta-link">
                    Go to store
                </Link>
            </div>
        </div>
    );
};

export default CustomerDashboardView;
