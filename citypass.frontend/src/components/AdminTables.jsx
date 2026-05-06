import React from 'react';

const AdminTables = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="p-3 text-muted">Даних не знайдено</div>;
    }
    const headers = Object.keys(data[0]).filter(key => key !== 'id');

    return (
        <div className="table-responsive">
            <table className="table table-sm table-hover align-middle">
                <thead className="table-light">
                    <tr>
                        <th style={{ width: '70px' }}>ID</th>
                        {headers.map(h => (
                            <th key={h} className="text-capitalize">
                                {h === 'label' ? 'Назва' : h === 'subLabel' ? 'Деталі' : h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, idx) => (
                        <tr key={idx}>
                            <td className="text-muted fw-bold">{item.id || item.Id || idx + 1}</td>
                            {headers.map(h => (
                                <td key={h}>{item[h]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminTables;