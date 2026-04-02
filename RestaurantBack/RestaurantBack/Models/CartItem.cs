using System.ComponentModel.DataAnnotations;

namespace RestaurantBack.Models
{
    public class CartItem
    {
        [Key]
        public int Id { get; set; }

        public int CartId { get; set; }
        public Cart Cart { get; set; }
        public int VariationId { get; set; }         
        public ProductVariation Variation { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; }

        public int Quantity { get; set; }
    }
}
