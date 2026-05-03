using CityPass.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography.Xml;

namespace CityPass.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Passenger> Passengers { get; set; }
        public DbSet<Wallet> Wallets { get; set; }
        public DbSet<Transport> Transports { get; set; }
        public DbSet<Trip> Trips { get; set; }
        public DbSet<Discount> Discounts { get; set; }
        public DbSet<TripDiscount> TripDiscounts { get; set; }
        public DbSet<SystemSetting> SystemSettings { get; set; }

        public DbSet<CityPass.Models.Route> Routes { get; set; }
        public DbSet<PassengerCategory> PassengerCategories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //складений ключ для знижок у поїздці
            modelBuilder.Entity<TripDiscount>()
                .HasKey(td => new { td.TripId, td.DiscountId });

            //складений ключ для багатьох пільг у пасажира
            modelBuilder.Entity<PassengerCategory>()
                .HasKey(pc => new { pc.PassengerId, pc.CategoryId });
        }
    }
}
