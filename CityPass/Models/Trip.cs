using System.ComponentModel.DataAnnotations;
using CityPass.Models;
namespace CityPass.Models;


public class Trip
{
    [Key]
    public int TripId { get; set; }

    public int PassengerId { get; set; }
    public Passenger? Passenger { get; set; }
    public int TransportId { get; set; }
    public Transport? Transport { get; set; }
    public int RouteId { get; set; }
    public CityPass.Models.Route? Route { get; set; }

    public DateTime TripDateTime { get; set; } = DateTime.UtcNow;

    public decimal StandardPriceAtMoment { get; set; }
    public decimal FinalPrice { get; set; }

    public bool IsAnonymousTrip { get; set; } = false;
    public int? AppliedCategoryId { get; set; }
    public Category? AppliedCategory { get; set; }

    public List<TripDiscount> TripDiscounts { get; set; } = new();
}
