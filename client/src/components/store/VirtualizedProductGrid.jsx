import { useMemo } from 'react';
import { AutoSizer, Grid } from 'react-virtualized';
import ProductCard from './ProductCard';
import 'react-virtualized/styles.css';
import './VirtualizedProductGrid.css';

const MIN_CARD_WIDTH = 180;
const ROW_HEIGHT = 360;
const COLUMN_GAP = 16;
const ROW_GAP = 16;

const VirtualizedProductGrid = ({ products = [] }) => {
    const productCount = products.length;

    if (productCount === 0) {
        return null;
    }

    return (
        <div className="store-virtualized-grid">
            <AutoSizer>
                {({ width, height }) => {
                    const columnCount = Math.max(
                        1,
                        Math.floor((width + COLUMN_GAP) / (MIN_CARD_WIDTH + COLUMN_GAP)),
                    );
                    const rowCount = Math.ceil(productCount / columnCount);
                    const columnWidth = width / columnCount;
                    const contentHeight = rowCount * (ROW_HEIGHT + ROW_GAP);
                    const gridHeight = Math.min(height, contentHeight);

                    return (
                        <Grid
                            width={width}
                            height={gridHeight}
                            columnCount={columnCount}
                            rowCount={rowCount}
                            columnWidth={columnWidth}
                            rowHeight={ROW_HEIGHT + ROW_GAP}
                            overscanRowCount={2}
                            overscanColumnCount={1}
                            cellRenderer={({ columnIndex, rowIndex, key, style }) => {
                                const index = rowIndex * columnCount + columnIndex;

                                if (index >= productCount) {
                                    return null;
                                }

                                return (
                                    <div
                                        key={key}
                                        style={{
                                            ...style,
                                            width: columnWidth - COLUMN_GAP,
                                            height: ROW_HEIGHT,
                                            paddingRight: COLUMN_GAP,
                                            paddingBottom: ROW_GAP,
                                        }}
                                        className="store-virtualized-grid-cell"
                                    >
                                        <ProductCard product={products[index]} />
                                    </div>
                                );
                            }}
                        />
                    );
                }}
            </AutoSizer>
        </div>
    );
};

export default VirtualizedProductGrid;
