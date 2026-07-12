import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { login as loginApi } from '../apis/user.api';
import { useAppDispatch } from '../store/hooks';
import { loginSuccess } from '../store/slices/authSlice';
import { markCartMergePending } from '../utils/cartMerge';
import {
    InputField,
    PasswordField,
    Button,
    OAuthButton,
    PageCard,
    AuthDivider,
    useToast,
    showToastMessage,
    showApiError,
    showFormValidationToast,
} from '../components/ui';

const OAUTH_ERROR_MESSAGES = {
    oauth_failed: 'Google login failed. Please try again.',
};

const validateLogin = (form) => {
    const errors = {};

    if (!form.email.trim()) {
        errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (!form.password) {
        errors.password = 'Password is required';
    }

    return errors;
};

const Login = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const [searchParams] = useSearchParams();
    const redirectPath = location.state?.from || '/dashboard';
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const oauthError = searchParams.get('error');
        if (oauthError && OAUTH_ERROR_MESSAGES[oauthError]) {
            showToastMessage(toast, OAUTH_ERROR_MESSAGES[oauthError], 'error');
        }
    }, [searchParams, toast]);

    useEffect(() => {
        if (location.state?.message) {
            showToastMessage(toast, location.state.message, 'info');
        }
    }, [location.state?.message, toast]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateLogin(form);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            showFormValidationToast(toast, validationErrors);
            return;
        }

        setLoading(true);

        try {
            const userData = await loginApi(form);
            markCartMergePending();
            dispatch(loginSuccess(userData));
            showToastMessage(toast, 'Logged in successfully', 'success');
            navigate(redirectPath, { replace: true });
        } catch (err) {
            showApiError(toast, err, 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageCard title="Login">
            <form className="form-stack" onSubmit={handleSubmit} noValidate>
                <InputField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="Enter your email"
                />
                <PasswordField
                    label="Password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                />

                <div className="text-right">
                    <Link to="/forgot-password" className="text-sm font-medium text-brand hover:underline">
                        Forgot password?
                    </Link>
                </div>

                <Button type="submit" loading={loading} fullWidth>
                    Login
                </Button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-600">
                Don&apos;t have an account?{' '}
                <Link to="/signup" className="font-medium text-brand hover:underline">
                    Sign up
                </Link>
            </p>
            <AuthDivider text="or sign in with Google" />
            <OAuthButton label="Sign in with Google" />
        </PageCard>
    );
};

export default Login;
