import { useCallback, useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton, Tooltip } from '@mui/material';
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../../apis/category.api';
import {
    InputField,
    Table,
    Button,
    StatusBadge,
    showToastMessage,
    useToast,
    useConfirm,
} from '../../components/ui';
import { showApiError } from '../../components/ui/Toast/toastHelpers';

const emptyForm = {
    name: '',
    description: '',
    isActive: true,
};

const AdminCategories = () => {
    const toast = useToast();
    const { confirm } = useConfirm();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getCategories();
            setCategories(data);
        } catch {
            showToastMessage(toast, 'Failed to load categories', 'error');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const validationErrors = {};

        if (!form.name.trim()) {
            validationErrors.name = 'Category name is required';
        } else if (form.name.trim().length < 2) {
            validationErrors.name = 'Category name must be at least 2 characters';
        }

        if (form.description.length > 300) {
            validationErrors.description = 'Description cannot exceed 300 characters';
        }

        return validationErrors;
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
        setErrors({});
    };

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
            fetchCategories();
        } catch (err) {
            showApiError(toast, err, editingId ? 'Failed to update category' : 'Failed to create category');
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
            }

            fetchCategories();
        } catch (err) {
            showApiError(toast, err, 'Failed to delete category');
        }
    };

    const columns = [
        { key: 'name', label: 'Name' },
        { key: 'slug', label: 'Slug' },
        {
            key: 'description',
            label: 'Description',
            render: (row) => row.description || '-',
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

    return (
        <div className="w-full">
            <div className="mb-5">
                <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Manage Categories</h1>
                <p className="mt-1 text-sm text-slate-500">Add, update, or remove product categories</p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="mb-6 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
            >
                <h2 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">
                    {editingId ? 'Edit Category' : 'Add Category'}
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
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

                <div className="mt-4 flex flex-wrap gap-2">
                    <Button type="submit" loading={saving}>
                        {editingId ? 'Update Category' : 'Add Category'}
                    </Button>
                    {editingId && (
                        <Button type="button" variant="outline" onClick={resetForm}>
                            Cancel
                        </Button>
                    )}
                </div>
            </form>

            <Table
                columns={columns}
                data={categories}
                loading={loading}
                rowKey="id"
                emptyMessage="No categories found"
            />
        </div>
    );
};

export default AdminCategories;
