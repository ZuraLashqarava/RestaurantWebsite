using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantBack.Data;
using RestaurantBack.Models;
using System.Text.Json;

namespace RestaurantBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly DataContext _context;
        private const string SessionCartKey = "AnonymousCart";

        public OrderController(DataContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name)) return BadRequest("Name is required.");
            if (string.IsNullOrWhiteSpace(request.LastName)) return BadRequest("Last name is required.");
            if (string.IsNullOrWhiteSpace(request.Email)) return BadRequest("Email is required.");
            if (string.IsNullOrWhiteSpace(request.Number)) return BadRequest("Phone number is required.");
            if (string.IsNullOrWhiteSpace(request.Location)) return BadRequest("Location is required.");
            if (request.Items == null || request.Items.Count == 0) return BadRequest("Order must contain at least one item.");

            var productIds = request.Items.Select(i => i.ProductId).ToList();
            var products = await _context.Products
                .Include(p => p.Variations)
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync();

            var orderItems = new List<OrderItem>();

            foreach (var item in request.Items)
            {
                var product = products.FirstOrDefault(p => p.Id == item.ProductId);
                if (product == null)
                    return NotFound($"Product with id {item.ProductId} not found.");

                var variation = product.Variations.FirstOrDefault();
                if (variation == null)
                    return BadRequest($"Product '{product.Name}' has no variations.");

                var unitPrice = variation.Price;
                var totalPrice = unitPrice * item.Quantity;

                orderItems.Add(new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    Quantity = item.Quantity,
                    Price = unitPrice,
                    TotalPrice = totalPrice
                });
            }

            var order = new Order
            {
                Name = request.Name,
                LastName = request.LastName,
                Email = request.Email,
                Number = request.Number,
                Location = request.Location,
                Price = orderItems.Sum(i => i.TotalPrice),
                OrderItems = orderItems
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            HttpContext.Session.Remove(SessionCartKey);

            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound($"Order with id {id} not found.");
            return Ok(order);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .OrderByDescending(o => o.Id)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound($"Order with id {id} not found.");

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class PlaceOrderRequest
    {
        public string Name { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Number { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public List<OrderItemRequest> Items { get; set; } = new();
    }

    public class OrderItemRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
