import React, { useState } from 'react';

const AdminQueries = ({ onExecuteQuery }) => {
    const [param, setParam] = useState("");

    const queries = [
        // --- ГРУПА 1: ПРОСТІ ТА ФІЛЬТРАЦІЯ ---
        { id: 'q1', label: '1. Усі маршрути', description: 'Проста вибірка усіх доступних маршрутів (SELECT)' },
        {
            id: 'q2',
            label: '2. Ціновий діапазон',
            description: 'Between (Ціна від Х до Y). Формат: 10,20',
            hasInput: true,
            placeholder: 'min,max'
        },
        { id: 'q3', label: '3. Пільгові категорії', description: 'Пошук пасажирів через IN (Студенти та Пільговики)' },
        {
            id: 'q4',
            label: '4. Пошук за описом',
            description: 'Використання LIKE (Пошук ключового слова в описі)',
            hasInput: true,
            placeholder: 'Напр: Центр...'
        },
        { id: 'q5', label: '5. Складний фільтр (AND)', description: 'Автобуси з бортовим номером > 100' },
        { id: 'q6', label: '6. Електротранспорт (OR)', description: 'Маршрути трамваїв (ID:2) АБО тролейбусів (ID:3)' },
        { id: 'q7', label: '7. Активний транспорт', description: 'DISTINCT: Транспорт, який здійснив хоча б одну поїздку' },

        // --- ГРУПА 2: АГРЕГАТНІ ФУНКЦІЇ ---
        { id: 'q8', label: '8. Екстремальні ціни', description: 'Функції MIN та MAX для вартості поїздок у системі' },
        { id: 'q9', label: '9. Фінансовий звіт', description: 'Загальна виручка (SUM) та середня ціна (AVG) поїздки' },
        { id: 'q10', label: '10. Загальна статистика', description: 'COUNT: Кількість пасажирів та поїздок у базі' },
        { id: 'q11', label: '11. Виручка по маршрутах', description: 'Групування (GROUP BY) з агрегацією суми по кожному номеру' },
        { id: 'q12', label: '12. Популярність (Ціна > 10)', description: 'COUNT + WHERE: Кількість дорогих поїздок на маршрутах' },
        {
            id: 'q13',
            label: '13. Навантажені лінії',
            description: 'HAVING: Маршрути, де кількість поїздок більше X',
            hasInput: true,
            placeholder: 'Мін. кількість (напр. 5)'
        },
        { id: 'q14', label: '14. Топ прибуткових', description: 'Агрегація + Having + Сортування (ORDER BY) за доходом' },

        // --- ГРУПА 3: З'ЄДНАННЯ (JOINS) ---
        { id: 'q15', label: '15. Деталізація поїздок', description: 'INNER JOIN: Поїздки з ПІБ пасажирів та номерами карток' },
        { id: 'q16', label: '16. Неактивні пасажири', description: 'LEFT JOIN: Клієнти, які ще не здійснювали поїздок' },
        { id: 'q17', label: '17. Стан автопарку', description: 'RIGHT JOIN (через GroupJoin): Весь транспорт та статус останньої поїздки' },
        { id: 'q18', label: '18. Прибуткові борти', description: 'JOIN + WHERE: Транспорт, що виконав поїздки > 10 грн' },
        {
            id: 'q19',
            label: '19. Пошук поїздок пасажира',
            description: 'JOIN + LIKE: Пошук усіх поїздок людини за частиною ПІБ',
            hasInput: true,
            placeholder: 'Прізвище...'
        },

        // --- ГРУПА 4: ПІДЗАПИТИ ---
        {
            id: 'q21',
            label: '21. Фільтр за категорією',
            description: 'Підзапит Any(): Пасажири конкретної категорії',
            hasInput: true,
            placeholder: 'Студент / Пільговий'
        },
        { id: 'q22', label: '22. Поїздки вище середнього', description: 'Підзапит з порівнянням (> AVG) по всій системі' },
        { id: 'q23', label: '23. Рекордсмен системи', description: 'Підзапит MAX: Пасажир, що сплатив найбільшу суму' },
        { id: 'q24', label: '24. Простій транспорту', description: 'Підзапит NOT EXISTS: Транспорт без жодного запису про рух' },
        { id: 'q25', label: '25. Порівняння ANY', description: 'Транспорт з номером, вищим за будь-який Трамвай' },
        { id: 'q26', label: '26. Користувачі лінії №1', description: 'Підзапит IN: Всі пасажири, що їздили на 1-му маршруті' },
        { id: 'q27', label: '27. Аналітика маршрутів', description: 'Комплексний запит: JOIN + вкладений GROUP BY' },
    ];

    return (
        <div className="admin-queries p-2" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                {queries.map(q => (
                    <div className="col" key={q.id}>
                        <div className="card h-100 shadow-sm border-0 bg-light">
                            <div className="card-body d-flex flex-column">
                                <h6 className="card-title text-primary" style={{ fontSize: '0.9rem' }}>{q.label}</h6>
                                <p className="card-text small text-muted flex-grow-1">{q.description}</p>
                                {q.hasInput && (
                                    <input
                                        className="form-control form-control-sm mb-2"
                                        placeholder={q.placeholder}
                                        onChange={(e) => setParam(e.target.value)}
                                    />
                                )}
                                <button
                                    className="btn btn-sm btn-dark w-100"
                                    onClick={() => onExecuteQuery(q.id, param)}
                                >
                                    Виконати
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminQueries;