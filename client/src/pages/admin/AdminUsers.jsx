import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getUsers,
    updateUserStatus,
    updateUserVerification,
    logout as logoutApi,
} from '../../apis/user.api';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import {
    InputField,
    Table,
    Button,
    StatusBadge,
    useToast,
    showToastMessage,
    useConfirm,
} from '../../components/ui';
import { showApiError } from '../../components/ui/Toast/toastHelpers';
import useDebounce from '../../utils/useDebounce';

const PAGE_SIZE = 10;

const AdminUsers = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const toast = useToast();
    const { confirm } = useConfirm();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionKey, setActionKey] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const debouncedSearch = useDebounce(search, 400);
    const isSearchPending = search !== debouncedSearch;

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getUsers({
                page,
                limit: PAGE_SIZE,
                search: debouncedSearch || undefined,
            });
            setUsers(response.data);
            setPagination(response.pagination);
        } catch {
            setUsers([]);
            showToastMessage(toast, 'Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, page, toast]);

    useEffect(() => {
        if (isSearchPending) {
            return;
        }

        fetchUsers();
    }, [fetchUsers, isSearchPending]);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const handleToggleBlock = useCallback(async (user) => {
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

        const nextActionKey = `${user.id}:status`;
        setActionKey(nextActionKey);

        try {
            const response = await updateUserStatus(user.id, !isBlocked);
            showToastMessage(toast, response.message, 'success');
            await fetchUsers();
        } catch (err) {
            showApiError(toast, err, isBlocked ? 'Failed to unblock user' : 'Failed to block user');
        } finally {
            setActionKey(null);
        }
    }, [confirm, fetchUsers, toast]);

    const handleToggleVerification = useCallback(async (user, field) => {
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

        const nextActionKey = `${user.id}:${field}`;
        setActionKey(nextActionKey);

        try {
            const response = await updateUserVerification(user.id, {
                [field === 'emailVerified' ? 'emailVerified' : 'phoneVerified']: !isVerified,
            });
            showToastMessage(toast, response.message, 'success');
            await fetchUsers();
        } catch (err) {
            showApiError(
                toast,
                err,
                isVerified ? `Failed to unverify ${label}` : `Failed to verify ${label}`,
            );
        } finally {
            setActionKey(null);
        }
    }, [confirm, fetchUsers, toast]);

    const handleLogout = async () => {
        const confirmed = await confirm({
            title: 'Logout',
            message: 'Are you sure you want to logout from admin panel?',
            confirmText: 'Logout',
            cancelText: 'Cancel',
            variant: 'danger',
        });

        if (confirmed) {
            try {
                await logoutApi();
            } catch {
                // Clear client state even if server logout fails
            }
            dispatch(logout());
            showToastMessage(toast, 'Logged out successfully', 'success');
            navigate('/login');
        }
    };

    const columns = useMemo(() => [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone', render: (row) => row.phone || '-' },
        {
            key: 'role',
            label: 'Role',
            render: (row) => <StatusBadge label={row.role} variant={row.role} />,
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge label={row.status} variant={row.status} />,
        },
        {
            key: 'isEmailVerified',
            label: 'Email',
            render: (row) => (
                <StatusBadge
                    label={row.isEmailVerified ? 'Verified' : 'Unverified'}
                    variant={row.isEmailVerified ? 'verified' : 'unverified'}
                />
            ),
        },
        {
            key: 'isPhoneVerified',
            label: 'Phone',
            render: (row) => (
                <StatusBadge
                    label={row.isPhoneVerified ? 'Verified' : 'Unverified'}
                    variant={row.isPhoneVerified ? 'verified' : 'unverified'}
                />
            ),
        },
        {
            key: 'isLoggedIn',
            label: 'Login',
            render: (row) => (
                <StatusBadge
                    label={row.isLoggedIn ? 'Online' : 'Offline'}
                    variant={row.isLoggedIn ? 'online' : 'offline'}
                />
            ),
        },
        {
            key: 'createdAt',
            label: 'Joined',
            render: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => {
                const isBlocked = row.status === 'suspended' || !row.isActive;

                return (
                    <div className="flex min-w-[180px] flex-col gap-2">
                        <Button
                            size="sm"
                            variant={row.isEmailVerified ? 'outline' : 'primary'}
                            loading={actionKey === `${row.id}:emailVerified`}
                            disabled={Boolean(actionKey && actionKey !== `${row.id}:emailVerified`)}
                            onClick={() => handleToggleVerification(row, 'emailVerified')}
                        >
                            {row.isEmailVerified ? 'Unverify Email' : 'Verify Email'}
                        </Button>
                        <Button
                            size="sm"
                            variant={row.isPhoneVerified ? 'outline' : 'primary'}
                            loading={actionKey === `${row.id}:phoneVerified`}
                            disabled={Boolean(actionKey && actionKey !== `${row.id}:phoneVerified`)}
                            onClick={() => handleToggleVerification(row, 'phoneVerified')}
                        >
                            {row.isPhoneVerified ? 'Unverify Phone' : 'Verify Phone'}
                        </Button>
                        <Button
                            size="sm"
                            variant={isBlocked ? 'outline' : 'danger'}
                            loading={actionKey === `${row.id}:status`}
                            disabled={row.role === 'admin' || Boolean(actionKey && actionKey !== `${row.id}:status`)}
                            onClick={() => handleToggleBlock(row)}
                        >
                            {isBlocked ? 'Unblock' : 'Block'}
                        </Button>
                        {row.role === 'admin' && (
                            <span className="text-xs text-slate-400">
                                Blocking is disabled for admin accounts.
                            </span>
                        )}
                    </div>
                );
            },
        },
    ], [actionKey, handleToggleBlock, handleToggleVerification]);

    return (
        <div className="w-full">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Manage Users</h1>
                    <p className="mt-1 text-sm text-slate-500">View, search, block, and verify registered users</p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                    <InputField
                        name="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, phone..."
                        className="!min-w-[240px] sm:!min-w-[280px]"
                    />
                    <Button variant="danger" onClick={handleLogout} className="w-full sm:w-auto">
                        Logout
                    </Button>
                </div>
            </div>

            <Table
                columns={columns}
                data={users}
                loading={loading}
                rowKey="id"
                emptyMessage="No users found"
                pagination={{
                    page,
                    totalPages: pagination.totalPages,
                    totalItems: pagination.total,
                    pageSize: PAGE_SIZE,
                    onPageChange: setPage,
                }}
            />
        </div>
    );
};

export default AdminUsers;
