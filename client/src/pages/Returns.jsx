import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyReturnRequests } from '../apis/return.api';
import { Loader, StatusBadge, useToast } from '../components/ui';
import { showApiError } from '../components/ui/Toast/toastHelpers';
import formatStatusLabel from '../utils/formatStatusLabel';
import './pages.css';

const formatDateTime = (value) => {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleString();
};

const Returns = () => {
    const toast = useToast();
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchReturns = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getMyReturnRequests();
            setReturns(data || []);
        } catch (err) {
            setReturns([]);
            showApiError(toast, err, 'Failed to load your return requests');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchReturns();
    }, [fetchReturns]);

    return (
        <div className="store-page">
            <h1>My Returns</h1>
            <p className="store-page-muted">Track return requests submitted for your orders.</p>

            {loading ? (
                <Loader center label="Loading return requests..." className="py-10" />
            ) : returns.length === 0 ? (
                <>
                    <p className="store-page-muted mt-6">You have not submitted any return requests yet.</p>
                    <Link to="/orders" className="store-page-link">View My Orders</Link>
                </>
            ) : (
                <div className="store-order-list">
                    {returns.map((returnRequest) => (
                        <div key={returnRequest.id} className="store-card">
                            <div className="store-order-header">
                                <div>
                                    <h2 className="store-card-title">{returnRequest.orderNumber}</h2>
                                    <p className="store-card-subtitle">
                                        Requested on {formatDateTime(returnRequest.createdAt)}
                                    </p>
                                </div>
                                <StatusBadge
                                    label={formatStatusLabel(returnRequest.status)}
                                    variant={returnRequest.status}
                                />
                            </div>

                            <div className="store-card-stack store-card-stack--spaced">
                                <div className="store-card-row">
                                    <p className="store-card-row-main">Reason</p>
                                    <p className="store-card-row-meta">{returnRequest.reason}</p>
                                </div>
                                {returnRequest.adminNotes ? (
                                    <div className="store-card-row">
                                        <p className="store-card-row-main">Admin Notes</p>
                                        <p className="store-card-row-meta">{returnRequest.adminNotes}</p>
                                    </div>
                                ) : null}
                            </div>

                            <div className="store-order-card-actions">
                                <Link to={`/orders/${returnRequest.orderId}`} className="store-page-link">
                                    View Order
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Returns;
