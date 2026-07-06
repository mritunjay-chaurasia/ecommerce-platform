import Button from '../Button/Button';

const API_BASE = process.env.REACT_APP_BACKEND_URL?.replace('/api', '') || 'http://localhost:5000';

const OAuthButton = ({ provider = 'google', label = 'Continue with Google', className = '' }) => {
    const handleOAuthLogin = () => {
        window.location.href = `${API_BASE}/api/auth/${provider}`;
    };

    return (
        <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={handleOAuthLogin}
            className={className}
            leftIcon={
                provider === 'google' ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                        <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-1.6 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.8 3.8 14.6 3 12 3 7.03 3 3 7.03 3 12s4.03 9 9 9c5.2 0 8.6-3.7 8.6-8.9 0-.6-.1-1.1-.2-1.5H12z" />
                    </svg>
                ) : null
            }
        >
            {label}
        </Button>
    );
};

export default OAuthButton;
