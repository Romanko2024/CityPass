using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CityPass.Models
{
    public class Wallet
    {
        [Key]
        public int WalletId { get; set; }

        public int PassengerId { get; set; }
        [ForeignKey("PassengerId")]
        public Passenger? Passenger { get; set; }
        public decimal Balance { get; set; } = 0;
        public DateTime? LastTransactionTime { get; set; }
        public string Status { get; set; } = "Active";
    }
}
