import { useState } from 'react';
import { DEFAULT_PRODUCT_IMAGE, getProductImageUrl } from '../../utils/imageUrl';

const ProductImage = ({ src, alt, className = '' }) => {
    const [imageSrc, setImageSrc] = useState(() => getProductImageUrl(src));
    const isPlaceholder = imageSrc === DEFAULT_PRODUCT_IMAGE;

    const handleError = () => {
        setImageSrc((current) => (
            current === DEFAULT_PRODUCT_IMAGE ? current : DEFAULT_PRODUCT_IMAGE
        ));
    };

    return (
        <img
            src={imageSrc}
            alt={alt}
            className={`${className}${isPlaceholder ? ' product-image-placeholder' : ''}`.trim()}
            loading="lazy"
            onError={handleError}
        />
    );
};

export default ProductImage;
