import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    getUserById,
    updateUserStatus,
    updateUserVerification,
    updateUserRole,
} from '../../apis/user.api';
import {
    Button,
    Loader,
    SelectField,
    StatusBadge,
    showToastMessage,
    useConfirm,
    useToast,
} from '../../components/ui';
import { showApiError } from '../../components/ui/Toast/toastHelpers';
import formatStatusLabel from '../../utils/formatStatusLabel';

const formatDateTime = (value) => {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleString();
};

const DetailRow = ({ label, children }) => (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className="text-sm text-slate-800">{children}</div>
    </div>
);

const AdminUserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { confirm } = useConfirm();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionKey, setActionKey] = useState(null);

    const fetchUser = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getUserById(userId);
            setUser(data);
        } catch (err) {
            setUser(null);
            showApiError(toast, err, 'Failed to load user details');
        } finally {
            setLoading(false);
        }
    }, [toast, userId]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleToggleBlock = async () => {
        if (!user) {
            return;
        }

        const isBlocked = user.status === 'suspended' || !user.isActive;

        const confirmed = await confirm({
            title: isBlocked ? 'Unblock User' : 'Block User',
            message: isBlocked
                ? `Allow ${user.name} to sign in again?`
                : `Block ${user.name}? They will be logged out and unable to sign in.`,
            confirmText: isBlocked ? 'Unblock' : 'Block',
            cancelText: 'Cancel',
            variant: isBlocked ? 'primary' : 'danger',
        });

        if (!confirmed) {
            return;
        }

        setActionKey('status');

        try {
            const response = await updateUserStatus(user.id, !isBlocked);
            showToastMessage(toast, response.message, 'success');
            await fetchUser();
        } catch (err) {
            showApiError(toast, err, isBlocked ? 'Failed to unblock user' : 'Failed to block user');
        } finally {
            setActionKey(null);
        }
    };

    const handleRoleChange = async (event) => {
        if (!user) {
            return;
        }

        const nextRole = event.target.value;

        if (!nextRole || nextRole === user.role) {
            return;
        }

        const confirmed = await confirm({
            title: 'Change User Role',
            message: `Change ${user.name}'s role to ${formatStatusLabel(nextRole)}? They will be logged out from all sessions.`,
            confirmText: 'Update Role',
            cancelText: 'Cancel',
            variant: 'primary',
        });

        if (!confirmed) {
            return;
        }

        setActionKey('role');

        try {
            const response = await updateUserRole(user.id, nextRole);
            showToastMessage(toast, response.message, 'success');
            await fetchUser();
        } catch (err) {
            showApiError(toast, err, 'Failed to update user role');
        } finally {
            setActionKey(null);
        }
    };

    const handleToggleVerification = async (field) => {
        if (!user) {
            return;
        }

        const isVerified = field === 'emailVerified'
            ? user.isEmailVerified
            : user.isPhoneVerified;
        const label = field === 'emailVerified' ? 'email' : 'phone';

        const confirmed = await confirm({
            title: isVerified ? `Unverify ${label}` : `Verify ${label}`,
            message: isVerified
                ? `Mark ${user.name}'s ${label} as unverified?`
                : `Mark ${user.name}'s ${label} as verified?`,
            confirmText: isVerified ? 'Unverify' : 'Verify',
            cancelText: 'Cancel',
            variant: isVerified ? 'outline' : 'primary',
        });

        if (!confirmed) {
            return;
        }

        setActionKey(field);

        try {
            const response = await updateUserVerification(user.id, {
                [field === 'emailVerified' ? 'emailVerified' : 'phoneVerified']: !isVerified,
            });
            showToastMessage(toast, response.message, 'success');
            await fetchUser();
        } catch (err) {
            showApiError(
                toast,
                err,
                isVerified ? `Failed to unverify ${label}` : `Failed to verify ${label}`,
            );
        } finally {
            setActionKey(null);
        }
    };

    if (loading) {
        return (
            <div className="w-full py-16">
                <Loader center label="Loading user details..." />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="w-full">
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <h1 className="text-xl font-bold text-slate-800">User not found</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        This user does not exist or is no longer available.
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        className="mt-4"
                        onClick={() => navigate('/admin/users')}
                    >
                        Back to Users
                    </Button>
                </div>
            </div>
        );
    }

    const isBlocked = user.status === 'suspended' || !user.isActive;
    const isAdmin = user.role === 'admin';

    return (
        <div className="w-full">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <Link
                        to="/admin/users"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                        ← Back to Users
                    </Link>
                    <h1 className="mt-2 text-xl font-bold text-slate-800 sm:text-2xl">{user.name}</h1>
                    <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <StatusBadge label={user.role} variant={user.role} />
                    <StatusBadge label={user.status} variant={user.status} />
                    <StatusBadge
                        label={user.isLoggedIn ? 'Online' : 'Offline'}
                        variant={user.isLoggedIn ? 'online' : 'offline'}
                    />
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                    <h2 className="mb-4 text-lg font-semibold text-slate-800">User Details</h2>

                    {user.avatar ? (
                        <div className="mb-4">
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-20 w-20 rounded-full border border-slate-200 object-cover"
                            />
                        </div>
                    ) : null}

                    <DetailRow label="First Name">{user.firstName}</DetailRow>
                    <DetailRow label="Last Name">{user.lastName}</DetailRow>
                    <DetailRow label="Email">{user.email}</DetailRow>
                    <DetailRow label="Phone">{user.phone || '-'}</DetailRow>
                    <DetailRow label="Gender">
                        {user.gender ? formatStatusLabel(user.gender) : '-'}
                    </DetailRow>
                    <DetailRow label="Role">
                        <StatusBadge label={user.role} variant={user.role} />
                    </DetailRow>
                    <DetailRow label="Account Status">
                        <StatusBadge label={user.status} variant={user.status} />
                    </DetailRow>
                    <DetailRow label="Auth Provider">
                        {formatStatusLabel(user.authProvider)}
                    </DetailRow>
                    <DetailRow label="Email Verification">
                        <StatusBadge
                            label={user.isEmailVerified ? 'Verified' : 'Unverified'}
                            variant={user.isEmailVerified ? 'verified' : 'unverified'}
                        />
                    </DetailRow>
                    <DetailRow label="Phone Verification">
                        <StatusBadge
                            label={user.isPhoneVerified ? 'Verified' : 'Unverified'}
                            variant={user.isPhoneVerified ? 'verified' : 'unverified'}
                        />
                    </DetailRow>
                    <DetailRow label="Last Login">{formatDateTime(user.lastLoginAt)}</DetailRow>
                    <DetailRow label="Joined">{formatDateTime(user.createdAt)}</DetailRow>
                    <DetailRow label="Last Updated">{formatDateTime(user.updatedAt)}</DetailRow>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
                    <h2 className="mb-4 text-lg font-semibold text-slate-800">Actions</h2>
                    <p className="mb-4 text-sm text-slate-500">
                        Manage verification status and account access for this user.
                    </p>

                    <div className="flex flex-col gap-3">
                        {!isAdmin ? (
                            <SelectField
                                label="Role"
                                name="role"
                                value={user.role}
                                onChange={handleRoleChange}
                                options={[
                                    { value: 'customer', label: 'Customer' },
                                    { value: 'admin', label: 'Admin' },
                                ]}
                                disabled={actionKey === 'role'}
                            />
                        ) : (
                            <p className="text-xs text-slate-400">
                                Admin role cannot be changed from this screen.
                            </p>
                        )}

                        <Button
                            type="button"
                            variant={user.isEmailVerified ? 'outline' : 'primary'}
                            loading={actionKey === 'emailVerified'}
                            disabled={Boolean(actionKey && actionKey !== 'emailVerified')}
                            onClick={() => handleToggleVerification('emailVerified')}
                        >
                            {user.isEmailVerified ? 'Unverify Email' : 'Verify Email'}
                        </Button>

                        <Button
                            type="button"
                            variant={user.isPhoneVerified ? 'outline' : 'primary'}
                            loading={actionKey === 'phoneVerified'}
                            disabled={Boolean(actionKey && actionKey !== 'phoneVerified')}
                            onClick={() => handleToggleVerification('phoneVerified')}
                        >
                            {user.isPhoneVerified ? 'Unverify Phone' : 'Verify Phone'}
                        </Button>

                        <Button
                            type="button"
                            variant={isBlocked ? 'outline' : 'danger'}
                            loading={actionKey === 'status'}
                            disabled={isAdmin || Boolean(actionKey && actionKey !== 'status')}
                            onClick={handleToggleBlock}
                        >
                            {isBlocked ? 'Unblock User' : 'Block User'}
                        </Button>

                        {isAdmin ? (
                            <p className="text-xs text-slate-400">
                                Blocking is disabled for admin accounts.
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetail;
