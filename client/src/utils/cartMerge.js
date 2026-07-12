const CART_MERGE_FLAG = 'ecommerce_merge_cart_on_login';

export const markCartMergePending = () => {
    if (typeof window === 'undefined') {
        return;
    }

    window.sessionStorage.setItem(CART_MERGE_FLAG, '1');
};

export const consumeCartMergePending = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    const shouldMerge = window.sessionStorage.getItem(CART_MERGE_FLAG) === '1';

    if (shouldMerge) {
        window.sessionStorage.removeItem(CART_MERGE_FLAG);
    }

    return shouldMerge;
};
