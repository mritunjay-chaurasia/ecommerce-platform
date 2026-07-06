import { Button, InputField, SelectField } from '../ui';

const CouponForm = ({
    form,
    errors,
    discountTypeOptions,
    onChange,
    onSubmit,
    onCancel,
    saving = false,
    isEditing = false,
}) => (
    <form onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
            <InputField
                label="Coupon Code"
                name="code"
                value={form.code}
                onChange={onChange}
                error={errors.code}
                placeholder="e.g. SAVE10"
                required
                inputProps={{ maxLength: 40 }}
            />
            <SelectField
                label="Discount Type"
                name="discountType"
                value={form.discountType}
                onChange={onChange}
                options={discountTypeOptions}
                error={errors.discountType}
                placeholder="Select discount type"
                required
            />
            <InputField
                label="Discount Value"
                name="discountValue"
                type="number"
                min="0"
                step="0.01"
                value={form.discountValue}
                onChange={onChange}
                error={errors.discountValue}
                placeholder={form.discountType === 'percentage' ? 'e.g. 10' : 'e.g. 500'}
                required
                inputProps={{ min: 0, step: '0.01' }}
            />
            <InputField
                label="Minimum Order Amount"
                name="minOrderAmount"
                type="number"
                min="0"
                step="0.01"
                value={form.minOrderAmount}
                onChange={onChange}
                error={errors.minOrderAmount}
                placeholder="e.g. 2000"
                inputProps={{ min: 0, step: '0.01' }}
            />
            <InputField
                label="Max Discount Amount"
                name="maxDiscountAmount"
                type="number"
                min="0"
                step="0.01"
                value={form.maxDiscountAmount}
                onChange={onChange}
                error={errors.maxDiscountAmount}
                placeholder="Optional cap"
                inputProps={{ min: 0, step: '0.01' }}
            />
            <InputField
                label="Usage Limit"
                name="usageLimit"
                type="number"
                min="1"
                step="1"
                value={form.usageLimit}
                onChange={onChange}
                error={errors.usageLimit}
                placeholder="Leave blank for unlimited"
                inputProps={{ min: 1, step: 1 }}
            />
            <InputField
                label="Start Date"
                name="startsAt"
                type="datetime-local"
                value={form.startsAt}
                onChange={onChange}
                error={errors.startsAt}
            />
            <InputField
                label="Expiry Date"
                name="expiresAt"
                type="datetime-local"
                value={form.expiresAt}
                onChange={onChange}
                error={errors.expiresAt}
            />
        </div>

        <div className="mt-4">
            <InputField
                label="Description"
                name="description"
                value={form.description}
                onChange={onChange}
                error={errors.description}
                placeholder="Optional coupon description"
                multiline
                rows={3}
                inputProps={{ maxLength: 300 }}
            />
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={onChange}
                className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
            />
            Active coupon
        </label>

        <div className="mt-6 flex flex-wrap gap-2">
            <Button type="submit" loading={saving}>
                {isEditing ? 'Update Coupon' : 'Add Coupon'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
                Cancel
            </Button>
        </div>
    </form>
);

export default CouponForm;
