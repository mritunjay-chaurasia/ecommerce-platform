import { Link, useLocation } from 'react-router-dom';
import staticPages from '../content/staticPages';
import './pages.css';

const PAGE_PATH_MAP = {
    '/about': 'about',
    '/contact': 'contact',
    '/faq': 'faq',
    '/terms': 'terms',
    '/privacy': 'privacy',
};

const StaticPage = () => {
    const { pathname } = useLocation();
    const pageKey = PAGE_PATH_MAP[pathname];
    const page = staticPages[pageKey];

    if (!page) {
        return (
            <div className="store-page">
                <h1>Page Not Found</h1>
                <p className="store-page-muted">The page you are looking for is unavailable.</p>
                <Link to="/" className="store-page-link">Back to store</Link>
            </div>
        );
    }

    const isFaq = pageKey === 'faq';

    return (
        <div className="store-page">
            <h1>{page.title}</h1>

            <div className="store-card store-static-page-content">
                {isFaq ? (
                    <div className="store-faq-list">
                        {page.content.map((entry) => (
                            <article key={entry.question} className="store-faq-item">
                                <h2 className="store-faq-question">{entry.question}</h2>
                                <p className="store-faq-answer">{entry.answer}</p>
                            </article>
                        ))}
                    </div>
                ) : (
                    page.content.map((paragraph) => (
                        <p key={paragraph} className="store-static-paragraph">{paragraph}</p>
                    ))
                )}
            </div>
        </div>
    );
};

export default StaticPage;
