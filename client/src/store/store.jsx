import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer, { loadCartState, saveCartState } from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        wishlist: wishlistReducer,
        ui: uiReducer,
    },
    preloadedState: {
        cart: loadCartState(),
    },
    devTools: process.env.NODE_ENV !== 'production',
});

store.subscribe(() => {
    const state = store.getState();
    saveCartState(state.cart);
});

export default store;
