using System.Text.Json;
using EVCharging.Api.Models;

namespace EVCharging.Api.Repositories;

public class JsonChargeRepository : IChargeRepository
{
    private readonly IReadOnlyList<ChargeSession> _charges;

    public JsonChargeRepository(IWebHostEnvironment environment, ILogger<JsonChargeRepository> logger)
    {
        var path = Path.Combine(environment.ContentRootPath, "seed", "charges.json");
        _charges = LoadCharges(path, logger);
    }

    public IReadOnlyList<ChargeSession> GetAll() => _charges;

    public IReadOnlyList<ChargeSession> GetByCustomerId(Guid customerId) =>
        _charges.Where(c => c.CustomerId == customerId).ToList();

    private static IReadOnlyList<ChargeSession> LoadCharges(string path, ILogger logger)
    {
        if (!File.Exists(path))
        {
            logger.LogWarning("Charge seed file not found at {Path}. Returning empty list.", path);
            return Array.Empty<ChargeSession>();
        }

        try
        {
            var json = File.ReadAllText(path);
            var charges = JsonSerializer.Deserialize<List<ChargeSession>>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return charges?.AsReadOnly() ?? Array.Empty<ChargeSession>();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to load charges from {Path}", path);
            return Array.Empty<ChargeSession>();
        }
    }
}
