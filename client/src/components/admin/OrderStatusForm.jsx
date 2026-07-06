import { Button, InputField, SelectField } from '../ui';
import { useStoreSettings } from '../../context/StoreSettingsProvider';
import formatCurrency from '../../utils/formatCurrency';

const renderAddress = (address) => {
    if (!address) {
        return '-';
    }

    return [
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.postalCode,
        address.country,
    ].filter(Boolean).join(', ');
};

const OrderStatusForm = ({
    order,
    form,
    errors,
    orderStatusOptions,
    paymentStatusOptions,
    onChange,
    onSubmit,
    onCancel,
    saving = false,
}) => {
    const { settings } = useStoreSettings();
    const currency = settings?.currency || 'INR';
    const customer = order?.customer || {};
    const items = order?.items || [];

    return (
        <form className="space-y-5" onSubmit={onSubmit}>
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{order?.orderNumber || '-'}</p>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Placed On</p>
                    <p className="mt-1 text-sm text-slate-700">
                        {order?.placedAt ? new Date(order.placedAt).toLocaleString() : '-'}
                    </p>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</p>
                    <p className="mt-1 text-sm text-slate-700">{customer.name || '-'}</p>
                    <p className="text-sm text-slate-500">{customer.email || '-'}</p>
                    <p className="text-sm text-slate-500">{customer.phone || '-'}</p>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Shipping Address</p>
                    <p className="mt-1 text-sm text-slate-700">{renderAddress(order?.shippingAddress)}</p>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Items</p>
                    <p className="mt-1 text-sm text-slate-700">{order?.itemsCount || 0} item(s)</p>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{formatCurrency(order?.totalAmount, order?.currency || currency)}</p>
                </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-800">Order Items</h3>
                <div className="mt-3 space-y-3">
                    {items.length === 0 ? (
                        <p className="text-sm text-slate-500">No items found for this order.</p>
                    ) : (
                        items.map((item, index) => (
                            <div
                                key={`${item.sku || item.productName}-${index}`}
                                className="flex flex-col gap-1 rounded-md border border-slate-100 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{item.productName}</p>
                                    <p className="text-xs text-slate-500">
                                        SKU: {item.sku || '-'} | Qty: {item.quantity}
                                    </p>
                                </div>
                                <p className="text-sm font-medium text-slate-700">{formatCurrency(item.lineTotal, order?.currency || currency)}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                    label="Order Status"
                    name="orderStatus"
                    value={form.orderStatus}
                    onChange={onChange}
                    options={orderStatusOptions}
                    error={errors.orderStatus}
                    required
                />
                <SelectField
                    label="Payment Status"
                    name="paymentStatus"
                    value={form.paymentStatus}
                    onChange={onChange}
                    options={paymentStatusOptions}
                    error={errors.paymentStatus}
                    required
                />
            </div>

            <InputField
                label="Tracking Number"
                name="trackingNumber"
                value={form.trackingNumber}
                onChange={onChange}
                error={errors.trackingNumber}
                placeholder="Add courier tracking number"
            />

            <InputField
                label="Notes"
                name="notes"
                value={form.notes}
                onChange={onChange}
                error={errors.notes}
                placeholder="Add internal order note"
                multiline
                rows={4}
            />

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
                    Cancel
                </Button>
                <Button type="submit" loading={saving}>
                    Save Changes
                </Button>
            </div>
        </form>
    );
};

export default OrderStatusForm;
