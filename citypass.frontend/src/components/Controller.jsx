import React, { useState } from 'react';

const Controller = ({ allVehicles, onVerify }) => {
    const [searchUID, setSearchUID] = useState("");
    const [selectedVehicle, setSelectedVehicle] = useState("");
    const [result, setResult] = useState(null);

    const handleCheck = async () => {
        if (!searchUID || !selectedVehicle) return alert("Введіть UID та оберіть транспорт");
        const res = await onVerify(searchUID, selectedVehicle);
        setResult(res);
    };

    return (
        <div className="row justify-content-center mt-4">
            <div className="col-md-6 card shadow-lg p-5 border-0 text-center">
                <h4>🛡️ Контроль квитків</h4>
                <div className="mb-3 text-start">
                    <label className="small text-muted">Оберіть борт, на якому ви знаходитесь:</label>
                    <select
                        className="form-select"
                        value={selectedVehicle}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                    >
                        <option value="">-- Оберіть ТЗ --</option>
                        {allVehicles.map(v => (
                            <option key={v.transportID || v.transportId} value={v.transportID || v.transportId}>
                                {v.type}: №{v.boardNumber}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="input-group mb-4">
                    <input
                        type="text"
                        className="form-control form-control-lg text-center"
                        placeholder="UID картки"
                        value={searchUID}
                        onChange={(e) => setSearchUID(e.target.value)}
                    />
                    <button className="btn btn-dark" onClick={handleCheck}>ПЕРЕВІРИТИ</button>
                </div>
                {result && (
                    <div className={`alert ${result.status === 'Valid' ? 'alert-success' : 'alert-danger shadow-sm'} text-start`}>
                        <div className="text-center">
                            <h2 className="fw-bold">{result.status === 'Valid' ? "✅ ОПЛАЧЕНО" : "❌ НЕ ОПЛАЧЕНО"}</h2>
                            <p>{result.message}</p>
                        </div>
                        {result.status === 'Valid' && result.passengerDetails && (
                            <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border border-success">
                                <h6 className="fw-bold text-success border-bottom pb-1">📄 КАРТКА ПІЛЬГОВИКА</h6>
                                <div className="small">
                                    <div><strong>ПІБ:</strong> {result.passengerDetails.fullName}</div>
                                    <div><strong>UID:</strong> {result.passengerDetails.cardUID}</div>
                                    <div><strong>Використана пільга:</strong> <span className="badge bg-success">{result.passengerDetails.appliedBenefit}</span></div>
                                    <div className="mt-1"><strong>Всі пільги:</strong> {result.passengerDetails.categories.join(", ")}</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Controller;