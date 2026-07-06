import * as React from 'react';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

const PasswordField = ({
    label,
    name,
    value,
    onChange,
    error,
    placeholder,
    required = false,
    disabled = false,
    className = '',
    autoComplete,
    ...rest
}) => {
    const generatedId = React.useId();
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };

    const inputId = `${name || generatedId}-input`;
    const helperTextId = `${inputId}-helper-text`;

    return (
        <FormControl
            fullWidth
            size="small"
            variant="outlined"
            error={Boolean(error)}
            disabled={disabled}
            required={required}
            className={className}
        >
            <InputLabel htmlFor={inputId}>{label}</InputLabel>
            <OutlinedInput
                id={inputId}
                name={name}
                type={showPassword ? 'text' : 'password'}
                value={value ?? ''}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                label={label}
                aria-describedby={helperTextId}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            aria-label={showPassword ? 'hide the password' : 'display the password'}
                            aria-pressed={showPassword}
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            onMouseUp={handleMouseUpPassword}
                            edge="end"
                            size="small"
                        >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                    </InputAdornment>
                }
                {...rest}
            />
            <FormHelperText id={helperTextId}>{error || ' '}</FormHelperText>
        </FormControl>
    );
};

export default PasswordField;
