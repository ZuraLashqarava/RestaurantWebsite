using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantBack.Data;
using RestaurantBack.Models;

namespace RestaurantBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly DataContext _context;

        public ProductController(DataContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _context.Products
                .Include(p => p.Variations)
                .ToListAsync();

            return Ok(products);
        }

       
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _context.Products
                .Include(p => p.Variations)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return NotFound($"Product with id {id} not found.");

            return Ok(product);
        }

      
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
        {
            var product = new Product
            {
                Name = dto.Name,
                ImageUrl = dto.ImageUrl,
                Variations = dto.Variations.Select(v => new ProductVariation
                {
                    Name = v.Name,
                    Price = v.Price
                }).ToList()
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }

       
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Products
                .Include(p => p.Variations)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return NotFound($"Product with id {id} not found.");

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }

      
        [HttpPost("{id}/variations")]
        public async Task<IActionResult> AddVariation(int id, [FromBody] CreateVariationDto dto)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
                return NotFound($"Product with id {id} not found.");

            var variation = new ProductVariation
            {
                Name = dto.Name,
                Price = dto.Price,
                ProductId = id
            };

            _context.ProductVariations.Add(variation);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = product.Id }, variation);
        }

        [HttpDelete("variations/{variationId}")]
        public async Task<IActionResult> DeleteVariation(int variationId)
        {
            var variation = await _context.ProductVariations.FindAsync(variationId);

            if (variation == null)
                return NotFound($"Variation with id {variationId} not found.");

            _context.ProductVariations.Remove(variation);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    
    public class CreateProductDto
    {
        public string Name { get; set; }
        public string ImageUrl { get; set; }
        public List<CreateVariationDto> Variations { get; set; } = new();
    }

    public class CreateVariationDto
    {
        public string Name { get; set; }
        public decimal Price { get; set; }
    }
}
