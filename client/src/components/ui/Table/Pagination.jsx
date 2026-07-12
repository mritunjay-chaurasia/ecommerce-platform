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

    if (!totalItems) {
        return null;
    }

    const safePage = page || 1;
    const safePageSize = pageSize || totalItems;
    const safeTotalPages = Math.max(1, totalPages || 1);
    const start = (safePage - 1) * safePageSize + 1;
    const end = Math.min(safePage * safePageSize, totalItems);

    return (
        <Box className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-3 py-3 sm:flex-row sm:px-4">
            <Typography variant="body2" color="text.secondary" className="text-center sm:text-left">
                Showing {start}-{end} of {totalItems}
            </Typography>

            {safeTotalPages > 1 ? (
                <Pagination
                    count={safeTotalPages}
                    page={safePage}
                    onChange={(_, value) => onPageChange(value)}
                    color="primary"
                    size={isMobile ? 'small' : 'medium'}
                    siblingCount={isMobile ? 0 : 1}
                    boundaryCount={isMobile ? 1 : 1}
                    showFirstButton={!isMobile}
                    showLastButton={!isMobile}
                />
            ) : null}
        </Box>
    );
};

export default TablePagination;
