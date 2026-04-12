using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CityPass.Data;
using CityPass.Models;

namespace CityPass.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemSettingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SystemSettingsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/SystemSettings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SystemSetting>>> GetSystemSettings()
        {
            return await _context.SystemSettings.ToListAsync();
        }

        // GET: api/SystemSettings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SystemSetting>> GetSystemSetting(int id)
        {
            var systemSetting = await _context.SystemSettings.FindAsync(id);

            if (systemSetting == null)
            {
                return NotFound();
            }

            return systemSetting;
        }

        // PUT: api/SystemSettings/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSystemSetting(int id, SystemSetting systemSetting)
        {
            if (id != systemSetting.SettingID)
            {
                return BadRequest();
            }

            _context.Entry(systemSetting).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SystemSettingExists(id))
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

        // POST: api/SystemSettings
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<SystemSetting>> PostSystemSetting(SystemSetting systemSetting)
        {
            _context.SystemSettings.Add(systemSetting);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetSystemSetting", new { id = systemSetting.SettingID }, systemSetting);
        }

        // DELETE: api/SystemSettings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSystemSetting(int id)
        {
            var systemSetting = await _context.SystemSettings.FindAsync(id);
            if (systemSetting == null)
            {
                return NotFound();
            }

            _context.SystemSettings.Remove(systemSetting);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SystemSettingExists(int id)
        {
            return _context.SystemSettings.Any(e => e.SettingID == id);
        }
    }
}
