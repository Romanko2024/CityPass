import React from 'react';

const AdminTables = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="p-3 text-muted">Даних не знайдено</div>;
    }

    //філтрація тех полів та ID
    const headers = Object.keys(data[0]).filter(key =>
        key !== 'id' &&
        key !== 'passengerId' &&
        key !== 'transportId' &&
        key !== 'routeId' &&
        key !== 'walletId'
    );
    const formatCellValue = (value, header) => {
        if (value === null || value === undefined) return '-';

        if (header === 'wallet') {
            return `${value.balance} грн (${value.status})`;
        }

        if (header === 'passengerCategories' && Array.isArray(value)) {
            if (value.length === 0) return 'Звичайна';
            return value.map(pc => pc.category?.name).join(', ');
        }

        if (header === 'route' && value.routeNumber) {
            return value.routeNumber;
        }

        if (Array.isArray(value)) return `Кількість: ${value.length}`;

        if (typeof value === 'boolean') return value ? '✅' : '❌';

        return value.toString();
    };

    const translateHeader = (h) => {
        const dict = {
            fullName: 'ПІБ',
            cardUID: 'UID Картки',
            wallet: 'Гаманець/Баланс',
            passengerCategories: 'Категорії',
            type: 'Тип',
            boardNumber: 'Бортовий №',
            routeNumber: '№ Маршруту',
            description: 'Опис',
            tripDateTime: 'Дата/Час',
            finalPrice: 'Ціна',
            standardPriceAtMoment: 'Тариф'
        };
        return dict[h] || h;
    };

    return (
        <div className="table-responsive">
            <table className="table table-sm table-hover align-middle">
                <thead className="table-light">
                    <tr>
                        <th style={{ width: '70px' }}>ID</th>
                        {headers.map(h => (
                            <th key={h} className="text-capitalize">
                                {translateHeader(h)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, idx) => (
                        <tr key={idx}>
                            <td className="text-muted fw-bold">
                                {item.passengerId || item.tripId || item.routeId || item.transportID || idx + 1}
                            </td>
                            {headers.map(h => (
                                <td key={h}>
                                    {formatCellValue(item[h], h)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminTables;