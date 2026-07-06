import { useCallback, useEffect, useMemo, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, Tooltip } from '@mui/material';
import { getOrders, updateOrderStatus } from '../../apis/order.api';
import {
    Button,
    InputField,
    Modal,
    SelectField,
    StatusBadge,
    Table,
    showToastMessage,
    useToast,
} from '../../components/ui';
import OrderStatusForm from '../../components/admin/OrderStatusForm';
import { showApiError } from '../../components/ui/Toast/toastHelpers';
import { useStoreSettings } from '../../context/StoreSettingsProvider';
import formatCurrency from '../../utils/formatCurrency';
import useDebounce from '../../utils/useDebounce';
import {
    ORDER_STATUS_OPTIONS,
    PAYMENT_STATUS_OPTIONS,
    PAGE_SIZE,
} from '../../constants/index';

const emptyForm = {
    orderStatus: 'pending',
    paymentStatus: 'pending',
    trackingNumber: '',
    notes: '',
};

const AdminOrders = () => {
    const toast = useToast();
    const { settings } = useStoreSettings();
    const currency = settings?.currency || 'INR';
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [orderStatusFilter, setOrderStatusFilter] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const debouncedSearch = useDebounce(search, 400);
    const isSearchPending = search !== debouncedSearch;

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getOrders({
                page,
                limit: PAGE_SIZE,
                search: debouncedSearch || undefined,
                orderStatus: orderStatusFilter || undefined,
                paymentStatus: paymentStatusFilter || undefined,
            });

            setOrders(response.data);
            setPagination(response.pagination);
        } catch (err) {
            setOrders([]);
            showApiError(toast, err, 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, orderStatusFilter, page, paymentStatusFilter, toast]);

    useEffect(() => {
        if (isSearchPending) {
            return;
        }

        fetchOrders();
    }, [fetchOrders, isSearchPending]);

    useEffect(() => {
        setPage(1);
    }, [search, orderStatusFilter, paymentStatusFilter]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const resetModalState = () => {
        setSelectedOrder(null);
        setForm(emptyForm);
        setErrors({});
    };

    const handleCloseModal = () => {
        if (saving) {
            return;
        }

        resetModalState();
        setIsModalOpen(false);
    };

    const handleOpenModal = (order) => {
        setSelectedOrder(order);
        setForm({
            orderStatus: order.orderStatus || 'pending',
            paymentStatus: order.paymentStatus || 'pending',
            trackingNumber: order.trackingNumber || '',
            notes: order.notes || '',
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const validateForm = () => {
        const nextErrors = {};

        if (!form.orderStatus) {
            nextErrors.orderStatus = 'Order status is required';
        }

        if (!form.paymentStatus) {
            nextErrors.paymentStatus = 'Payment status is required';
        }

        if (form.trackingNumber.trim().length > 120) {
            nextErrors.trackingNumber = 'Tracking number cannot exceed 120 characters';
        }

        if (form.notes.trim().length > 1000) {
            nextErrors.notes = 'Notes cannot exceed 1000 characters';
        }

        return nextErrors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedOrder) {
            return;
        }

        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            showToastMessage(toast, Object.values(validationErrors).join(' • '), 'warning');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                orderStatus: form.orderStatus,
                paymentStatus: form.paymentStatus,
                trackingNumber: form.trackingNumber.trim(),
                notes: form.notes.trim(),
            };

            await updateOrderStatus(selectedOrder.id, payload);
            showToastMessage(toast, 'Order updated successfully', 'success');
            setIsModalOpen(false);
            resetModalState();
            fetchOrders();
        } catch (err) {
            showApiError(toast, err, 'Failed to update order');
        } finally {
            setSaving(false);
        }
    };

    const columns = useMemo(() => [
        {
            key: 'serialNumber',
            label: 'S.N.',
            render: (_, index) => (page - 1) * PAGE_SIZE + index + 1,
        },
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
            render: (row) => row.itemsCount || 0,
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
                    label={row.paymentStatus.replace(/_/g, ' ')}
                    variant={row.paymentStatus}
                />
            ),
        },
        {
            key: 'orderStatus',
            label: 'Order Status',
            render: (row) => (
                <StatusBadge
                    label={row.orderStatus}
                    variant={row.orderStatus}
                />
            ),
        },
        {
            key: 'placedAt',
            label: 'Placed On',
            render: (row) => new Date(row.placedAt).toLocaleDateString(),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <Tooltip title="Update order status">
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenModal(row)}
                        aria-label="Update order status"
                        sx={{
                            border: 1,
                            borderColor: 'primary.main',
                            borderRadius: 2,
                        }}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            ),
        },
    ], [currency, page]);

    return (
        <div className="w-full">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Manage Orders</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Search, filter, and update customer order fulfillment
                    </p>
                </div>

                <Button type="button" variant="outline" onClick={fetchOrders} className="w-full lg:w-auto">
                    Refresh
                </Button>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-3">
                <InputField
                    name="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search order no, customer, product, SKU..."
                />
                <SelectField
                    label="Order Status"
                    name="orderStatusFilter"
                    value={orderStatusFilter}
                    onChange={(event) => setOrderStatusFilter(event.target.value)}
                    options={ORDER_STATUS_OPTIONS}
                    placeholder="All order statuses"
                />
                <SelectField
                    label="Payment Status"
                    name="paymentStatusFilter"
                    value={paymentStatusFilter}
                    onChange={(event) => setPaymentStatusFilter(event.target.value)}
                    options={PAYMENT_STATUS_OPTIONS}
                    placeholder="All payment statuses"
                />
            </div>

            <Table
                columns={columns}
                data={orders}
                loading={loading}
                rowKey="id"
                emptyMessage="No orders found"
                pagination={{
                    page,
                    totalPages: pagination.totalPages,
                    totalItems: pagination.total,
                    pageSize: PAGE_SIZE,
                    onPageChange: setPage,
                }}
            />

            <Modal
                open={isModalOpen}
                title={selectedOrder ? `Update ${selectedOrder.orderNumber}` : 'Update Order'}
                description="Review the order summary and update its status."
                onClose={handleCloseModal}
                disableClose={saving}
                size="lg"
            >
                <OrderStatusForm
                    order={selectedOrder}
                    form={form}
                    errors={errors}
                    orderStatusOptions={ORDER_STATUS_OPTIONS}
                    paymentStatusOptions={PAYMENT_STATUS_OPTIONS}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseModal}
                    saving={saving}
                />
            </Modal>
        </div>
    );
};

export default AdminOrders;
