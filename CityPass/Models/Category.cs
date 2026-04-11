using System.ComponentModel.DataAnnotations;

namespace CityPass.Models
{
    public class Category
    {
        [Key]
        public int CategoryId { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public decimal DiscountPercent { get; set; }
        public decimal MonthlyLimit { get; set; }
        public List<Passenger> Passengers { get; set; } = new();
    }
}
