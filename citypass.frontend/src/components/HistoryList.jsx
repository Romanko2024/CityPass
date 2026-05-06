import React from 'react';

const HistoryList = ({ history }) => {
    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white fw-bold">Останні поїздки</div>
            <div className="list-group list-group-flush" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                {history.length === 0 && <div className="p-3 text-muted">Історія порожня</div>}
                {history.map(trip => (
                    <div key={trip.tripId} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <div className="fw-bold">{trip.routeNumber}</div>
                            <small className="text-muted">{new Date(trip.tripDateTime).toLocaleString()}</small>
                        </div>
                        <span className="badge bg-light text-dark">{trip.finalPrice.toFixed(2)} ₴</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryList;