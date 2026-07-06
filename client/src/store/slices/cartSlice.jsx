import { createSlice } from '@reduxjs/toolkit';

const CART_STORAGE_KEY = 'ecommerce_cart';

const getEmptyCartState = () => ({
    items: [],
});

const loadCartState = () => {
    if (typeof window === 'undefined') {
        return getEmptyCartState();
    }

    try {
        const raw = window.localStorage.getItem(CART_STORAGE_KEY);

        if (!raw) {
            return getEmptyCartState();
        }

        const parsed = JSON.parse(raw);

        return {
            items: Array.isArray(parsed.items) ? parsed.items : [],
        };
    } catch {
        return getEmptyCartState();
    }
};

const saveCartState = (state) => {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
};

const cartSlice = createSlice({
    name: 'cart',
    initialState: getEmptyCartState(),
    reducers: {
        addToCart: (state, action) => {
            const product = action.payload;
            const existingItem = state.items.find((item) => item.productId === product.id);
            const stockLimit = product.stockQuantity ?? existingItem?.stockQuantity ?? Number.MAX_SAFE_INTEGER;

            if (stockLimit <= 0) {
                return;
            }

            if (existingItem) {
                existingItem.quantity = Math.min(existingItem.quantity + 1, stockLimit);
                return;
            }

            state.items.push({
                productId: product.id,
                name: product.name,
                categoryName: product.categoryName || '',
                imageUrl: product.imageUrl || '',
                price: product.currentPrice ?? product.price,
                originalPrice: product.price,
                stockQuantity: product.stockQuantity ?? 0,
                quantity: 1,
            });
        },
        updateCartQuantity: (state, action) => {
            const { productId, quantity } = action.payload;
            const item = state.items.find((entry) => entry.productId === productId);

            if (!item) {
                return;
            }

            if (quantity <= 0) {
                state.items = state.items.filter((entry) => entry.productId !== productId);
                return;
            }

            item.quantity = Math.min(quantity, item.stockQuantity ?? quantity);
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter((item) => item.productId !== action.payload);
        },
        clearCart: (state) => {
            state.items = [];
        },
        syncCartProducts: (state, action) => {
            const products = action.payload || [];

            state.items = state.items
                .map((item) => {
                    const product = products.find((entry) => entry.id === item.productId);

                    if (!product) {
                        return item;
                    }

                    return {
                        ...item,
                        name: product.name,
                        categoryName: product.categoryName || '',
                        imageUrl: product.imageUrl || '',
                        price: product.currentPrice ?? product.price,
                        originalPrice: product.price,
                        stockQuantity: product.stockQuantity ?? item.stockQuantity,
                        quantity: Math.min(item.quantity, product.stockQuantity ?? item.quantity),
                    };
                })
                .filter((item) => item.quantity > 0);
        },
    },
});

export const {
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    syncCartProducts,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartItemCount = (state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartSubtotal = (state) => state.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

export {
    loadCartState,
    saveCartState,
};

export default cartSlice.reducer;
