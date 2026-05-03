namespace CityPass.Models
{
    public class PassengerCategory
    {
        public int PassengerId { get; set; }
        public Passenger? Passenger { get; set; }
        public int CategoryId { get; set; }
        public Category? Category { get; set; }
    }
}
