import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import cn from '../../../utils/cn';
import './Loader.css';

const sizeMap = {
    sm: 20,
    md: 28,
    lg: 40,
};

const Loader = ({
    size = 'md',
    label,
    className = '',
    center = false,
    color = 'primary',
}) => (
    <div
        className={cn(
            'loader',
            center && 'loader-center',
            className,
        )}
        role="status"
        aria-live="polite"
        aria-busy="true"
    >
        <CircularProgress size={sizeMap[size]} color={color} />
        {label && (
            <Typography variant="body2" color="text.secondary" className="loader-label">
                {label}
            </Typography>
        )}
    </div>
);

const PageLoader = ({ label = 'Loading...' }) => (
    <div className="page-loader">
        <Loader size="lg" label={label} />
    </div>
);

export { Loader, PageLoader };
export default Loader;
