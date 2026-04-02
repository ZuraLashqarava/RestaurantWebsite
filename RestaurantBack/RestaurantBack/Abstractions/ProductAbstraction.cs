using RestaurantBack.Models;
namespace RestaurantBack.Abstractions
{
    public static class ProductAbstraction
    {
        public static List<Product> GetProducts()
        {
            return new List<Product>
            {
                new Product
                {
                    Name     = "Khinkali",
                    ImageUrl = "/images/products/khinkali.jpg",
                    Variations = new List<ProductVariation>
                    {
                        new ProductVariation { Name = "Qalaquri", Price = 0.80m },
                        new ProductVariation { Name = "Mtiuluri",  Price = 0.80m }
                    }
                },
                new Product
                {
                    Name     = "Chakapuli",
                    ImageUrl = "/images/products/chakapuli.jpg",
                    Variations = new List<ProductVariation>
                    {
                        new ProductVariation { Name = "Chakapuli", Price = 12.00m }
                    }
                },
                new Product
                {
                    Name     = "Khachapuri",
                    ImageUrl = "/images/products/khachapuri.jpg",
                    Variations = new List<ProductVariation>
                    {
                        new ProductVariation { Name = "Imeruli", Price = 3.00m },
                        new ProductVariation { Name = "Adjaruli", Price = 6.00m },
                        new ProductVariation { Name = "Megruli",  Price = 4.00m }
                    }
                },
                new Product
                {
                    Name     = "Mtsvadi",
                    ImageUrl = "/images/products/mtsvadi.webp",
                    Variations = new List<ProductVariation>
                    {
                        new ProductVariation { Name = "Mtsvadi", Price = 10.00m }
                    }
                },
                new Product
                {
                    Name     = "Shkmeruli",
                    ImageUrl = "/images/products/shqmeruli.jpg",
                    Variations = new List<ProductVariation>
                    {
                        new ProductVariation { Name = "Shkmeruli", Price = 11.00m }
                    }
                },
                new Product
                {
                    Name     = "Kubdari",
                    ImageUrl = "/images/products/kubdari.jpg",
                    Variations = new List<ProductVariation>
                    {
                        new ProductVariation { Name = "Kubdari", Price = 5.00m }
                    }
                },
                new Product
                {
                    Name     = "Chakhokhbili",
                    ImageUrl = "/images/products/chakhokhbili.jpg",
                    Variations = new List<ProductVariation>
                    {
                        new ProductVariation { Name = "Chakhokhbili", Price = 13.00m }
                    }
                },
                new Product
                {
                    Name     = "Kupati",
                    ImageUrl = "/images/products/kupati.jpg",
                    Variations = new List<ProductVariation>
                    {
                        new ProductVariation { Name = "Kupati", Price = 8.00m }
                    }
                },
                new Product
                {
                    Name     = "Badrijani",
                    ImageUrl = "/images/products/badrijani.jpg",
                    Variations = new List<ProductVariation>
                    {
                        new ProductVariation { Name = "Badrijani", Price = 2.00m }
                    }
                },
                new Product
                {
                    Name     = "Elarji",
                    ImageUrl = "/images/products/elarji.jpg",
                    Variations = new List<ProductVariation>
                    {
                        new ProductVariation { Name = "Elarji", Price = 2.00m }
                    }
                },
                new Product
                {
                    Name     = "Red Beans",
                    ImageUrl = "/images/products/beans.webp",
                    Variations = new List<ProductVariation>
                    {
                        new ProductVariation { Name = "Lobio", Price = 3.00m }
                    }
                },
                new Product
                {
                    Name     = "Khashlama",
                    ImageUrl = "/images/products/khashlama.jpg",
                    Variations = new List<ProductVariation>
                    {
                        new ProductVariation { Name = "Khashlama", Price = 14.00m }
                    }
                },
                new Product
                {
                    Name     = "Mchadi",
                    ImageUrl = "/images/products/mchadi.jpg",
                    Variations = new List<ProductVariation>
                    {
                        new ProductVariation { Name = "Mchadi", Price = 0.20m },
                        new ProductVariation { Name = "Chvishtari", Price = 0.50m }
                    }
                },
                new Product
                {
                    Name     = "Cheese",
                    ImageUrl = "/images/products/yveli.webp",
                    Variations = new List<ProductVariation>
                    {
                        new ProductVariation { Name = "Imeruli", Price = 3.00m },
                        new ProductVariation { Name = "Sulguni", Price = 4.00m }
                    }
                },
                new Product
                {
                    Name     = "Lobiani",
                    ImageUrl = "/images/products/lobiani.jpg",
                    Variations = new List<ProductVariation>
                    {
                        new ProductVariation { Name = "Lobiani", Price = 3.00m }
                    }
                },
                new Product
                {
                    Name     = "Wine",
                    ImageUrl = "/images/products/gvino.webp",
                    Variations = new List<ProductVariation>
                    {
                        new ProductVariation { Name = "Saperavi Red Dry", Price = 17.00m },
                        new ProductVariation { Name = "Rkatsiteli White Dry", Price = 15.00m },
                        new ProductVariation { Name = "Khvanchkara Sweet Red", Price = 20.00m }
                    }
                }
            };
        }
    }
}