using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CityPass.Data;

namespace CityPass.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // --- ГРУПА 1: ПРОСТІ ТА ФІЛЬТРАЦІЯ ---

        // 1. Простий запит на вибірку.
        [HttpGet("Queries/q1")]
        public async Task<IActionResult> GetQ1()
        {
            var result = await _context.Routes
                .Select(r => new {
                    Id = r.RouteId,
                    Label = $"Маршрут №{r.RouteNumber}",
                    SubLabel = r.Description
                })
                .ToListAsync();
            return Ok(result);
        }

        // 2. Запит на вибірку з використанням «between....and».
        //параметри min/max, якщо вони є, або стандартний діапазон
        [HttpGet("Queries/q2")]
        public async Task<IActionResult> GetQ2([FromQuery] string min, [FromQuery] string max)
        {
            decimal minVal = decimal.TryParse(min, out var resMin) ? resMin : 10;
            decimal maxVal = decimal.TryParse(max, out var resMax) ? resMax : 20;

            var result = await _context.Trips
                .Include(t => t.Route)
                .Where(t => t.FinalPrice >= minVal && t.FinalPrice <= maxVal)
                .Select(t => new {
                    Id = t.TripId,
                    Label = $"Поїздка на маршруті №{t.Route.RouteNumber}",
                    SubLabel = $"Ціна: {t.FinalPrice} ₴"
                })
                .ToListAsync();
            return Ok(result);
        }

        // 3. Запит на вибірку з використанням «in».
        [HttpGet("Queries/q3")]
        public async Task<IActionResult> GetQ3()
        {
            var targetCategories = new[] { "Пільговий", "Студент" };

            var result = await _context.Passengers
                .Where(p => p.PassengerCategories.Any(pc => targetCategories.Contains(pc.Category.Name)))
                .Select(p => new {
                    Id = p.PassengerId,
                    Label = p.FullName,
                    SubLabel = "Категорія: Пільговик або Студент"
                })
                .ToListAsync();
            return Ok(result);
        }

        // 4. Запит на вибірку з використанням «like».
        [HttpGet("Queries/q4")]
        public async Task<IActionResult> GetQ4([FromQuery] string param)
        {
            string search = string.IsNullOrEmpty(param) ? "Центр" : param;
            var result = await _context.Routes
                .Where(r => EF.Functions.Like(r.Description, $"%{search}%"))
                .Select(r => new {
                    Id = r.RouteId,
                    Label = $"№{r.RouteNumber}",
                    SubLabel = r.Description
                })
                .ToListAsync();
            return Ok(result);
        }

        // 5. Запит на вибірку з двома умовами через «and».
        //транспорт конкретного типу (напр. Автобус), номер борту якого > 100
        [HttpGet("Queries/q5")]
        public async Task<IActionResult> GetQ5()
        {
            var transports = await _context.Transports
                .Where(tr => tr.Type == "Автобус")
                .ToListAsync();

            var result = transports
                .Where(tr => int.TryParse(tr.BoardNumber, out var num) && num > 100)
                .Select(tr => new {
                    Id = tr.TransportID,
                    Label = $"{tr.Type} (Борт №{tr.BoardNumber})",
                    SubLabel = "Фільтр: Тип='Автобус' ТА Номер > 100"
                })
                .ToList();

            return Ok(result);
        }

        // 6. Запит на вибірку з двома умовами через «оr».
        //маршрути, які належать або до Трамваїв (2), або до Тролейбусів (3)
        [HttpGet("Queries/q6")]
        public async Task<IActionResult> GetQ6()
        {
            var result = await _context.Routes
                .Where(r => r.TransportId == 2 || r.TransportId == 3)
                .Select(r => new {
                    Id = r.RouteId,
                    Label = $"Маршрут №{r.RouteNumber}",
                    SubLabel = $"Електротранспорт (Тип ID: {r.TransportId})"
                })
                .ToListAsync();
            return Ok(result);
        }

        // 7. Запит на вибірку з використанням «DISTINCT».
        [HttpGet("Queries/q7")]
        [HttpGet("Queries/active-vehicles")]
        public async Task<IActionResult> GetQ7()
        {
            var result = await _context.Trips
                .Select(t => t.TransportId)
                .Distinct()
                .Join(_context.Transports, id => id, tr => tr.TransportID, (id, tr) => new {
                    Id = tr.TransportID,
                    Label = tr.Type,
                    SubLabel = $"Борт: {tr.BoardNumber}"
                })
                .ToListAsync();
            return Ok(result);
        }

        // --- ГРУПА 2: АГРЕГАЦІЯ ---


        // 8. Запит з функцією «min» або «max».
        //граничні вартості поїздок у системі
        [HttpGet("Queries/q8")]
        public async Task<IActionResult> GetQ8()
        {
            var minPrice = await _context.Trips.MinAsync(t => t.FinalPrice);
            var maxPrice = await _context.Trips.MaxAsync(t => t.FinalPrice);

            var result = new[]
            {
        new { Id = 1, Label = "Найдешевша поїздка", SubLabel = $"{minPrice} ₴" },
        new { Id = 2, Label = "Найдорожча поїздка", SubLabel = $"{maxPrice} ₴" }
    };
            return Ok(result);
        }

        // 9. Запит з функцією «sum» або «avg».
        // загальна виручка та середня ціна
        [HttpGet("Queries/q9")]
        public async Task<IActionResult> GetQ9()
        {
            var totalSum = await _context.Trips.SumAsync(t => t.FinalPrice);
            var averagePrice = await _context.Trips.AverageAsync(t => t.FinalPrice);

            var result = new[]
            {
        new { Id = 1, Label = "Загальна виручка системи", SubLabel = $"{Math.Round(totalSum, 2)} ₴" },
        new { Id = 2, Label = "Середня вартість однієї поїздки", SubLabel = $"{Math.Round(averagePrice, 2)} ₴" }
    };
            return Ok(result);
        }

        // 10. Запит з функцією «count».
        //підрахувати загальну кількість зареєстрованих пасажирів
        [HttpGet("Queries/q10")]
        public async Task<IActionResult> GetQ10()
        {
            var passengersCount = await _context.Passengers.CountAsync();
            var tripsCount = await _context.Trips.CountAsync();

            var result = new[]
            {
        new { Id = 1, Label = "Всього пасажирів у базі", SubLabel = $"{passengersCount} осіб" },
        new { Id = 2, Label = "Всього здійснено поїздок", SubLabel = $"{tripsCount} записів" }
    };
            return Ok(result);
        }

        // 11. Запит на вибірку з використанням агрегатної функції і виведенням ще декількох полів.
        //статистика по кожному маршруту: номер, кількість поїздок та загальна виручка.
        [HttpGet("Queries/q11")]
        public async Task<IActionResult> GetQ11()
        {
            var result = await _context.Trips
                .Include(t => t.Route)
                .GroupBy(t => t.Route.RouteNumber)
                .Select(g => new {
                    Id = g.First().RouteId,
                    Label = $"Маршрут №{g.Key}",
                    SubLabel = $"Всього зароблено: {g.Sum(t => t.FinalPrice)} ₴"
                })
                .ToListAsync();
            return Ok(result);
        }

        // 12. Запит на вибірку з використанням агрегатної функції і умовою на вибірку поля.
        //підрахувати кількість ціна > 10 поїздок для кожного маршруту.
        [HttpGet("Queries/q12")]
        public async Task<IActionResult> GetQ12()
        {
            var result = await _context.Trips
                .Include(t => t.Route)
                .Where(t => t.FinalPrice > 10)
                .GroupBy(t => t.Route.RouteNumber)
                .Select(g => new {
                    Id = 0,
                    Label = $"Маршрут №{g.Key} (Дорогі поїздки)",
                    SubLabel = $"Кількість записів: {g.Count()}"
                })
                .ToListAsync();
            return Ok(result);
        }

        // 13. Запит на вибірку з використанням агрегатної функції і умовою на агрегатну функцію (HAVING).
        [HttpGet("Queries/q13")]
        public async Task<IActionResult> GetQ13([FromQuery] string param)
        {
            int minTrips = int.TryParse(param, out var p) ? p : 5;
            var result = await _context.Trips
                .Include(t => t.Route)
                .GroupBy(t => t.Route.RouteNumber)
                .Where(g => g.Count() >= minTrips)
                .Select(g => new {
                    Id = 0,
                    Label = $"Маршрут №{g.Key}",
                    SubLabel = $"Всього поїздок: {g.Count()}"
                })
                .ToListAsync();
            return Ok(result);
        }

        // 14. Запит на вибірку з використанням агрегатної функції, умовою на агрегатну функцію, 
        // умовою на вибірку поля з сортуванням даних.
        //знайти маршрути на "1" (напр. 1, 14, 102 і тд), де більше 1 поїздки, і відсортувати за доходом.
        [HttpGet("Queries/q14")]
        public async Task<IActionResult> GetQ14()
        {
            var result = await _context.Trips
                .Include(t => t.Route)
                .Where(t => t.Route.RouteNumber.StartsWith("1"))
                .GroupBy(t => t.Route.RouteNumber)
                .Where(g => g.Count() > 1)
                .OrderByDescending(g => g.Sum(x => x.FinalPrice))
                .Select(g => new {
                    Id = 0,
                    Label = $"Топ-маршрут №{g.Key}",
                    SubLabel = $"Дохід: {g.Sum(x => x.FinalPrice)} ₴ (Відсортовано за спаданням)"
                })
                .ToListAsync();
            return Ok(result);
        }

        // --- ГРУПА 3: З'ЄДНАННЯ (JOINS) ---

        // 15. Запит з використанням INNER JOIN.
        //поєднати поїздки з пасажирами, щоб вивести ПІБ замість ID.
        [HttpGet("Queries/q15")]
        public async Task<IActionResult> GetQ15()
        {
            var result = await _context.Trips
                .Include(t => t.Route)
                .Join(_context.Passengers,
                    t => t.PassengerId,
                    p => p.PassengerId,
                    (t, p) => new {
                        Id = t.TripId,
                        Label = p.FullName,
                        SubLabel = $"Маршрут {t.Route.RouteNumber} | Картка: {p.CardUID}"
                    })
                .ToListAsync();
            return Ok(result);
        }

        // 16. Запит на вибірку з використанням LEFT JOIN.
        [HttpGet("Queries/q16")]
        [HttpGet("Queries/inactive-passengers")]
        public async Task<IActionResult> GetQ16()
        {
            var result = await _context.Passengers
                .GroupJoin(_context.Trips,
                    p => p.PassengerId,
                    t => t.PassengerId,
                    (p, trips) => new { p, trips })
                .SelectMany(x => x.trips.DefaultIfEmpty(), (x, t) => new { x.p, t })
                .Where(x => x.t == null)
                .Select(x => new {
                    Id = x.p.PassengerId,
                    Label = x.p.FullName,
                    SubLabel = "Ніколи не користувався послугами"
                })
                .ToListAsync();
            return Ok(result);
        }

        // 17. Запит з використанням RIGHT JOIN.
        //В Entity Framework немає прямого методу RightJoin. 
        //реалізуємо логіку, міняючи таблиці місцями (Transports -> Trips) через GroupJoin.

        //вивести весь транспорт, навіть якщо він ще не здійснив жодної поїздки.
        [HttpGet("Queries/q17")]
        public async Task<IActionResult> GetQ17()
        {
            var result = await _context.Transports
                .GroupJoin(_context.Trips.Include(t => t.Route),
                    tr => tr.TransportID,
                    t => t.TransportId,
                    (tr, trips) => new { tr, trips })
                .SelectMany(x => x.trips.DefaultIfEmpty(), (x, t) => new {
                    Id = x.tr.TransportID,
                    Label = $"{x.tr.Type} (№{x.tr.BoardNumber})",
                    SubLabel = t == null ? "🛑 Немає записів про поїздки" : $"✅ Остання поїздка на маршруті {t.Route.RouteNumber}"
                })
                .ToListAsync();
            return Ok(result);
        }

        // 18. Запит з використанням INNER JOIN і умовою.
        //з'єднати поїздки з транспортом і відфільтрувати тільки > 10 грн поїздки .
        [HttpGet("Queries/q18")]
        public async Task<IActionResult> GetQ18()
        {
            var result = await _context.Trips
                .Join(_context.Transports,
                    t => t.TransportId,
                    tr => tr.TransportID,
                    (t, tr) => new { t, tr })
                .Where(x => x.t.FinalPrice > 10)
                .Select(x => new {
                    Id = x.t.TripId,
                    Label = $"Борт №{x.tr.BoardNumber} ({x.tr.Type})",
                    SubLabel = $"Дорога поїздка: {x.t.FinalPrice} ₴"
                })
                .ToListAsync();
            return Ok(result);
        }

        // 19. Запит з використанням INNER JOIN і умовою LIKE.
        // всі поїздки пасажирів, чиє ім'я містить "Олександр" : param.
        [HttpGet("Queries/q19")]
        public async Task<IActionResult> GetQ19([FromQuery] string param)
        {
            string search = string.IsNullOrEmpty(param) ? "Олександр" : param;

            var result = await _context.Trips
                .Include(t => t.Route)
                .Join(_context.Passengers,
                    t => t.PassengerId,
                    p => p.PassengerId,
                    (t, p) => new { t, p })
                .Where(x => EF.Functions.Like(x.p.FullName, $"%{search}%"))
                .Select(x => new {
                    Id = x.t.TripId,
                    Label = x.p.FullName,
                    SubLabel = $"Поїздка на маршруті: {x.t.Route.RouteNumber}"
                })
                .ToListAsync();
            return Ok(result);
        }

        // --- ГРУПА 4: ПІДЗАПИТИ ---
        // 21. Пасажири, що належать до певної категорії (наприклад, "Студент")
        [HttpGet("Queries/q21")]
        public async Task<IActionResult> GetQ21([FromQuery] string categoryName = "Студент")
        {
            var result = await _context.Passengers
                .Where(p => p.PassengerCategories.Any(pc => pc.Category.Name == categoryName))
                .Select(p => new {
                    Id = p.PassengerId,
                    Label = p.FullName ?? "Анонім",
                    SubLabel = $"Категорія: {categoryName}"
                })
                .ToListAsync();
            return Ok(result);
        }
        // 22. Запит з використанням підзапита з використанням (=, <, >).
        //всі поїздки, вартість яких вища за середню вартість по всій системі.
        [HttpGet("Queries/q22")]
        public async Task<IActionResult> GetQ22()
        {
            var averagePrice = await _context.Trips.AverageAsync(t => t.FinalPrice);

            var result = await _context.Trips
                .Include(t => t.Route)
                .Where(t => t.FinalPrice > averagePrice)
                .Select(t => new {
                    Id = t.TripId,
                    Label = $"Маршрут {t.Route.RouteNumber}",
                    SubLabel = $"Ціна {t.FinalPrice} ₴ (Вище середньої: {Math.Round(averagePrice, 2)} ₴)"
                })
                .ToListAsync();
            return Ok(result);
        }

        // 23. Запит з використанням підзапита з використанням агрегатної функції.
        //вибрати пасажира, який здійснив поїздку з максимальною вартістю.
        [HttpGet("Queries/q23")]
        public async Task<IActionResult> GetQ23()
        {
            var maxPrice = await _context.Trips.MaxAsync(t => t.FinalPrice);

            var result = await _context.Trips
                .Where(t => t.FinalPrice == maxPrice)
                .Include(t => t.Passenger)
                .Select(t => new {
                    Id = t.PassengerId,
                    Label = t.Passenger != null ? t.Passenger.FullName : "Анонімна поїздка",
                    SubLabel = $"Максимальна вартість: {t.FinalPrice} ₴"
                })
                .Take(1)
                .ToListAsync();

            return Ok(result);
        }

        // 24. Запит з використанням підзапита з використанням оператора EXIST.
        [HttpGet("Queries/q24")]
        [HttpGet("Queries/unused-transports")] // Аліас для старої кнопки
        public async Task<IActionResult> GetQ24()
        {
            var result = await _context.Transports
                .Where(tr => !_context.Trips.Any(t => t.TransportId == tr.TransportID))
                .Select(tr => new {
                    Id = tr.TransportID,
                    Label = tr.Type,
                    SubLabel = $"Борт {tr.BoardNumber} (Неактивний)"
                })
                .ToListAsync();
            return Ok(result);
        }

        // 25. Запит з використанням підзапита з використанням ANY або SOME.
        //знайти транспорт, номер борту якого більший за БУДЬ-ЯКИЙ борт типу Трамвай.
        [HttpGet("Queries/q25")]
        public async Task<IActionResult> GetQ25()
        {
            // Отримуємо мінімальний номер борту серед трамваїв
            var tramNumbers = await _context.Transports
                .Where(t => t.Type == "Трамвай")
                .Select(t => t.BoardNumber)
                .ToListAsync();
            if (!tramNumbers.Any()) return Ok(new List<object>());
            var minTramBoard = tramNumbers.Select(n => int.TryParse(n, out var v) ? v : int.MaxValue).Min();
            var allTransports = await _context.Transports.ToListAsync();
            var result = allTransports
                .Where(t => int.TryParse(t.BoardNumber, out var n) && n > minTramBoard)
                .Select(t => new {
                    Id = t.TransportID,
                    Label = $"{t.Type} №{t.BoardNumber}",
                    SubLabel = $"Бортовий номер вищий за {minTramBoard}"
                })
                .ToList();

            return Ok(result);
        }

        // 26. Запит з використанням підзапита з використанням IN.
        // вибрати всіх пасажирів, чиї ID містяться у списку тих, хто здійснював поїздки на маршруті "1".
        [HttpGet("Queries/q26")]
        public async Task<IActionResult> GetQ26()
        {
            var passengerIdsOnRoute1 = _context.Trips
                .Include(t => t.Route)
                .Where(t => t.Route.RouteNumber == "1")
                .Select(t => t.PassengerId);

            var result = await _context.Passengers
                .Where(p => passengerIdsOnRoute1.Contains(p.PassengerId))
                .Select(p => new {
                    Id = p.PassengerId,
                    Label = p.FullName,
                    SubLabel = "Користувач маршруту №1"
                })
                .ToListAsync();
            return Ok(result);
        }

        // 27. Запит з використанням підзапита і зв’язку INNER JOIN.
        //отримати дані про маршрути та їхню середню вартість, використовуючи поєднання таблиць та груповий підзапит.
        [HttpGet("Queries/q27")]
        public async Task<IActionResult> GetQ27()
        {
            var result = await (from r in _context.Routes
                                join stats in (
                                    _context.Trips
                                    .GroupBy(t => t.RouteId)
                                    .Select(g => new { RId = g.Key, AvgPrice = g.Average(x => x.FinalPrice) })
                                ) on r.RouteId equals stats.RId
                                select new
                                {
                                    Id = r.RouteId,
                                    Label = $"Маршрут №{r.RouteNumber}",
                                    SubLabel = $"Сер. вартість: {Math.Round(stats.AvgPrice, 2)} ₴ | Опис: {r.Description}"
                                }).ToListAsync();

            return Ok(result);
        }
    }
}
