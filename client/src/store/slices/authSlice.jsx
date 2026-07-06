import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    role: 'guest',
    isAuthenticated: false,
    authChecked: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            const user = action.payload;
            state.user = user;
            state.role = user.role;
            state.isAuthenticated = true;
            state.authChecked = true;
        },
        loginSuccess: (state, action) => {
            const user = action.payload;
            state.user = user;
            state.role = user.role;
            state.isAuthenticated = true;
            state.authChecked = true;
        },
        clearAuth: (state) => {
            state.user = null;
            state.role = 'guest';
            state.isAuthenticated = false;
            state.authChecked = true;
        },
        logout: (state) => {
            state.user = null;
            state.role = 'guest';
            state.isAuthenticated = false;
            state.authChecked = true;
        },
    },
});

export const { setUser, loginSuccess, clearAuth, logout } = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectRole = (state) => state.auth.role;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthChecked = (state) => state.auth.authChecked;

export default authSlice.reducer;
