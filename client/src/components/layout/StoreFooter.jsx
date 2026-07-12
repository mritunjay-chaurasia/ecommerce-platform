import { Link } from 'react-router-dom';
import { useStoreSettings } from '../../context/StoreSettingsProvider';
import './StoreFooter.css';

const STATIC_PAGE_LINKS = [
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
    { path: '/faq', label: 'FAQ' },
    { path: '/terms', label: 'Terms' },
    { path: '/privacy', label: 'Privacy' },
];

const StoreFooter = () => {
    const { settings } = useStoreSettings();
    const storeName = settings?.storeName || 'Store';
    const hasContact = settings?.contactEmail || settings?.contactPhone || settings?.supportAddress;
    const hasPolicy = Boolean(settings?.returnPolicy?.trim());

    return (
        <footer className="store-footer">
            <div className="store-footer-inner">
                <div className="store-footer-grid">
                    <div className="store-footer-block">
                        <h2>{storeName}</h2>
                        <p className="store-footer-muted">Your trusted online shopping destination.</p>
                    </div>

                    <div className="store-footer-block">
                        <h3>Quick Links</h3>
                        {STATIC_PAGE_LINKS.map((link) => (
                            <p key={link.path}>
                                <Link to={link.path}>{link.label}</Link>
                            </p>
                        ))}
                    </div>

                    {hasContact ? (
                        <div className="store-footer-block">
                            <h3>Contact</h3>
                            {settings.contactEmail ? (
                                <p>
                                    <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
                                </p>
                            ) : null}
                            {settings.contactPhone ? <p>{settings.contactPhone}</p> : null}
                            {settings.supportAddress ? (
                                <p className="store-footer-muted">{settings.supportAddress}</p>
                            ) : null}
                        </div>
                    ) : null}

                    {hasPolicy ? (
                        <div className="store-footer-block store-footer-block--wide">
                            <h3>Return Policy</h3>
                            <p className="store-footer-policy">{settings.returnPolicy}</p>
                        </div>
                    ) : null}
                </div>

                <p className="store-footer-copy">
                    © {new Date().getFullYear()} {storeName}. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default StoreFooter;
