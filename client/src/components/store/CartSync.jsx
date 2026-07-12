import { useEffect, useMemo, useRef } from 'react';
import { getMyCart, mergeCartItems } from '../../apis/cart.api';
import { getStoreProducts } from '../../apis/store.api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectAuthChecked, selectIsAuthenticated, selectRole } from '../../store/slices/authSlice';
import {
    selectCartItems,
    setCartItems,
    syncCartProducts,
} from '../../store/slices/cartSlice';
import { consumeCartMergePending } from '../../utils/cartMerge';

const mapCartItemsToMergePayload = (items) => items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
}));

const CartSync = () => {
    const dispatch = useAppDispatch();
    const authChecked = useAppSelector(selectAuthChecked);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const role = useAppSelector(selectRole);
    const isCustomer = isAuthenticated && role === 'customer';
    const cartItems = useAppSelector(selectCartItems);
    const serverCartLoadedRef = useRef(false);

    const productIdsKey = useMemo(
        () => cartItems.map((item) => item.productId).sort().join(','),
        [cartItems],
    );

    useEffect(() => {
        if (!authChecked) {
            return;
        }

        if (!isCustomer) {
            serverCartLoadedRef.current = false;
            return;
        }

        if (serverCartLoadedRef.current) {
            return;
        }

        serverCartLoadedRef.current = true;

        const syncServerCart = async () => {
            const shouldMerge = consumeCartMergePending();
            const localItems = cartItems;

            try {
                if (shouldMerge && localItems.length > 0) {
                    const mergedItems = await mergeCartItems({
                        items: mapCartItemsToMergePayload(localItems),
                    });
                    dispatch(setCartItems(mergedItems));
                    return;
                }

                const serverItems = await getMyCart();
                dispatch(setCartItems(serverItems));
            } catch {
                // Keep existing cart data if server sync fails.
            }
        };

        syncServerCart();
    }, [authChecked, cartItems, dispatch, isCustomer]);

    useEffect(() => {
        if (!productIdsKey) {
            return;
        }

        const syncCart = async () => {
            try {
                const response = await getStoreProducts({ ids: productIdsKey });
                dispatch(syncCartProducts(response.data || []));
            } catch {
                // Keep existing cart data if sync fails.
            }
        };

        syncCart();
    }, [dispatch, productIdsKey]);

    return null;
};

export default CartSync;
