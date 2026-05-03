using System.ComponentModel.DataAnnotations;

namespace CityPass.Models
{
    public class Passenger
    {
        [Key]
        public int PassengerId { get; set; }
        public string? FullName { get; set; }
        [Required]
        public string CardUID { get; set; } = string.Empty;
        public Wallet? Wallet { get; set; }
        public List<PassengerCategory> PassengerCategories { get; set; } = new();
    }
}
