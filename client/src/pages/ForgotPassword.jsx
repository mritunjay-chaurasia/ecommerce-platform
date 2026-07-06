import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword as forgotPasswordApi } from '../apis/user.api';
import {
    InputField,
    Button,
    PageCard,
    showToastMessage,
    useToast,
} from '../components/ui';
import { showApiError, showFormValidationToast } from '../components/ui/Toast/toastHelpers';

const validateForgotPassword = (form) => {
    const errors = {};

    if (!form.email.trim()) {
        errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'Please enter a valid email address';
    }

    return errors;
};

const ForgotPassword = () => {
    const toast = useToast();
    const [form, setForm] = useState({ email: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForgotPassword(form);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            showFormValidationToast(toast, validationErrors);
            return;
        }

        setLoading(true);

        try {
            const response = await forgotPasswordApi(form.email);
            setSubmitted(true);
            showToastMessage(toast, response.message || 'Password reset link sent', 'success');
        } catch (err) {
            showApiError(toast, err, 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageCard title="Forgot Password">
            {submitted ? (
                <div className="space-y-4 text-center">
                    <p className="text-sm text-slate-600">
                        If an account exists with this email, you will receive a password reset link shortly.
                    </p>
                    {process.env.NODE_ENV === 'development' && (
                        <p className="rounded-lg bg-amber-50 p-3 text-left text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                            Development: emails are sent via SMTP when configured, or via Ethereal test mail (check the backend console for a preview link). Set DEBUG_RESET_TOKEN=true to also log reset links in the server console.
                        </p>
                    )}
                    <Link to="/login" className="inline-block text-sm font-medium text-brand hover:underline">
                        Back to login
                    </Link>
                </div>
            ) : (
                <>
                    <p className="mb-4 text-center text-sm text-slate-600">
                        Enter your email and we&apos;ll send you a link to reset your password.
                    </p>

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

                        <Button type="submit" loading={loading} fullWidth>
                            Send Reset Link
                        </Button>
                    </form>

                    <p className="mt-4 text-center text-sm text-slate-600">
                        Remember your password?{' '}
                        <Link to="/login" className="font-medium text-brand hover:underline">
                            Login
                        </Link>
                    </p>
                </>
            )}
        </PageCard>
    );
};

export default ForgotPassword;
