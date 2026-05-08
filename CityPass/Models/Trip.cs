using System.ComponentModel.DataAnnotations;
using CityPass.Models;


public class Trip
{
    [Key]
    public int TripId { get; set; }

    public int PassengerId { get; set; }
    public int TransportId { get; set; }
    public int RouteId { get; set; }
    public CityPass.Models.Route? Route { get; set; }

    public DateTime TripDateTime { get; set; } = DateTime.UtcNow;

    public decimal StandardPriceAtMoment { get; set; }
    public decimal FinalPrice { get; set; }

    public bool IsAnonymousTrip { get; set; } = false;
    public List<TripDiscount> TripDiscounts { get; set; } = new();
}
