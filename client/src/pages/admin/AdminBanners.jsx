import { useCallback, useEffect, useMemo, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, Tooltip } from '@mui/material';
import {
    createBanner,
    deleteBanner,
    getBanners,
    updateBanner,
} from '../../apis/banner.api';
import BannerForm from '../../components/admin/BannerForm';
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
import { validateBannerForm } from '../../utils/bannerValidation';
import {
    createExistingImageItem,
    resolveSingleImageItem,
    revokeImageItemPreview,
} from '../../utils/imageUploadHelpers';
import useDebounce from '../../utils/useDebounce';
import formatStatusLabel from '../../utils/formatStatusLabel';
import { BANNER_STATUS_FILTER_OPTIONS, PLACEMENT_OPTIONS, PAGE_SIZE } from '../../constants/index';
import { applyPaginationResponse, buildTablePagination, DEFAULT_PAGINATION } from '../../utils/pagination';


const emptyForm = {
    title: '',
    tag: '',
    subtitle: '',
    imageItem: null,
    buttonText: '',
    placement: 'hero',
    sortOrder: 0,
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

const AdminBanners = () => {
    const toast = useToast();
    const { confirm } = useConfirm();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [placementFilter, setPlacementFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const debouncedSearch = useDebounce(search, 400);
    const isSearchPending = search !== debouncedSearch;

    const fetchBanners = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getBanners({
                page,
                limit: PAGE_SIZE,
                search: debouncedSearch || undefined,
                status: statusFilter || undefined,
                placement: placementFilter || undefined,
            });

            setBanners(response.data);
            applyPaginationResponse(response, setPagination, setPage);
        } catch (err) {
            setBanners([]);
            setPagination(DEFAULT_PAGINATION);
            setPage(DEFAULT_PAGINATION.page);
            showApiError(toast, err, 'Failed to load banners');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, page, placementFilter, statusFilter, toast]);

    useEffect(() => {
        if (isSearchPending) {
            return;
        }

        fetchBanners();
    }, [fetchBanners, isSearchPending]);

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter, placementFilter]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleImageItemChange = (imageItem) => {
        setForm((prev) => ({ ...prev, imageItem }));
        setErrors((prev) => ({ ...prev, imageItem: '' }));
    };

    const resetForm = () => {
        revokeImageItemPreview(form.imageItem);
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

    const buildPayload = (imageUrl) => ({
        title: form.title.trim(),
        tag: form.tag.trim(),
        subtitle: form.subtitle.trim(),
        imageUrl,
        buttonText: form.buttonText.trim(),
        placement: form.placement,
        sortOrder: form.sortOrder === '' ? 0 : Number(form.sortOrder),
        startsAt: toIsoOrNull(form.startsAt),
        expiresAt: toIsoOrNull(form.expiresAt),
        isActive: form.isActive,
    });

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateBannerForm(form);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            showToastMessage(toast, Object.values(validationErrors).join(' • '), 'warning');
            return;
        }

        setSaving(true);
        try {
            const imageUrl = await resolveSingleImageItem(form.imageItem);
            const payload = buildPayload(imageUrl);

            if (editingId) {
                await updateBanner(editingId, payload);
                showToastMessage(toast, 'Banner updated successfully', 'success');
            } else {
                await createBanner(payload);
                showToastMessage(toast, 'Banner created successfully', 'success');
            }

            handleCloseModal();
            fetchBanners();
        } catch (err) {
            showApiError(toast, err, editingId ? 'Failed to update banner' : 'Failed to create banner');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = useCallback((banner) => {
        setEditingId(banner.id);
        setForm({
            title: banner.title || '',
            tag: banner.tag || '',
            subtitle: banner.subtitle || '',
            imageItem: banner.imageUrl ? createExistingImageItem(banner.imageUrl) : null,
            buttonText: banner.buttonText || '',
            placement: banner.placement || 'hero',
            sortOrder: banner.sortOrder ?? 0,
            startsAt: formatDateTimeInput(banner.startsAt),
            expiresAt: formatDateTimeInput(banner.expiresAt),
            isActive: banner.isActive ?? true,
        });
        setErrors({});
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback(async (banner) => {
        const confirmed = await confirm({
            title: 'Delete Banner',
            message: `Delete banner "${banner.title}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger',
        });

        if (!confirmed) {
            return;
        }

        try {
            await deleteBanner(banner.id);
            showToastMessage(toast, 'Banner deleted successfully', 'success');
            fetchBanners();
        } catch (err) {
            showApiError(toast, err, 'Failed to delete banner');
        }
    }, [confirm, fetchBanners, toast]);

    const columns = useMemo(() => [
        {
            key: 'title',
            label: 'Title',
            render: (row) => (
                <div>
                    <p className="font-medium text-slate-900">{row.title}</p>
                    {row.tag ? <p className="text-xs text-slate-500">{row.tag}</p> : null}
                </div>
            ),
        },
        {
            key: 'placement',
            label: 'Placement',
            render: (row) => formatStatusLabel(row.placement),
        },
        {
            key: 'sortOrder',
            label: 'Order',
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
                <div className="flex items-center gap-1">
                    <Tooltip title="Edit banner">
                        <IconButton size="small" onClick={() => handleEdit(row)} aria-label="Edit banner">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete banner">
                        <IconButton size="small" color="error" onClick={() => handleDelete(row)} aria-label="Delete banner">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            ),
        },
    ], [handleDelete, handleEdit]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Banners</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage homepage hero banners and promotional content.
                    </p>
                </div>
                <Button onClick={handleOpenCreateModal}>Add Banner</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <InputField
                    label="Search banners"
                    name="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by title, tag, or subtitle"
                    inputProps={{ maxLength: 120 }}
                />
                <SelectField
                    label="Status"
                    name="statusFilter"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    options={BANNER_STATUS_FILTER_OPTIONS}
                    placeholder="All statuses"
                />
                <SelectField
                    label="Placement"
                    name="placementFilter"
                    value={placementFilter}
                    onChange={(event) => setPlacementFilter(event.target.value)}
                    options={PLACEMENT_OPTIONS}
                    placeholder="All placements"
                />
            </div>

            <Table
                columns={columns}
                data={banners}
                loading={loading || isSearchPending}
                emptyMessage="No banners found"
                pagination={buildTablePagination(pagination, setPage)}
            />

            <Modal
                open={isModalOpen}
                onClose={handleCloseModal}
                title={editingId ? 'Edit Banner' : 'Add Banner'}
                maxWidth="md"
            >
                <BannerForm
                    form={form}
                    errors={errors}
                    placementOptions={PLACEMENT_OPTIONS}
                    onChange={handleChange}
                    onImageItemChange={handleImageItemChange}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseModal}
                    saving={saving}
                    isEditing={Boolean(editingId)}
                />
            </Modal>
        </div>
    );
};

export default AdminBanners;
