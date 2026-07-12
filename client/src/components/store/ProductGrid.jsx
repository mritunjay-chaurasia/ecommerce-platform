import ProductCard from './ProductCard';
import './ProductGrid.css';

const ProductGrid = ({ products = [] }) => {
    if (products.length === 0) {
        return null;
    }

    return (
        <div className="store-product-grid">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};

export default ProductGrid;
