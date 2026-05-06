import React, { useState } from 'react';

const WalletCard = ({ passenger, onTopUp }) => {
    const [customAmount, setCustomAmount] = useState("");

    return (
        <div className="card-container">
            <div className="card shadow border-0 bg-primary text-white mb-4">
                <div className="card-body">
                    <h6 className="opacity-75">Мій баланс</h6>
                    <h1 className="display-5 fw-bold">{passenger?.wallet?.balance.toFixed(2)} ₴</h1>
                    <hr />
                    <small>👤 {passenger?.fullName}</small>
                </div>
            </div>
            <div className="card shadow-sm p-3 border-0">
                <h6>Поповнити рахунок:</h6>
                <div className="btn-group btn-group-sm w-100 mb-3">
                    {[50, 100, 200].map(amt => (
                        <button key={amt} onClick={() => onTopUp(amt)} className="btn btn-outline-primary">+{amt}</button>
                    ))}
                </div>
                <div className="input-group">
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Сума поповнення"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={() => { onTopUp(customAmount); setCustomAmount(""); }}
                        disabled={!customAmount || customAmount <= 0}
                    >
                        ОК
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WalletCard;