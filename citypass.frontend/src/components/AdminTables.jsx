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
        key !== 'walletId' &&
        key !== 'tripDiscounts' &&
        key !== 'transportID'
    );

    const formatCellValue = (value, header) => {
        if (value === null || value === undefined) return '-';

        // Форматування для таблиці Маршрутів (Transport об'єкт)
        if (header === 'transport' && value) {
            return `${value.type || 'ТЗ'} (${value.boardNumber || 'б/н'})`;
        }

        // Форматування для таблиці Поїздок (Passenger об'єкт)
        if (header === 'passenger' && value) {
            return value.fullName || value.cardUID || 'Анонім';
        }

        if (header === 'route' && value) {
            return value.routeNumber || 'Без номера';
        }

        if (header === 'wallet' && value) {
            return `${value.balance} грн (${value.status})`;
        }

        // Якщо це масив (Trips у маршрутах, PassengerCategories)
        if (Array.isArray(value)) {
            if (header === 'trips') return `Всього: ${value.length}`;
            if (header === 'passengerCategories') {
                return value.length === 0 ? 'Звичайна' : value.map(pc => pc.category?.name).join(', ');
            }
            return `Кількість: ${value.length}`;
        }

        if (header === 'tripDateTime' || header === 'lastTransactionTime') {
            return new Date(value).toLocaleString('uk-UA');
        }

        if (typeof value === 'boolean') return value ? '✅' : '❌';

        return value.toString();
    };

    const translateHeader = (h) => {
        const dict = {
            passenger: 'Пасажир',
            transport: 'Транспорт',
            route: 'Маршрут',
            fullName: 'ПІБ',
            cardUID: 'UID Картки',
            wallet: 'Гаманець',
            passengerCategories: 'Категорії',
            type: 'Тип',
            boardNumber: 'Бортовий №',
            routeNumber: '№ Маршруту',
            description: 'Опис',
            tripDateTime: 'Час поїздки',
            finalPrice: 'Сплачено',
            standardPriceAtMoment: 'Тариф',
            isAnonymousTrip: 'Анонімно',
            trips: 'Поїздки'
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
                                {item.routeId || item.tripId || item.passengerId || item.transportID || idx + 1}
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