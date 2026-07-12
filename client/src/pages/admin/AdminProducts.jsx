import { useCallback, useEffect, useMemo, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, Tooltip } from '@mui/material';
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getExportProductsUrl,
} from '../../apis/product.api';
import { getCategories } from '../../apis/category.api';
import {
    Table,
    Button,
    InputField,
    Modal,
    StatusBadge,
    showToastMessage,
    useToast,
    useConfirm,
} from '../../components/ui';
import ProductForm from '../../components/admin/ProductForm';
import { showApiError } from '../../components/ui/Toast/toastHelpers';
import { useStoreSettings } from '../../context/StoreSettingsProvider';
import formatCurrency from '../../utils/formatCurrency';
import useDebounce from '../../utils/useDebounce';
import { PAGE_SIZE } from '../../constants/index';
import { applyPaginationResponse, buildTablePagination, DEFAULT_PAGINATION } from '../../utils/pagination';
import {
    createExistingImageItem,
    resolveImageItems,
    revokeImageItemsPreview,
} from '../../utils/imageUploadHelpers';

const emptyForm = {
    name: '',
    description: '',
    category: '',
    subcategory: '',
    brand: '',
    sku: '',
    price: '',
    salePrice: '',
    stockQuantity: '',
    imageItems: [],
    isActive: true,
    isFeatured: false,
};

const parseImageItems = (value) => (Array.isArray(value) ? value : []);

const AdminProducts = () => {
    const toast = useToast();
    const { confirm } = useConfirm();
    const { settings } = useStoreSettings();
    const currency = settings?.currency || 'INR';
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
    const debouncedSearch = useDebounce(search, 300);
    const isSearchPending = search !== debouncedSearch;
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    const categoryOptions = useMemo(() => categories.map((category) => ({
        value: category.id,
        label: category.name,
    })), [categories]);

    const subcategoryOptions = useMemo(() => {
        const selectedCategory = categories.find((category) => category.id === form.category);
        return (selectedCategory?.subcategories || []).map((subcategory) => ({
            value: subcategory.id,
            label: subcategory.name,
        }));
    }, [categories, form.category]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getProducts({
                page,
                limit: PAGE_SIZE,
                search: debouncedSearch.trim() || undefined,
            });
            setProducts(Array.isArray(response.data) ? response.data : []);
            applyPaginationResponse(response, setPagination, setPage);
        } catch {
            setProducts([]);
            setPagination(DEFAULT_PAGINATION);
            setPage(DEFAULT_PAGINATION.page);
            showToastMessage(toast, 'Failed to load products', 'error');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, page, toast]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await getCategories({
                includeSubcategories: true,
            });
            setCategories(Array.isArray(response.data) ? response.data : []);
        } catch {
            showToastMessage(toast, 'Failed to load categories', 'error');
        }
    }, [toast]);

    useEffect(() => {
        if (isSearchPending) {
            return;
        }

        fetchProducts();
    }, [fetchProducts, isSearchPending]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => {
            const nextValue = type === 'checkbox' ? checked : value;

            if (name === 'category') {
                return {
                    ...prev,
                    category: nextValue,
                    subcategory: '',
                };
            }

            return {
                ...prev,
                [name]: nextValue,
            };
        });
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleImageItemsChange = (imageItems) => {
        setForm((prev) => ({ ...prev, imageItems }));
        setErrors((prev) => ({ ...prev, imageItems: '' }));
    };

    const validateForm = () => {
        const validationErrors = {};
        const price = Number(form.price);
        const salePrice = form.salePrice === '' ? null : Number(form.salePrice);
        const stockQuantity = Number(form.stockQuantity);

        if (!form.name.trim()) {
            validationErrors.name = 'Product name is required';
        } else if (form.name.trim().length < 2) {
            validationErrors.name = 'Product name must be at least 2 characters';
        }

        if (!form.category) {
            validationErrors.category = 'Category is required';
        }

        if (subcategoryOptions.length > 0 && !form.subcategory) {
            validationErrors.subcategory = 'Subcategory is required';
        }

        if (!form.sku.trim()) {
            validationErrors.sku = 'SKU is required';
        }

        if (form.price === '' || Number.isNaN(price) || price < 0) {
            validationErrors.price = 'Price must be 0 or greater';
        }

        if (salePrice !== null && (Number.isNaN(salePrice) || salePrice < 0)) {
            validationErrors.salePrice = 'Sale price must be 0 or greater';
        } else if (salePrice !== null && !Number.isNaN(price) && salePrice > price) {
            validationErrors.salePrice = 'Sale price cannot be greater than price';
        }

        if (form.stockQuantity === '' || Number.isNaN(stockQuantity) || stockQuantity < 0 || !Number.isInteger(stockQuantity)) {
            validationErrors.stockQuantity = 'Stock quantity must be a whole number 0 or greater';
        }

        const imageItems = parseImageItems(form.imageItems);
        if (imageItems.length > 5) {
            validationErrors.imageItems = 'You can upload up to 5 product images';
        }

        if (form.description.length > 2000) {
            validationErrors.description = 'Description cannot exceed 2000 characters';
        }

        return validationErrors;
    };

    const resetForm = () => {
        revokeImageItemsPreview(form.imageItems);
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

    const buildPayload = (imageUrls) => ({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        subcategory: form.subcategory || null,
        brand: form.brand.trim(),
        sku: form.sku.trim(),
        price: Number(form.price),
        salePrice: form.salePrice === '' ? null : Number(form.salePrice),
        stockQuantity: Number(form.stockQuantity),
        imageUrls,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            showToastMessage(toast, Object.values(validationErrors).join(' • '), 'warning');
            return;
        }

        setSaving(true);

        try {
            const imageUrls = await resolveImageItems(form.imageItems);
            const payload = buildPayload(imageUrls);

            if (editingId) {
                await updateProduct(editingId, payload);
                showToastMessage(toast, 'Product updated successfully', 'success');
            } else {
                await createProduct(payload);
                showToastMessage(toast, 'Product created successfully', 'success');
            }

            resetForm();
            setIsModalOpen(false);
            fetchProducts();
        } catch (err) {
            showApiError(toast, err, editingId ? 'Failed to update product' : 'Failed to create product');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setForm({
            name: product.name,
            description: product.description || '',
            category: product.category || '',
            subcategory: product.subcategory || '',
            brand: product.brand || '',
            sku: product.sku || '',
            price: product.price ?? '',
            salePrice: product.salePrice ?? '',
            stockQuantity: product.stockQuantity ?? '',
            imageItems: (product.imageUrls || []).map(createExistingImageItem),
            isActive: product.isActive,
            isFeatured: product.isFeatured,
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleExportCsv = () => {
        window.open(getExportProductsUrl(), '_blank', 'noopener,noreferrer');
    };

    const handleDelete = async (product) => {
        const confirmed = await confirm({
            title: 'Delete Product',
            message: `Are you sure you want to delete "${product.name}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger',
        });

        if (!confirmed) return;

        try {
            await deleteProduct(product.id);
            showToastMessage(toast, 'Product deleted successfully', 'success');

            if (editingId === product.id) {
                resetForm();
            }

            fetchProducts();
        } catch (err) {
            showApiError(toast, err, 'Failed to delete product');
        }
    };

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'categoryName', label: 'Category', render: (row) => row.categoryName || '-' },
        {
            key: 'subcategoryName',
            label: 'Subcategory',
            render: (row) => row.subcategoryName || '-',
        },
        { key: 'sku', label: 'SKU' },
        {
            key: 'price',
            label: 'Price',
            render: (row) => formatCurrency(row.price, currency),
        },
        {
            key: 'salePrice',
            label: 'Sale Price',
            render: (row) => (row.salePrice !== null ? formatCurrency(row.salePrice, currency) : '-'),
        },
        { key: 'stockQuantity', label: 'Stock' },
        {
            key: 'isFeatured',
            label: 'Featured',
            render: (row) => (
                <StatusBadge
                    label={row.isFeatured ? 'Featured' : 'Standard'}
                    variant={row.isFeatured ? 'active' : 'inactive'}
                />
            ),
        },
        {
            key: 'isActive',
            label: 'Status',
            render: (row) => (
                <StatusBadge
                    label={row.isActive ? 'Active' : 'Inactive'}
                    variant={row.isActive ? 'active' : 'inactive'}
                />
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <Tooltip title="Edit product">
                        <IconButton
                            size="small"
                            color="primary"
                        onClick={() => handleEdit(row)}
                            aria-label="Edit product"
                            sx={{
                                border: 1,
                                borderColor: 'primary.main',
                                borderRadius: 2,
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete product">
                        <IconButton
                            size="small"
                            color="error"
                        onClick={() => handleDelete(row)}
                            aria-label="Delete product"
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
    ];

    return (
        <div className="w-full">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Manage Products</h1>
                    <p className="mt-1 text-sm text-slate-500">Add, update, or remove products from the catalog</p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Button type="button" variant="outline" onClick={handleExportCsv} className="w-full sm:w-auto">
                        Export CSV
                    </Button>
                    <Button type="button" onClick={handleOpenCreateModal} className="w-full sm:w-auto">
                        Add Product
                    </Button>
                </div>
            </div>

            <div className="admin-search mb-4">
                <InputField
                    label="Search products"
                    name="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name, brand, or SKU"
                />
            </div>

            <Table
                columns={columns}
                data={products}
                loading={loading || isSearchPending}
                rowKey="id"
                emptyMessage="No products found"
                pagination={buildTablePagination(pagination, setPage)}
            />
            <Modal
                open={isModalOpen}
                title={editingId ? 'Edit Product' : 'Add Product'}
                description="Fill in the product details for your catalog."
                onClose={handleCloseModal}
                disableClose={saving}
                size="lg"
            >
                <ProductForm
                    form={form}
                    errors={errors}
                    categoryOptions={categoryOptions}
                    subcategoryOptions={subcategoryOptions}
                    onChange={handleChange}
                    onImageItemsChange={handleImageItemsChange}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseModal}
                    saving={saving}
                    isEditing={Boolean(editingId)}
                />
            </Modal>
        </div>
    );
};

export default AdminProducts;
