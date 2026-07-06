import { Link } from 'react-router-dom';
import './pages.css';

const NotFound = () => {
    return (
        <div className="page">
            <h1>404</h1>
            <p>Page not found.</p>
            <Link to="/" className="btn">Go Home</Link>
        </div>
    );
};

export default NotFound;
