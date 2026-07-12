import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail as verifyEmailApi } from '../apis/user.api';
import { Button, Loader, PageCard, showToastMessage, useToast } from '../components/ui';
import { showApiError } from '../components/ui/Toast/toastHelpers';

const VerifyEmail = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setLoading(false);
            setMessage('Verification token is missing. Please use the link from your email.');
            return;
        }

        const verify = async () => {
            try {
                const response = await verifyEmailApi(token.trim());
                setIsSuccess(true);
                setMessage(response.message || 'Email verified successfully');
                showToastMessage(toast, response.message || 'Email verified successfully', 'success');
                window.history.replaceState(null, '', '/verify-email');
            } catch (err) {
                setIsSuccess(false);
                const errorMessage = err?.response?.data?.message || 'Verification link is invalid or has expired';
                setMessage(errorMessage);
                showApiError(toast, err, 'Email verification failed');
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [searchParams, toast]);

    if (loading) {
        return (
            <PageCard title="Verifying Email">
                <Loader center label="Please wait..." />
            </PageCard>
        );
    }

    return (
        <PageCard title={isSuccess ? 'Email Verified' : 'Verification Failed'}>
            <p className={`mb-4 text-center text-sm ${isSuccess ? 'text-emerald-600' : 'text-red-500'}`}>
                {message}
            </p>

            <div className="flex flex-col gap-3">
                <Button type="button" fullWidth onClick={() => navigate('/login')}>
                    Go to Login
                </Button>
                <p className="text-center text-sm text-slate-600">
                    <Link to="/" className="font-medium text-brand hover:underline">
                        Back to store
                    </Link>
                </p>
            </div>
        </PageCard>
    );
};

export default VerifyEmail;
