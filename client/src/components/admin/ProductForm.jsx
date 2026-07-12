import {
    Button,
    InputField,
    SelectField,
    ImageUpload,
} from '../ui';

const ProductForm = ({
    form,
    errors,
    categoryOptions,
    subcategoryOptions = [],
    onChange,
    onImageItemsChange,
    onSubmit,
    onCancel,
    saving = false,
    isEditing = false,
}) => (
    <form onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
            <InputField
                label="Product Name"
                name="name"
                value={form.name}
                onChange={onChange}
                error={errors.name}
                placeholder="e.g. iPhone 15"
                required
            />
            <SelectField
                label="Category"
                name="category"
                value={form.category}
                onChange={onChange}
                options={categoryOptions}
                error={errors.category}
                placeholder="Select a category"
                required
            />
            <SelectField
                label="Subcategory"
                name="subcategory"
                value={form.subcategory}
                onChange={onChange}
                options={subcategoryOptions}
                error={errors.subcategory}
                placeholder={form.category ? 'Select a subcategory' : 'Select category first'}
                disabled={!form.category || subcategoryOptions.length === 0}
                required={subcategoryOptions.length > 0}
            />
            <InputField
                label="Brand"
                name="brand"
                value={form.brand}
                onChange={onChange}
                error={errors.brand}
                placeholder="e.g. Apple"
            />
            <InputField
                label="SKU"
                name="sku"
                value={form.sku}
                onChange={onChange}
                error={errors.sku}
                placeholder="e.g. IP15-128-BLK"
                required
            />
            <InputField
                label="Price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={onChange}
                error={errors.price}
                placeholder="e.g. 69999"
                required
            />
            <InputField
                label="Sale Price"
                name="salePrice"
                type="number"
                min="0"
                step="0.01"
                value={form.salePrice}
                onChange={onChange}
                error={errors.salePrice}
                placeholder="Optional"
            />
            <InputField
                label="Stock Quantity"
                name="stockQuantity"
                type="number"
                min="0"
                step="1"
                value={form.stockQuantity}
                onChange={onChange}
                error={errors.stockQuantity}
                placeholder="e.g. 50"
                required
            />
        </div>

        <div className="mt-4">
            <ImageUpload
                label="Product Images"
                value={form.imageItems}
                onChange={onImageItemsChange}
                error={errors.imageItems}
                multiple
                maxFiles={5}
                disabled={saving}
            />
        </div>

        <div className="mt-4">
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
                Description
            </label>
            <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={onChange}
                rows={4}
                placeholder="Product description"
                className={`input-base ${errors.description ? 'input-error' : ''}`}
            />
            {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
        </div>

        <div className="mt-4 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={onChange}
                    className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                />
                Active product
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input
                    type="checkbox"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={onChange}
                    className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                />
                Featured product
            </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
            <Button type="submit" loading={saving}>
                {isEditing ? 'Update Product' : 'Add Product'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
                Cancel
            </Button>
        </div>
    </form>
);

export default ProductForm;
