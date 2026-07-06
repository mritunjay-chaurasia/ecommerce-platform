import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { loginSuccess } from '../store/slices/authSlice';
import { getProfile } from '../apis/user.api';
import { PageCard, Loader, showToastMessage, useToast } from '../components/ui';

const OAuthCallback = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const toast = useToast();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState('');

    useEffect(() => {
        const success = searchParams.get('success');

        if (success !== '1') {
            setError('Google login failed. Please try again.');
            showToastMessage(toast, 'Google login failed', 'error');
            return;
        }

        const completeLogin = async () => {
            try {
                const userData = await getProfile();
                dispatch(loginSuccess(userData));
                showToastMessage(toast, 'Logged in with Google', 'success');
                navigate('/dashboard', { replace: true });
            } catch {
                setError('Failed to complete login. Please try again.');
                showToastMessage(toast, 'Failed to complete login', 'error');
            }
        };

        completeLogin();
    }, [dispatch, navigate, searchParams, toast]);

    return (
        <PageCard title={error ? 'Login Failed' : 'Signing you in...'}>
            {error ? (
                <p className="text-sm font-medium text-red-500">{error}</p>
            ) : (
                <Loader label="Please wait" center />
            )}
        </PageCard>
    );
};

export default OAuthCallback;
