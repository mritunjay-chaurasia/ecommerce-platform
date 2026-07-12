import { useCallback, useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { IconButton, Tooltip } from '@mui/material';
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../../apis/category.api';
import {
    getSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
} from '../../apis/subcategory.api';
import {
    InputField,
    SelectField,
    Table,
    Button,
    Modal,
    StatusBadge,
    showToastMessage,
    useToast,
    useConfirm,
} from '../../components/ui';
import { showApiError, showFormValidationToast, mapFieldErrorsFromApi } from '../../components/ui/Toast/toastHelpers';
import useDebounce from '../../utils/useDebounce';
import { PAGE_SIZE } from '../../constants/index';
import { applyPaginationResponse, buildTablePagination, DEFAULT_PAGINATION } from '../../utils/pagination';

const emptyForm = {
    name: '',
    description: '',
    isActive: true,
};

const STATUS_FILTER_OPTIONS = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
];

const AdminCategories = () => {
    const toast = useToast();
    const { confirm } = useConfirm();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
    const [editingId, setEditingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [managingCategory, setManagingCategory] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);
    const [subcategoryModalOpen, setSubcategoryModalOpen] = useState(false);
    const [editingSubcategoryId, setEditingSubcategoryId] = useState(null);
    const [subcategoryForm, setSubcategoryForm] = useState(emptyForm);
    const [subcategoryErrors, setSubcategoryErrors] = useState({});
    const [savingSubcategory, setSavingSubcategory] = useState(false);
    const debouncedSearch = useDebounce(search, 400);
    const isSearchPending = search !== debouncedSearch;

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getCategories({
                page,
                limit: PAGE_SIZE,
                search: debouncedSearch || undefined,
                isActive: statusFilter === 'active'
                    ? true
                    : statusFilter === 'inactive'
                        ? false
                        : undefined,
            });
            setCategories(Array.isArray(response.data) ? response.data : []);
            applyPaginationResponse(response, setPagination, setPage);
        } catch {
            setCategories([]);
            setPagination(DEFAULT_PAGINATION);
            setPage(DEFAULT_PAGINATION.page);
            showToastMessage(toast, 'Failed to load categories', 'error');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, page, statusFilter, toast]);

    const fetchSubcategories = useCallback(async (categoryId) => {
        if (!categoryId) {
            setSubcategories([]);
            return;
        }

        setLoadingSubcategories(true);
        try {
            const response = await getSubcategories({ category: categoryId });
            setSubcategories(Array.isArray(response.data) ? response.data : []);
        } catch {
            setSubcategories([]);
            showToastMessage(toast, 'Failed to load subcategories', 'error');
        } finally {
            setLoadingSubcategories(false);
        }
    }, [toast]);

    useEffect(() => {
        if (isSearchPending) {
            return;
        }

        fetchCategories();
    }, [fetchCategories, isSearchPending]);

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSubcategoryChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSubcategoryForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setSubcategoryErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateCategoryForm = (values) => {
        const validationErrors = {};
        const name = values.name?.trim() || '';
        const description = values.description?.trim() || '';

        if (!name) {
            validationErrors.name = 'Category name is required';
        } else if (name.length < 2) {
            validationErrors.name = 'Category name must be at least 2 characters';
        } else if (name.length > 80) {
            validationErrors.name = 'Category name cannot exceed 80 characters';
        }

        if (description.length > 300) {
            validationErrors.description = 'Description cannot exceed 300 characters';
        }

        return validationErrors;
    };

    const validateSubcategoryForm = (values) => {
        const validationErrors = {};
        const name = values.name?.trim() || '';

        if (!name) {
            validationErrors.name = 'Subcategory name is required';
        } else if (name.length < 2) {
            validationErrors.name = 'Subcategory name must be at least 2 characters';
        } else if (name.length > 80) {
            validationErrors.name = 'Subcategory name cannot exceed 80 characters';
        }

        return validationErrors;
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setErrors({});
    };

    const resetSubcategoryForm = () => {
        setSubcategoryForm(emptyForm);
        setEditingSubcategoryId(null);
        setSubcategoryErrors({});
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateCategoryForm(form);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            showFormValidationToast(toast, validationErrors);
            return;
        }

        setSaving(true);

        try {
            const payload = {
                name: form.name.trim(),
                description: form.description.trim(),
                isActive: form.isActive,
            };

            if (editingId) {
                await updateCategory(editingId, payload);
                showToastMessage(toast, 'Category updated successfully', 'success');
            } else {
                await createCategory(payload);
                showToastMessage(toast, 'Category created successfully', 'success');
            }

            resetForm();
            setIsModalOpen(false);
            fetchCategories();
        } catch (err) {
            const fieldErrors = mapFieldErrorsFromApi(err);

            if (Object.keys(fieldErrors).length > 0) {
                setErrors(fieldErrors);
                showFormValidationToast(toast, fieldErrors);
            } else {
                showApiError(toast, err, editingId ? 'Failed to update category' : 'Failed to create category');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        setForm({
            name: category.name,
            description: category.description || '',
            isActive: category.isActive,
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleDelete = async (category) => {
        const confirmed = await confirm({
            title: 'Delete Category',
            message: `Are you sure you want to delete "${category.name}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger',
        });

        if (!confirmed) return;

        try {
            await deleteCategory(category.id);
            showToastMessage(toast, 'Category deleted successfully', 'success');

            if (editingId === category.id) {
                resetForm();
                setIsModalOpen(false);
            }

            fetchCategories();
        } catch (err) {
            showApiError(toast, err, 'Failed to delete category');
        }
    };

    const handleOpenSubcategories = (category) => {
        setManagingCategory(category);
        setSubcategoryModalOpen(true);
        resetSubcategoryForm();
        fetchSubcategories(category.id);
    };

    const handleCloseSubcategoryModal = () => {
        if (savingSubcategory) {
            return;
        }

        setSubcategoryModalOpen(false);
        setManagingCategory(null);
        setSubcategories([]);
        resetSubcategoryForm();
        fetchCategories();
    };

    const handleSubmitSubcategory = async (e) => {
        e.preventDefault();

        const validationErrors = validateSubcategoryForm(subcategoryForm);
        setSubcategoryErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            showFormValidationToast(toast, validationErrors);
            return;
        }

        setSavingSubcategory(true);

        try {
            const payload = {
                name: subcategoryForm.name.trim(),
                description: subcategoryForm.description.trim(),
                isActive: subcategoryForm.isActive,
                category: managingCategory.id,
            };

            if (editingSubcategoryId) {
                await updateSubcategory(editingSubcategoryId, {
                    name: payload.name,
                    description: payload.description,
                    isActive: payload.isActive,
                });
                showToastMessage(toast, 'Subcategory updated successfully', 'success');
            } else {
                await createSubcategory(payload);
                showToastMessage(toast, 'Subcategory created successfully', 'success');
            }

            resetSubcategoryForm();
            fetchSubcategories(managingCategory.id);
        } catch (err) {
            const fieldErrors = mapFieldErrorsFromApi(err);

            if (Object.keys(fieldErrors).length > 0) {
                setSubcategoryErrors(fieldErrors);
                showFormValidationToast(toast, fieldErrors);
            } else {
                showApiError(
                    toast,
                    err,
                    editingSubcategoryId ? 'Failed to update subcategory' : 'Failed to create subcategory',
                );
            }
        } finally {
            setSavingSubcategory(false);
        }
    };

    const handleEditSubcategory = (subcategory) => {
        setEditingSubcategoryId(subcategory.id);
        setSubcategoryForm({
            name: subcategory.name,
            description: subcategory.description || '',
            isActive: subcategory.isActive,
        });
        setSubcategoryErrors({});
    };

    const handleDeleteSubcategory = async (subcategory) => {
        const confirmed = await confirm({
            title: 'Delete Subcategory',
            message: `Are you sure you want to delete "${subcategory.name}"?`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            variant: 'danger',
        });

        if (!confirmed) return;

        try {
            await deleteSubcategory(subcategory.id);
            showToastMessage(toast, 'Subcategory deleted successfully', 'success');

            if (editingSubcategoryId === subcategory.id) {
                resetSubcategoryForm();
            }

            fetchSubcategories(managingCategory.id);
        } catch (err) {
            showApiError(toast, err, 'Failed to delete subcategory');
        }
    };

    const columns = [
        { key: 'name', label: 'Name', minWidth: 140 },
        {
            key: 'description',
            label: 'Description',
            className: 'data-table__cell--description',
            render: (row) => row.description || '-',
        },
        {
            key: 'subcategoryCount',
            label: 'Subcategories',
            width: 130,
            align: 'center',
            render: (row) => row.subcategoryCount ?? 0,
        },
        {
            key: 'isActive',
            label: 'Status',
            width: 120,
            align: 'center',
            className: 'data-table__cell--nowrap',
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
            width: 160,
            align: 'center',
            className: 'data-table__cell--nowrap',
            render: (row) => (
                <div className="flex gap-2">
                    <Tooltip title="Add / manage subcategories">
                        <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleOpenSubcategories(row)}
                            aria-label="Manage subcategories"
                            sx={{
                                border: 1,
                                borderColor: 'secondary.main',
                                borderRadius: 2,
                            }}
                        >
                            <ListAltIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit category">
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(row)}
                            aria-label="Edit category"
                            sx={{
                                border: 1,
                                borderColor: 'primary.main',
                                borderRadius: 2,
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete category">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(row)}
                            aria-label="Delete category"
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

    const subcategoryColumns = [
        { key: 'name', label: 'Subcategory Name', minWidth: 180 },
        {
            key: 'isActive',
            label: 'Status',
            width: 120,
            align: 'center',
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
            width: 120,
            align: 'center',
            render: (row) => (
                <div className="flex gap-2">
                    <Tooltip title="Edit subcategory">
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditSubcategory(row)}
                            aria-label="Edit subcategory"
                            sx={{ border: 1, borderColor: 'primary.main', borderRadius: 2 }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete subcategory">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteSubcategory(row)}
                            aria-label="Delete subcategory"
                            sx={{ border: 1, borderColor: 'error.main', borderRadius: 2 }}
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
                    <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Manage Categories</h1>
                </div>
                <Button type="button" onClick={handleOpenCreateModal} className="w-full sm:w-auto">
                    Add Category
                </Button>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-2">
                <InputField
                    label="Search categories"
                    name="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name, slug, or description"
                />
                <SelectField
                    label="Status"
                    name="statusFilter"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    options={STATUS_FILTER_OPTIONS}
                    placeholder="All statuses"
                />
            </div>

            <Table
                columns={columns}
                data={categories}
                loading={loading || isSearchPending}
                rowKey="id"
                emptyMessage="No categories found"
                pagination={buildTablePagination(pagination, setPage)}
            />

            <Modal
                open={isModalOpen}
                title={editingId ? 'Edit Category' : 'Add Category'}
                description="Enter the top-level category name and description."
                onClose={handleCloseModal}
                disableClose={saving}
                size="md"
            >
                <form onSubmit={handleSubmit} noValidate>
                    <div className="grid gap-4">
                        <InputField
                            label="Category Name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            error={errors.name}
                            placeholder="e.g. Electronics"
                            required
                        />
                        <InputField
                            label="Description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            error={errors.description}
                            placeholder="Optional description"
                            multiline
                            rows={3}
                        />
                    </div>

                    <label className="mt-4 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={form.isActive}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                        />
                        Active category
                    </label>

                    <div className="mt-6 flex flex-wrap gap-2">
                        <Button type="submit" loading={saving}>
                            {editingId ? 'Update Category' : 'Add Category'}
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCloseModal} disabled={saving}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                open={subcategoryModalOpen}
                title={managingCategory ? `Subcategories for ${managingCategory.name}` : 'Subcategories'}
                description={``}
                onClose={handleCloseSubcategoryModal}
                disableClose={savingSubcategory}
                size="md"
            >
                <form onSubmit={handleSubmitSubcategory} noValidate className="mb-5 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    <InputField
                        label="Subcategory Name"
                        name="name"
                        value={subcategoryForm.name}
                        onChange={handleSubcategoryChange}
                        error={subcategoryErrors.name}
                        placeholder="e.g. Laptops"
                        required
                    />

                    <label className="mt-4 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={subcategoryForm.isActive}
                            onChange={handleSubcategoryChange}
                            className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                        />
                        Active subcategory
                    </label>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Button type="submit" loading={savingSubcategory}>
                            {editingSubcategoryId ? 'Update' : 'Add'}
                        </Button>
                        {editingSubcategoryId ? (
                            <Button type="button" variant="outline" onClick={resetSubcategoryForm} disabled={savingSubcategory}>
                                Cancel
                            </Button>
                        ) : null}
                    </div>
                </form>

                <Table
                    columns={subcategoryColumns}
                    data={subcategories}
                    loading={loadingSubcategories}
                    rowKey="id"
                    emptyMessage="No subcategories found"
                    showSerialNumber
                />
            </Modal>
        </div>
    );
};

export default AdminCategories;
