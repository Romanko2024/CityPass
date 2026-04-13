using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CityPass.Data;

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
        public async Task<ActionResult<Trip>> PostTrip(Trip trip)
        {
            var settings = await _context.SystemSettings.FirstOrDefaultAsync();
            if (settings == null) return BadRequest("Налаштування системи не знайдено");

            var passenger = await _context.Passengers
                .Include(p => p.Category)
                .Include(p => p.Wallet)
                .FirstOrDefaultAsync(p => p.PassengerId == trip.PassengerId);

            if (passenger == null || passenger.Wallet == null)
                return NotFound("Пасажир або гаманець не знайдений");

            decimal priceToPay = settings.BasePrice;
            var appliedDiscounts = new List<int>();

            // 1. ПЕРЕВІРКА НА АНОНІМНІСТЬ
            bool useBenefits = !trip.IsAnonymousTrip;

            // 2. ЛОГІКА ПІЛЬГОВИКА (Monthly Limit)
            if (useBenefits && passenger.Category != null && passenger.Category.DiscountPercent > 0)
            {
                var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
                var monthlySavings = await _context.Trips
                    .Where(t => t.PassengerId == passenger.PassengerId && t.TripDateTime >= startOfMonth)
                    .SumAsync(t => t.StandardPriceAtMoment - t.FinalPrice);

                if (monthlySavings < passenger.Category.MonthlyLimit)
                {
                    priceToPay = 0;
                    appliedDiscounts.Add(4);
                }
                else
                {
                    priceToPay = settings.BasePrice * (1 - (passenger.Category.DiscountPercent / 100));
                    appliedDiscounts.Add(5);
                }
            }
            else
            {
                var today = DateTime.UtcNow.Date;

                //Daily Cap
                var spentToday = await _context.Trips
                    .Where(t => t.PassengerId == passenger.PassengerId && t.TripDateTime >= today)
                    .SumAsync(t => t.FinalPrice);

                if (spentToday >= settings.DailyCap)
                {
                    priceToPay = 0;
                    appliedDiscounts.Add(2); // ID Daily Cap
                }
                else
                {
                    //Transfer
                    var lastTrip = await _context.Trips
                        .Where(t => t.PassengerId == passenger.PassengerId)
                        .OrderByDescending(t => t.TripDateTime)
                        .FirstOrDefaultAsync();

                    if (lastTrip != null && (DateTime.UtcNow - lastTrip.TripDateTime).TotalMinutes <= settings.TransferTimeLimit)
                    {
                        priceToPay = settings.TransferPrice;
                        appliedDiscounts.Add(1); // ID Transfer
                    }

                    else if (spentToday > 0)
                    {
                        priceToPay = settings.SubsequentPrice;
                        appliedDiscounts.Add(3);
                    }
                }
            }

            // 3. ПЕРЕВІРКА БАЛАНСУ
            if (passenger.Wallet.Balance < priceToPay)
                return BadRequest("Недостатньо коштів на балансі");

            // 4. ОПЛАТА ТА ЗБЕРЕЖЕННЯ
            passenger.Wallet.Balance -= priceToPay;
            passenger.Wallet.LastTransactionTime = DateTime.UtcNow;

            trip.StandardPriceAtMoment = settings.BasePrice;
            trip.FinalPrice = priceToPay;
            trip.TripDateTime = DateTime.UtcNow;

            _context.Trips.Add(trip);
            await _context.SaveChangesAsync();

            //використані знижки в проміжну таблицю
            foreach (var discountId in appliedDiscounts)
            {
                _context.Database.ExecuteSqlRaw(
                    "INSERT INTO \"TripDiscounts\" (\"TripID\", \"DiscountID\") VALUES ({0}, {1})",
                    trip.TripId, discountId);
            }

            return CreatedAtAction("GetTrip", new { id = trip.TripId }, trip);
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

        [HttpGet("verify/{cardUID}")]
        public async Task<IActionResult> VerifyTicket(string cardUID, [FromQuery] int transportId)
        {
            var passenger = await _context.Passengers.FirstOrDefaultAsync(p => p.CardUID == cardUID);
            if (passenger == null) return NotFound("Картка не зареєстрована");

            var recentTrip = await _context.Trips
                .Where(t => t.PassengerId == passenger.PassengerId &&
                            t.TransportId == transportId &&
                            t.TripDateTime >= DateTime.UtcNow.AddHours(-2))
                .FirstOrDefaultAsync();

            if (recentTrip != null)
            {
                return Ok(new { Status = "Valid", Message = "Проїзд оплачено", Time = recentTrip.TripDateTime });
            }

            return Ok(new { Status = "Invalid", Message = "Оплата не знайдена! Штраф!" });
        }
        private bool TripExists(int id)
        {
            return _context.Trips.Any(e => e.TripId == id);
        }
    }
}
