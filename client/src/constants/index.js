import {
    ORDER_STATUS_VALUES,
    PAYMENT_STATUS_VALUES,
    CANCELLABLE_ORDER_STATUSES,
    RETURNABLE_ORDER_STATUSES,
    ORDER_STEPS,
} from '@shared/constants/order';
import { CURRENCY_VALUES, CURRENCY_LOCALE_MAP } from '@shared/constants/currency';
import { COUPON_STATUS_VALUES } from '@shared/constants/coupon';
import { BANNER_STATUS_VALUES, PLACEMENT_VALUES } from '@shared/constants/banner';
import formatStatusLabel from '@shared/utils/formatStatusLabel';

export { PHONE_REGEX } from '@shared/constants/validation';
export { CURRENCY_LOCALE_MAP, ORDER_STEPS, CANCELLABLE_ORDER_STATUSES as CANCELLABLE_STATUSES, RETURNABLE_ORDER_STATUSES as RETURNABLE_STATUSES };

export const GENDER_OPTIONS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
];

export const CURRENCY_OPTIONS = CURRENCY_VALUES.map((value) => ({
    value,
    label: value === 'INR' ? 'INR (₹)' : value === 'USD' ? 'USD ($)' : `${value} (€)`,
}));

export const PAGE_SIZE = 10;

const toStatusOptions = (values) => values.map((value) => ({
    value,
    label: formatStatusLabel(value),
}));

export const ORDER_STATUS_OPTIONS = toStatusOptions(ORDER_STATUS_VALUES);
export const PAYMENT_STATUS_OPTIONS = toStatusOptions(PAYMENT_STATUS_VALUES);
export const DISCOUNT_TYPE_OPTIONS = [
    { value: 'percentage', label: 'Percentage' },
    { value: 'fixed', label: 'Fixed Amount' },
];
export const STATUS_FILTER_OPTIONS = toStatusOptions(COUPON_STATUS_VALUES);
export const PAYMENT_METHOD_OPTIONS = [
    { value: 'cod', label: 'Cash on Delivery' },
    { value: 'upi', label: 'UPI' },
    { value: 'card', label: 'Card' },
];
export const FILTER_ORDER_STATUS_OPTIONS = [
    { value: 'all', label: 'All statuses' },
    ...ORDER_STATUS_OPTIONS,
];
export const REVIEW_STATUS_FILTER_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'hidden', label: 'Hidden' },
    { value: 'rejected', label: 'Rejected' },
];
export const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
];
export const PLACEMENT_OPTIONS = toStatusOptions(PLACEMENT_VALUES);
export const BANNER_STATUS_FILTER_OPTIONS = toStatusOptions(BANNER_STATUS_VALUES);
export const RATING_OPTIONS = [1, 2, 3, 4, 5];

export const CUSTOMER_DASHBOARD_LINKS = [
    {
        label: 'My Orders',
        description: 'Track and view your order history',
        path: '/orders',
        icon: 'Package',
    },
    {
        label: 'Shopping Cart',
        description: 'Review items before checkout',
        path: '/cart',
        icon: 'ShoppingCart',
    },
    {
        label: 'My Wishlist',
        description: 'View saved products',
        path: '/wishlist',
        icon: 'Heart',
    },
    {
        label: 'My Profile',
        description: 'Update your account details',
        path: '/profile',
        icon: 'User',
    },
];
