namespace RestaurantBack.Models
{
    public class Order
    {
        public int Id { get; set; }

        public string Name { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Number { get; set; }
        public string Location { get; set; }

        public decimal Price { get; set; }

        public List<OrderItem> OrderItems { get; set; }
    }
}