import React, { useState, useEffect } from 'react';
import WalletCard from './components/WalletCard';
import Validator from './components/Validator';
import HistoryList from './components/HistoryList';
import AdminPanel from './components/AdminPanel';
import Controller from './components/Controller';

const API_URL = "https://localhost:7297/api";

function App() {
    const [appMode, setAppMode] = useState('passenger'); // 'passenger', 'admin', 'controller'
    const [loading, setLoading] = useState(true);
    const [passenger, setPassenger] = useState(null);
    const [history, setHistory] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [allVehicles, setAllVehicles] = useState([]);
    const [adminData, setAdminData] = useState([]);
    const [currentTable, setCurrentTable] = useState('Passengers');

    const fetchData = async () => {
        try {
            const fetchResource = async (path) => {
                const res = await fetch(`${API_URL}/${path}`);
                if (!res.ok) {
                    console.warn(`Запит до ${path} завершився помилкою ${res.status}`);
                    return [];
                }
                return await res.json();
            };

            const [dataP, dataH, dataR, dataV] = await Promise.all([
                fetchResource("Passengers/5"),
                fetchResource("Passengers/5/history"),
                fetchResource("Routes"),
                fetchResource("Transports")
            ]);

            setPassenger(Array.isArray(dataP) ? dataP[0] : dataP);
            setHistory(dataH);
            setRoutes(dataR);
            setAllVehicles(dataV);
        } catch (err) {
            console.error("Критична помилка API:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleTap = async (data) => {
        const res = await fetch(`${API_URL}/Trips`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                passengerId: data.isAnon ? null : 5,
                transportId: parseInt(data.vehicleId),
                routeId: parseInt(data.routeId),
                isAnonymousTrip: data.isAnon,
                selectedCategoryId: data.benefit ? parseInt(data.benefit) : null
            })
        });
        if (res.ok) { alert("✅ Успішно!"); fetchData(); }
        else alert("❌ Помилка оплати");
    };

    const handleTopUp = async (amount) => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) return alert("Некоректна сума");

        const res = await fetch(`${API_URL}/Wallets/${passenger.wallet.walletId}/topup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(numericAmount)
        });
        if (res.ok) { alert("💰 Баланс поповнено!"); fetchData(); }
    };

    const fetchAdminData = async (tableName) => {
        setCurrentTable(tableName);
        const res = await fetch(`${API_URL}/${tableName}`);
        setAdminData(await res.json());
    };

    const handleAdminDelete = async (id) => {
        if (!window.confirm("Видалити цей запис?")) return;
        try {
            const res = await fetch(`${API_URL}/${currentTable}/${id}`, { method: 'DELETE' });
            if (res.ok) fetchAdminData(currentTable);
            else alert("Помилка видалення");
        } catch (err) { console.error(err); }
    };

    const handleVerify = async (uid, vId) => {
        try {
            const res = await fetch(`${API_URL}/Trips/verify/${uid}?transportId=${vId}`);
            if (res.ok) return await res.json();
            return { status: "Error", message: "Дані не знайдено" };
        } catch { return { status: "Error", message: "Помилка зв'язку" }; }
    };

    if (loading) return <div className="p-5 text-center">Завантаження...</div>;

    const handleExecuteQuery = async (queryId, param) => {
        let url = `${API_URL}/Admin/Queries/${queryId}`;
        if (param) url += `?param=${param}`;

        try {
            const res = await fetch(url);
            const result = await res.json();

            console.table(result);
            alert(`Запит виконано! Знайдено записів: ${result.length || 0}. Результати в консолі.`);

            setAdminData(result);
            setCurrentTable(`Результат: ${queryId}`);
        } catch {
            alert("Помилка виконання запиту.");
        }
    };

    return (
        <div className="container mt-4">
            <header className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded shadow-sm">
                <h2 className="mb-0">🏙️ CityPass</h2>
                <div className="btn-group">
                    <button className={`btn ${appMode === 'passenger' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setAppMode('passenger')}>👤 Пасажир</button>
                    <button className={`btn ${appMode === 'controller' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setAppMode('controller')}>🛡️ Контролер</button>
                    <button className={`btn ${appMode === 'admin' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => { setAppMode('admin'); fetchAdminData('Passengers'); }}>⚙️ Адмін</button>
                </div>
            </header>

            {appMode === 'passenger' && (
                <div className="row">
                    <div className="col-md-4"><WalletCard passenger={passenger} onTopUp={handleTopUp} /></div>
                    <div className="col-md-4"><Validator routes={routes} allVehicles={allVehicles} passenger={passenger} onTap={handleTap} /></div>
                    <div className="col-md-4"><HistoryList history={history} /></div>
                </div>
            )}

            {appMode === 'controller' && (
                <Controller allVehicles={allVehicles} onVerify={handleVerify} />
            )}

            {appMode === 'admin' && (
                <AdminPanel
                    data={adminData}
                    currentTable={currentTable}
                    onTableChange={fetchAdminData}
                    onDelete={handleAdminDelete}
                    onExecuteQuery={handleExecuteQuery}
                />
            )}
        </div>
    );
}
export default App;