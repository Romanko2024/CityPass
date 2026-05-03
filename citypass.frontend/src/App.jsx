import React, { useState, useEffect } from 'react';

// === КОНФІГУРАЦІЯ API ===
const API_URL = "https://localhost:7297/api";

function App() {
    // === 1. СТАНИ СИСТЕМИ (UI STATES) ===
    const [appMode, setAppMode] = useState('passenger'); // 'passenger', 'controller', 'admin'
    const [loading, setLoading] = useState(true);

    // === 2. СТАНИ ДЛЯ ПАЙПЛАЙНУ ПОЇЗДКИ (TRIP DATA) ===
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState("");
    const [selectedBenefit, setSelectedBenefit] = useState("");

    // === 3. СТАН ПАСАЖИРА (PASSENGER STATE) ===
    const [passenger, setPassenger] = useState(null);
    const [history, setHistory] = useState([]);
    const [transportId, setTransportId] = useState(1);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState(50);

    // === 4. СТАН КОНТРОЛЕРА (CONTROLLER STATE) ===
    const [searchUID, setSearchUID] = useState("");
    const [verificationResult, setVerificationResult] = useState(null);

    // === 5. СТАН АДМІНІСТРАТОРА (ADMIN STATE) ===
    const [adminData, setAdminData] = useState([]);
    const [currentTable, setCurrentTable] = useState('Passengers');

    // === 6. ЗАВАНТАЖЕННЯ ДАНИХ (FETCHING) ===
    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/Passengers/5`);
            if (!res.ok) throw new Error("Пасажира не знайдено");
            const data = await res.json();
            setPassenger(data);

            const histRes = await fetch(`${API_URL}/Passengers/5/history`);
            const histData = await histRes.json();
            setHistory(histData);
        } catch (err) {
            console.error("Помилка завантаження даних пасажира:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoutes = async () => {
        try {
            const res = await fetch(`${API_URL}/Routes`);
            const data = await res.json();
            setRoutes(data);
            if (data.length > 0) setSelectedRoute(data[0].routeNumber);
        } catch (err) {
            console.error("Помилка завантаження маршрутів:", err);
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
        fetchRoutes();
    }, []);

    // === 7. ЛОГІКА ПАСАЖИРА (PASSENGER ACTIONS) ===
    const handleTap = async () => {
        try {
            const res = await fetch(`${API_URL}/Trips`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    passengerId: 5,
                    transportId: parseInt(transportId),
                    routeNumber: selectedRoute,
                    isAnonymousTrip: isAnonymous,
                    selectedCategoryId: selectedBenefit ? parseInt(selectedBenefit) : null
                })
            });

            if (res.ok) {
                alert("✅ Проїзд оплачено!");
                fetchData();
            } else {
                const err = await res.text();
                alert("❌ Помилка: " + err);
            }
        } catch {
            alert("Помилка підключення до сервера");
        }
    };

    const handleTopUp = async (amount) => {
        const val = amount || topUpAmount;
        if (!val || val <= 0) return alert("Введіть коректну суму");

        try {
            const res = await fetch(`${API_URL}/Wallets/${passenger.wallet.walletId}/topup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parseFloat(val))
            });
            if (res.ok) {
                alert("💰 Рахунок поповнено!");
                fetchData();
            }
        } catch {
            alert("Помилка поповнення");
        }
    };

    // === 8. ЛОГІКА КОНТРОЛЕРА (CONTROLLER ACTIONS) ===
    const handleVerify = async (uid) => {
        if (!uid) return alert("Введіть UID");
        setVerificationResult(null);
        try {
            const res = await fetch(`${API_URL}/Trips/verify/${uid}?transportId=${transportId}`);
            if (res.ok) {
                const result = await res.json();
                setVerificationResult(result);
            } else {
                alert("Картку не знайдено");
            }
        } catch (err) {
            console.error(err);
            alert("Помилка підключення");
        }
    };

    // === 9. ЛОГІКА АДМІНІСТРАТОРА (ADMIN ACTIONS) ===
    const handleDelete = async (id) => {
        if (window.confirm("Видалити цей запис?")) {
            await fetch(`${API_URL}/${currentTable}/${id}`, { method: 'DELETE' });
            fetchAdminData(currentTable);
        }
    };

    // === 10. ЕКРАН ЗАВАНТАЖЕННЯ ===
    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="text-center">
                <div className="spinner-border text-primary mb-2"></div>
                <div>🔌 Підключення до CityPass...</div>
            </div>
        </div>
    );

    // === 11. ОСНОВНИЙ РЕНДЕР (UI) ===
    return (
        <div className="container mt-4 pb-5">

            {/* --- ШАПКА ТА НАВІГАЦІЯ --- */}
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

            {/* --- РЕЖИМ ПАСАЖИРА --- */}
            {appMode === 'passenger' && (
                <div className="row mt-4">
                    {/* Картка балансу */}
                    <div className="col-md-4">
                        <div className="card shadow border-0 bg-primary text-white mb-4">
                            <div className="card-body">
                                <h6 className="opacity-75">Поточний баланс</h6>
                                <h1 className="display-5 fw-bold">{passenger.wallet?.balance.toFixed(2)} ₴</h1>
                                <hr />
                                <div className="small">
                                    <div className="fw-bold">👤 {passenger.fullName}</div>
                                    <div>🏷️ Пільги: {passenger.passengerCategories?.length > 0
                                        ? passenger.passengerCategories.map(pc => pc.category.name).join(", ")
                                        : "Немає пільг"}</div>
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
                            <div className="input-group">
                                <input type="number" className="form-control" placeholder="Сума"
                                    value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} />
                                <button className="btn btn-primary" onClick={() => handleTopUp()}>OK</button>
                            </div>
                        </div>
                    </div>

                    {/* Валідатор */}
                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 text-center p-4">
                            <h5 className="mb-4">🚍 Валідатор проїзду</h5>

                            <label className="small text-muted d-block text-start">Оберіть маршрут:</label>
                            <select className="form-select mb-3" value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)}>
                                {routes.map(r => (
                                    <option key={r.routeId} value={r.routeNumber}>
                                        №{r.routeNumber} — {r.description}
                                    </option>
                                ))}
                            </select>

                            {!isAnonymous && passenger.passengerCategories?.length > 0 && (
                                <>
                                    <label className="small text-muted d-block text-start">Використати пільгу:</label>
                                    <select className="form-select mb-3 border-primary" value={selectedBenefit}
                                        onChange={(e) => setSelectedBenefit(e.target.value)}>
                                        <option value="">Без пільги (Стандартний тариф)</option>
                                        {passenger.passengerCategories.map(pc => (
                                            <option key={pc.categoryId} value={pc.categoryId}>{pc.category.name}</option>
                                        ))}
                                    </select>
                                </>
                            )}

                            <div className="form-check form-switch mb-4 text-start d-inline-block">
                                <input className="form-check-input" type="checkbox" id="anonSwitch"
                                    checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
                                <label className="form-check-label" htmlFor="anonSwitch">Анонімна поїздка</label>
                            </div>

                            <button onClick={handleTap} className="btn btn-danger btn-lg w-100 py-4 fw-bold shadow">
                                ПРИКЛАСТИ КАРТКУ
                            </button>
                        </div>
                    </div>

                    {/* Історія поїздок */}
                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 overflow-hidden">
                            <div className="card-header bg-white fw-bold">Останні поїздки</div>
                            <div className="list-group list-group-flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {history.length > 0 ? history.map(t => (
                                    <div key={t.tripId} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-bold">Маршрут №{t.routeNumber}</div>
                                            <small className="text-muted">{new Date(t.tripDateTime).toLocaleString()}</small>
                                        </div>
                                        <span className={`fw-bold ${t.finalPrice === 0 ? 'text-success' : 'text-danger'}`}>
                                            {t.finalPrice > 0 ? `-${t.finalPrice.toFixed(2)} ₴` : "Безкоштовно"}
                                        </span>
                                    </div>
                                )) : <div className="p-3 text-center text-muted">Поїздок ще немає</div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- РЕЖИМ КОНТРОЛЕРА --- */}
            {appMode === 'controller' && (
                <div className="row justify-content-center mt-4">
                    <div className="col-md-6 card shadow-lg p-5 text-center border-0">
                        <h4>🔍 Перевірка квитків</h4>
                        <p className="text-muted small">Оберіть тип транспорту для перевірки:</p>
                        <select className="form-select mb-4" value={transportId} onChange={(e) => setTransportId(e.target.value)}>
                            <option value="1">Автобуси</option>
                            <option value="2">Трамваї</option>
                            <option value="3">Тролейбуси</option>
                        </select>

                        <div className="input-group mb-4">
                            <input type="text" className="form-control form-control-lg text-center"
                                placeholder="UID: UID-777-999" value={searchUID}
                                onChange={(e) => setSearchUID(e.target.value)} />
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

            {/* --- РЕЖИМ АДМІНІСТРАТОРА --- */}
            {appMode === 'admin' && (
                <div className="mt-4 card shadow-sm p-4 border-0">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="btn-group">
                            <button className="btn btn-outline-secondary" onClick={() => fetchAdminData('Passengers')}>Пасажири</button>
                            <button className="btn btn-outline-secondary" onClick={() => fetchAdminData('Trips')}>Всі Поїздки</button>
                            <button className="btn btn-outline-secondary" onClick={() => fetchAdminData('Categories')}>Категорії пільг</button>
                            <button className="btn btn-outline-secondary" onClick={() => fetchAdminData('Routes')}>Маршрути</button>
                        </div>
                    </div>

                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Назва / Основна інфо</th>
                                <th className="text-end">Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                            {adminData.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.passengerId || item.tripId || item.categoryId || item.routeId}</td>
                                    <td>{item.fullName || item.routeNumber || item.name}</td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-outline-info me-2">📝</button>
                                        <button className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(item.passengerId || item.tripId || item.categoryId || item.routeId)}>🗑️</button>
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