import React from 'react';

const AdminPanel = ({ data, currentTable, onTableChange, onDelete }) => {
    const tables = [
        { id: 'Passengers', label: 'Пасажири' },
        { id: 'Trips', label: 'Поїздки' },
        { id: 'Routes', label: 'Маршрути' }
    ];

    return (
        <div className="card shadow-sm p-4 border-0">
            <div className="btn-group mb-4">
                {tables.map(t => (
                    <button
                        key={t.id}
                        className={`btn ${currentTable === t.id ? 'btn-secondary' : 'btn-outline-secondary'}`}
                        onClick={() => onTableChange(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Назва/Дані</th>
                            <th className="text-end">Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, idx) => {
                            const id = item.passengerId || item.tripId || item.routeId;
                            const label = item.fullName || item.routeNumber || `Запис #${id}`;
                            return (
                                <tr key={idx}>
                                    <td>{id}</td>
                                    <td>{label}</td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(id)}>
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;