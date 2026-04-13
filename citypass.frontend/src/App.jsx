import React, { useState, useEffect } from 'react';

const API_URL = "https://localhost:7297/api";

function App() {
    const [passenger, setPassenger] = useState(null);
    const [history, setHistory] = useState([]);
    const [transportId, setTransportId] = useState(1);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchPassengerData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/Passengers/5`);
            if (!res.ok) throw new Error("Пасажира не знайдено");

            const data = await res.json();
            setPassenger(data);

            const histRes = await fetch(`${API_URL}/Passengers/5/history`);
            if (histRes.ok) {
                const histData = await histRes.json();
                setHistory(histData);
            }
        } catch (error) {
            console.error("Помилка завантаження:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPassengerData(); }, []);

    const handleTap = async () => {
        const tripData = {
            passengerId: 5,
            transportId: parseInt(transportId),
            routeNumber: "Маршрут №24",
            isAnonymousTrip: isAnonymous
        };

        const res = await fetch(`${API_URL}/Trips`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tripData)
        });

        if (res.ok) {
            alert("Оплата успішна!");
            fetchPassengerData();
        } else {
            const err = await res.text();
            alert("Помилка: " + err);
        }
    };

    const handleTopUp = async () => {
        if (!passenger?.wallet?.walletId) return;

        await fetch(`${API_URL}/Wallets/${passenger.wallet.walletId}/topup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(50)
        });
        fetchPassengerData();
    };

    if (loading) {
        return (
            <div className="container p-5 text-center">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-3">З'єднуємося з базою даних...</p>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">💳 CityPass Simulator</h2>

            <div className="row">
                {/* ЛІВА ПАНЕЛЬ Картка пасажира */}
                <div className="col-md-4">
                    <div className="card shadow mb-4">
                        <div className="card-header bg-primary text-white">Мій Гаманець</div>
                        <div className="card-body">
                            <h5>{passenger?.fullName || "Анонімний користувач"}</h5>
                            <p className="text-muted small">UID: {passenger?.cardUID || "---"}</p>
                            <hr />
                            <h3 className="text-success">
                                {passenger?.wallet?.balance?.toFixed(2) ?? "0.00"} грн
                            </h3>
                            <button onClick={handleTopUp} className="btn btn-outline-primary btn-sm w-100 mt-2">
                                Поповнити на 50 грн
                            </button>
                        </div>
                    </div>
                </div>

                {/* ЦЕНТР Валідатор */}
                <div className="col-md-4">
                    <div className="card shadow mb-4 border-warning">
                        <div className="card-header bg-warning text-dark text-center fw-bold">ВАЛІДАТОР</div>
                        <div className="card-body text-center">
                            <label className="form-label small">Оберіть Транспорт</label>
                            <select className="form-select mb-3" value={transportId} onChange={(e) => setTransportId(e.target.value)}>
                                <option value="1">Автобус AA 1234</option>
                                <option value="2">Трамвай TT 5555</option>
                            </select>

                            <div className="form-check form-switch mb-3 text-start">
                                <input className="form-check-input" type="checkbox" checked={isAnonymous} onChange={() => setIsAnonymous(!isAnonymous)} />
                                <label className="form-check-label small">Анонімна поїздка (без пільг)</label>
                            </div>

                            <button onClick={handleTap} className="btn btn-danger btn-lg w-100 py-3 shadow-sm">ПРИКЛАСТИ КАРТКУ</button>
                        </div>
                    </div>
                </div>

                {/* ПРАВА ПАНЕЛЬ Історія */}
                <div className="col-md-4">
                    <div className="card shadow shadow-sm overflow-auto" style={{ maxHeight: '400px' }}>
                        <div className="card-header bg-dark text-white">Останні поїздки</div>
                        <ul className="list-group list-group-flush">
                            {history.length > 0 ? (
                                history.map(trip => (
                                    <li key={trip.tripId} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <small className="d-block text-muted">{new Date(trip.tripDateTime).toLocaleTimeString()}</small>
                                            <span>{trip.routeNumber || "Маршрут"}</span>
                                        </div>
                                        <span className="badge bg-secondary">-{trip.finalPrice} ₴</span>
                                    </li>
                                ))
                            ) : (
                                <li className="list-group-item text-center text-muted">Поїздок ще не було</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;