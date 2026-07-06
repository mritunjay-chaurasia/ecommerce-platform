import Chip from '@mui/material/Chip';

const variantMap = {
    admin: { color: 'warning', className: '' },
    customer: { color: 'primary', className: '' },
    active: { color: 'success', className: '' },
    in_stock: { color: 'success', className: '' },
    low_stock: { color: 'warning', className: '' },
    out_of_stock: { color: 'error', className: '' },
    pending: { color: 'warning', className: '' },
    scheduled: { color: 'info', className: '' },
    confirmed: { color: 'info', className: '' },
    processing: { color: 'info', className: '' },
    shipped: { color: 'secondary', className: '' },
    delivered: { color: 'success', className: '' },
    cancelled: { color: 'error', className: '' },
    returned: { color: 'default', className: '' },
    expired: { color: 'default', className: '' },
    exhausted: { color: 'warning', className: '' },
    paid: { color: 'success', className: '' },
    failed: { color: 'error', className: '' },
    refunded: { color: 'default', className: '' },
    partially_refunded: { color: 'warning', className: '' },
    online: { color: 'success', className: '' },
    offline: { color: 'default', className: '' },
    verified: { color: 'success', className: '' },
    unverified: { color: 'default', className: '' },
    inactive: { color: 'default', className: '' },
    suspended: { color: 'error', className: '' },
    deleted: { color: 'default', className: '' },
    approved: { color: 'success', className: '' },
    hidden: { color: 'default', className: '' },
    rejected: { color: 'error', className: '' },
};

const StatusBadge = ({ label, variant = 'default', size = 'small' }) => {
    const config = variantMap[variant] || { color: 'default' };

    return (
        <Chip
            label={label}
            color={config.color}
            size={size}
            className="capitalize"
        />
    );
};

export default StatusBadge;
