using System.ComponentModel.DataAnnotations;
namespace CityPass.Models;

public class Discount
{
    [Key]
    public int DiscountId { get; set; }
    public string Description { get; set; } = string.Empty;
    public List<TripDiscount> TripDiscounts { get; set; } = new();
}
