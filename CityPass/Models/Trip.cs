using System.ComponentModel.DataAnnotations;

public class Trip
{
    [Key]
    public int TripId { get; set; }

    public int PassengerId { get; set; }
    public int TransportId { get; set; }

    public string RouteNumber { get; set; } = string.Empty;
    public DateTime TripDateTime { get; set; } = DateTime.UtcNow;

    public decimal StandardPriceAtMoment { get; set; }
    public decimal FinalPrice { get; set; }

    public bool IsAnonymousTrip { get; set; } = false;
    public List<TripDiscount> TripDiscounts { get; set; } = new();
}
