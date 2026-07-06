import { useMemo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { AutoSizer, Table as VirtualizedTable, Column } from 'react-virtualized';
import { Loader } from '../Loader/Loader';
import Pagination from './Pagination';
import 'react-virtualized/styles.css';
import './Table.css';

const DEFAULT_ROW_HEIGHT = 52;
const HEADER_HEIGHT = 48;
const MIN_VIRTUALIZED_ROWS = 20;

const DataTable = ({
    columns = [],
    data = [],
    pagination,
    loading = false,
    emptyMessage = 'No data found',
    rowKey = 'id',
    className = '',
    rowHeight = DEFAULT_ROW_HEIGHT,
    maxHeight = 560,
}) => {
    const getRowKey = (row, index) => row[rowKey] || index;
    const shouldVirtualize = !loading && data.length >= MIN_VIRTUALIZED_ROWS;

    const resolvedColumns = useMemo(() => {
        const fixedWidth = columns.reduce((sum, column) => sum + (column.width || 0), 0);
        const flexColumns = columns.filter((column) => !column.width).length || 1;
        const defaultWidth = Math.max(150, Math.floor((960 - fixedWidth) / flexColumns));

        return columns.map((column) => ({
            ...column,
            resolvedWidth: column.width || defaultWidth,
        }));
    }, [columns]);

    const tableHeight = useMemo(() => {
        const contentHeight = HEADER_HEIGHT + (data.length * rowHeight);
        return Math.min(contentHeight, maxHeight);
    }, [data.length, maxHeight, rowHeight]);

    const renderCell = (column, rowData, rowIndex) => {
        if (column.render) {
            return column.render(rowData, rowIndex);
        }

        return rowData[column.key] ?? '-';
    };

    return (
        <Paper elevation={0} className={`virtualized-data-table w-full overflow-hidden rounded-lg border border-slate-200 ${className}`}>
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
            ) : shouldVirtualize ? (
                <div className="h-[70vh] min-h-[320px] max-h-[70vh] w-full">
                    <AutoSizer>
                        {({ width, height }) => (
                            <VirtualizedTable
                                width={width}
                                height={Math.min(height, tableHeight)}
                                headerHeight={HEADER_HEIGHT}
                                rowHeight={rowHeight}
                                rowCount={data.length}
                                rowGetter={({ index }) => data[index]}
                                rowKey={({ index }) => String(getRowKey(data[index], index))}
                                overscanRowCount={8}
                            >
                                {resolvedColumns.map((column) => (
                                    <Column
                                        key={column.key}
                                        label={column.label}
                                        dataKey={column.key}
                                        width={column.resolvedWidth}
                                        flexGrow={column.width ? 0 : 1}
                                        cellRenderer={({ rowData, rowIndex }) => (
                                            <span className="truncate">
                                                {renderCell(column, rowData, rowIndex)}
                                            </span>
                                        )}
                                    />
                                ))}
                            </VirtualizedTable>
                        )}
                    </AutoSizer>
                </div>
            ) : (
                <div className="w-full overflow-x-auto">
                    <table className="min-w-[640px] w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className="px-3 py-3 font-semibold"
                                        style={{ width: column.width }}
                                    >
                                        {column.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={getRowKey(row, index)} className="border-b border-slate-200 hover:bg-slate-50">
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-3 py-3 text-slate-800">
                                            {renderCell(column, row, index)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {pagination && (
                <Pagination
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    pageSize={pagination.pageSize}
                    onPageChange={pagination.onPageChange}
                />
            )}
        </Paper>
    );
};

export default DataTable;
