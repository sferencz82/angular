namespace EVCharging.Api.Models;

public record Car
{
    public Guid Id { get; init; }
    public string Make { get; init; } = string.Empty;
    public string Model { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public double BatteryKWh { get; init; }
    public string Plate { get; init; } = string.Empty;
}
