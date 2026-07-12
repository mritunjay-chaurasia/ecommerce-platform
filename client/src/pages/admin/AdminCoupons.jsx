import { useCallback, useEffect, useMemo, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, Tooltip } from '@mui/material';
import {
    createCoupon,
    deleteCoupon,
    getCoupons,
    updateCoupon,
} from '../../apis/coupon.api';
import CouponForm from '../../components/admin/CouponForm';
import {
    Button,
    InputField,
    Modal,
    SelectField,
    StatusBadge,
    Table,
    showToastMessage,
    useConfirm,
    useToast,
} from '../../components/ui';
import { showApiError } from '../../components/ui/Toast/toastHelpers';
import { useStoreSettings } from '../../context/StoreSettingsProvider';
import formatCurrency from '../../utils/formatCurrency';
import {
    normalizeCouponCode,
    validateCouponForm,
} from '../../utils/couponValidation';
import useDebounce from '../../utils/useDebounce';
import formatStatusLabel from '../../utils/formatStatusLabel';
import { PAGE_SIZE, DISCOUNT_TYPE_OPTIONS, STATUS_FILTER_OPTIONS } from '../../constants/index';
import { applyPaginationResponse, buildTablePagination, DEFAULT_PAGINATION } from '../../utils/pagination';

const emptyForm = {
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    startsAt: '',
    expiresAt: '',
    isActive: true,
};

const formatDateTimeInput = (value) => {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const toIsoOrNull = (value) => {
    if (!value) {
        return null;
    }

    return new Date(value).toISOString();
};

const AdminCoupons = () => {
    const toast = useToast();
    const { settings } = useStoreSettings();
    const currency = settings?.currency || 'INR';
    const { confirm } = useConfirm();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const debouncedSearch = useDebounce(search, 400);
    const isSearchPending = search !== debouncedSearch;

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getCoupons({
                page,
                limit: PAGE_SIZE,
                search: debouncedSearch || undefined,
                status: statusFilter || undefined,
            });

            setCoupons(response.data);
            applyPaginationResponse(response, setPagination, setPage);
        } catch (err) {
            setCoupons([]);
            setPagination(DEFAULT_PAGINATION);
            setPage(DEFAULT_PAGINATION.page);
            showApiError(toast, err, 'Failed to load coupons');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, page, statusFilter, toast]);

    useEffect(() => {
        if (isSearchPending) {
            return;
        }

        fetchCoupons();
    }, [fetchCoupons, isSearchPending]);

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        const nextValue = name === 'code' ? normalizeCouponCode(value) : value;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : nextValue,
        }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setErrors({});
    };

    const handleOpenCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (saving) {
            return;
        }

        resetForm();
        setIsModalOpen(false);
    };

    const buildPayload = () => ({
        code: normalizeCouponCode(form.code),
        description: form.description.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount === '' ? 0 : Number(form.minOrderAmount),
        maxDiscountAmount: form.maxDiscountAmount === '' ? null : Number(form.maxDiscountAmount),
        usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
        startsAt: toIsoOrNull(form.startsAt),
        expiresAt: toIsoOrNull(form.expiresAt),
        isActive: form.isActive,
    });

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateCouponForm(form);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            showToastMessage(toast, Object.values(validationErrors).join(' • '), 'warning');
            return;
        }

        setSaving(true);
        try {
            const payload = buildPayload();

            if (editingId) {
                await updateCoupon(editingId, payload);
                showToastMessage(toast, 'Coupon updated successfully', 'success');
            } else {
                await createCoupon(payload);
                showToastMessage(toast, 'Coupon created successfully', 'success');
            }

            resetForm();
            setIsModalOpen(false);
            fetchCoupons();
        } catch (err) {
            showApiError(toast, err, editingId ? 'Failed to update coupon' : 'Failed to create coupon');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = useCallback((coupon) => {
        setEditingId(coupon.id);
        setForm({
            code: coupon.code || '',
            description: coupon.description || '',
            discountType: coupon.discountType || 'percentage',
            discountValue: coupon.discountValue ?? '',
            minOrderAmount: coupon.minOrderAmount ?? '',
            maxDiscountAmount: coupon.maxDiscountAmount ?? '',
            usageLimit: coupon.usageLimit ?? '',
            startsAt: formatDateTimeInput(coupon.startsAt),
            expiresAt: formatDateTimeInput(coupon.expiresAt),
            isActive: coupon.isActive,
        });
        setErrors({});
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback(async (coupon) => {
        const confirmed = await confirm({
            title: 'Delete Coupon',
            message: `Are you sure you want to delete "${coupon.code}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger',
        });

        if (!confirmed) {
            return;
        }

        try {
            await deleteCoupon(coupon.id);
            showToastMessage(toast, 'Coupon deleted successfully', 'success');

            if (editingId === coupon.id) {
                resetForm();
            }

            fetchCoupons();
        } catch (err) {
            showApiError(toast, err, 'Failed to delete coupon');
        }
    }, [confirm, editingId, fetchCoupons, toast]);

    const columns = useMemo(() => [
        { key: 'code', label: 'Code' },
        {
            key: 'discountType',
            label: 'Discount',
            render: (row) => (
                row.discountType === 'percentage'
                    ? `${Number(row.discountValue).toFixed(2)}%`
                    : formatCurrency(row.discountValue, currency)
            ),
        },
        {
            key: 'minOrderAmount',
            label: 'Min Order',
            render: (row) => formatCurrency(row.minOrderAmount, currency),
        },
        {
            key: 'usage',
            label: 'Usage',
            render: (row) => (
                row.usageLimit !== null && row.usageLimit !== undefined
                    ? `${row.usedCount}/${row.usageLimit}`
                    : `${row.usedCount} / Unlimited`
            ),
        },
        {
            key: 'expiresAt',
            label: 'Expiry',
            render: (row) => (row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : '-'),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => (
                <StatusBadge
                    label={formatStatusLabel(row.status)}
                    variant={row.status}
                />
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <Tooltip title="Edit coupon">
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(row)}
                            aria-label="Edit coupon"
                            sx={{
                                border: 1,
                                borderColor: 'primary.main',
                                borderRadius: 2,
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete coupon">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(row)}
                            aria-label="Delete coupon"
                            sx={{
                                border: 1,
                                borderColor: 'error.main',
                                borderRadius: 2,
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            ),
        },
    ], [currency, handleDelete, handleEdit]);

    return (
        <div className="w-full">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Manage Coupons</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Create, schedule, and manage discount coupons for customer orders
                    </p>
                </div>
                <Button type="button" onClick={handleOpenCreateModal} className="w-full lg:w-auto">
                    Add Coupon
                </Button>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-3">
                <InputField
                    name="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search coupon code or description..."
                    inputProps={{ maxLength: 120 }}
                />
                <SelectField
                    label="Status"
                    name="statusFilter"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    options={STATUS_FILTER_OPTIONS}
                    placeholder="All statuses"
                />
                <Button type="button" variant="outline" onClick={fetchCoupons} className="h-[40px]">
                    Refresh
                </Button>
            </div>

            <Table
                columns={columns}
                data={coupons}
                loading={loading}
                rowKey="id"
                emptyMessage="No coupons found"
                pagination={buildTablePagination(pagination, setPage)}
            />

            <Modal
                open={isModalOpen}
                title={editingId ? 'Edit Coupon' : 'Add Coupon'}
                description="Configure the coupon rules for future checkout and promotions."
                onClose={handleCloseModal}
                disableClose={saving}
                size="lg"
            >
                <CouponForm
                    form={form}
                    errors={errors}
                    discountTypeOptions={DISCOUNT_TYPE_OPTIONS}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseModal}
                    saving={saving}
                    isEditing={Boolean(editingId)}
                />
            </Modal>
        </div>
    );
};

export default AdminCoupons;
