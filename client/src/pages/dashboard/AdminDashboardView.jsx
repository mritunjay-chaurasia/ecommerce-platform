import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    FiAlertTriangle,
    FiCheckCircle,
    FiDollarSign,
    FiGrid,
    FiMessageSquare,
    FiPackage,
    FiShoppingCart,
    FiTrendingUp,
    FiUsers,
} from 'react-icons/fi';
import { getAdminDashboardStats } from '../../apis/dashboard.api';
import { useStoreSettings } from '../../context/StoreSettingsProvider';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../store/slices/authSlice';
import {
    Button,
    PageLoader,
    StatusBadge,
    Table,
    useToast,
} from '../../components/ui';
import { showApiError } from '../../components/ui/Toast/toastHelpers';
import formatCurrency from '../../utils/formatCurrency';
import formatStatusLabel from '../../utils/formatStatusLabel';

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value || 0));

const AdminDashboardView = () => {
    const toast = useToast();
    const user = useAppSelector(selectUser);
    const { settings } = useStoreSettings();
    const currency = settings?.currency || 'INR';
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAdminDashboardStats();
            setStats(response);
        } catch (err) {
            setStats(null);
            showApiError(toast, err, 'Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const displayName = user?.fullName || user?.firstName || 'Admin';
    const recentOrders = stats?.recentOrders || [];
    const salesTrend = stats?.salesTrend || [];
    const topProducts = stats?.topProducts || [];

    const statCards = useMemo(() => {
        const nextOverview = stats?.overview || {};
        const nextSales = stats?.sales || {};
        const lowStockThreshold = stats?.thresholds?.lowStock || 5;

        return [
            {
                label: 'Total Revenue',
                value: formatCurrency(nextSales.totalRevenue, currency),
                helper: `${formatNumber(nextSales.paidOrders)} paid orders`,
                icon: FiDollarSign,
                link: '/admin/orders',
                linkLabel: 'View orders',
            },
            {
                label: 'Monthly Revenue',
                value: formatCurrency(nextSales.monthlyRevenue, currency),
                helper: `${formatNumber(nextSales.monthlyOrders)} orders this month`,
                icon: FiTrendingUp,
                link: '/admin/orders',
                linkLabel: 'Track revenue',
            },
            {
                label: 'Orders',
                value: formatNumber(nextOverview.totalOrders),
                helper: `${formatNumber(nextOverview.pendingOrders)} pending / processing`,
                icon: FiShoppingCart,
                link: '/admin/orders',
                linkLabel: 'Manage orders',
            },
            {
                label: 'Products',
                value: formatNumber(nextOverview.totalProducts),
                helper: `${formatNumber(nextOverview.activeProducts)} active, ${formatNumber(nextOverview.featuredProducts)} featured`,
                icon: FiPackage,
                link: '/admin/products',
                linkLabel: 'Manage products',
            },
            {
                label: 'Customers',
                value: formatNumber(nextOverview.totalCustomers),
                helper: `${formatNumber(nextOverview.totalUsers)} total users`,
                icon: FiUsers,
                link: '/admin/users',
                linkLabel: 'Manage users',
            },
            {
                label: 'Low Stock',
                value: formatNumber(nextOverview.lowStockProducts),
                helper: `Stock at or below ${lowStockThreshold} units`,
                icon: FiAlertTriangle,
                link: '/admin/inventory',
                linkLabel: 'Review inventory',
            },
            {
                label: 'Categories',
                value: formatNumber(nextOverview.totalCategories),
                helper: 'Organize your catalog',
                icon: FiGrid,
                link: '/admin/categories',
                linkLabel: 'Manage categories',
            },
            {
                label: 'Pending Reviews',
                value: formatNumber(nextOverview.pendingReviews),
                helper: 'Customer reviews awaiting moderation',
                icon: FiMessageSquare,
                link: '/admin/reviews',
                linkLabel: 'Moderate reviews',
            },
            {
                label: 'Delivered Orders',
                value: formatNumber(nextOverview.deliveredOrders),
                helper: `${formatNumber(nextOverview.cancelledOrders)} cancelled`,
                icon: FiCheckCircle,
                link: '/admin/orders',
                linkLabel: 'Review fulfillment',
            },
        ];
    }, [stats, currency]);

    const recentOrderColumns = useMemo(() => ([
        { key: 'orderNumber', label: 'Order No.' },
        {
            key: 'customerName',
            label: 'Customer',
            render: (row) => (
                <div>
                    <p className="font-medium text-slate-800">{row.customerName || '-'}</p>
                    <p className="text-xs text-slate-500">{row.customerEmail || '-'}</p>
                </div>
            ),
        },
        {
            key: 'itemsCount',
            label: 'Items',
            render: (row) => formatNumber(row.itemsCount),
        },
        {
            key: 'totalAmount',
            label: 'Total',
            render: (row) => formatCurrency(row.totalAmount, currency),
        },
        {
            key: 'paymentStatus',
            label: 'Payment',
            render: (row) => (
                <StatusBadge
                    label={formatStatusLabel(row.paymentStatus)}
                    variant={row.paymentStatus}
                />
            ),
        },
        {
            key: 'orderStatus',
            label: 'Status',
            render: (row) => (
                <StatusBadge
                    label={formatStatusLabel(row.orderStatus)}
                    variant={row.orderStatus}
                />
            ),
        },
        {
            key: 'placedAt',
            label: 'Placed On',
            render: (row) => new Date(row.placedAt).toLocaleDateString(),
        },
    ]), [currency]);

    if (loading) {
        return <PageLoader label="" />;
    }

    return (
        <div className="w-full">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
                    Admin Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Welcome back, {displayName}. Here is an overview of your store.
                </p>
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
                <Button type="button" onClick={fetchStats} loading={loading}>
                    Refresh Dashboard
                </Button>
                <Button type="button" variant="outline" component={Link} to="/admin/orders">
                    View Orders
                </Button>
                <Button type="button" variant="outline" component={Link} to="/admin/products">
                    View Products
                </Button>
                <Button type="button" variant="outline" component={Link} to="/admin/inventory">
                    View Inventory
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map(({ label, icon: Icon, link, linkLabel, value, helper }) => (
                    <div
                        key={label}
                        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-500">{label}</span>
                            <span className="rounded-md bg-brand-light p-2 text-brand">
                                <Icon size={18} />
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{value}</p>
                        <p className="mt-1 text-sm text-slate-500">{helper}</p>
                        {link && (
                            <Link
                                to={link}
                                className="mt-3 inline-block text-sm font-medium text-brand hover:underline"
                            >
                                {linkLabel}
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-base font-semibold text-slate-800">Sales Trend (30 days)</h2>
                    <div className="mt-4 h-72">
                        {salesTrend.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(value, name) => [name === 'revenue' ? formatCurrency(value, currency) : value, name]} />
                                    <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
                                    <Line type="monotone" dataKey="orders" stroke="#16a34a" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="py-16 text-center text-sm text-slate-500">No sales data yet</p>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-base font-semibold text-slate-800">Top Products</h2>
                    <div className="mt-4 h-72">
                        {topProducts.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProducts}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="productName" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(value, name) => [name === 'revenue' ? formatCurrency(value, currency) : value, name]} />
                                    <Bar dataKey="quantitySold" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="py-16 text-center text-sm text-slate-500">No product sales yet</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-800">Recent Orders</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Latest customer orders and their current fulfillment state.
                        </p>
                    </div>
                    <Link to="/admin/orders" className="text-sm font-medium text-brand hover:underline">
                        View all
                    </Link>
                </div>

                <Table
                    columns={recentOrderColumns}
                    data={recentOrders}
                    rowKey="id"
                    emptyMessage="No orders available yet"
                    stickyHeader={false}
                />
            </div>

            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800">Quick actions</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                        to="/admin/orders"
                        className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
                    >
                        Manage orders
                    </Link>
                    <Link
                        to="/admin/products"
                        className="rounded-md border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light"
                    >
                        Manage products
                    </Link>
                    <Link
                        to="/admin/inventory"
                        className="rounded-md border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light"
                    >
                        Manage inventory
                    </Link>
                    <Link
                        to="/admin/users"
                        className="rounded-md border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light"
                    >
                        Manage users
                    </Link>
                    <Link
                        to="/admin/categories"
                        className="rounded-md border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light"
                    >
                        Manage categories
                    </Link>
                    <Link
                        to="/admin/reviews"
                        className="rounded-md border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light"
                    >
                        Moderate reviews
                    </Link>
                    <Link
                        to="/admin/settings"
                        className="rounded-md border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light"
                    >
                        Store settings
                    </Link>
                    <Link
                        to="/profile"
                        className="rounded-md border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-light"
                    >
                        My profile
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardView;
