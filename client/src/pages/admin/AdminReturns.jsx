import { useCallback, useEffect, useMemo, useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import { IconButton, Tooltip } from '@mui/material';
import { getAdminReturnRequests, updateReturnRequestStatus } from '../../apis/return.api';
import {
    InputField,
    SelectField,
    StatusBadge,
    Table,
    showToastMessage,
    useToast,
} from '../../components/ui';
import { showApiError } from '../../components/ui/Toast/toastHelpers';
import useDebounce from '../../utils/useDebounce';
import formatStatusLabel from '../../utils/formatStatusLabel';
import { PAGE_SIZE } from '../../constants/index';
import { applyPaginationResponse, buildTablePagination, DEFAULT_PAGINATION } from '../../utils/pagination';

const STATUS_OPTIONS = [
    { value: '', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
];

const AdminReturns = () => {
    const toast = useToast();
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionKey, setActionKey] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
    const debouncedSearch = useDebounce(search, 400);
    const isSearchPending = search !== debouncedSearch;

    const fetchReturns = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAdminReturnRequests({
                page,
                limit: PAGE_SIZE,
                search: debouncedSearch || undefined,
                status: statusFilter || undefined,
            });
            setReturns(response.data);
            applyPaginationResponse(response, setPagination, setPage);
        } catch (err) {
            setReturns([]);
            setPagination(DEFAULT_PAGINATION);
            setPage(DEFAULT_PAGINATION.page);
            showApiError(toast, err, 'Failed to load return requests');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, page, statusFilter, toast]);

    useEffect(() => {
        if (isSearchPending) {
            return;
        }

        fetchReturns();
    }, [fetchReturns, isSearchPending]);

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter]);

    const handleStatusUpdate = async (returnRequest, status) => {
        const actionKeyValue = `${returnRequest.id}-${status}`;
        setActionKey(actionKeyValue);

        try {
            await updateReturnRequestStatus(returnRequest.id, { status });
            showToastMessage(toast, `Return request ${formatStatusLabel(status).toLowerCase()}`, 'success');
            fetchReturns();
        } catch (err) {
            showApiError(toast, err, 'Failed to update return request');
        } finally {
            setActionKey(null);
        }
    };

    const columns = useMemo(() => ([
        { key: 'orderNumber', label: 'Order No.' },
        { key: 'customerEmail', label: 'Customer' },
        {
            key: 'reason',
            label: 'Reason',
            render: (row) => <span className="line-clamp-2">{row.reason}</span>,
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge label={formatStatusLabel(row.status)} variant={row.status} />,
        },
        {
            key: 'createdAt',
            label: 'Requested',
            render: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="flex gap-1">
                    {row.status === 'pending' ? (
                        <>
                            <Tooltip title="Approve return">
                                <IconButton
                                    size="small"
                                    color="success"
                                    disabled={Boolean(actionKey)}
                                    onClick={() => handleStatusUpdate(row, 'approved')}
                                >
                                    <CheckCircleIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject return">
                                <IconButton
                                    size="small"
                                    color="error"
                                    disabled={Boolean(actionKey)}
                                    onClick={() => handleStatusUpdate(row, 'rejected')}
                                >
                                    <BlockIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </>
                    ) : null}
                </div>
            ),
        },
    ]), [actionKey]);

    return (
        <div className="w-full">
            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Return Requests</h1>
            <p className="mt-1 mb-6 text-sm text-slate-500">Review and process customer return requests.</p>

            <div className="mb-4 grid gap-4 md:grid-cols-2">
                <InputField
                    label="Search"
                    name="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Order number, email, reason"
                />
                <SelectField
                    label="Status"
                    name="statusFilter"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    options={STATUS_OPTIONS}
                />
            </div>

            <Table
                columns={columns}
                data={returns}
                loading={loading}
                rowKey="id"
                emptyMessage="No return requests found"
                pagination={buildTablePagination(pagination, setPage)}
            />
        </div>
    );
};

export default AdminReturns;
