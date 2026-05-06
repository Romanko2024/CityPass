import React, { useState } from 'react';
import AdminTables from './AdminTables'; // Винесемо таблицю в окремий файл
import AdminQueries from './AdminQueries';

const AdminPanel = ({ data, currentTable, onTableChange, onDelete, onExecuteQuery }) => {
    const [subTab, setSubTab] = useState('tables'); // 'tables' або 'queries'

    return (
        <div className="card shadow-sm p-4 border-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="btn-group">
                    <button
                        className={`btn ${subTab === 'tables' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                        onClick={() => setSubTab('tables')}
                    >
                        📂 Таблиці
                    </button>
                    <button
                        className={`btn ${subTab === 'queries' ? 'btn-info text-white' : 'btn-outline-info'}`}
                        onClick={() => setSubTab('queries')}
                    >
                        🔍 Спеціальні запити
                    </button>
                </div>
            </div>

            {subTab === 'tables' ? (
                <>
                    <div className="btn-group mb-4 w-100">
                        {['Passengers', 'Trips', 'Routes', 'Transports'].map(t => (
                            <button
                                key={t}
                                className={`btn btn-sm ${currentTable === t ? 'btn-dark' : 'btn-outline-dark'}`}
                                onClick={() => onTableChange(t)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <AdminTables data={data} onDelete={onDelete} currentTable={currentTable} />
                </>
            ) : (
                <AdminQueries onExecuteQuery={onExecuteQuery} />
            )}
        </div>
    );
};

export default AdminPanel;