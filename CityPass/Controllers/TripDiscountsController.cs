/*using System;
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
    public class TripDiscountsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TripDiscountsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/TripDiscounts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TripDiscount>>> GetTripDiscounts()
        {
            return await _context.TripDiscounts.ToListAsync();
        }

        // GET: api/TripDiscounts/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TripDiscount>> GetTripDiscount(int id)
        {
            var tripDiscount = await _context.TripDiscounts.FindAsync(id);

            if (tripDiscount == null)
            {
                return NotFound();
            }

            return tripDiscount;
        }

        // PUT: api/TripDiscounts/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTripDiscount(int id, TripDiscount tripDiscount)
        {
            if (id != tripDiscount.TripId)
            {
                return BadRequest();
            }

            _context.Entry(tripDiscount).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TripDiscountExists(id))
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

        // POST: api/TripDiscounts
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<TripDiscount>> PostTripDiscount(TripDiscount tripDiscount)
        {
            _context.TripDiscounts.Add(tripDiscount);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (TripDiscountExists(tripDiscount.TripId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetTripDiscount", new { id = tripDiscount.TripId }, tripDiscount);
        }

        // DELETE: api/TripDiscounts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTripDiscount(int id)
        {
            var tripDiscount = await _context.TripDiscounts.FindAsync(id);
            if (tripDiscount == null)
            {
                return NotFound();
            }

            _context.TripDiscounts.Remove(tripDiscount);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TripDiscountExists(int id)
        {
            return _context.TripDiscounts.Any(e => e.TripId == id);
        }
    }
} */
