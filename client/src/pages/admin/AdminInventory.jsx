import { useCallback, useEffect, useMemo, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, Tooltip } from '@mui/material';
import { getCategories } from '../../apis/category.api';
import { getInventoryProducts, updateProductStock } from '../../apis/inventory.api';
import InventoryStockForm from '../../components/admin/InventoryStockForm';
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
import { showApiError } from '../../components/ui/Toast/toastHelpers';
import useDebounce from '../../utils/useDebounce';
import { applyPaginationResponse, buildTablePagination, DEFAULT_PAGINATION } from '../../utils/pagination';

const PAGE_SIZE = 10;

const INVENTORY_STATUS_OPTIONS = [
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
];

const emptyForm = {
    stockQuantity: '',
};

const formatInventoryStatusLabel = (value) => value
    ?.split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || '-';

const AdminInventory = () => {
    const toast = useToast();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [inventoryStatusFilter, setInventoryStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
    const [summary, setSummary] = useState({
        totalProducts: 0,
        inStockCount: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        lowStockThreshold: 5,
    });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const debouncedSearch = useDebounce(search, 400);
    const isSearchPending = search !== debouncedSearch;

    const categoryOptions = useMemo(() => categories.map((category) => ({
        value: category.id,
        label: category.name,
    })), [categories]);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getInventoryProducts({
                page,
                limit: PAGE_SIZE,
                search: debouncedSearch || undefined,
                category: categoryFilter || undefined,
                inventoryStatus: inventoryStatusFilter || undefined,
            });

            setProducts(response.data);
            applyPaginationResponse(response, setPagination, setPage);
            setSummary(response.summary);
        } catch (err) {
            setProducts([]);
            setPagination(DEFAULT_PAGINATION);
            setPage(DEFAULT_PAGINATION.page);
            showApiError(toast, err, 'Failed to load inventory');
        } finally {
            setLoading(false);
        }
    }, [categoryFilter, debouncedSearch, inventoryStatusFilter, page, toast]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await getCategories();
            setCategories(response.data);
        } catch (err) {
            showApiError(toast, err, 'Failed to load categories');
        }
    }, [toast]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        if (isSearchPending) {
            return;
        }

        fetchInventory();
    }, [fetchInventory, isSearchPending]);

    useEffect(() => {
        setPage(1);
    }, [search, categoryFilter, inventoryStatusFilter]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const resetModalState = () => {
        setSelectedProduct(null);
        setForm(emptyForm);
        setErrors({});
    };

    const handleOpenModal = (product) => {
        setSelectedProduct(product);
        setForm({
            stockQuantity: String(product.stockQuantity ?? 0),
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (saving) {
            return;
        }

        resetModalState();
        setIsModalOpen(false);
    };

    const validateForm = () => {
        const nextErrors = {};
        const stockQuantity = Number(form.stockQuantity);

        if (form.stockQuantity === '' || Number.isNaN(stockQuantity) || stockQuantity < 0 || !Number.isInteger(stockQuantity)) {
            nextErrors.stockQuantity = 'Stock quantity must be a whole number 0 or greater';
        }

        return nextErrors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedProduct) {
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
            await updateProductStock(selectedProduct.id, {
                stockQuantity: Number(form.stockQuantity),
            });
            showToastMessage(toast, 'Product stock updated successfully', 'success');
            setIsModalOpen(false);
            resetModalState();
            fetchInventory();
        } catch (err) {
            showApiError(toast, err, 'Failed to update stock');
        } finally {
            setSaving(false);
        }
    };

    const columns = useMemo(() => [
        { key: 'name', label: 'Product' },
        { key: 'sku', label: 'SKU' },
        {
            key: 'categoryName',
            label: 'Category',
            render: (row) => row.categoryName || '-',
        },
        {
            key: 'stockQuantity',
            label: 'Stock Qty',
            render: (row) => row.stockQuantity ?? 0,
        },
        {
            key: 'inventoryStatus',
            label: 'Inventory Status',
            render: (row) => (
                <StatusBadge
                    label={formatInventoryStatusLabel(row.inventoryStatus)}
                    variant={row.inventoryStatus}
                />
            ),
        },
        {
            key: 'isActive',
            label: 'Product Status',
            render: (row) => (
                <StatusBadge
                    label={row.isActive ? 'Active' : 'Inactive'}
                    variant={row.isActive ? 'active' : 'inactive'}
                />
            ),
        },
        {
            key: 'updatedAt',
            label: 'Updated',
            render: (row) => new Date(row.updatedAt).toLocaleDateString(),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <Tooltip title="Update stock">
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenModal(row)}
                        aria-label="Update stock"
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
    ], [handleOpenModal]);

    return (
        <div className="w-full">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Inventory Management</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Monitor stock levels, low-stock alerts, and out-of-stock products
                    </p>
                </div>
                <Button type="button" variant="outline" onClick={fetchInventory} className="w-full lg:w-auto">
                    Refresh Inventory
                </Button>
            </div>

            <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Total Products</p>
                    <p className="mt-2 text-2xl font-bold text-slate-800">{summary.totalProducts}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">In Stock</p>
                    <p className="mt-2 text-2xl font-bold text-slate-800">{summary.inStockCount}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Low Stock</p>
                    <p className="mt-2 text-2xl font-bold text-slate-800">{summary.lowStockCount}</p>
                    <p className="mt-1 text-xs text-slate-500">At or below {summary.lowStockThreshold} units</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">Out of Stock</p>
                    <p className="mt-2 text-2xl font-bold text-slate-800">{summary.outOfStockCount}</p>
                </div>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-3">
                <InputField
                    name="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search product, brand, or SKU..."
                    inputProps={{ maxLength: 120 }}
                />
                <SelectField
                    label="Category"
                    name="categoryFilter"
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    options={categoryOptions}
                    placeholder="All categories"
                />
                <SelectField
                    label="Inventory Status"
                    name="inventoryStatusFilter"
                    value={inventoryStatusFilter}
                    onChange={(event) => setInventoryStatusFilter(event.target.value)}
                    options={INVENTORY_STATUS_OPTIONS}
                    placeholder="All inventory statuses"
                />
            </div>

            <Table
                columns={columns}
                data={products}
                loading={loading}
                rowKey="id"
                emptyMessage="No inventory records found"
                pagination={buildTablePagination(pagination, setPage)}
            />

            <Modal
                open={isModalOpen}
                title={selectedProduct ? `Update Stock: ${selectedProduct.name}` : 'Update Stock'}
                description="Adjust product stock quantity to keep inventory accurate."
                onClose={handleCloseModal}
                disableClose={saving}
                size="md"
            >
                <InventoryStockForm
                    product={selectedProduct}
                    form={form}
                    errors={errors}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseModal}
                    saving={saving}
                />
            </Modal>
        </div>
    );
};

export default AdminInventory;
