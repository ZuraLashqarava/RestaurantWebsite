using System.ComponentModel.DataAnnotations;

namespace RestaurantBack.Models
{
    public class Cart
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public string DeliveryLocation { get; set; }

        public DateTime DeliveryTime { get; set; }

        public ICollection<CartItem> Items { get; set; }
    }
}
