using Microsoft.EntityFrameworkCore;
using RestaurantBack.Abstractions;
using RestaurantBack.Data;

namespace RestaurantBack.Services
{
    public class DatabaseSeedingService
    {
        private readonly DataContext _context;
        private readonly ILogger<DatabaseSeedingService> _logger;

        public DatabaseSeedingService(DataContext context, ILogger<DatabaseSeedingService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            try
            {
                await _context.Database.MigrateAsync(); 

                if (!_context.Products.Any())
                {
                    var products = ProductAbstraction.GetProducts();
                    await _context.Products.AddRangeAsync(products);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Products seeded successfully.");
                }

                _logger.LogInformation("Database seeding completed successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while seeding the database.");
                throw;
            }
        }
    }
}