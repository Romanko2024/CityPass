using System.ComponentModel.DataAnnotations;

namespace CityPass.Models
{
    public class Route
    {
        [Key]
        public int RouteId { get; set; }
        public string RouteNumber { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int TransportId { get; set; }
    }
}
