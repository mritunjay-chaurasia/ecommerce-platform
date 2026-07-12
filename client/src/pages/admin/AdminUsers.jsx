import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { IconButton, Tooltip } from '@mui/material';
import {
    getUsers,
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
import useDebounce from '../../utils/useDebounce';
import { applyPaginationResponse, buildTablePagination, DEFAULT_PAGINATION } from '../../utils/pagination';

const PAGE_SIZE = 10;

const AdminUsers = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const toast = useToast();
    const { confirm } = useConfirm();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
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
            applyPaginationResponse(response, setPagination, setPage);
        } catch {
            setUsers([]);
            setPagination(DEFAULT_PAGINATION);
            setPage(DEFAULT_PAGINATION.page);
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

    const handleViewUser = useCallback((userId) => {
        navigate(`/admin/users/${userId}`);
    }, [navigate]);

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
            render: (row) => (
                <Tooltip title="View user details">
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewUser(row.id)}
                        aria-label="View user details"
                        sx={{
                            border: 1,
                            borderColor: 'primary.main',
                            borderRadius: 2,
                        }}
                    >
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            ),
        },
    ], [handleViewUser]);

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
                pagination={buildTablePagination(pagination, setPage)}
            />
        </div>
    );
};

export default AdminUsers;
