import MuiButton from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

const variantMap = {
    primary: {
        variant: 'contained',
        color: 'primary',
    },
    secondary: {
        variant: 'contained',
        color: 'inherit',
        sx: {
            bgcolor: 'grey.900',
            color: 'common.white',
            '&:hover': {
                bgcolor: 'grey.800',
            },
        },
    },
    outline: {
        variant: 'outlined',
        color: 'inherit',
    },
    danger: {
        variant: 'contained',
        color: 'error',
    },
    ghost: {
        variant: 'text',
        color: 'inherit',
    },
};

const sizeMap = {
    sm: 'small',
    md: 'medium',
    lg: 'large',
};

const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    disabled = false,
    className = '',
    leftIcon,
    rightIcon,
    ...rest
}) => {
    const config = variantMap[variant] || variantMap.primary;

    return (
        <MuiButton
            type={type}
            variant={config.variant}
            color={config.color}
            size={sizeMap[size] || 'medium'}
            disabled={disabled || loading}
            fullWidth={fullWidth}
            startIcon={!loading ? leftIcon : null}
            endIcon={!loading ? rightIcon : null}
            className={className}
            sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                ...(config.sx || {}),
            }}
            {...rest}
        >
            {loading ? <CircularProgress size={16} color="inherit" /> : children}
            {!loading && null}
        </MuiButton>
    );
};

export default Button;
