using System.ComponentModel.DataAnnotations;

namespace CityPass.Models
{
    public class SystemSetting
    {
        [Key]
        public int SettingID { get; set; }
        public decimal BasePrice { get; set; }
        public decimal SubsequentPrice { get; set; }
        public decimal TransferPrice { get; set; }
        public decimal DailyCap { get; set; }
        public int TransferTimeLimit { get; set; }
    }
}
