const LOW_STOCK_THRESHOLD = 5;

const INVENTORY_STATUS_VALUES = ['in_stock', 'low_stock', 'out_of_stock'];

const getInventoryStatus = (stockQuantity) => {
    if (stockQuantity <= 0) {
        return 'out_of_stock';
    }

    if (stockQuantity <= LOW_STOCK_THRESHOLD) {
        return 'low_stock';
    }

    return 'in_stock';
};

module.exports = {
    LOW_STOCK_THRESHOLD,
    INVENTORY_STATUS_VALUES,
    getInventoryStatus,
};
