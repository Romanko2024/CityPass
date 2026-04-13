import React, { useState, useEffect } from 'react';

const API_URL = "https://localhost:7297/api";

function App() {
    const [passenger, setPassenger] = useState(null);
    const [history, setHistory] = useState([]);
    const [transportId, setTransportId] = useState(1);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [loading, setLoading] = useState(true);
    const [topUpAmount, setTopUpAmount] = useState(50);
    const [isControllerMode, setIsControllerMode] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/Passengers/5`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setPassenger(data);

            const histRes = await fetch(`${API_URL}/Passengers/5/history`);
            const histData = await histRes.json();
            setHistory(histData);
        } catch {
            console.error("Сервер не відповідає");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleTap = async () => {
        try {
            const res = await fetch(`${API_URL}/Trips`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    passengerId: 5,
                    transportId: parseInt(transportId),
                    routeNumber: `Маршрут #${Math.floor(Math.random() * 99) + 1}`,
                    isAnonymousTrip: isAnonymous
                })
            });
            if (res.ok) {
                alert("✅ Проїзд оплачено успішно!");
                fetchData();
            } else {
                const err = await res.text();
                alert("❌ Помилка: " + err);
            }
        } catch {
            alert("Помилка з'єднання з API");
        }
    };

    const handleTopUp = async (amount) => {
        const val = amount || topUpAmount;
        await fetch(`${API_URL}/Wallets/${passenger.wallet.walletId}/topup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parseFloat(val))
        });
        fetchData();
    };

    const handleVerify = async () => {
        const res = await fetch(`${API_URL}/Trips/verify/${passenger.cardUID}?transportId=${transportId}`);
        const result = await res.json();
        setVerificationResult(result);
    };

    if (loading) return <div className="text-center mt-5">🔌 Підключення до CityPass...</div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>CityPass System</h2>
                <button className={`btn ${isControllerMode ? 'btn-dark' : 'btn-outline-dark'}`}
                    onClick={() => setIsControllerMode(!isControllerMode)}>
                    {isControllerMode ? "⬅️ Назад до пасажира" : "🛡️ Режим контролера"}
                </button>
            </div>

            {isControllerMode ? (
                /* ПАНЕЛЬ КОНТРОЛЕРА */
                <div className="row justify-content-center">
                    <div className="col-md-6 card shadow-lg p-5 text-center">
                        <h4>🔍 Перевірка квитків</h4>
                        <p className="text-muted">Транспортний засіб №{transportId}</p>
                        <button onClick={handleVerify} className="btn btn-primary btn-lg w-100 py-3 mb-4">
                            ЗЧИТАТИ КАРТКУ
                        </button>
                        {verificationResult && (
                            <div className={`alert ${verificationResult.status === 'Valid' ? 'alert-success' : 'alert-danger'}`}>
                                <h2 className="fw-bold">{verificationResult.status === 'Valid' ? "✅ ОПЛАЧЕНО" : "❌ НЕОПЛАЧЕНО"}</h2>
                                <p className="mb-0">{verificationResult.message}</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* ПАНЕЛЬ ПАСАЖИРА */
                <div className="row">
                    <div className="col-md-4">
                        <div className="card shadow border-0 bg-gradient bg-primary text-white mb-4">
                            <div className="card-body">
                                <h6 className="opacity-75">Мій баланс</h6>
                                <h1 className="display-5 fw-bold">{passenger.wallet?.balance.toFixed(2)} ₴</h1>
                                <hr />
                                <div className="small">
                                    <div>👤 {passenger.fullName}</div>
                                    <div>🏷️ Пільга: {passenger.category?.name} ({passenger.category?.discountPercent}%)</div>
                                </div>
                            </div>
                        </div>

                        <div className="card shadow-sm p-3 border-0">
                            <h6>Поповнення</h6>
                            <div className="btn-group btn-group-sm mb-3">
                                {[50, 100, 200].map(m => (
                                    <button key={m} onClick={() => handleTopUp(m)} className="btn btn-outline-primary">+{m}</button>
                                ))}
                            </div>
                            <div className="input-group">
                                <input type="number" className="form-control" placeholder="Сума"
                                    onChange={(e) => setTopUpAmount(e.target.value)} />
                                <button className="btn btn-primary" onClick={() => handleTopUp()}>OK</button>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 h-100 text-center p-4">
                            <h5 className="mb-4">🚍 Валідатор</h5>
                            <select className="form-select mb-3 form-select-lg" value={transportId}
                                onChange={(e) => setTransportId(e.target.value)}>
                                <option value="1">Автобус №24</option>
                                <option value="2">Трамвай №3</option>
                                <option value="3">Тролейбус №10</option>
                            </select>
                            <div className="form-check form-switch mb-4 text-start">
                                <input className="form-check-input" type="checkbox" checked={isAnonymous}
                                    onChange={() => setIsAnonymous(!isAnonymous)} />
                                <label className="form-check-label">Анонімно (без пільг)</label>
                            </div>
                            <button onClick={handleTap} className="btn btn-danger btn-lg w-100 py-4 fw-bold shadow">
                                ПРИКЛАСТИ КАРТКУ
                            </button>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-header bg-white fw-bold">Останні транзакції</div>
                            <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: '400px' }}>
                                {history.map(t => (
                                    <div key={t.tripId} className="list-group-item d-flex justify-content-between align-items-start">
                                        <div>
                                            <div className="fw-bold">{t.routeNumber}</div>
                                            <div className="text-muted extra-small">{new Date(t.tripDateTime).toLocaleString()}</div>
                                        </div>
                                        <span className="badge bg-light text-danger">-{t.finalPrice} ₴</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;