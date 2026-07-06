import { useEffect } from 'react';
import { getMyWishlist } from '../../apis/wishlist.api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectIsAuthenticated, selectRole } from '../../store/slices/authSlice';
import { clearWishlist, setWishlistItems } from '../../store/slices/wishlistSlice';

const LEGACY_WISHLIST_KEY = 'ecommerce_wishlist';

const WishlistSync = () => {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const role = useAppSelector(selectRole);
    const isCustomer = isAuthenticated && role === 'customer';

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem(LEGACY_WISHLIST_KEY);
        }
    }, []);

    useEffect(() => {
        if (!isCustomer) {
            dispatch(clearWishlist());
            return;
        }

        const syncWishlist = async () => {
            try {
                const items = await getMyWishlist();
                dispatch(setWishlistItems(items));
            } catch {
                dispatch(clearWishlist());
            }
        };

        syncWishlist();
    }, [dispatch, isCustomer]);

    return null;
};

export default WishlistSync;
