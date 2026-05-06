import React, { useState } from 'react';

const AdminQueries = ({ onExecuteQuery }) => {
    const [param, setParam] = useState("");

    const queries = [
        // --- ГРУПА 1: ПРОСТІ ТА ФІЛЬТРАЦІЯ ---
        { id: 'q1', label: '1. Усі маршрути', description: 'Проста вибірка (Select *)' },
        { id: 'q2', label: '2. Ціновий діапазон', description: 'Between...And (Ціна від 10 до 20)', hasInput: false },
        { id: 'q3', label: '3. Конкретні категорії', description: 'Використання IN (Пільговики та Студенти)' },
        { id: 'q4', label: '4. Пошук за назвою', description: 'Використання LIKE (Пошук у назві)', hasInput: true, placeholder: 'Частина назви...' },
        { id: 'q5', label: '5. Складний фільтр (AND)', description: 'Транспорт: Тип = Автобус ТА Борт > 100' },
        { id: 'q6', label: '6. Гнучкий фільтр (OR)', description: 'Транспорт: Трамвай АБО Тролейбус' },
        { id: 'q7', label: '7. Унікальний транспорт', description: 'Використання DISTINCT (Типи, що працюють)' },

        // --- ГРУПА 2: АГРЕГАТНІ ФУНКЦІЇ ---
        { id: 'q8', label: '8. Екстремальні ціни', description: 'Функції MIN та MAX для вартості поїздок' },
        { id: 'q9', label: '9. Середній чек', description: 'Функції SUM та AVG (Фінансова статистика)' },
        { id: 'q10', label: '10. Лічильник пасажирів', description: 'Функція COUNT (Всього в базі)' },
        { id: 'q11', label: '11. Статистика по маршрутах', description: 'Агрегація + декілька полів' },
        { id: 'q12', label: '12. Фільтр полів + Агрегація', description: 'Агрегатна функція + умова на поле' },
        { id: 'q13', label: '13. Популярні вузли (HAVING)', description: 'Умова на агрегатну функцію (> X поїздок)', hasInput: true, placeholder: 'Кількість...' },
        { id: 'q14', label: '14. Топ прибуткових (Sort)', description: 'Агрегація + Having + Сортування' },

        // --- ГРУПА 3: З'ЄДНАННЯ (JOINS) ---
        { id: 'q15', label: '15. Повна історія (Inner Join)', description: 'Поїздки разом з даними пасажирів' },
        { id: 'q16', label: '16. Неактивні клієнти (Left Join)', description: 'Пасажири без жодної поїздки' },
        { id: 'q17', label: '17. Транспорт без ліній (Right Join)', description: 'Транспорт, не закріплений за маршрутами' },
        { id: 'q18', label: '18. Join + Умова', description: 'Inner Join з фільтрацією за датою' },
        { id: 'q19', label: '19. Join + Like', description: 'Inner Join з пошуком по прізвищу' },
        { id: 'q20', label: '20. Join + Агрегація', description: 'Виручка за кожним типом транспорту' },
        { id: 'q21', label: '21. Складний звіт (Having + Join)', description: 'Join + Агрегація + Фільтр групи' },

        // --- ГРУПА 4: ПІДЗАПИТИ ---
        { id: 'q22', label: '22. Дорожче середнього', description: 'Підзапит з порівнянням (> AVG)' },
        { id: 'q23', label: '23. Підзапит + Агрегація', description: 'Вибірка через агрегатний підзапит' },
        { id: 'q24', label: '24. Перевірка наявності (EXISTS)', description: 'Пасажири, що існують у звітах' },
        { id: 'q25', label: '25. Вибірка ANY/SOME', description: 'Порівняння з будь-яким значенням підзапиту' },
        { id: 'q26', label: '26. Підзапит IN', description: 'Вибірка через вкладений список ID' },
        { id: 'q27', label: '27. Max Complex (Join + Subquery)', description: 'Поєднання підзапиту та з\'єднання' },
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