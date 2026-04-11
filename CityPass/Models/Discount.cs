using System.ComponentModel.DataAnnotations;

public class Discount
{
    [Key]
    public int DiscountId { get; set; }
    public string Description { get; set; } = string.Empty;
    public List<TripDiscount> TripDiscounts { get; set; } = new();
}
