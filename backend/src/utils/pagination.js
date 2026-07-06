const buildPagination = (page, limit, total) => ({
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1),
});

module.exports = {
    buildPagination,
};
