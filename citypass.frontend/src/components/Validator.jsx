import React, { useState } from 'react';

const Validator = ({ routes, allVehicles, passenger, onTap }) => {
    const [type, setType] = useState("1");
    const [route, setRoute] = useState("");
    const [vehicleId, setVehicleId] = useState("");
    const [benefit, setBenefit] = useState("");
    const [isAnon, setIsAnon] = useState(false);

    // МАРШРУТИ
    const filteredRoutes = routes.filter(r => {
        const rTypeId = r.transportId || r.TransportId;
        return String(rTypeId) === String(type);
    });

    // ТРАНСПОРТ
    const mapping = { "1": "Автобус", "2": "Трамвай", "3": "Тролейбус" };
    const filteredVehicles = allVehicles.filter(v => {
        const vType = v.type || v.Type;
        return vType === mapping[type];
    });

    const activeRoute = route || (filteredRoutes[0]?.routeNumber || "");
    const activeVehicleId = vehicleId || (filteredVehicles[0]?.transportID || filteredVehicles[0]?.transportId || "");

    const handleTypeChange = (e) => {
        setType(e.target.value);
        setRoute("");
        setVehicleId("");
    };

    return (
        <div className="card shadow-sm border-0 p-4">
            <h5 className="text-center mb-3">🚍 Валідатор</h5>

            <label className="small text-muted">Тип транспорту:</label>
            <select className="form-select mb-2" value={type} onChange={handleTypeChange}>
                <option value="1">Автобус</option>
                <option value="2">Трамвай</option>
                <option value="3">Тролейбус</option>
            </select>

            <label className="small text-muted">Маршрут:</label>
            <select
                className="form-select mb-2"
                value={activeRoute}
                onChange={(e) => setRoute(e.target.value)}
                disabled={filteredRoutes.length === 0}
            >
                {filteredRoutes.length > 0 ? (
                    filteredRoutes.map(r => (
                        <option key={r.routeId || r.RouteId} value={r.routeNumber || r.RouteNumber}>
                            №{r.routeNumber || r.RouteNumber} — {r.description || r.Description}
                        </option>
                    ))
                ) : (
                    <option value="">Маршрути відсутні</option>
                )}
            </select>

            <label className="small text-muted">Бортовий номер (ТЗ):</label>
            <select
                className="form-select mb-3"
                value={activeVehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                disabled={filteredVehicles.length === 0}
            >
                {filteredVehicles.length > 0 ? (
                    filteredVehicles.map(v => (
                        <option key={v.transportID || v.transportId} value={v.transportID || v.transportId}>
                            {v.boardNumber || v.BoardNumber}
                        </option>
                    ))
                ) : (
                    <option value="">Транспорт відсутній</option>
                )}
            </select>

            {/* Пільги */}
            {passenger?.passengerCategories?.length > 0 && (
                <div className="mb-3">
                    <label className="small text-muted">Вибрати пільгу:</label>
                    <select className="form-select" value={benefit} onChange={(e) => setBenefit(e.target.value)}>
                        <option value="">Повний тариф</option>
                        {passenger.passengerCategories.map(pc => (
                            <option key={pc.categoryId} value={pc.categoryId}>
                                {pc.category?.name || `Категорія ${pc.categoryId}`}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" checked={isAnon} onChange={(e) => setIsAnon(e.target.checked)} id="anon" />
                <label className="form-check-label" htmlFor="anon">Анонімна поїздка</label>
            </div>

            <button
                onClick={() => onTap({
                    vehicleId: activeVehicleId,
                    route: activeRoute,
                    isAnon,
                    benefit
                })}
                className="btn btn-danger btn-lg w-100 fw-bold shadow"
                disabled={!activeVehicleId}
            >
                ПРИКЛАСТИ КАРТКУ
            </button>
        </div>
    );
};

export default Validator;