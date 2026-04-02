using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestaurantBack.Models
{
    public class ProductVariation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }   

        [Required]
        public decimal Price { get; set; }

        
        public int ProductId { get; set; }

        [ForeignKey("ProductId")]
        public Product Product { get; set; }
    }
}
