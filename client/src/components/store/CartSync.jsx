import { useEffect, useMemo } from 'react';
import { getStoreProducts } from '../../apis/store.api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectCartItems, syncCartProducts } from '../../store/slices/cartSlice';

const CartSync = () => {
    const dispatch = useAppDispatch();
    const cartItems = useAppSelector(selectCartItems);

    const productIdsKey = useMemo(
        () => cartItems.map((item) => item.productId).sort().join(','),
        [cartItems],
    );

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
