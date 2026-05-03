using CityPass.Data;
using CityPass.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CityPass.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TripsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TripsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Trips
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Trip>>> GetTrips()
        {
            return await _context.Trips.ToListAsync();
        }

        // GET: api/Trips/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Trip>> GetTrip(int id)
        {
            var trip = await _context.Trips.FindAsync(id);

            if (trip == null)
            {
                return NotFound();
            }

            return trip;
        }

        // PUT: api/Trips/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTrip(int id, Trip trip)
        {
            if (id != trip.TripId)
            {
                return BadRequest();
            }

            _context.Entry(trip).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TripExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Trips
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Trip>> PostTrip([FromBody] TripRequest request)
        {
            var settings = await _context.SystemSettings.FirstOrDefaultAsync();
            if (settings == null) return BadRequest("Налаштування не знайдено");

            var passenger = await _context.Passengers
                .Include(p => p.PassengerCategories).ThenInclude(pc => pc.Category)
                .Include(p => p.Wallet)
                .FirstOrDefaultAsync(p => p.PassengerId == request.PassengerId);

            if (passenger == null || passenger.Wallet == null) return NotFound("Пасажир не знайдений");

            decimal priceToPay = settings.BasePrice;
            var appliedDiscounts = new List<int>();

            Category? selectedCategory = null;
            if (!request.IsAnonymousTrip && request.SelectedCategoryId != null)
            {
                selectedCategory = passenger.PassengerCategories
                    .Where(pc => pc.CategoryId == request.SelectedCategoryId)
                    .Select(pc => pc.Category)
                    .FirstOrDefault();
            }

            if (selectedCategory != null)
            {
                var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                var monthlySavings = await _context.Trips
                    .Where(t => t.PassengerId == passenger.PassengerId && t.TripDateTime >= startOfMonth)
                    .SumAsync(t => t.StandardPriceAtMoment - t.FinalPrice);

                if (monthlySavings < selectedCategory.MonthlyLimit)
                {
                    priceToPay = 0;
                    appliedDiscounts.Add(4);
                }
                else
                {
                    priceToPay = settings.BasePrice * (1 - (selectedCategory.DiscountPercent / 100));
                    appliedDiscounts.Add(5);
                }
            }
            else
            {
                // СТАНДАРТНА ЛОГІКА (Daily Cap / Transfer)
                var today = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);
                var spentToday = await _context.Trips
                    .Where(t => t.PassengerId == passenger.PassengerId && t.TripDateTime >= today)
                    .SumAsync(t => t.FinalPrice);

                if (spentToday >= settings.DailyCap)
                {
                    priceToPay = 0;
                    appliedDiscounts.Add(2);
                }
                else
                {
                    var lastTrip = await _context.Trips
                        .Where(t => t.PassengerId == passenger.PassengerId)
                        .OrderByDescending(t => t.TripDateTime)
                        .FirstOrDefaultAsync();

                    if (lastTrip != null && (DateTime.UtcNow - lastTrip.TripDateTime).TotalMinutes <= settings.TransferTimeLimit)
                    {
                        priceToPay = settings.TransferPrice;
                        appliedDiscounts.Add(1);
                    }
                    else if (spentToday > 0)
                    {
                        priceToPay = settings.SubsequentPrice;
                        appliedDiscounts.Add(3);
                    }
                }
            }

            if (passenger.Wallet.Balance < priceToPay) return BadRequest("Недостатньо коштів");

            passenger.Wallet.Balance -= priceToPay;

            var trip = new Trip
            {
                PassengerId = request.PassengerId,
                TransportId = request.TransportId,
                RouteNumber = request.RouteNumber ?? "Невідомий",
                TripDateTime = DateTime.UtcNow,
                StandardPriceAtMoment = settings.BasePrice,
                FinalPrice = priceToPay,
                IsAnonymousTrip = request.IsAnonymousTrip
            };

            _context.Trips.Add(trip);
            await _context.SaveChangesAsync();

            foreach (var dId in appliedDiscounts)
            {
                _context.Database.ExecuteSqlRaw(
                    "INSERT INTO \"TripDiscounts\" (\"TripId\", \"DiscountId\") VALUES ({0}, {1})",
                    trip.TripId, dId);
            }

            return CreatedAtAction("GetTrip", new { id = trip.TripId }, trip);
        }

        public class TripRequest
        {
            public int PassengerId { get; set; }
            public int TransportId { get; set; }
            public string RouteNumber { get; set; } = "";
            public bool IsAnonymousTrip { get; set; }
            public int? SelectedCategoryId { get; set; }
        }

        // DELETE: api/Trips/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTrip(int id)
        {
            var trip = await _context.Trips.FindAsync(id);
            if (trip == null)
            {
                return NotFound();
            }

            _context.Trips.Remove(trip);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("verify/{uid}")]
        public async Task<ActionResult> Verify(string uid, [FromQuery] int transportId)
        {
            //пошук пасажира за UID
            var passenger = await _context.Passengers
                .Include(p => p.Wallet)
                .FirstOrDefaultAsync(p => p.CardUID == uid);

            if (passenger == null)
                return NotFound(new { status = "Invalid", message = "Картку не знайдено в системі" });

            //чи була оплата в цьому транспорті за останні 60 хвилин
            var lastTrip = await _context.Trips
                .Where(t => t.PassengerId == passenger.PassengerId && t.TransportId == transportId)
                .OrderByDescending(t => t.TripDateTime)
                .FirstOrDefaultAsync();

            bool isValid = lastTrip != null && (DateTime.UtcNow - lastTrip.TripDateTime).TotalMinutes <= 60;

            //10 останніх поїздок для історії
            var recentTrips = await _context.Trips
                .Where(t => t.PassengerId == passenger.PassengerId)
                .OrderByDescending(t => t.TripDateTime)
                .Take(10)
                .Select(t => new {
                    t.RouteNumber,
                    t.TripDateTime,
                    t.FinalPrice
                })
                .ToListAsync();

            return Ok(new
            {
                status = isValid ? "Valid" : "Invalid",
                message = isValid ? $"Оплата підтверджена: {lastTrip.TripDateTime.ToLocalTime():HH:mm}" : "Оплата не знайдена",
                passengerName = passenger.FullName,
                recentTrips = recentTrips
            });
        }
        private bool TripExists(int id)
        {
            return _context.Trips.Any(e => e.TripId == id);
        }
    }
}
