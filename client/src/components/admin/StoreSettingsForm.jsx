import { Button, InputField, SelectField } from '../ui';
import { CURRENCY_OPTIONS } from '../../constants/index';


const StoreSettingsForm = ({
    form,
    errors,
    onChange,
    onSubmit,
    saving = false,
}) => (
    <form onSubmit={onSubmit} className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Store Information</h2>
            <p className="mt-1 text-sm text-slate-500">Basic details shown across the storefront.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <InputField
                    label="Store Name"
                    name="storeName"
                    value={form.storeName}
                    onChange={onChange}
                    error={errors.storeName}
                    placeholder="e.g. ShopKart"
                    required
                    inputProps={{ maxLength: 80 }}
                />
                <SelectField
                    label="Currency"
                    name="currency"
                    value={form.currency}
                    onChange={onChange}
                    options={CURRENCY_OPTIONS}
                    error={errors.currency}
                    required
                />
                <InputField
                    label="Contact Email"
                    name="contactEmail"
                    type="email"
                    value={form.contactEmail}
                    onChange={onChange}
                    error={errors.contactEmail}
                    placeholder="support@shopkart.com"
                />
                <InputField
                    label="Contact Phone"
                    name="contactPhone"
                    value={form.contactPhone}
                    onChange={onChange}
                    error={errors.contactPhone}
                    placeholder="e.g. +91 9876543210"
                    inputProps={{ maxLength: 20 }}
                />
                <InputField
                    label="Support Address"
                    name="supportAddress"
                    value={form.supportAddress}
                    onChange={onChange}
                    error={errors.supportAddress}
                    placeholder="Business address for customer support"
                    className="md:col-span-2"
                    inputProps={{ maxLength: 300 }}
                />
            </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Shipping & Tax</h2>
            <p className="mt-1 text-sm text-slate-500">These values are used during checkout calculations.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
                <InputField
                    label="Free Shipping Threshold"
                    name="freeShippingThreshold"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.freeShippingThreshold}
                    onChange={onChange}
                    error={errors.freeShippingThreshold}
                    placeholder="e.g. 2000"
                    required
                    inputProps={{ min: 0, step: '0.01' }}
                />
                <InputField
                    label="Standard Shipping Fee"
                    name="standardShippingFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.standardShippingFee}
                    onChange={onChange}
                    error={errors.standardShippingFee}
                    placeholder="e.g. 99"
                    required
                    inputProps={{ min: 0, step: '0.01' }}
                />
                <InputField
                    label="Tax Rate (%)"
                    name="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.taxRate}
                    onChange={onChange}
                    error={errors.taxRate}
                    placeholder="e.g. 18"
                    required
                    inputProps={{ min: 0, max: 100, step: '0.01' }}
                />
            </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Return Policy</h2>
            <p className="mt-1 text-sm text-slate-500">Optional policy text for customers.</p>
            <div className="mt-4">
                <InputField
                    label="Return Policy"
                    name="returnPolicy"
                    value={form.returnPolicy}
                    onChange={onChange}
                    error={errors.returnPolicy}
                    placeholder="Describe your return and refund policy"
                    multiline
                    rows={5}
                    inputProps={{ maxLength: 2000 }}
                />
            </div>
        </section>

        <div className="flex justify-end">
            <Button type="submit" loading={saving}>
                Save Settings
            </Button>
        </div>
    </form>
);

export default StoreSettingsForm;
