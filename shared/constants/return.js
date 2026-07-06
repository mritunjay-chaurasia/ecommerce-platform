const RETURN_REQUEST_STATUS_VALUES = [
    'pending',
    'approved',
    'rejected',
    'completed',
];

const RETURN_REQUEST_STATUS = Object.freeze({
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    COMPLETED: 'completed',
});

module.exports = {
    RETURN_REQUEST_STATUS_VALUES,
    RETURN_REQUEST_STATUS,
};
