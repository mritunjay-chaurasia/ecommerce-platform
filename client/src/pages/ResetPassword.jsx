import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword as resetPasswordApi } from '../apis/user.api';
import { validatePassword } from '../utils/passwordValidation';
import {
    InputField,
    PasswordField,
    Button,
    PageCard,
    showToastMessage,
    useToast,
} from '../components/ui';
import { showApiError, showFormValidationToast } from '../components/ui/Toast/toastHelpers';

const validateResetPassword = (form) => {
    const errors = {};

    if (!form.token.trim()) {
        errors.token = 'Reset token is required';
    }

    const passwordError = validatePassword(form.password);
    if (passwordError) {
        errors.password = passwordError;
    }

    if (!form.confirmPassword) {
        errors.confirmPassword = 'Confirm password is required';
    } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
};

const ResetPassword = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [form, setForm] = useState({
        token: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [tokenFromUrl, setTokenFromUrl] = useState(false);

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            return;
        }

        setForm((prev) => ({ ...prev, token }));
        setTokenFromUrl(true);
        window.history.replaceState(null, '', '/reset-password');
    }, [searchParams]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateResetPassword(form);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            showFormValidationToast(toast, validationErrors);
            return;
        }

        setLoading(true);

        try {
            const response = await resetPasswordApi({
                token: form.token.trim(),
                password: form.password,
                confirmPassword: form.confirmPassword,
            });

            showToastMessage(toast, response.message || 'Password reset successfully', 'success');
            navigate('/login', { replace: true });
        } catch (err) {
            showApiError(toast, err, 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageCard title="Reset Password">
            <p className="mb-4 text-center text-sm text-slate-600">
                Enter your new password below.
            </p>

            <form className="form-stack" onSubmit={handleSubmit} noValidate>
                {!tokenFromUrl && (
                    <InputField
                        label="Reset Token"
                        name="token"
                        type="text"
                        value={form.token}
                        onChange={handleChange}
                        error={errors.token}
                        placeholder="Paste reset token from email"
                    />
                )}

                <PasswordField
                    label="New Password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                />
                <PasswordField
                    label="Confirm Password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                />

                <Button type="submit" loading={loading} fullWidth>
                    Reset Password
                </Button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-600">
                <Link to="/login" className="font-medium text-brand hover:underline">
                    Back to login
                </Link>
            </p>
        </PageCard>
    );
};

export default ResetPassword;
