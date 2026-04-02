using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using RestaurantBack.Models;
using RestaurantBack.Data;

namespace RestaurantBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly DataContext _context;
        private const string SessionCartKey = "AnonymousCart";

        public CartController(DataContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            if (IsAuthenticated())
            {
                var cart = await GetOrCreateDbCartAsync();

                
                var dto = new SessionCartDto
                {
                    Items = cart.Items.Select(i => new SessionCartItem
                    {
                        ProductId = i.ProductId,
                        ProductName = i.Product?.Name ?? string.Empty,
                        Quantity = i.Quantity
                    }).ToList()
                };

                return Ok(dto);
            }

            return Ok(GetSessionCart());
        }


        [HttpPost("items")]
        public async Task<IActionResult> AddItem([FromBody] AddCartItemRequest request)
        {
            if (request.Quantity <= 0)
                return BadRequest("Quantity must be greater than zero.");

            var product = await _context.Products
                .Include(p => p.Variations)
                .FirstOrDefaultAsync(p => p.Id == request.ProductId);

            if (product == null)
                return NotFound($"Product with id {request.ProductId} not found.");

            if (IsAuthenticated())
            {
                var cart = await GetOrCreateDbCartAsync();
                var existing = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);

                if (existing != null)
                    existing.Quantity += request.Quantity;
                else
                    cart.Items.Add(new CartItem
                    {
                        CartId = cart.Id,
                        ProductId = request.ProductId,
                        Quantity = request.Quantity
                    });

                await _context.SaveChangesAsync();
                return Ok(cart);
            }

            
            var sessionCart = GetSessionCart();
            var sessionItem = sessionCart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);

            if (sessionItem != null)
                sessionItem.Quantity += request.Quantity;
            else
                sessionCart.Items.Add(new SessionCartItem
                {
                    ProductId = request.ProductId,
                    ProductName = product.Name,
                    Quantity = request.Quantity
                });

            SaveSessionCart(sessionCart);
            return Ok(sessionCart);
        }

       
        [HttpPut("items/{productId}")]
        public async Task<IActionResult> UpdateItem(int productId, [FromBody] UpdateCartItemRequest request)
        {
            if (IsAuthenticated())
            {
                var cart = await GetOrCreateDbCartAsync();
                var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
                if (item == null) return NotFound("Item not in cart.");

                if (request.Quantity <= 0)
                    cart.Items.Remove(item);
                else
                    item.Quantity = request.Quantity;

                await _context.SaveChangesAsync();
                return Ok(cart);
            }

            var sessionCart = GetSessionCart();
            var sessionItem = sessionCart.Items.FirstOrDefault(i => i.ProductId == productId);
            if (sessionItem == null) return NotFound("Item not in cart.");

            if (request.Quantity <= 0)
                sessionCart.Items.Remove(sessionItem);
            else
                sessionItem.Quantity = request.Quantity;

            SaveSessionCart(sessionCart);
            return Ok(sessionCart);
        }

      
        [HttpDelete("items/{productId}")]
        public async Task<IActionResult> RemoveItem(int productId)
        {
            if (IsAuthenticated())
            {
                var cart = await GetOrCreateDbCartAsync();
                var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
                if (item == null) return NotFound("Item not in cart.");

                cart.Items.Remove(item);
                await _context.SaveChangesAsync();
                return Ok(cart);
            }

            var sessionCart = GetSessionCart();
            var removed = sessionCart.Items.RemoveAll(i => i.ProductId == productId);
            if (removed == 0) return NotFound("Item not in cart.");

            SaveSessionCart(sessionCart);
            return Ok(sessionCart);
        }

       
        [HttpDelete]
        public async Task<IActionResult> ClearCart()
        {
            if (IsAuthenticated())
            {
                var cart = await GetOrCreateDbCartAsync();
                _context.CartItems.RemoveRange(cart.Items);
                await _context.SaveChangesAsync();
                return NoContent();
            }

            HttpContext.Session.Remove(SessionCartKey);
            return NoContent();
        }

       
        [Authorize]
        [HttpPost("merge")]
        public async Task<IActionResult> MergeSessionCartOnLogin()
        {
            var sessionCart = GetSessionCart();
            if (!sessionCart.Items.Any())
                return Ok("Nothing to merge.");

            var dbCart = await GetOrCreateDbCartAsync();

            foreach (var sessionItem in sessionCart.Items)
            {
                var existing = dbCart.Items.FirstOrDefault(i => i.ProductId == sessionItem.ProductId);
                if (existing != null)
                    existing.Quantity += sessionItem.Quantity;
                else
                    dbCart.Items.Add(new CartItem
                    {
                        CartId = dbCart.Id,
                        ProductId = sessionItem.ProductId,
                        Quantity = sessionItem.Quantity
                    });
            }

            await _context.SaveChangesAsync();
            HttpContext.Session.Remove(SessionCartKey);
            return Ok(dbCart);
        }

 

        private bool IsAuthenticated() =>
            User.Identity?.IsAuthenticated == true;

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private async Task<Cart> GetOrCreateDbCartAsync()
        {
            int userId = GetUserId();
            var cart = await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart { UserId = userId, Items = new List<CartItem>() };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            return cart;
        }

        private SessionCartDto GetSessionCart()
        {
            var json = HttpContext.Session.GetString(SessionCartKey);
            if (string.IsNullOrEmpty(json))
                return new SessionCartDto();

            return JsonSerializer.Deserialize<SessionCartDto>(json) ?? new SessionCartDto();
        }

        private void SaveSessionCart(SessionCartDto cart) =>
            HttpContext.Session.SetString(SessionCartKey, JsonSerializer.Serialize(cart));
    }

   
    public record AddCartItemRequest(int ProductId, int Quantity);
    public record UpdateCartItemRequest(int Quantity);

    public class SessionCartDto
    {
        public List<SessionCartItem> Items { get; set; } = new();
    }

    public class SessionCartItem
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }
}