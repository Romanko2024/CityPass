using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CityPass.Models
{
    public class Passenger
    {
        [Key]
        public int PassengerId { get; set; }

        public int CategoryId { get; set; }
        [ForeignKey("CategoryId")]
        public Category? Category { get; set; }
        public string? FullName { get; set; } // could be NULL

        [Required]
        public string CardUID { get; set; } = string.Empty;
        public Wallet? Wallet { get; set; }
    }
}
