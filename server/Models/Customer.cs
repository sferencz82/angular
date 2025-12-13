namespace EVCharging.Api.Models;

public record Customer
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public IReadOnlyList<Car> Cars { get; init; } = Array.Empty<Car>();
}
