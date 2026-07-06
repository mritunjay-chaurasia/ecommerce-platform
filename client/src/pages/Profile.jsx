import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createAddress,
    deleteAddress,
    getMyAddresses,
    setDefaultAddress,
    updateAddress,
} from '../apis/address.api';
import { changePassword, getProfile, logout, updateProfile } from '../apis/user.api';
import {
    Button,
    InputField,
    Loader,
    Modal,
    PasswordField,
    SelectField,
    StatusBadge,
    showToastMessage,
    useConfirm,
    useToast,
} from '../components/ui';
import { showApiError } from '../components/ui/Toast/toastHelpers';
import { useAppDispatch } from '../store/hooks';
import { clearAuth, setUser } from '../store/slices/authSlice';
import { validatePassword } from '../utils/passwordValidation';
import { validatePhone } from '../utils/phoneValidation';
import { GENDER_OPTIONS } from '../constants/index';
import './pages.css';

const emptyProfileForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
};

const emptyAddressForm = {
    label: 'Home',
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
};

const emptyPasswordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
};

const renderAddressLine = (address) => [
    address.fullName,
    address.phone,
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
].filter(Boolean).join(', ');

const Profile = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const toast = useToast();
    const { confirm } = useConfirm();

    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState(emptyProfileForm);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [addresses, setAddresses] = useState([]);
    const [addressesLoading, setAddressesLoading] = useState(false);
    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [addressForm, setAddressForm] = useState(emptyAddressForm);
    const [addressErrors, setAddressErrors] = useState({});
    const [savingAddress, setSavingAddress] = useState(false);

    const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
    const [passwordErrors, setPasswordErrors] = useState({});
    const [changingPassword, setChangingPassword] = useState(false);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getProfile();
            setProfile(data);
            setForm({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                phone: data.phone || '',
                gender: data.gender || '',
            });
        } catch (err) {
            showApiError(toast, err, 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const fetchAddresses = useCallback(async () => {
        setAddressesLoading(true);
        try {
            const data = await getMyAddresses();
            setAddresses(data || []);
        } catch (err) {
            setAddresses([]);
            showApiError(toast, err, 'Failed to load saved addresses');
        } finally {
            setAddressesLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchProfile();
        fetchAddresses();
    }, [fetchAddresses, fetchProfile]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const nextErrors = {};

        if (!form.firstName.trim()) nextErrors.firstName = 'First name is required';
        if (!form.lastName.trim()) nextErrors.lastName = 'Last name is required';
        const phoneError = validatePhone(form.phone);
        if (phoneError) nextErrors.phone = phoneError;
        if (!form.gender) nextErrors.gender = 'Gender is required';

        return nextErrors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            showToastMessage(toast, Object.values(validationErrors).join(' • '), 'warning');
            return;
        }

        setSaving(true);
        try {
            const response = await updateProfile({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                phone: form.phone.trim(),
                gender: form.gender,
            });

            dispatch(setUser(response.data));
            setProfile(response.data);
            showToastMessage(toast, response.message || 'Profile updated successfully', 'success');
        } catch (err) {
            showApiError(toast, err, 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const openAddressModal = (address = null) => {
        if (address) {
            setEditingAddressId(address.id);
            setAddressForm({
                label: address.label || 'Home',
                fullName: address.fullName || '',
                phone: address.phone || '',
                line1: address.line1 || '',
                line2: address.line2 || '',
                city: address.city || '',
                state: address.state || '',
                postalCode: address.postalCode || '',
                country: address.country || 'India',
                isDefault: Boolean(address.isDefault),
            });
        } else {
            setEditingAddressId(null);
            setAddressForm({
                ...emptyAddressForm,
                fullName: profile?.fullName || `${form.firstName} ${form.lastName}`.trim(),
                phone: form.phone || '',
            });
        }

        setAddressErrors({});
        setAddressModalOpen(true);
    };

    const closeAddressModal = () => {
        setAddressModalOpen(false);
        setEditingAddressId(null);
        setAddressForm(emptyAddressForm);
        setAddressErrors({});
    };

    const handleAddressChange = (event) => {
        const { name, value, type, checked } = event.target;
        setAddressForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setAddressErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateAddressForm = () => {
        const nextErrors = {};

        if (!addressForm.fullName.trim()) nextErrors.fullName = 'Full name is required';
        const phoneError = validatePhone(addressForm.phone);
        if (phoneError) nextErrors.phone = phoneError;
        if (!addressForm.line1.trim()) nextErrors.line1 = 'Address line 1 is required';
        if (!addressForm.city.trim()) nextErrors.city = 'City is required';
        if (!addressForm.country.trim()) nextErrors.country = 'Country is required';

        return nextErrors;
    };

    const handleSaveAddress = async (event) => {
        event.preventDefault();

        const validationErrors = validateAddressForm();
        setAddressErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        const payload = {
            label: addressForm.label.trim() || 'Home',
            fullName: addressForm.fullName.trim(),
            phone: addressForm.phone.trim(),
            line1: addressForm.line1.trim(),
            line2: addressForm.line2.trim(),
            city: addressForm.city.trim(),
            state: addressForm.state.trim(),
            postalCode: addressForm.postalCode.trim(),
            country: addressForm.country.trim(),
            isDefault: addressForm.isDefault,
        };

        setSavingAddress(true);
        try {
            if (editingAddressId) {
                await updateAddress(editingAddressId, payload);
                showToastMessage(toast, 'Address updated successfully', 'success');
            } else {
                await createAddress(payload);
                showToastMessage(toast, 'Address saved successfully', 'success');
            }

            closeAddressModal();
            fetchAddresses();
        } catch (err) {
            showApiError(toast, err, 'Failed to save address');
        } finally {
            setSavingAddress(false);
        }
    };

    const handleDeleteAddress = async (address) => {
        const confirmed = await confirm({
            title: 'Delete address?',
            message: `Remove ${address.label || 'this address'} from your address book?`,
            confirmText: 'Delete',
            variant: 'danger',
        });

        if (!confirmed) {
            return;
        }

        try {
            await deleteAddress(address.id);
            showToastMessage(toast, 'Address deleted successfully', 'success');
            fetchAddresses();
        } catch (err) {
            showApiError(toast, err, 'Failed to delete address');
        }
    };

    const handleSetDefaultAddress = async (addressId) => {
        try {
            await setDefaultAddress(addressId);
            showToastMessage(toast, 'Default address updated', 'success');
            fetchAddresses();
        } catch (err) {
            showApiError(toast, err, 'Failed to update default address');
        }
    };

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
        setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validatePasswordForm = () => {
        const nextErrors = {};

        if (!passwordForm.currentPassword) {
            nextErrors.currentPassword = 'Current password is required';
        }

        const newPasswordError = validatePassword(passwordForm.newPassword);
        if (newPasswordError) {
            nextErrors.newPassword = newPasswordError;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            nextErrors.confirmPassword = 'Passwords do not match';
        }

        return nextErrors;
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();

        const validationErrors = validatePasswordForm();
        setPasswordErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setChangingPassword(true);
        try {
            const response = await changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });

            setPasswordForm(emptyPasswordForm);
            showToastMessage(toast, response.message || 'Password changed successfully', 'success');

            try {
                await logout();
            } catch {
                // Session is already invalidated on the server.
            }

            dispatch(clearAuth());
            navigate('/login', { replace: true, state: { message: 'Please sign in with your new password' } });
        } catch (err) {
            showApiError(toast, err, 'Failed to change password');
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="store-page">
                <Loader center label="Loading profile..." className="py-16" />
            </div>
        );
    }

    const canChangePassword = profile?.authProvider === 'local';

    return (
        <div className="store-page">
            <h1>My Profile</h1>
            <p className="store-page-muted">Update your personal details, saved addresses, and account security.</p>

            <div className="store-profile-badges">
                <StatusBadge
                    label={profile?.isEmailVerified ? 'Email verified' : 'Email not verified'}
                    variant={profile?.isEmailVerified ? 'verified' : 'unverified'}
                />
                <StatusBadge
                    label={profile?.isPhoneVerified ? 'Phone verified' : 'Phone not verified'}
                    variant={profile?.isPhoneVerified ? 'verified' : 'unverified'}
                />
            </div>

            <form className="store-profile-form store-card" onSubmit={handleSubmit}>
                <h2 className="store-card-title">Personal Details</h2>
                <div className="store-form-grid">
                    <InputField
                        label="First Name"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        error={errors.firstName}
                        required
                    />
                    <InputField
                        label="Last Name"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        error={errors.lastName}
                        required
                    />
                    <InputField
                        label="Email"
                        name="email"
                        value={form.email}
                        disabled
                    />
                    <InputField
                        label="Phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        error={errors.phone}
                        required
                    />
                    <SelectField
                        label="Gender"
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        options={GENDER_OPTIONS}
                        error={errors.gender}
                        required
                    />
                </div>

                <div className="store-profile-actions">
                    <Button type="submit" loading={saving}>
                        Save Changes
                    </Button>
                </div>
            </form>

            <section className="store-profile-section store-card">
                <div className="store-section-toolbar">
                    <div>
                        <h2 className="store-card-title">Saved Addresses</h2>
                        <p className="store-page-muted">Use saved addresses for faster checkout.</p>
                    </div>
                    <Button type="button" onClick={() => openAddressModal()}>
                        Add Address
                    </Button>
                </div>

                {addressesLoading ? (
                    <Loader center label="Loading addresses..." className="py-8" />
                ) : addresses.length === 0 ? (
                    <p className="store-page-muted">No saved addresses yet.</p>
                ) : (
                    <div className="store-address-list">
                        {addresses.map((address) => (
                            <article key={address.id} className="store-address-card">
                                <div className="store-address-card-header">
                                    <div>
                                        <p className="store-card-row-main">{address.label || 'Address'}</p>
                                        {address.isDefault ? (
                                            <StatusBadge label="Default" variant="verified" />
                                        ) : null}
                                    </div>
                                    <p className="store-panel-muted">{renderAddressLine(address)}</p>
                                </div>
                                <div className="store-address-card-actions">
                                    {!address.isDefault ? (
                                        <Button type="button" variant="outline" onClick={() => handleSetDefaultAddress(address.id)}>
                                            Set Default
                                        </Button>
                                    ) : null}
                                    <Button type="button" variant="outline" onClick={() => openAddressModal(address)}>
                                        Edit
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => handleDeleteAddress(address)}>
                                        Delete
                                    </Button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {canChangePassword ? (
                <form className="store-profile-section store-card" onSubmit={handleChangePassword}>
                    <h2 className="store-card-title">Change Password</h2>
                    <p className="store-page-muted">You will be signed out on all devices after changing your password.</p>
                    <div className="store-form-grid">
                        <PasswordField
                            label="Current Password"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            error={passwordErrors.currentPassword}
                            autoComplete="current-password"
                            required
                        />
                        <PasswordField
                            label="New Password"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            error={passwordErrors.newPassword}
                            autoComplete="new-password"
                            required
                        />
                        <PasswordField
                            label="Confirm New Password"
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            error={passwordErrors.confirmPassword}
                            autoComplete="new-password"
                            required
                        />
                    </div>
                    <div className="store-profile-actions">
                        <Button type="submit" loading={changingPassword}>
                            Update Password
                        </Button>
                    </div>
                </form>
            ) : (
                <section className="store-profile-section store-card">
                    <h2 className="store-card-title">Account Security</h2>
                    <p className="store-page-muted">
                        Password changes are managed through your Google account.
                    </p>
                </section>
            )}

            <Modal
                open={addressModalOpen}
                title={editingAddressId ? 'Edit Address' : 'Add Address'}
                onClose={closeAddressModal}
                disableClose={savingAddress}
                footer={(
                    <>
                        <Button type="button" variant="outline" onClick={closeAddressModal} disabled={savingAddress}>
                            Cancel
                        </Button>
                        <Button type="submit" form="address-form" loading={savingAddress}>
                            Save Address
                        </Button>
                    </>
                )}
            >
                <form id="address-form" className="store-form-grid" onSubmit={handleSaveAddress}>
                    <InputField
                        label="Label"
                        name="label"
                        value={addressForm.label}
                        onChange={handleAddressChange}
                        placeholder="Home, Office, etc."
                    />
                    <InputField
                        label="Full Name"
                        name="fullName"
                        value={addressForm.fullName}
                        onChange={handleAddressChange}
                        error={addressErrors.fullName}
                        required
                    />
                    <InputField
                        label="Phone"
                        name="phone"
                        value={addressForm.phone}
                        onChange={handleAddressChange}
                        error={addressErrors.phone}
                        required
                    />
                    <InputField
                        label="Address Line 1"
                        name="line1"
                        value={addressForm.line1}
                        onChange={handleAddressChange}
                        error={addressErrors.line1}
                        required
                    />
                    <InputField
                        label="Address Line 2"
                        name="line2"
                        value={addressForm.line2}
                        onChange={handleAddressChange}
                    />
                    <InputField
                        label="City"
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        error={addressErrors.city}
                        required
                    />
                    <InputField
                        label="State"
                        name="state"
                        value={addressForm.state}
                        onChange={handleAddressChange}
                    />
                    <InputField
                        label="Postal Code"
                        name="postalCode"
                        value={addressForm.postalCode}
                        onChange={handleAddressChange}
                    />
                    <InputField
                        label="Country"
                        name="country"
                        value={addressForm.country}
                        onChange={handleAddressChange}
                        error={addressErrors.country}
                        required
                    />
                    <label className="store-checkbox-label">
                        <input
                            type="checkbox"
                            name="isDefault"
                            checked={addressForm.isDefault}
                            onChange={handleAddressChange}
                        />
                        Set as default address
                    </label>
                </form>
            </Modal>
        </div>
    );
};

export default Profile;
