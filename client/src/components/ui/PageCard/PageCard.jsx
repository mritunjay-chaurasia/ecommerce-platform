import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const PageCard = ({
    title,
    subtitle,
    children,
    wide = false,
    className = '',
}) => {
    return (
        <Box className={`page-container${wide ? '-wide' : ''} ${className}`}>
            <Paper elevation={2} className="w-full rounded-xl bg-white p-5 dark:bg-slate-900 sm:p-8">
                {title && (
                    <Typography variant="h5" component="h1" className="!mb-1 !font-bold !text-slate-800 dark:!text-slate-100">
                        {title}
                    </Typography>
                )}
                {subtitle && (
                    <Typography variant="body2" color="text.secondary" className="!mb-6">
                        {subtitle}
                    </Typography>
                )}
                {children}
            </Paper>
        </Box>
    );
};

export default PageCard;
