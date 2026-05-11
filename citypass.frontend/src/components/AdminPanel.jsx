import React, { useState } from 'react';
import AdminTables from './AdminTables';
import AdminQueries from './AdminQueries';

const AdminPanel = ({ data, currentTable, onTableChange, onDelete, onExecuteQuery }) => {
    const [subTab, setSubTab] = useState('tables');

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
                    <div>
                        <AdminQueries onExecuteQuery={onExecuteQuery} />

                        {currentTable.startsWith('Результат:') && data.length > 0 && (
                            <div className="mt-4">
                                <h5 className="text-info border-bottom pb-2">{currentTable}</h5>
                                <div className="list-group">
                                    {data.map((item, idx) => (
                                        <div key={item.id || idx} className="list-group-item list-group-item-action">
                                            <div className="d-flex w-100 justify-content-between">
                                                <h6 className="mb-1">{item.label}</h6>
                                                <small className="text-muted">ID: {item.id}</small>
                                            </div>
                                            <p className="mb-1 text-secondary" style={{ fontSize: '0.9rem' }}>
                                                {item.subLabel}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
            )}
        </div>
    );
};

export default AdminPanel;