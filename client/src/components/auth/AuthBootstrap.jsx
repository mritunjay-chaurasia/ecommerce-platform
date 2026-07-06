import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setUser, clearAuth, selectAuthChecked, selectIsAuthenticated } from '../../store/slices/authSlice';
import { getProfile } from '../../apis/user.api';
import { PageLoader } from '../ui';

const AuthBootstrap = ({ children }) => {
    const dispatch = useAppDispatch();
    const authChecked = useAppSelector(selectAuthChecked);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    useEffect(() => {
        const bootstrapAuth = async () => {
            try {
                const user = await getProfile();
                dispatch(setUser(user));
            } catch {
                dispatch(clearAuth());
            }
        };

        bootstrapAuth();
    }, [dispatch]);

    useEffect(() => {
        if (!isAuthenticated) {
            return undefined;
        }

        const revalidateSession = async () => {
            if (document.visibilityState !== 'visible') {
                return;
            }

            try {
                const user = await getProfile();
                dispatch(setUser(user));
            } catch {
                dispatch(clearAuth());
            }
        };

        window.addEventListener('focus', revalidateSession);
        document.addEventListener('visibilitychange', revalidateSession);

        return () => {
            window.removeEventListener('focus', revalidateSession);
            document.removeEventListener('visibilitychange', revalidateSession);
        };
    }, [dispatch, isAuthenticated]);

    if (!authChecked) {
        return <PageLoader label="Loading your account..." />;
    }

    return children;
};

export default AuthBootstrap;
