const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

const parsePaginationQuery = (query = {}, options = {}) => {
    const defaultLimit = options.defaultLimit ?? DEFAULT_LIMIT;
    const maxLimit = options.maxLimit ?? MAX_LIMIT;
    const page = Math.max(DEFAULT_PAGE, Number(query.page) || DEFAULT_PAGE);
    const limit = Math.min(maxLimit, Math.max(1, Number(query.limit) || defaultLimit));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

const buildPagination = (page, limit, total) => ({
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
});

const hasPaginationQuery = (query = {}) => (
    query.page !== undefined || query.limit !== undefined
);

module.exports = {
    DEFAULT_PAGE,
    DEFAULT_LIMIT,
    MAX_LIMIT,
    parsePaginationQuery,
    buildPagination,
    hasPaginationQuery,
};
