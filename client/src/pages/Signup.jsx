import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup as signupApi } from '../apis/user.api';
import { useAppDispatch } from '../store/hooks';
import { loginSuccess } from '../store/slices/authSlice';
import { markCartMergePending } from '../utils/cartMerge';
import {
    InputField,
    PasswordField,
    PhoneInput,
    PHONE_REGEX,
    SelectField,
    Button,
    OAuthButton,
    PageCard,
    AuthDivider,
    useToast,
    showToastMessage,
    showApiError,
    showFormValidationToast,
} from '../components/ui';

import { validatePassword } from '../utils/passwordValidation';
import { GENDER_OPTIONS } from '../constants/index';

const validateSignup = (form) => {
    const errors = {};

    if (!form.firstName.trim()) errors.firstName = 'First name is required';
    if (!form.lastName.trim()) errors.lastName = 'Last name is required';

    if (!form.email.trim()) {
        errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (!form.phone) {
        errors.phone = 'Phone number is required';
    } else if (!PHONE_REGEX.test(form.phone)) {
        errors.phone = 'Enter a valid 10-digit phone number';
    }

    if (!form.gender) errors.gender = 'Please select your gender';

    if (!form.password) {
        errors.password = 'Password is required';
    } else {
        const passwordError = validatePassword(form.password);
        if (passwordError && passwordError !== 'Password is required') {
            errors.password = passwordError;
        }
    }

    if (!form.confirmPassword) {
        errors.confirmPassword = 'Confirm password is required';
    } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
};

const Signup = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const toast = useToast();
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        gender: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateSignup(form);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            showFormValidationToast(toast, validationErrors);
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...signupPayload } = form;
            const userData = await signupApi(signupPayload);
            markCartMergePending();
            dispatch(loginSuccess(userData));
            showToastMessage(toast, 'Account created successfully. Welcome!', 'success');
            navigate('/');
        } catch (err) {
            showApiError(toast, err, 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageCard title="Sign Up" subtitle="Create your account to start shopping.">
            <form className="form-stack" onSubmit={handleSubmit} noValidate>
                <div className="form-row-responsive">
                    <InputField
                        label="First Name"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        error={errors.firstName}
                        placeholder="First name"
                        required
                    />
                    <InputField
                        label="Last Name"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        error={errors.lastName}
                        placeholder="Last name"
                        required
                    />
                </div>

                <InputField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="Enter your email"
                    required
                />

                <PasswordField
                    label="Password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="At least 8 characters"
                    required
                    autoComplete="new-password"
                />

                <PasswordField
                    label="Confirm Password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    placeholder="Re-enter your password"
                    required
                    autoComplete="new-password"
                />

                <PhoneInput
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    required
                />

                <SelectField
                    label="Gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    options={GENDER_OPTIONS}
                    error={errors.gender}
                    placeholder="Select gender"
                    required
                />

                <Button type="submit" loading={loading} fullWidth>
                    Sign Up
                </Button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-brand hover:underline">
                    Login
                </Link>
            </p>
            <AuthDivider text="or sign up with Google" />
            <OAuthButton label="Sign up with Google" />
        </PageCard>
    );
};

export default Signup;
