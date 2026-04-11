using System.ComponentModel.DataAnnotations;

namespace CityPass.Models
{
    public class Transport
    {
        [Key]
        public int TransportID { get; set; }
        [Required]
        public string Type { get; set; } = string.Empty;
        [Required]
        public string BoardNumber { get; set; } = string.Empty;
    }
}