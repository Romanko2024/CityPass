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
                    <div className={`alert ${result.status === 'Valid' ? 'alert-success' : 'alert-danger shadow-sm'}`}>
                        <h2 className="fw-bold">{result.status === 'Valid' ? "✅ ОПЛАЧЕНО" : "❌ НЕ ОПЛЕЧЕНО"}</h2>
                        <p className="mb-0">{result.message}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Controller;