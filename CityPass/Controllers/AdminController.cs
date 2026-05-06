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

        public AppDbContext Context => _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // 1. LIKE & BETWEEN пошук поїздок у діапазоні цін (Запит 2 та 4)
        [HttpGet("Queries/search-trips")]
        public async Task<IActionResult> SearchTrips([FromQuery] string min, [FromQuery] string max)
        {
            decimal minVal = decimal.TryParse(min, out var resMin) ? resMin : 0;
            decimal maxVal = decimal.TryParse(max, out var resMax) ? resMax : 1000;

            var result = await _context.Trips
                .Where(t => t.FinalPrice >= minVal && t.FinalPrice <= maxVal)
                .Select(t => new {
                    Id = t.TripId,
                    Label = $"Маршрут {t.RouteNumber}",
                    SubLabel = $"Ціна: {t.FinalPrice} ₴"
                })
                .ToListAsync();
            return Ok(result);
        }

        // 2. DISTINCT унікальні номери бортів, що вже здійснювали поїздки (Запит 7)
        [HttpGet("Queries/active-vehicles")]
        public async Task<IActionResult> GetActiveVehicles()
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

        // 3. INNER JOIN & GROUP BY & HAVING маршрути з кількістю поїздок більше X (Запит 11, 20, 21)
        [HttpGet("Queries/high-traffic-routes")]
        public async Task<IActionResult> GetHighTrafficRoutes([FromQuery] string param)
        {
            int minTrips = int.TryParse(param, out var p) ? p : 5;

            var result = await _context.Trips
                .GroupBy(t => t.RouteNumber)
                .Where(g => g.Count() >= minTrips) // HAVING в SQL
                .Select(g => new {
                    Id = 0,
                    Label = $"Маршрут №{g.Key}",
                    SubLabel = $"Всього поїздок: {g.Count()}"
                })
                .ToListAsync();
            return Ok(result);
        }

        // 4. LEFT JOIN & IS NULL пасажири, які жодного разу не їздили (Запит 16)
        [HttpGet("Queries/inactive-passengers")]
        public async Task<IActionResult> GetInactivePassengers()
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
                    SubLabel = "Ніколи не користувався"
                })
                .ToListAsync();
            return Ok(result);
        }

        // 5. EXISTS / Subquery транспорт, який жодного разу не виходив на маршрут (Запит 24)
        [HttpGet("Queries/unused-transports")]
        public async Task<IActionResult> GetUnusedTransports()
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
    }
}
