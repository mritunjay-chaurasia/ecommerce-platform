import { useCallback, useEffect, useMemo, useState } from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import BlockIcon from '@mui/icons-material/Block';
import { IconButton, Tooltip } from '@mui/material';
import { deleteReview, getReviews, updateReviewStatus } from '../../apis/review.api';
import {
    InputField,
    SelectField,
    StatusBadge,
    Table,
    showToastMessage,
    useConfirm,
    useToast,
} from '../../components/ui';
import { showApiError } from '../../components/ui/Toast/toastHelpers';
import useDebounce from '../../utils/useDebounce';
import formatStatusLabel from '../../utils/formatStatusLabel';
import { REVIEW_STATUS_FILTER_OPTIONS, PAGE_SIZE } from '../../constants/index';
import { applyPaginationResponse, buildTablePagination, DEFAULT_PAGINATION } from '../../utils/pagination';



const renderStars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

const AdminReviews = () => {
    const toast = useToast();
    const { confirm } = useConfirm();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionKey, setActionKey] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
    const debouncedSearch = useDebounce(search, 400);
    const isSearchPending = search !== debouncedSearch;

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getReviews({
                page,
                limit: PAGE_SIZE,
                search: debouncedSearch || undefined,
                status: statusFilter || undefined,
            });
            setReviews(response.data);
            applyPaginationResponse(response, setPagination, setPage);
        } catch (err) {
            setReviews([]);
            setPagination(DEFAULT_PAGINATION);
            setPage(DEFAULT_PAGINATION.page);
            showApiError(toast, err, 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, page, statusFilter, toast]);

    useEffect(() => {
        if (isSearchPending) {
            return;
        }

        fetchReviews();
    }, [fetchReviews, isSearchPending]);

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter]);

    const handleStatusUpdate = useCallback(async (review, status) => {
        const actionKeyValue = `${review.id}-${status}`;
        setActionKey(actionKeyValue);

        try {
            await updateReviewStatus(review.id, { status });
            showToastMessage(toast, `Review marked as ${formatStatusLabel(status)}`, 'success');
            fetchReviews();
        } catch (err) {
            showApiError(toast, err, 'Failed to update review status');
        } finally {
            setActionKey(null);
        }
    }, [fetchReviews, toast]);

    const handleDelete = useCallback(async (review) => {
        const confirmed = await confirm({
            title: 'Delete Review',
            message: 'Delete this review permanently?',
            confirmText: 'Delete',
            variant: 'danger',
        });

        if (!confirmed) {
            return;
        }

        try {
            await deleteReview(review.id);
            showToastMessage(toast, 'Review deleted successfully', 'success');
            fetchReviews();
        } catch (err) {
            showApiError(toast, err, 'Failed to delete review');
        }
    }, [confirm, fetchReviews, toast]);

    const columns = useMemo(() => [
        {
            key: 'productName',
            label: 'Product',
            render: (row) => (
                <div>
                    <p className="font-medium text-slate-900">{row.productName || '-'}</p>
                    {row.title ? <p className="text-xs text-slate-500">{row.title}</p> : null}
                </div>
            ),
        },
        {
            key: 'customerName',
            label: 'Customer',
            render: (row) => (
                <div>
                    <p className="font-medium text-slate-900">{row.customerName || '-'}</p>
                    <p className="text-xs text-slate-500">{row.customerEmail || '-'}</p>
                </div>
            ),
        },
        {
            key: 'rating',
            label: 'Rating',
            render: (row) => (
                <span className="text-amber-500" title={`${row.rating} out of 5`}>
                    {renderStars(row.rating)}
                </span>
            ),
        },
        {
            key: 'comment',
            label: 'Comment',
            render: (row) => (
                <p className="max-w-xs truncate text-sm text-slate-600" title={row.comment}>
                    {row.comment}
                </p>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => (
                <StatusBadge
                    label={formatStatusLabel(row.status)}
                    variant={row.status}
                />
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-1">
                    {row.status !== 'approved' ? (
                        <Tooltip title="Approve review">
                            <IconButton
                                size="small"
                                color="success"
                                disabled={Boolean(actionKey)}
                                onClick={() => handleStatusUpdate(row, 'approved')}
                                aria-label="Approve review"
                            >
                                <CheckCircleIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    ) : null}
                    {row.status !== 'hidden' ? (
                        <Tooltip title="Hide review">
                            <IconButton
                                size="small"
                                disabled={Boolean(actionKey)}
                                onClick={() => handleStatusUpdate(row, 'hidden')}
                                aria-label="Hide review"
                            >
                                <VisibilityOffIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    ) : null}
                    {row.status !== 'rejected' ? (
                        <Tooltip title="Reject review">
                            <IconButton
                                size="small"
                                color="warning"
                                disabled={Boolean(actionKey)}
                                onClick={() => handleStatusUpdate(row, 'rejected')}
                                aria-label="Reject review"
                            >
                                <BlockIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    ) : null}
                    <Tooltip title="Delete review">
                        <IconButton
                            size="small"
                            color="error"
                            disabled={Boolean(actionKey)}
                            onClick={() => handleDelete(row)}
                            aria-label="Delete review"
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </div>
            ),
        },
    ], [actionKey, handleDelete, handleStatusUpdate]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Reviews</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Moderate customer product reviews before they appear on the storefront.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <InputField
                    label="Search reviews"
                    name="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by title or comment"
                    inputProps={{ maxLength: 120 }}
                />
                <SelectField
                    label="Status"
                    name="statusFilter"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    options={REVIEW_STATUS_FILTER_OPTIONS}
                    placeholder="All statuses"
                />
            </div>

            <Table
                columns={columns}
                data={reviews}
                loading={loading || isSearchPending}
                emptyMessage="No reviews found"
                pagination={buildTablePagination(pagination, setPage)}
            />
        </div>
    );
};

export default AdminReviews;
