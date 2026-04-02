using System.ComponentModel.DataAnnotations;

namespace RestaurantBack.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        public string ImageUrl { get; set; }

      
        public List<ProductVariation> Variations { get; set; }
    }
}