import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const TablePagination = ({
    page,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (!totalPages || totalPages <= 1) return null;

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalItems);

    return (
        <Box className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-3 py-3 sm:flex-row sm:px-4">
            <Typography variant="body2" color="text.secondary" className="text-center sm:text-left">
                Showing {start}-{end} of {totalItems}
            </Typography>

            <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => onPageChange(value)}
                color="primary"
                size={isMobile ? 'small' : 'medium'}
                siblingCount={isMobile ? 0 : 1}
                boundaryCount={isMobile ? 1 : 1}
                showFirstButton={!isMobile}
                showLastButton={!isMobile}
            />
        </Box>
    );
};

export default TablePagination;
