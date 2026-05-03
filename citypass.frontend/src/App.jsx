import React, { useState, useEffect } from 'react';

const API_URL = "https://localhost:7297/api";

function App() {
    // --- СТАНИ СИСТЕМИ ---
    const [appMode, setAppMode] = useState('passenger'); // 'passenger', 'controller', 'admin'
    const [loading, setLoading] = useState(true);

    // Стан пасажира
    const [passenger, setPassenger] = useState(null);
    const [history, setHistory] = useState([]);
    const [transportId, setTransportId] = useState(1);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState(50);

    // Стан контролера
    const [searchUID, setSearchUID] = useState("");
    const [verificationResult, setVerificationResult] = useState(null);

    // Стан адміна
    const [adminData, setAdminData] = useState([]);
    const [currentTable, setCurrentTable] = useState('Passengers');

    // --- ЗАВАНТАЖЕННЯ ДАНИХ ---
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

    const fetchAdminData = async (tableName) => {
        setCurrentTable(tableName);
        try {
            const res = await fetch(`${API_URL}/${tableName}`);
            const data = await res.json();
            setAdminData(data);
        } catch {
            alert("Помилка завантаження адмін-даних");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- ФУНКЦІЇ ПАСАЖИРА ---
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
                alert("✅ Проїзд оплачено!");
                fetchData();
            } else {
                const err = await res.text();
                alert("❌ Помилка: " + err);
            }
        } catch { alert("Помилка API"); }
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

    // --- ФУНКЦІЇ КОНТРОЛЕРА ---
    const handleVerify = async (uid) => {
        if (!uid) return alert("Введіть UID картки");
        try {
            const res = await fetch(`${API_URL}/Trips/verify/${uid}?transportId=${transportId}`);
            const result = await res.json();
            setVerificationResult(result);
        } catch { alert("Помилка перевірки"); }
    };

    // --- ФУНКЦІЇ АДМІНІСТРАТОРА ---
    const handleDelete = async (id) => {
        if (window.confirm("Видалити цей запис?")) {
            await fetch(`${API_URL}/${currentTable}/${id}`, { method: 'DELETE' });
            fetchAdminData(currentTable);
        }
    };

    if (loading) return <div className="text-center mt-5">🔌 Підключення до CityPass...</div>;

    return (
        <div className="container mt-4 pb-5">
            {/* ШАПКА ТА НАВІГАЦІЯ */}
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded shadow-sm">
                <h2 className="mb-0">🏙️ CityPass</h2>
                <div className="btn-group">
                    <button className={`btn ${appMode === 'passenger' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setAppMode('passenger')}>👤 Пасажир</button>
                    <button className={`btn ${appMode === 'controller' ? 'btn-dark' : 'btn-outline-dark'}`}
                        onClick={() => setAppMode('controller')}>🛡️ Контролер</button>
                    <button className={`btn ${appMode === 'admin' ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => { setAppMode('admin'); fetchAdminData('Passengers'); }}>⚙️ Адмін</button>
                </div>
            </div>

            <hr />

            {/* РЕЖИМ ПАСАЖИРА */}
            {appMode === 'passenger' && (
                <div className="row mt-4">
                    <div className="col-md-4">
                        <div className="card shadow border-0 bg-primary text-white mb-4">
                            <div className="card-body">
                                <h6 className="opacity-75">Баланс</h6>
                                <h1 className="display-5 fw-bold">{passenger.wallet?.balance.toFixed(2)} ₴</h1>
                                <hr />
                                <div className="small">
                                    <div>👤 {passenger.fullName}</div>
                                    <div>🏷️ Пільга: {passenger.category?.name}</div>
                                </div>
                            </div>
                        </div>
                        <div className="card shadow-sm p-3 border-0">
                            <h6>Поповнення гаманця</h6>
                            <div className="btn-group btn-group-sm mb-3 w-100">
                                {[50, 100, 200].map(m => (
                                    <button key={m} onClick={() => handleTopUp(m)} className="btn btn-outline-primary">+{m}</button>
                                ))}
                            </div>
                            {/* ТУТ ВИКОРИСТОВУЄТЬСЯ setTopUpAmount */}
                            <div className="input-group">
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Сума"
                                    value={topUpAmount}
                                    onChange={(e) => setTopUpAmount(e.target.value)}
                                />
                                <button className="btn btn-primary" onClick={() => handleTopUp()}>OK</button>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 text-center p-4">
                            <h5 className="mb-4">🚍 Валідатор</h5>
                            <select className="form-select mb-3" value={transportId} onChange={(e) => setTransportId(e.target.value)}>
                                <option value="1">Автобус №24</option>
                                <option value="2">Трамвай №3</option>
                                <option value="3">Тролейбус №10</option>
                            </select>

                            {/* ТУТ ВИКОРИСТОВУЄТЬСЯ setIsAnonymous */}
                            <div className="form-check form-switch mb-4 text-start d-inline-block">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="anonSwitch"
                                    checked={isAnonymous}
                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="anonSwitch">Анонімно (без пільг)</label>
                            </div>

                            <button onClick={handleTap} className="btn btn-danger btn-lg w-100 py-4 fw-bold shadow">ПРИКЛАСТИ КАРТКУ</button>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 overflow-hidden">
                            <div className="card-header bg-white fw-bold">Останні поїздки</div>
                            <div className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {history.map(t => (
                                    <div key={t.tripId} className="list-group-item d-flex justify-content-between">
                                        <span>{t.routeNumber}</span>
                                        <span className="text-danger">-{t.finalPrice} ₴</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* РЕЖИМ КОНТРОЛЕРА */}
            {appMode === 'controller' && (
                <div className="row justify-content-center mt-4">
                    <div className="col-md-6 card shadow-lg p-5 text-center border-0">
                        <h4>🔍 Перевірка квитків</h4>
                        <p className="text-muted">Транспортний засіб №{transportId}</p>
                        <div className="input-group mb-4">
                            <input
                                type="text"
                                className="form-control form-control-lg text-center"
                                placeholder="UID: UID-777-999"
                                value={searchUID}
                                onChange={(e) => setSearchUID(e.target.value)}
                            />
                            <button className="btn btn-primary" onClick={() => handleVerify(searchUID)}>ЗЧИТАТИ</button>
                        </div>
                        {verificationResult && (
                            <div className={`alert ${verificationResult.status === 'Valid' ? 'alert-success' : 'alert-danger'}`}>
                                <h2 className="fw-bold">{verificationResult.status === 'Valid' ? "✅ ОПЛАЧЕНО" : "❌ НЕМАЄ ОПЛАТИ"}</h2>
                                <p className="mb-0">{verificationResult.message}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* РЕЖИМ АДМІНІСТРАТОРА */}
            {appMode === 'admin' && (
                <div className="mt-4 card shadow-sm p-4 border-0">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="btn-group">
                            <button className="btn btn-outline-secondary" onClick={() => fetchAdminData('Passengers')}>Пасажири</button>
                            <button className="btn btn-outline-secondary" onClick={() => fetchAdminData('Trips')}>Всі Поїздки</button>
                            <button className="btn btn-outline-secondary" onClick={() => fetchAdminData('Categories')}>Категорії пільг</button>
                        </div>
                        <button className="btn btn-success">+ Додати новий</button>
                    </div>

                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Назва / Подробиці</th>
                                <th className="text-end">Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                            {adminData.map(item => (
                                <tr key={item.passengerId || item.tripId || item.categoryId}>
                                    <td>{item.passengerId || item.tripId || item.categoryId}</td>
                                    <td>{item.fullName || item.routeNumber || item.name}</td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-outline-info me-2">📝</button>
                                        <button className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(item.passengerId || item.tripId || item.categoryId)}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default App;