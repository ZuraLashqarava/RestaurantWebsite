namespace RestaurantBack.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public int TableId { get; set; }
        public int GuestCount { get; set; }
        public DateTime Time { get; set; }
        public string GuestName { get; set; } = string.Empty;
        public string Status { get; set; } = "booked";
    }
}