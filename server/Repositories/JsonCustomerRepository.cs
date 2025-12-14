using System.Text.Json;
using EVCharging.Api.Models;

namespace EVCharging.Api.Repositories;

public class JsonCustomerRepository : ICustomerRepository
{
    private readonly IReadOnlyList<Customer> _customers;

    public JsonCustomerRepository(IWebHostEnvironment environment, ILogger<JsonCustomerRepository> logger)
    {
        var path = Path.Combine(environment.ContentRootPath, "seed", "customers.json");
        _customers = LoadCustomers(path, logger);
    }

    public IReadOnlyList<Customer> GetAll() => _customers;

    public Customer? GetById(Guid id) => _customers.FirstOrDefault(c => c.Id == id);

    private static IReadOnlyList<Customer> LoadCustomers(string path, ILogger logger)
    {
        if (!File.Exists(path))
        {
            logger.LogWarning("Customer seed file not found at {Path}. Returning empty list.", path);
            return Array.Empty<Customer>();
        }

        try
        {
            var json = File.ReadAllText(path);
            var customers = JsonSerializer.Deserialize<List<Customer>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return (customers ?? new List<Customer>()).AsReadOnly();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to load customers from {Path}", path);
            return Array.Empty<Customer>();
        }
    }
}
