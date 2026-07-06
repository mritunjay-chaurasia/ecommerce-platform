import { useCallback, useEffect, useState } from 'react';
import { getStoreSettings, updateStoreSettings } from '../../apis/settings.api';
import StoreSettingsForm from '../../components/admin/StoreSettingsForm';
import { Loader, showToastMessage, useToast } from '../../components/ui';
import { showApiError } from '../../components/ui/Toast/toastHelpers';
import { useStoreSettings } from '../../context/StoreSettingsProvider';
import { validateStoreSettingsForm } from '../../utils/settingsValidation';

const emptyForm = {
    storeName: '',
    contactEmail: '',
    contactPhone: '',
    supportAddress: '',
    currency: 'INR',
    taxRate: '',
    freeShippingThreshold: '',
    standardShippingFee: '',
    returnPolicy: '',
};

const AdminSettings = () => {
    const toast = useToast();
    const { refreshSettings } = useStoreSettings();
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getStoreSettings();
            setForm({
                storeName: data.storeName || '',
                contactEmail: data.contactEmail || '',
                contactPhone: data.contactPhone || '',
                supportAddress: data.supportAddress || '',
                currency: data.currency || 'INR',
                taxRate: data.taxRate ?? '',
                freeShippingThreshold: data.freeShippingThreshold ?? '',
                standardShippingFee: data.standardShippingFee ?? '',
                returnPolicy: data.returnPolicy || '',
            });
        } catch (err) {
            showApiError(toast, err, 'Failed to load store settings');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateStoreSettingsForm(form);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            showToastMessage(toast, Object.values(validationErrors).join(' • '), 'warning');
            return;
        }

        setSaving(true);
        try {
            await updateStoreSettings({
                storeName: form.storeName.trim(),
                contactEmail: form.contactEmail.trim(),
                contactPhone: form.contactPhone.trim(),
                supportAddress: form.supportAddress.trim(),
                currency: form.currency,
                taxRate: Number(form.taxRate),
                freeShippingThreshold: Number(form.freeShippingThreshold),
                standardShippingFee: Number(form.standardShippingFee),
                returnPolicy: form.returnPolicy.trim(),
            });
            showToastMessage(toast, 'Store settings updated successfully', 'success');
            await Promise.all([fetchSettings(), refreshSettings()]);
        } catch (err) {
            showApiError(toast, err, 'Failed to update store settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Loader center label="Loading store settings..." className="py-16" />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Store Settings</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Manage store details, shipping charges, tax, and return policy.
                </p>
            </div>

            <StoreSettingsForm
                form={form}
                errors={errors}
                onChange={handleChange}
                onSubmit={handleSubmit}
                saving={saving}
            />
        </div>
    );
};

export default AdminSettings;
