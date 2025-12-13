namespace EVCharging.Api.Models;

public record ChargeSession
{
    public Guid Id { get; init; }
    public Guid CustomerId { get; init; }
    public Guid CarId { get; init; }
    public string Location { get; init; } = string.Empty;
    public decimal PriceChf { get; init; }
    public int DurationMinutes { get; init; }
    public double EnergyKWh { get; init; }
    public double EstimatedRangeKm { get; init; }
    public DateTimeOffset StartTimeUtc { get; init; }
}
