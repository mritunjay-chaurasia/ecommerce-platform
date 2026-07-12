import { useMemo } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Loader } from '../Loader/Loader';
import Pagination from './Pagination';
import './Table.css';

const DEFAULT_TABLE_PAGINATION = {
    page: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
};

const SERIAL_COLUMN_KEYS = new Set(['serialNumber', 'serial', '__serialNumber']);

const getCellSx = (column) => ({
    width: column.width,
    minWidth: column.minWidth,
    maxWidth: column.maxWidth,
});

const DataTable = ({
    columns = [],
    data = [],
    pagination,
    loading = false,
    emptyMessage = 'No data found',
    rowKey = 'id',
    className = '',
    stickyHeader = false,
    showSerialNumber = true,
    serialNumberLabel = 'S.N.',
}) => {
    const getRowKey = (row, index) => row[rowKey] || index;

    const resolvedColumns = useMemo(() => {
        const filteredColumns = columns.filter((column) => !SERIAL_COLUMN_KEYS.has(column.key));

        if (!showSerialNumber) {
            return filteredColumns;
        }

        const getSerialNumber = (index) => {
            if (pagination?.page && pagination?.pageSize) {
                return (pagination.page - 1) * pagination.pageSize + index + 1;
            }

            return index + 1;
        };

        return [
            {
                key: '__serialNumber',
                label: serialNumberLabel,
                width: 72,
                align: 'center',
                className: 'data-table__cell--nowrap',
                render: (_, index) => getSerialNumber(index),
            },
            ...filteredColumns,
        ];
    }, [columns, pagination?.page, pagination?.pageSize, serialNumberLabel, showSerialNumber]);

    const renderCell = (column, rowData, rowIndex) => {
        if (column.render) {
            return column.render(rowData, rowIndex);
        }

        return rowData[column.key] ?? '-';
    };

    return (
        <Paper
            elevation={0}
            className={`data-table-wrapper w-full overflow-hidden rounded-lg border border-slate-200 ${className}`}
        >
            {loading ? (
                <div className="flex min-h-[240px] items-center justify-center py-12">
                    <Loader label="Loading..." center />
                </div>
            ) : data.length === 0 ? (
                <div className="flex min-h-[240px] items-center justify-center py-12">
                    <Typography variant="body2" color="text.secondary">
                        {emptyMessage}
                    </Typography>
                </div>
            ) : (
                <TableContainer className="data-table-container">
                    <Table stickyHeader={stickyHeader} size="medium" className="data-table">
                        <TableHead>
                            <TableRow>
                                {resolvedColumns.map((column) => (
                                    <TableCell
                                        key={column.key}
                                        align={column.align || 'left'}
                                        className={column.headerClassName}
                                        sx={{
                                            ...getCellSx(column),
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                            color: 'text.secondary',
                                            bgcolor: 'grey.50',
                                            borderBottom: 1,
                                            borderColor: 'divider',
                                        }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row, index) => (
                                <TableRow
                                    key={getRowKey(row, index)}
                                    hover
                                    className="data-table__row"
                                >
                                    {resolvedColumns.map((column) => (
                                        <TableCell
                                            key={column.key}
                                            align={column.align || 'left'}
                                            className={column.className}
                                            sx={{
                                                ...getCellSx(column),
                                                verticalAlign: 'middle',
                                                borderBottom: 1,
                                                borderColor: 'divider',
                                            }}
                                        >
                                            {renderCell(column, row, index)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {pagination ? (
                <Pagination
                    page={pagination.page ?? DEFAULT_TABLE_PAGINATION.page}
                    totalPages={pagination.totalPages ?? DEFAULT_TABLE_PAGINATION.totalPages}
                    totalItems={pagination.totalItems ?? DEFAULT_TABLE_PAGINATION.totalItems}
                    pageSize={pagination.pageSize ?? DEFAULT_TABLE_PAGINATION.pageSize}
                    onPageChange={pagination.onPageChange}
                />
            ) : null}
        </Paper>
    );
};

export default DataTable;
