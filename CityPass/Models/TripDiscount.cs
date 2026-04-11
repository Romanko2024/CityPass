public class TripDiscount
{
    public int TripId { get; set; }
    public Trip? Trip { get; set; }
    public int DiscountId { get; set; }
    public Discount? Discount { get; set; }
}
