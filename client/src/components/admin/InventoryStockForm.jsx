import { Button, InputField, StatusBadge } from '../ui';

const formatInventoryStatusLabel = (value) => value
    ?.split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || '-';

const InventoryStockForm = ({
    product,
    form,
    errors,
    onChange,
    onSubmit,
    onCancel,
    saving = false,
}) => (
    <form className="space-y-5" onSubmit={onSubmit}>
        <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Product</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{product?.name || '-'}</p>
            </div>
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">SKU</p>
                <p className="mt-1 text-sm text-slate-700">{product?.sku || '-'}</p>
            </div>
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</p>
                <p className="mt-1 text-sm text-slate-700">{product?.categoryName || '-'}</p>
            </div>
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Status</p>
                <div className="mt-1">
                    <StatusBadge
                        label={formatInventoryStatusLabel(product?.inventoryStatus)}
                        variant={product?.inventoryStatus}
                    />
                </div>
            </div>
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Stock</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{product?.stockQuantity ?? 0} unit(s)</p>
            </div>
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last Updated</p>
                <p className="mt-1 text-sm text-slate-700">
                    {product?.updatedAt ? new Date(product.updatedAt).toLocaleString() : '-'}
                </p>
            </div>
        </div>

        <InputField
            label="New Stock Quantity"
            name="stockQuantity"
            type="number"
            value={form.stockQuantity}
            onChange={onChange}
            error={errors.stockQuantity}
            placeholder="Enter updated stock quantity"
            required
            inputProps={{ min: 0, step: 1 }}
        />

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
                Cancel
            </Button>
            <Button type="submit" loading={saving}>
                Update Stock
            </Button>
        </div>
    </form>
);

export default InventoryStockForm;
