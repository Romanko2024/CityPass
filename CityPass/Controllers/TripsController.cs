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
            // 1. Шукаємо налаштування системи
            var settings = await _context.SystemSettings.FirstOrDefaultAsync();
            if (settings == null) return BadRequest("Налаштування цін не знайдено");

            // 2. Шукаємо пасажира та його гаманець разом із категорією
            var passenger = await _context.Passengers
                .Include(p => p.Category)
                .Include(p => p.Wallet)
                .FirstOrDefaultAsync(p => p.PassengerId == trip.PassengerId);

            if (passenger == null || passenger.Wallet == null)
                return NotFound("Пасажир або гаманець не знайдений");

            // 3. РОЗРАХУНОК ЦІНИ
            decimal discount = passenger.Category?.DiscountPercent ?? 0;
            decimal finalPrice = settings.BasePrice * (1 - (discount / 100));

            // 4. ПЕРЕВІРКА БАЛАНСУ
            if (passenger.Wallet.Balance < finalPrice)
                return BadRequest("Недостатньо коштів на балансі");

            // 5. ПРОВЕДЕННЯ ОПЛАТИ
            passenger.Wallet.Balance -= finalPrice;
            passenger.Wallet.LastTransactionTime = DateTime.UtcNow;

            // 6. ЗАПИС ПОЇЗДКИ
            trip.StandardPriceAtMoment = settings.BasePrice;
            trip.FinalPrice = finalPrice;
            trip.TripDateTime = DateTime.UtcNow;

            _context.Trips.Add(trip);
            await _context.SaveChangesAsync();

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

        private bool TripExists(int id)
        {
            return _context.Trips.Any(e => e.TripId == id);
        }
    }
}
