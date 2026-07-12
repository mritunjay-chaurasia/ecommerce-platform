export const DEFAULT_PAGINATION = {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
};

export const toPaginationState = (pagination) => ({
    page: Number(pagination?.page) || DEFAULT_PAGINATION.page,
    limit: Number(pagination?.limit) || DEFAULT_PAGINATION.limit,
    total: Number(pagination?.total) || DEFAULT_PAGINATION.total,
    totalPages: Number(pagination?.totalPages) || DEFAULT_PAGINATION.totalPages,
});

export const applyPaginationResponse = (response, setPagination, setPage) => {
    const nextPagination = toPaginationState(response?.pagination);
    setPagination(nextPagination);

    if (setPage) {
        setPage(nextPagination.page);
    }

    return nextPagination;
};

export const buildTablePagination = (pagination, onPageChange) => ({
    page: pagination.page,
    totalPages: pagination.totalPages,
    totalItems: pagination.total,
    pageSize: pagination.limit,
    onPageChange,
});
