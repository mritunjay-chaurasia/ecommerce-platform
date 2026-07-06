import { createSlice } from '@reduxjs/toolkit';

const getEmptyWishlistState = () => ({
    items: [],
    synced: false,
});

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: getEmptyWishlistState(),
    reducers: {
        setWishlistItems: (state, action) => {
            state.items = action.payload || [];
            state.synced = true;
        },
        removeFromWishlist: (state, action) => {
            state.items = state.items.filter((item) => item.productId !== action.payload);
        },
        clearWishlist: (state) => {
            state.items = [];
            state.synced = false;
        },
    },
});

export const {
    setWishlistItems,
    removeFromWishlist,
    clearWishlist,
} = wishlistSlice.actions;

export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.items.length;
export const selectWishlistSynced = (state) => state.wishlist.synced;
export const selectIsInWishlist = (productId) => (state) =>
    state.wishlist.items.some((item) => item.productId === productId);

export default wishlistSlice.reducer;
